/**
 * GitHub Action Script — Indexar archivos cambiados en D1
 *
 * Detecta archivos cambiados/eliminados en el push y actualiza D1.
 * Se copia a cada repo como .github/scripts/cdn-index.mjs
 *
 * Env vars (del workflow):
 *   CF_API_TOKEN, CF_ACCOUNT_ID, D1_DATABASE_ID, REPO_OWNER, REPO_NAME
 */

import { execSync } from 'child_process';
import { readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const D1_DATABASE_ID = process.env.D1_DATABASE_ID;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !D1_DATABASE_ID || !REPO_OWNER || !REPO_NAME) {
    console.error('Missing env vars');
    process.exit(1);
}

const INDEXABLE_EXTS = new Set([
    'mjs', 'js', 'md', 'txt', 'css', 'html', 'sql', 'json', 'yml', 'yaml', 'toml',
]);

const EXCLUDED_PATHS = ['node_modules/', '.git/', 'package-lock.json'];
const MAX_FILE_SIZE = 100 * 1024;

function getExtension(path) {
    const dot = path.lastIndexOf('.');
    return dot === -1 ? '' : path.slice(dot + 1).toLowerCase();
}

function shouldIndex(path) {
    const ext = getExtension(path);
    if (!INDEXABLE_EXTS.has(ext)) return false;
    if (EXCLUDED_PATHS.some(ex => path.includes(ex))) return false;
    if (path.endsWith('.min.js') || path.endsWith('.min.css')) return false;
    return true;
}

async function d1Query(sql, params = []) {
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CF_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql, params }),
        }
    );
    const data = await res.json();
    if (!data.success) throw new Error(`D1: ${JSON.stringify(data.errors)}`);
    return data.result;
}

async function main() {
    // Detectar si es primer commit (sin padre)
    let isFirst = false;
    try { execSync('git rev-parse HEAD~1', { stdio: 'ignore' }); } catch { isFirst = true; }

    let changed, deleted;

    if (isFirst) {
        // Primer commit: indexar todos los archivos
        changed = execSync('git ls-tree -r HEAD --name-only')
            .toString().trim().split('\n').filter(Boolean);
        deleted = [];
    } else {
        changed = execSync('git diff --name-only --diff-filter=ACMR HEAD~1 HEAD')
            .toString().trim().split('\n').filter(Boolean);
        deleted = execSync('git diff --name-only --diff-filter=D HEAD~1 HEAD')
            .toString().trim().split('\n').filter(Boolean);
    }

    const toIndex = changed.filter(shouldIndex);
    const toDelete = deleted.filter(shouldIndex);

    console.log(`Repo: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`Changed: ${changed.length}, indexable: ${toIndex.length}`);
    console.log(`Deleted: ${deleted.length}, indexable: ${toDelete.length}`);

    let indexed = 0, errors = 0;

    // Indexar archivos cambiados
    for (const path of toIndex) {
        try {
            const stat = statSync(path);
            if (stat.size > MAX_FILE_SIZE) {
                console.log(`  SKIP ${path} (${stat.size} bytes > 100KB)`);
                continue;
            }

            const content = readFileSync(path, 'utf-8');
            const ext = getExtension(path);
            const sha = createHash('sha1').update(content).digest('hex');

            await d1Query(
                'INSERT OR REPLACE INTO assets(owner, repo, path, extension, size, sha, content) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [REPO_OWNER, REPO_NAME, path, ext, String(stat.size), sha, content]
            );
            indexed++;
        } catch (err) {
            console.error(`  ERROR ${path}: ${err.message}`);
            errors++;
        }
    }

    // Eliminar archivos borrados
    for (const path of toDelete) {
        try {
            // FTS5: buscar rowid y borrar
            const result = await d1Query(
                'SELECT rowid FROM assets WHERE owner = ? AND repo = ? AND path = ?',
                [REPO_OWNER, REPO_NAME, path]
            );
            const rowids = result[0]?.results?.map(r => r.rowid) || [];
            for (const rowid of rowids) {
                await d1Query('DELETE FROM assets WHERE rowid = ?', [rowid]);
            }
            if (rowids.length) console.log(`  DEL ${path}`);
        } catch (err) {
            console.error(`  ERROR DEL ${path}: ${err.message}`);
            errors++;
        }
    }

    console.log(`Done: ${indexed} indexed, ${toDelete.length} deleted, ${errors} errors`);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});

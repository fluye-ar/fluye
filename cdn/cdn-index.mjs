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

// Purge-on-deploy (refresca R2 + evicta el edge cache de los archivos cambiados)
const ZONE_ID = 'ae950b9dbde7100a126b4a787a482d6b';  // fluye.ar
const BRANCH = process.env.GITHUB_REF_NAME || 'main';  // GitHub Actions setea GITHUB_REF_NAME
const CDN_BASE = 'https://cdn.fluye.ar';

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

// Las 2 formas canonicas con que el worker cachea un archivo del default branch:
// sin-ref (gh/{o}/{r}/{path}) + explicito (gh/{o}/{r}@{branch}/{path}).
function purgeUrls(path) {
    const base = `${CDN_BASE}/gh/${REPO_OWNER}/${REPO_NAME}`;
    return [`${base}/${path}`, `${base}@${BRANCH}/${path}`];
}

// Refresca R2 desde GitHub (?_fresh=1) y purga el edge cache de las URLs canonicas.
// changed → R2 reescribe contenido nuevo; deleted → worker recibe 404 y borra de R2.
async function refreshAndPurge(paths) {
    if (!paths.length) return;

    // 1. Refrescar R2 (la forma @branch resuelve al ref correcto). R2 es global → 1 fetch por archivo.
    for (const path of paths) {
        const url = `${CDN_BASE}/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/${encodeURI(path)}?_fresh=1`;
        try {
            const r = await fetch(url);
            if (!r.ok && r.status !== 404) console.error(`  fresh ${r.status} ${path}`);
        } catch (err) {
            console.error(`  fresh ERROR ${path}: ${err.message}`);
        }
    }

    // 2. Purgar el edge (caches.default) de las 2 formas. Purge API: max 30 URLs por call.
    const urls = paths.flatMap(purgeUrls);
    for (let i = 0; i < urls.length; i += 30) {
        const chunk = urls.slice(i, i + 30);
        try {
            const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: chunk }),
            });
            const data = await res.json();
            if (!data.success) console.error(`  purge ERROR: ${JSON.stringify(data.errors)}`);
        } catch (err) {
            console.error(`  purge ERROR: ${err.message}`);
        }
    }

    console.log(`Purge: ${paths.length} archivos → R2 refrescado + edge purgado (${urls.length} URLs, branch ${BRANCH})`);
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

    // Purge-on-deploy: refrescar R2 + evictar edge para TODOS los changed/deleted servibles
    // (cualquier extension — el CDN sirve todo, no solo los indexables), excluyendo node_modules/.git.
    const served = (p) => !EXCLUDED_PATHS.some(ex => p.includes(ex));
    await refreshAndPurge([...changed, ...deleted].filter(served));

    console.log(`Done: ${indexed} indexed, ${toDelete.length} deleted, ${errors} errors`);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});

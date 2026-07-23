import { Session } from '/Users/jorge/Desarrollo/fluye/doorsClient.mjs';
import pg from 'pg';

const pwd = process.env.PASSWORD;
if (!pwd) { console.error('Falta PASSWORD'); process.exit(1); }

const MARK = 'smoke-sconsole';   // consoleTag1 unico para hallar las filas
const NBSP = String.fromCharCode(160);

const fd = new Session();
fd.serverUrl = 'https://ormay.fluye.ar/restful';

function showRes(label, res) {
    if (res && typeof res.status === 'number') {
        console.log(`  ${label}: HTTP ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
    } else {
        console.log(`  ${label}: sin Response (fetch fallo / disabled)`);
    }
}

(async () => {
    try {
        console.log('== logon ormay ==');
        await fd.logon('admin', pwd, 'ormay');
        console.log('  authToken:', (fd.authToken || '').slice(0, 12) + '...');

        console.log('== envios sconsole (await la promesa fire-and-forget) ==');
        // 1) multi-arg + tag object en el medio + tags default pisados
        showRes('log multi-arg+tags', await fd.sconsole.log(
            'smoke test', { n: 42, arr: [1, 2] }, { consoleTag1: MARK, consoleTag2: 'sdk' }, 'cola'));
        // 2) sin tag object -> deberia autollenar tag2=instancia, tag3=usuario
        showRes('warn sin tags   ', await fd.sconsole.warn('warn sin tags', { consoleTag1: MARK }));
        // 3) Error -> serializeError (full) o errMsg
        showRes('error con Error ', await fd.sconsole.error('boom', new Error('test error'), { consoleTag1: MARK }));
        // 4) multi-string -> NBSP join
        showRes('log 3 strings   ', await fd.sconsole.log('a', 'b', 'c', { consoleTag1: MARK }));

        await fd.logoff();
        console.log('  logoff ok');
    } catch (err) {
        console.error('ERROR sesion:', err);
        try { await fd.logoff(); } catch (e) {}
    }

    // ---- verificacion en node_console (Neon) ----
    console.log('== verificacion node_console (Neon) ==');
    const client = new pg.Client({
        connectionString: process.env.PG_CONN,   // export PG_CONN='postgresql://neondb_owner:...@ep-...neon.tech/fluye?sslmode=require'
    });
    await client.connect();
    const { rows } = await client.query(
        `SELECT time, method, data, tag1, tag2, tag3
         FROM fluye_master.node_console
         WHERE tag1 = $1
         ORDER BY time DESC LIMIT 10`, [MARK]);
    await client.end();

    console.log(`  filas halladas: ${rows.length}`);
    for (const r of rows) {
        console.log('  ─────');
        console.log('   method:', r.method, '| tag1:', r.tag1, '| tag2:', r.tag2, '| tag3:', r.tag3);
        console.log('   data   :', JSON.stringify(r.data));
        console.log('   NBSP?  :', r.data.includes(NBSP) ? `si (${r.data.split(NBSP).length} partes)` : 'no');
    }
})();

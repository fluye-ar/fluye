import { Session } from '/Users/jorge/Desarrollo/fluye/doorsClient.mjs';
import pg from 'pg';

const APIKEY_ENC = process.env.APIKEY_ENC;   // export APIKEY_ENC='<encriptado CryptoJS>' (encriptado CryptoJS)
if (!APIKEY_ENC) { console.error('Falta APIKEY_ENC'); process.exit(1); }
const MARK = 'smoke-sconsole-apikey';
const NBSP = String.fromCharCode(160);

process.on('unhandledRejection', () => {});   // el setter apiKey dispara validacion async

function showRes(label, res) {
    if (res && typeof res.status === 'number') {
        console.log(`  ${label}: HTTP ${res.status} ${res.ok ? 'OK' : 'FAIL'}`);
    } else {
        console.log(`  ${label}: sin Response (fetch fallo / disabled)`);
    }
}

(async () => {
    const fd = new Session();
    fd.serverUrl = 'https://ormay.fluye.ar/restful';
    await fd.utils.load();                       // carga cryptoJS
    fd.apiKey = fd.utils.decrypt(APIKEY_ENC);    // desencriptar sin clave antes de setear
    console.log('== envios sconsole via ApiKey (sin logon) ==');
    console.log('  authToken:', fd.authToken, '| apiKey:', (fd.apiKey || '').slice(0, 14) + '...');

    showRes('log via apikey  ', await fd.sconsole.log('apikey path', { via: 'ApiKey' }, { consoleTag1: MARK, consoleTag2: 'sdk' }));
    showRes('error via apikey', await fd.sconsole.error('boom apikey', new Error('err apikey'), { consoleTag1: MARK }));

    console.log('== verificacion node_console (Neon) ==');
    const client = new pg.Client({
        connectionString: process.env.PG_CONN,   // export PG_CONN='postgresql://neondb_owner:...@ep-...neon.tech/fluye?sslmode=require'
    });
    await client.connect();
    const { rows } = await client.query(
        `SELECT time, method, data, tag1, tag2, tag3
         FROM fluye_master.node_console
         WHERE tag1 = $1 ORDER BY time DESC LIMIT 10`, [MARK]);
    await client.end();

    console.log(`  filas halladas: ${rows.length}`);
    for (const r of rows) {
        console.log('  ─────');
        console.log('   method:', r.method, '| tag1:', r.tag1, '| tag2:', r.tag2, '| tag3:', r.tag3);
        console.log('   data   :', JSON.stringify(r.data));
        console.log('   NBSP?  :', r.data.includes(NBSP) ? `si (${r.data.split(NBSP).length} partes)` : 'no');
    }
    process.exit(0);
})();

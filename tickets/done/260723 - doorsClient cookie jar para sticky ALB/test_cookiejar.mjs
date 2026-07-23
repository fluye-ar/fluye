import { Session } from '/Users/jorge/Desarrollo/fluye/doorsClient.mjs';

// Envuelvo fetch: registro la cookie SALIENTE y el AWSALB que el ALB SETEA en cada
// response, delegando al fetch real (pega al ALB de Cloudy de verdad).
const realFetch = globalThis.fetch;
let sent = [], setByAlb = [];
const albOf = (arr) => (arr.find(c => c.startsWith('AWSALB=')) || '').split(';')[0] || null;

globalThis.fetch = async (url, opts = {}) => {
    sent.push(opts.headers?.['Cookie']?.match(/AWSALB=[^;]+/)?.[0] ?? null);
    const res = await realFetch(url, opts);
    setByAlb.push(albOf(res.headers.getSetCookie?.() || []));
    return res;
};

const s = new Session();
s.serverUrl = 'https://antun.cloudycrm.net/restful';
s._needsAuth = false;
async function call() { try { await s.restClient.fetch('session/islogged', 'POST', {}, ''); } catch (e) {} }

console.log('== captura + reenvio (ALB real: antun) ==');
await call(); await call(); await call();
sent.forEach((c, i) => console.log(`  call ${i + 1}: envio ${c ? c.slice(0,28)+'…' : 'null'}  |  ALB seteo ${setByAlb[i] ? setByAlb[i].slice(0,28)+'…' : 'null'}`));
// correcto: call 1 no envia; call 2 envia lo que el ALB seteo en call 1; call 3 lo de call 2
const capturo = sent[0] === null && sent[1] === setByAlb[0] && sent[2] === setByAlb[1];
console.log('  reenvio == lo capturado en la response anterior:', capturo ? '✅' : '❌');

console.log('== clear al cambiar serverUrl (edisur) ==');
sent = []; setByAlb = [];
s.serverUrl = 'https://edisur.cloudycrm.net/restful';   // _reset -> clearCookies
await call(); await call();
console.log(`  call 1 (post-reset): envio ${sent[0]}`);
console.log(`  call 2: envio ${sent[1] ? sent[1].slice(0,28)+'…' : 'null'}  (== ALB call1: ${sent[1] === setByAlb[0]})`);
const clearOk = sent[0] === null && sent[1] === setByAlb[0];
console.log('  clear en _reset + recaptura host nuevo:', clearOk ? '✅' : '❌');

globalThis.fetch = realFetch;
console.log(capturo && clearOk ? '\nTODO OK ✅' : '\nFALLO ❌');
process.exit(capturo && clearOk ? 0 : 1);

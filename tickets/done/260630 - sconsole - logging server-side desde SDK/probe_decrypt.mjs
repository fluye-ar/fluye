import { Session } from '/Users/jorge/Desarrollo/fluye/doorsClient.mjs';

const APIKEY = process.env.APIKEY_ENC;   // export APIKEY_ENC='<encriptado CryptoJS>' (encriptado CryptoJS)
if (!APIKEY) { console.error('Falta APIKEY_ENC'); process.exit(1); }

const fd = new Session();
fd.serverUrl = 'https://ormay.fluye.ar/restful';

(async () => {
    await fd.utils.load();   // carga cryptoJS
    for (const pass of ['', 'ormay', 'fluye']) {
        try {
            let out = fd.utils.decrypt(APIKEY, pass === '' ? undefined : pass);
            console.log(`pass='${pass}' -> len=${out.length} | ${JSON.stringify(out.slice(0, 120))}`);
        } catch (e) {
            console.log(`pass='${pass}' -> ERROR ${e.message}`);
        }
    }
})();

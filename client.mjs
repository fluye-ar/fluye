/*
Object model
to-do

Fresh:
https://cdn.fluye.ar/ghf/fluye/client.mjs?_fresh=1
https://cdn.cloudycrm.net/gh/fluye-ar/fluye/client.mjs?_fresh=1
*/

// Platform detection & mainlib

let platform, _mainlib;

if (typeof window !== 'undefined' && window.document) {
    platform = 'browser';
} else if (globalThis.fluye) {
    platform = globalThis.fluye.engine; // Vercel
} else if (globalThis._engine) {
    platform = globalThis._engine; // Ev8
} else if (typeof process !== 'undefined' && process.versions?.node) {
    platform = 'node';
}

if (platform == 'Ev8') {
    try {
        let mod = await import('../mainlib.mjs');
        _mainlib = mod.default ? mod.default : mod;
    } catch(err) {
        console.error('Error loading mainlib', err);
    }
}


/**
Clase FluyeSession — Entry point para conectar a la plataforma Fluye.
Maneja auth (Cognito JWT o API key) y selección de instancia.

Uso:
    // Con API key (scripts Node.js)
    let fluyeSession = new FluyeSession({ apiKey: 'flk_abc123' });
    let doorsSession = await fluyeSession.openDoors('ormay');
    let folder = await doorsSession.folder(1234);

    // Múltiples instancias
    let ormay = await fluyeSession.openDoors('ormay');
    let vidacel = await fluyeSession.openDoors('vidacel');

    // Con Cognito JWT (app React, browser)
    let fluyeSession = new FluyeSession({ token: cognitoJwt });
    let doorsSession = await fluyeSession.openDoors('ormay');
*/
export class FluyeSession {
    #url;
    #apiKey;
    #token;
    #instances;
    #user;
    #utils;
    data;
    #doorsClient;

    constructor(options = {}) {
        this.#url = options.url || 'https://fluye.ar/api/v9';
        this.#apiKey = options.apiKey;
        this.#token = options.token;
        this.#instances = new Instances(this);
        this.#user = new User(this);
        this.#utils = new Utilities(this);
        this.data = new Data(this, '/session/data');
    }

    // Conecta a una instancia por id. Retorna un Session autenticado.
    async openDoors(id) {
        let me = this;
        let res = await me.fetch('/session/connect', {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Connect failed');

        if (!me.#doorsClient) me.#doorsClient = await me.utils.import({ repo: 'fluye', path: 'doorsClient.mjs' });
        return new me.#doorsClient.Session(data.serverUrl, data.authToken);
    }

    get instances() { return this.#instances; }
    get user() { return this.#user; }
    get utils() { return this.#utils; }

    set token(value) { this.#token = value; }
    set apiKey(value) { this.#apiKey = value; }

    async fetch(path, options = {}) {
        let headers = { 'Content-Type': 'application/json' };
        if (this.#token) headers['Authorization'] = 'Bearer ' + this.#token;
        if (this.#apiKey) headers['X-Api-Key'] = this.#apiKey;
        return fetch(this.#url + path, { ...options, headers: { ...headers, ...options.headers } });
    }
}

/**
Instancias registradas del usuario.

Uso:
    let list = await fluye.instances.list();
    await fluye.instances.add({ url, login, pwd, instance });
    await fluye.instances.remove(id);
*/
class Instances {
    #fSession;
    #cache;

    constructor(session) {
        this.#fSession = session;
    }

    async list() {
        let me = this;
        if (!me.#cache) {
            let res = await me.#fSession.fetch('/instances');
            let data = await res.json();
            if (!res.ok) throw new Error(data.error || 'List instances failed');
            me.#cache = data;
        }
        return me.#cache;
    }

    async add({ name, url, login, pwd, instance, protectPwd }) {
        let me = this;
        let res = await me.#fSession.fetch('/instances', {
            method: 'POST',
            body: JSON.stringify({ name, url, login, pwd, instance, protectPwd }),
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Add instance failed');
        me.#cache = null;
        return data;
    }

    async remove(id) {
        let me = this;
        let res = await me.#fSession.fetch('/instances', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Remove instance failed');
        me.#cache = null;
        return data;
    }
}

/**
Data store genérico (JSONB).

Uso:
    let all = await obj.data.get();
    let val = await obj.data.get('key');
    await obj.data.set('key', 'value');
*/
class Data {
    #fSession;
    #path;
    #cache;

    constructor(session, path) {
        this.#fSession = session;
        this.#path = path;
    }

    async get(key) {
        let me = this;
        if (!me.#cache) {
            let res = await me.#fSession.fetch(me.#path);
            let data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Data fetch failed');
            me.#cache = data;
        }
        return key ? me.#cache[key] : me.#cache;
    }

    async set(key, value) {
        let me = this;
        let res = await me.#fSession.fetch(me.#path, {
            method: 'PUT',
            body: JSON.stringify({ key, value }),
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Data set failed');
        if (me.#cache) me.#cache[key] = value;
        return data;
    }
}

class User {
    #fSession;
    data;
    constructor(session) {
        this.#fSession = session;
        this.data = new Data(session, '/user/data');
    }
}

class Utilities {
    #fSession;
    
    constructor(session) {
        this.#fSession = session;
    }

    /**
    Devuelve la url de un codigo Github

    @example
    ghCodeUrl({
        owner // def fluye-ar
        repo // nombre del repo
        path // Ruta al archivo, no poner el slash inicial
        ref // Branch / tag
        fresh // Actualiza el cache
        exec // Boolean, indica si es para ejecutar (ghx)
        server // Opcional, def https://cdn.fluye.ar, https://node.cloudycrm.net para exec
    }
    */
    ghCodeUrl(options) {
        let opt = Object.assign({
            owner: 'fluye-ar',
        }, options);

        /*
        Puedo especificar el ref y fresh de los scripts en el localStorage, en un item asi:
            scripts = [{ "repo": "myRepo", "path": "myScript.js", "ref": "myBranchOrTag", "fresh": "true" }, { "repo": ... }]
        */
        if (typeof(window) == 'object' && window.localStorage && opt.repo && opt.path) {
            try {
                var lsScripts = JSON.parse(window.localStorage.getItem('scripts'));
                if (Array.isArray(lsScripts)) {
                    var scr = lsScripts.find(el => (el.owner || '') == (opt.owner || '') && (el.repo || '').toLowerCase() == (opt.repo || '').toLowerCase() && el.path == opt.path);
                    if (scr) {
                        opt.ref = scr.ref;
                        opt.fresh = scr.fresh;
                        console.log('ghCodeUrl localStorage hit', scr)
                    }
                };
            } catch (e) {
                // Nothing to do
            };
        }

        let url;
        if (opt.exec) {
            if (opt.vercel) {
                url = (opt.server || 'https://fluye.ar') + '/api/ghx';
            } else {
                url = (opt.server || 'https://node.cloudycrm.net') + '/ghx';
            }
        } else {
            url = (opt.server || 'https://cdn.fluye.ar') + '/gh';
        }
        url += `/${ opt.owner }/${ opt.repo }`;
        url += opt.ref ? `@${ opt.ref }` : '';
        while(opt.path.substring(0, 1) == '/') opt.path = opt.path.slice(1);
        url += '/' + opt.path;
        if (opt.fresh == true || opt.fresh == 1) url += '?_fresh=1';

        return url;
    }

    /**
    Importa un modulo.
    Se puede usar desde el cliente o el servidor.
    module puede ser un string, o un objeto para códigos del repo.
    @example
    // server
    let mod = await dSession.utils.import('fast-xml-parser');
    // client
    let mod = await dSession.utils.import('https://cdn.jsdelivr.net/npm/fast-xml-parser/+esm');
    // repo
    let mod = await dSession.utils.import({ repo: 'Global', path: 'workflow.mjs' });
    */
    async import(module) {
        let me = this;

        let ret;
        if (typeof(module) == 'object') {
            if (platform == 'Ev8') {
                if (!module.owner) module.owner = 'fluye-ar';
                ret = await _mainlib.gitImport(module);
            } else if (platform == 'Vercel') {
                ret = await globalThis.fluye.gitImport(module);
            } else {
                ret = await import(me.ghCodeUrl(module));
            }
        } else {
            ret = await import(module);
        }

        if (ret.default) ret = ret.default;
        return ret;
    }
}

/*
Biblioteca javascript core para el cliente Fluye

Fresh: https://cdn.fluye.ar/ghf/fluye/browser.js?_fresh=1
*/

window.fluye = {
    /**
    Carga el client y crea la session
    */
    init: async function() {
        if (!fluye.client) fluye.client = await import('https://cdn.fluye.ar/ghf/fluye/client.mjs');
        if (!fluye.session) {
            fluye.session = new fluye.client.Session();
            window.fSession = fluye.session; // Para compatibilidad
        }
    },

    /**
    Se conecta a la sesion web, hace un redirect al login si no esta logueado
    */
    connect: async function() {
        if (!fluye.session) await fluye.init();
        if (!await fluye.session.webSession() || !await fluye.session.isLogged) {
            let path = location.pathname.replace(/^\/[^\/]+/, ''); // Saca el /c
            location.href = '/w/auth/login?request=' + encodeURIComponent(path + location.search);
            return;
        }
        await fluye.session.runSyncEventsOnClient(false);
    },

    /**
    Carga scripts o css dinamicamente
    @param {object|array} assets - { id, src } o [ { id, src, depends: [id1, id2] } ]
    @returns {Promise}
    */
    load: async function(assets) {
        if (!Array.isArray(assets)) assets = [assets];

        const loaded = {};

        const loadOne = (asset) => {
            return new Promise((resolve) => {
                if (loaded[asset.id] || document.getElementById('asset_' + asset.id)) {
                    console.log('load: ' + asset.id + ' already loaded, skipping');
                    resolve();
                    return;
                }

                console.log('load: ' + asset.id + ' loading - ' + asset.src);

                const ext = asset.src.split('?')[0].split('.').pop().toLowerCase();
                let el;

                if (ext === 'css') {
                    el = document.createElement('link');
                    el.rel = 'stylesheet';
                    el.href = asset.src;
                } else {
                    el = document.createElement('script');
                    el.async = true;
                    el.src = asset.src;
                }

                el.id = 'asset_' + asset.id;
                el.onload = () => {
                    loaded[asset.id] = true;
                    asset.loaded = true;
                    console.log('load: ' + asset.id + ' loaded');
                    resolve();
                };
                el.onerror = () => {
                    console.error('load: ' + asset.id + ' failed - ' + asset.src);
                    resolve();
                };

                document.head.appendChild(el);
            });
        };

        // Carga respetando dependencias
        const pending = [...assets];
        while (pending.length) {
            const ready = pending.filter(a =>
                !a.depends || a.depends.every(dep => loaded[dep])
            );

            if (!ready.length) {
                console.log('load: waiting for dependencies...', pending.map(a => a.id));
                await new Promise(r => setTimeout(r, 50));
                continue;
            }

            await Promise.all(ready.map(loadOne));
            ready.forEach(a => pending.splice(pending.indexOf(a), 1));
        }

        console.log('load: all assets loaded (' + assets.length + ')');
        return assets.length;
    },

    // Para cargar modulos
    mods: {},
}
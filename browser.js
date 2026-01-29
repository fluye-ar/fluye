/*
Biblioteca javascript core para el cliente Fluye

Fresh: https://cdn.fluye.ar/ghf/fluye/client/fluye.js?_fresh=1
*/

window.fluye = {
    /**
    Carga el client y crea la session
    */
    init: async function() {
        if (!fluye.client) fluye.client = await import('https://cdn.fluye.ar/ghf/fluye/client.mjs');
        if (!fluye.session) {
            fluye.session = new fluye.client.Session();

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

    // Para cargar modulos
    mods: {},
}
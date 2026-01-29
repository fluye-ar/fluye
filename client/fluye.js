/*
Biblioteca javascript core para el cliente Fluye

Fresh: https://cdn.fluye.ar/ghf/fluye/client/fluye.js?_fresh=1
*/

window.fluye = {
    /**
    Carga doorsapi3, crea dSession y lo conecta a la sesion web
    */
    init: async function() {
        if (!fluye.client) fluye.client = await import('https://cdn.fluye.ar/ghf/fluye/fluye-client.mjs');
        if (!fluye.session) {
            fluye.session = new fluye.client.Session();

            if (!await fluye.session.webSession() || !await fluye.session.isLogged) {
                let path = location.pathname.replace(/^\/[^\/]+/, ''); // Saca el /c
                location.href = '/w/auth/login?request=' + encodeURIComponent(path + location.search);
                return;
            }
        }
        await fluye.session.runSyncEventsOnClient(false);
    }
}
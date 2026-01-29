/*
Biblioteca javascript core para el cliente Fluye

Fresh: https://cdn.fluye.ar/ghf/fluye/client/fluye.js?_fresh=1
*/

/**
Carga doorsapi3, crea dSession y lo conecta a la sesion web
*/
async function importDoorsapi3() {
	if (!window.doorsapi3) window.doorsapi3 = await import('https://cdn.fluye.ar/ghf/fluye/doorsapi3.mjs');
	if (!window.dSession) {
		window.dSession = new doorsapi3.Session();

		if (!await dSession.webSession() || !await dSession.isLogged) {
            let path = location.pathname.replace(/^\/[^\/]+/, ''); // Saca el /c
            location.href = '/w/auth/login?request=' + encodeURIComponent(path + location.search);
            return;
        }
	}
	await dSession.runSyncEventsOnClient(false);
}

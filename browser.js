/*
Biblioteca javascript core para el cliente Fluye

Fresh:
https://cdn.fluye.ar/ghf/fluye/browser.js?_fresh=1
https://cdn.cloudycrm.net/gh/fluye-ar/fluye/browser.js?_fresh=1
*/


// Actualiza meta tags e icons de form.htm al cargar browser.js
(function() {
    const fluyeIcon = 'https://cdn.fluye.ar/ghf/fluye/brand/iso-logo.png';

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && descMeta.content === 'Cloudy CRM') descMeta.content = 'Fluye';

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content.includes('cdn.cloudycrm.net')) ogImage.content = fluyeIcon;

    // Actualiza favicons solo si son de cloudycrm
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(link => {
        if (link.href.includes('cdn.cloudycrm.net')) link.href = fluyeIcon;
    });
})();

window.fluye = {
    /**
    Carga el client y crea la session
    */
    init: async function() {
        if (!fluye.client) fluye.client = await import('https://cdn.fluye.ar/ghf/fluye/client.mjs' + (fluye.urlParams.get('_fresh') == '1' ? '?_fresh=1' : ''));
        if (!fluye.session) {
            fluye.session = new fluye.client.Session();
            window.fSession = fluye.session;
        }
    },

    /**
    Utilidades para bootstrap
    */
    bs: {
        _preloader: null,

        /**
        Carga los archivos de un input file como adjuntos al documento
        options = {
            input, // Elemento input file con los archivos a cargar
            doc, // Documento donde se cargan los adjuntos
            tag, // Opcional, tag a asignar a los adjuntos
            storage, // Opcional, s3 (def) / db
            callback(att), // Opcional, funcion que se llama por cada adjunto cargado
        }
        */
        inputFileAttachments: async function (options) {
            let opt = Object.assign({
                storage: 's3',
            }, options);

            for (file of opt.input.files) {
                let att = opt.doc.attachmentsAdd(file.name);

                let blb = await new Promise(resolve => {
                    let reader = new FileReader();
                    reader.onloadend = async function (e) {
                        resolve(new Blob([this.result], { type: file.type }));
                    };
                    reader.readAsArrayBuffer(file);
                });

                if (opt.storage == 's3' && att.fileStream2) {
                    let $prog = $(`
                        <div class="mb-2">Subiendo ${ file.name } (${ opt.doc.session.utils.fileSize(blb.size) })</div>
                        <div class="progress">
                            <div class="progress-bar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    `);
                    let t = fluye.bs.toast($prog, { autohide: false });
                    await att.fileStream2(blb, progress => {
                        $prog.find('.progress-bar')
                            .css('width', progress + '%')
                            .attr('aria-valuenow', progress)
                            .text(progress + "%");
                    });
                    t.hide();

                } else if (opt.storage == 'db') {
                    att.fileStream = blb;

                } else {
                    throw new Error('Invalid storage option');
                }

                let tag = opt.tag;
                if (tag || tag == 0) {
                    att.description = tag;
                    att.group = tag;
                }

                if (opt.callback) opt.callback(att);
            }
        },

        /**
        Carga las bibliotecas de Bootstrap 5
        */
        load: async function () {
            await fluye.load(['bootstrap', 'bootstrap-css', 'bootstrap-icons']);
        },

        /**
        Spinner que tapa toda la pagina (jQuery element, requiere Bootstrap 5 y jQuery)
        @example
        fluye.bs.preloader.show();
        fluye.bs.preloader.hide();
        */
        get preloader() {
            if (!this._preloader && typeof jQuery != 'undefined') {
                this._preloader = $('<div/>', {
                    style: 'position:fixed; top:0; left:0; z-index:9999; display:none; width:100%; height:100%;',
                }).appendTo($('body'));
                this._preloader.css('background-color', $('body').css('background-color') || '#fff');
                this._preloader.css('opacity', '0.5');
                this._preloader.append('<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);"><div class="spinner-border"></div></div>');
            }
            return this._preloader;
        },

        /**
        Selecciona el tab correspondiente a un nav clickeado.
        Soporta Bootstrap 5.3 y Framework7 7.0.
        Los navs y tabs deben estar dentro de un contenedor con clase doors-control-container.
        @param {Event} ev - Evento click
        @example
        $tabs.find('.nav-link').on('click', fluye.bs.tabClick); // Bootstrap
        $tabs.find('.tab-link').on('click', fluye.bs.tabClick); // Framework7
        */
        tabClick: function (ev) {
            let $this = $(ev.currentTarget);

            if (typeof app7 == 'object') {
                let ix = $this.index();
                let $root = $this.closest('.doors-control-container');
                $root.find('.tab-link-active').removeClass('tab-link-active');
                $root.find('.tab-active').removeClass('tab-active');
                $root.find('.tab-link').eq(ix).addClass('tab-link-active');
                app7.toolbar.setHighlight($root.find('.toolbar')[0]);
                $root.find('.tab').eq(ix).addClass('tab-active');
            } else {
                let ix = $this.parent().index();
                let $root = $this.closest('.doors-control-container');
                $root.find('.active').removeClass('active');
                $root.find('.show').removeClass('show');
                $root.find('.nav-link').eq(ix).addClass('active');
                $root.find('.tab-pane').eq(ix).addClass('show active');
            }
        },

        /**
        Muestra un toast de Bootstrap 5 (requiere jQuery)
        @param {string|jQuery} text - Texto o elemento jQuery a mostrar en el body
        @param {object} [options] - Opciones
        @param {boolean} [options.autohide=true] - Ocultar automaticamente
        @param {number} [options.delay=3000] - Delay en ms antes de ocultar
        @param {string} [options.title='Cloudy CRM'] - Titulo del toast
        @param {string} [options.subtitle=''] - Subtitulo
        @param {string} [options.icon] - URL del icono
        @returns {bootstrap.Toast} Instancia del toast
        @example
        fluye.bs.toast('Guardado exitosamente');
        fluye.bs.toast('Procesando...', { autohide: false });
        let t = fluye.bs.toast($progress, { autohide: false });
        t.hide();
        */
        toast: function (text, options) {
            var bsver = fluye.bs.version;

            if (bsver[0] < 5) {
                console.warn('Bootstrap 5 es requerido para toast');
                alert(text);
                return;
            };

            var opt = {
                autohide: true,
                delay: 3000,
                title: 'Fluye',
                subtitle: '',
                icon: 'https://cdn.fluye.ar/ghf/fluye/brand/iso-logo.png',
            }
            Object.assign(opt, options);

            var $cont = $('.toast-container');
            if (!$cont.length) {
                $cont = $('<div class="toast-container p-3" style="position:fixed; top:15px; right:0; z-index:2000;"></div>').appendTo('body');
            }

            var $toast = $(`
                <div class="toast">
                    <div class="toast-header">
                        <img src="${ opt.icon }" class="rounded me-2" style="width: 20px;">
                        <strong class="me-auto">${ opt.title }</strong>
                        <small class="text-muted">${ opt.subtitle }</small>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body"></div>
                </div>
            `).appendTo($cont);

            $toast.find('.toast-body').append(text);

            var t = new bootstrap.Toast($toast, opt);

            $toast.on('hidden.bs.toast', function () {
                $(this).remove();
            });

            t.show();
            return t;
        },

        /**
        Devuelve la version de Bootstrap cargada
        @returns {number[]} Array con [major, minor, patch], ej: [5, 3, 3]
        @example
        fluye.bs.version       // [5, 3, 3]
        fluye.bs.version[0]    // 5
        */
        get version() {
            let ver, ret;
            try {
                if (typeof bootstrap == 'object') {
                    ver = bootstrap.Button.VERSION;
                } else {
                    ver = $.fn.button.Constructor.VERSION;
                }
                ret = ver.split('.').map(el => parseInt(el));
                return ret;

            } catch (er) {
                console.warn('Bootstrap not found');
                return [];
            };
        }
    },

    /**
    Se conecta a la sesion web, hace un redirect al login si no esta logueado
    */
    connect: async function() {
        //todo: falta soporte app
        if (!fluye.session) await fluye.init();
        if (!await fluye.session.webSession() || !await fluye.session.isLogged) {
            let path = location.pathname.replace(/^\/[^\/]+/, ''); // Saca el /c
            location.href = '/w/auth/login?request=' + encodeURIComponent(path + location.search);
            return;
        }
        await fluye.session.runSyncEventsOnClient(false);
    },

    /**
    Descarga un buffer como archivo
    @example
    downloadFile(buffer, 'logo.jpg');
    */
    downloadFile: function (buffer, fileName) {
        var url = URL.createObjectURL(buffer);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();    
        a.remove();
        URL.revokeObjectURL(url);
    },

    /**
    Devuelve un buffer con un elemento de GitHub o su url
    @example
    gitCdn({
        owner // def fluye-ar
        repo // 
        path // Ruta al archivo, no poner el slash inicial
        ref // Branch / tag
        fresh // Actualiza el cache
        url // Devuelve la url en vez del buffer. Def false
        server // Opcional, def https://cdn.fluye.ar
    }
    @returns {string|Promise<SimpleBuffer>}
    */
    gitCdn: async function (options) {
        if (!fluye.session) await fluye.init();

        let utils = fluye.session.utils;
        let url = utils.ghCodeUrl(options);

        if (options.url) {
            return url;
            
        } else {
            let res = await fetch(url);
            if (res.ok) {
                return utils.newSimpleBuffer(await res.arrayBuffer());

            } else {
                try {
                    var txt = await res.text();
                    var json = JSON.parse(txt);
                    // importa serialize si no esta
                    if (!window.serializeError) {
                        let mod = await import('https://cdn.jsdelivr.net/npm/serialize-error-cjs@0.1.3/+esm');
                        window.serializeError = mod.default;
                    }
                    var err = serializeError.deserializeError(json);
                    throw err;

                } catch(err) {
                    throw new Error(res.status + ' (' + res.statusText + ')');
                }
            }
        }
    },

    inApp: typeof window.app7 == 'object',

    /**
    Carga scripts o css dinamicamente
    @param {string|object|array} assets - 'id', { id, src } o [ { id, src, depends } ]
    @returns {Promise<number>}
    */
    load: async function(assets) {
        // Sources: string (URL) o { src, tag: 'link'|'script' }
        const sources = {
            'jquery': 'https://code.jquery.com/jquery-3.7.1.min.js',
            'bootstrap': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
            'bootstrap-css': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
            'bootstrap-icons': 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
            'tailwind': 'https://cdn.tailwindcss.com',
            'inter-font': { src: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', tag: 'link' },
        };

        if (!Array.isArray(assets)) assets = [assets];

        // Normaliza: string -> { id, src, tag }
        assets = assets.map(a => {
            if (typeof a === 'string') {
                const source = sources[a];
                if (typeof source === 'object') {
                    return { id: a, src: source.src, tag: source.tag };
                }
                return { id: a, src: source };
            }
            if (!a.src && sources[a.id]) {
                const source = sources[a.id];
                if (typeof source === 'object') {
                    a.src = source.src;
                    a.tag = source.tag;
                } else {
                    a.src = source;
                }
            }
            return a;
        });

        const findEl = (id) => document.getElementById('asset_' + id) || document.getElementById('script_' + id);
        const isLoaded = (el) => el && (el.dataset.loaded === 'true' || el._loaded);

        const loadOne = (asset) => {
            return new Promise((resolve) => {
                const existingEl = findEl(asset.id);
                if (existingEl) {
                    // Ya existe, esperar a que se cargue (max 3 segundos)
                    let waiting = 0;
                    const checkLoaded = () => {
                        waiting += 50;
                        if (isLoaded(existingEl)) {
                            asset.loaded = true;
                            resolve();
                        } else if (existingEl.dataset.loaded === 'error') {
                            resolve();
                        } else if (waiting > 3000) {
                            console.log(asset.id + ' timeout');
                            asset.loaded = true;
                            existingEl.dataset.loaded = 'true';
                            resolve();
                        } else {
                            setTimeout(checkLoaded, 50);
                        }
                    };
                    checkLoaded();
                    return;
                }

                // Determinar tag: explícito, o por extensión
                let tag = asset.tag;
                if (!tag) {
                    const ext = asset.src.split('?')[0].split('.').pop().toLowerCase();
                    tag = (ext === 'css') ? 'link' : 'script';
                }

                let el;
                if (tag === 'link') {
                    el = document.createElement('link');
                    el.rel = 'stylesheet';
                    el.href = asset.src;
                } else {
                    el = document.createElement('script');
                    el.async = true;
                    el.src = asset.src;
                }

                el.id = 'asset_' + asset.id;

                let resolved = false;
                el.onload = () => {
                    if (resolved) return;
                    resolved = true;
                    asset.loaded = true;
                    el.dataset.loaded = 'true';
                    console.log(asset.id + ' loaded - ' + asset.src);
                    resolve();
                };
                el.onerror = () => {
                    if (resolved) return;
                    resolved = true;
                    console.error(asset.id + ' failed - ' + asset.src);
                    el.dataset.loaded = 'error';
                    resolve();
                };

                // Timeout 3s (para debugging cuando onload no se dispara)
                setTimeout(() => {
                    if (resolved) return;
                    resolved = true;
                    console.log(asset.id + ' timeout');
                    asset.loaded = true;
                    el.dataset.loaded = 'true';
                    resolve();
                }, 3000);

                document.head.appendChild(el);
            });
        };

        // Carga respetando dependencias
        const pending = [...assets];
        let iterations = 0;

        while (pending.length) {
            iterations++;
            const ready = pending.filter(a => {
                if (!a.depends) return true;
                return a.depends.every(dep => isLoaded(findEl(dep)));
            });

            if (!ready.length) {
                if (iterations > 100) {
                    console.error('[fluye.load] TIMEOUT - stuck in dependency loop!', pending.map(a => ({ id: a.id, depends: a.depends })));
                    break;
                }
                await new Promise(r => setTimeout(r, 50));
                continue;
            }

            await Promise.all(ready.map(loadOne));
            ready.forEach(a => pending.splice(pending.indexOf(a), 1));
        }

        return assets.length;
    },

    /**
    Cache de módulos con lazy loading
    @param {string} key - Identificador del módulo
    @param {Function} loader - Función async que carga el módulo
    @param {Object} [context] - Si viene, llama a setContext del módulo
    @returns {Promise<any>} El módulo cargado
    @example
    const aiChat = await fluye.mod('ai/chat', () => fSession.import({ ... }), ctx);
    */
    mod: async function(key, loader, context) {
        if (!this.mods[key]) {
            this.mods[key] = await loader();
        }
        if (context && this.mods[key].setContext) {
            await this.mods[key].setContext(context);
        }
        return this.mods[key];
    },

    // Cache de modulos
    mods: {},

    /**
    Crea un formulario, hace submit de los datos y lo borra
    Se puede usar para abrir una nueva ventana haciendo POST
    @example
    submitData({
        url: 'http://my.url/path',
        data: {
            param1: 'value1',
            param2: 'value2',
        },
        method: 'GET', // Opcional, default POST
        target: '_self', // Opcional, default _blank
    });
    */
    submitData: function (options) {
        var opt = {
            method: 'POST',
            target: '_blank',
        }
        Object.assign(opt, options);

        var form = document.createElement('form');
        form.target = opt.target;
        form.method = opt.method;
        form.action = opt.url;
        form.style.display = 'none';

        for (var key in opt.data) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = opt.data[key];
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    },

    /**
    Utilidades para Tailwind
    */
    tw: {
        /**
        Configura Tailwind con el tema Fluye (llamar después de tw.load())
        */
        config: function() {
            if (typeof tailwind !== 'undefined' && tailwind.config) {
                tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                fluye: {
                                    dark: '#1e4c76',
                                    mid: '#2d5a87',
                                    light: '#547797',
                                    bg: '#dbe7f6',
                                    accent: '#708eac',
                                }
                            },
                            fontFamily: {
                                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                            }
                        }
                    }
                };
            }
        },

        /**
        Carga Tailwind
        */
        load: async function () {
            await fluye.load('tailwind');
        },

    },

    urlParams: new URLSearchParams(window.location.search),
}
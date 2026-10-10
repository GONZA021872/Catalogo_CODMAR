/* ================================================= */
/*                 CONEXIÓN SUPABASE                 */
/* ================================================= */

const SUPABASE_URL =
    "https://lkajqjiiqatleydroibw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tfOFSgp4Rq8Q6WKSWhstaA_VsdxHk9D";

const clienteSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* ================================================= */
/*              INICIO DE LA APLICACIÓN              */
/* ================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

/* ================================================= */
/*              SESIÓN DEL USUARIO                  */
/* ================================================= */

const {
    data: { session },
    error: errorSesion
} = await clienteSupabase.auth.getSession();

if (errorSesion) {

    console.error(
        "Error al obtener la sesión:",
        errorSesion
    );

}


if (!session) {

    console.log(
        "No hay usuario autenticado."
    );

    document.getElementById(
        "pantalla-login"
    ).style.display = "block";

    document.getElementById(
        "pagina-inicio"
    ).style.display = "none";

} else {

    console.log(
        "Usuario autenticado:",
        session.user.id
    );

    document.getElementById(
        "pantalla-login"
    ).style.display = "none";

    document.getElementById(
        "pagina-inicio"
    ).style.display = "block";

}
    

/* ================================================= */
/*                INICIO DE SESIÓN                   */
/* ================================================= */

const botonLogin =
    document.getElementById("boton-login");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");

const mensajeLogin =
    document.getElementById("mensaje-login");


if (botonLogin) {

    botonLogin.addEventListener(
        "click",
        async function () {

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;

            mensajeLogin.textContent = "";


            const {
                data,
                error
            } = await clienteSupabase.auth.signInWithPassword({

                email: email,

                password: password

            });


            if (error) {

                console.error(
                    "Error al iniciar sesión:",
                    error
                );

                mensajeLogin.textContent =
                    "Correo o contraseña incorrectos.";

                return;
            }


            console.log(
                "Sesión iniciada:",
                data.user.id
            );


            document.getElementById(
                "pantalla-login"
            ).style.display = "none";


            document.getElementById(
                "pagina-inicio"
            ).style.display = "block";


            location.reload();
        }
    );

}

/* ================================================= */
/*       DETENER CARGA SI NO HAY SESIÓN              */
/* ================================================= */

if (!session) {
    return;
}



        /* ============================================= */
        /*              ELEMENTOS DEL MENÚ              */
        /* ============================================= */

        const botonMenu =
            document.getElementById("boton-menu");

        const panelMenu =
            document.getElementById("panel-menu");

        const opcionesMenu =
            document.querySelectorAll(".opcion-menu");

        const opcionInicio =
            document.querySelector(".opcion-menu");


        /* ============================================= */
        /*                 FORMULARIOS                    */
        /* ============================================= */

        const formularioInicio =
            document.getElementById("formulario-inicio");

        const formularioCabecera =
            document.getElementById("formulario-cabecera");

        const formularioNombreComercial =
            document.getElementById(
                "formulario-nombre-comercial"
            );

        const formularioLogotipo =
            document.getElementById(
                "formulario-logotipo"
            );

            const formularioCarrito =
            document.getElementById(
            "formulario-carrito"
    );


            
const formularioBuscador =
    document.getElementById(
        "formulario-buscador"
    );


        /* ============================================= */
        /*           BOTONES DE CONFIGURACIÓN             */
        /* ============================================= */

        const botonNombreComercial =
            document.getElementById(
                "boton-nombre-comercial"
            );
  
        const botonConfigurarCarrito =
             document.getElementById(
            "boton-configurar-carrito"
    );

           
const botonConfigurarBuscador =
    document.getElementById(
        "boton-configurar-buscador"
    );

const aceptarBuscador =
    document.getElementById(
        "aceptar-buscador"
    );

           


          const aceptarCarrito =
                document.getElementById(
               "aceptar-carrito"
    );  


        const aceptarNombreComercial =
            document.getElementById(
                "aceptar-nombre-comercial"
            );

        const botonConfigurarLogotipo =
            document.getElementById(
                "boton-configurar-logotipo"
            );

        const aceptarLogotipo =
            document.getElementById(
                "aceptar-logotipo"
            );

        const aceptarInicio =
            document.getElementById(
                "aceptar-inicio"
            );

            console.log("BOTONES DE CONFIGURACIÓN CARGADOS");
console.log("ACEPTAR NOMBRE:", aceptarNombreComercial);

        const aceptarCabecera =
            document.getElementById(
                "aceptar-cabecera"
            );


        /* ============================================= */
        /*               CONFIGURACIÓN GENERAL            */
        /* ============================================= */

        const colorFranjas =
            document.getElementById(
                "color-franjas"
            );

        const colorBotonMenu =
            document.getElementById(
                "color-boton-menu"
            );

        const colorTextoMenu =
            document.getElementById(
                "color-texto-menu"
            );

        const colorPanelMenu =
            document.getElementById(
                "color-panel-menu"
            );


        /* ============================================= */
        /*                    CARRITO                     */
        /* ============================================= */

        const mostrarCarrito =
            document.getElementById(
                "mostrar-carrito"
            );

        const botonCarrito =
            document.querySelector(
                ".boton-carrito"
            );


        /* ============================================= */
        /*              NOMBRE COMERCIAL                  */
        /* ============================================= */

        const mostrarNombreComercial =
            document.getElementById(
                "mostrar-nombre-comercial"
            );

        const nombreComercial =
            document.getElementById(
                "nombre-comercial"
            );

        const fuenteNombreComercial =
            document.getElementById(
                "fuente-nombre-comercial"
            );

        const tamanoNombreComercial =
            document.getElementById(
                "tamano-nombre-comercial"
            );


        /* ============================================= */
        /*                    BUSCADOR                    */
        /* ============================================= */

        const mostrarBuscador =
            document.getElementById(
                "mostrar-buscador"
            );

        const buscador =
            document.getElementById(
                "buscador"
            );

        const botonBusqueda =
            document.getElementById(
                "boton-busqueda"
            );

        
/* ============================================= */
/*       CONFIGURACIÓN DEL BUSCADOR               */
/* ============================================= */

const flechaBuscadorArriba =
    document.getElementById("flecha-buscador-arriba");

const flechaBuscadorIzquierda =
    document.getElementById("flecha-buscador-izquierda");

const flechaBuscadorDerecha =
    document.getElementById("flecha-buscador-derecha");

const flechaBuscadorAbajo =
    document.getElementById("flecha-buscador-abajo");

const centroBuscador =
    document.getElementById("centro-buscador");

const tamanoBuscador =
    document.getElementById("tamano-buscador");



        /* ============================================= */
        /*                    LOGOTIPO                    */
        /* ============================================= */

        const archivoLogotipo =
            document.getElementById(
                "archivo-logotipo"
            );

        const vistaLogotipo =
            document.getElementById(
                "vista-logotipo"
            );

        const botonLogotipo =
            document.getElementById(
                "boton-logotipo"
            );

        const mostrarLogotipo =
            document.getElementById(
                "mostrar-logotipo"
            );


        /* ============================================= */
        /*        FLECHAS DEL LOGOTIPO                   */
        /* ============================================= */

        const flechaLogotipoIzquierda =
            document.getElementById(
                "flecha-logotipo-izquierda"
            );

        const flechaLogotipoDerecha =
            document.getElementById(
                "flecha-logotipo-derecha"
            );


        /* ============================================= */
        /*       FLECHAS DEL NOMBRE COMERCIAL             */
        /* ============================================= */

        const flechaNombreComercialIzquierda =
            document.getElementById(
                "flecha-nombre-comercial-izquierda"
            );

        const flechaNombreComercialDerecha =
            document.getElementById(
                "flecha-nombre-comercial-derecha"
            );

        const flechaNombreComercialArriba =
            document.getElementById(
                "flecha-nombre-comercial-arriba"
            );

        const flechaNombreComercialAbajo =
            document.getElementById(
                "flecha-nombre-comercial-abajo"
            );

         /* ================================================= */
/*          CONFIGURACIÓN DEL CARRITO                */
/* ================================================= */

const tipoBolsita =
    document.getElementById(
        "tipo-bolsita"
    );

const tipoCarrito =
    document.getElementById(
        "tipo-carrito"
    );

/* ============================================= */
/*       FLECHAS DE POSICIÓN DEL CARRITO         */
/* ============================================= */

const flechaCarritoIzquierda =
    document.getElementById(
        "flecha-carrito-izquierda"
    );

const flechaCarritoDerecha =
    document.getElementById(
        "flecha-carrito-derecha"
    );

const flechaCarritoArriba =
    document.getElementById(
        "flecha-carrito-arriba"
    );

const flechaCarritoAbajo =
    document.getElementById(
        "flecha-carrito-abajo"
    );



        /* ============================================= */
        /*             FRANJAS PRINCIPALES                */
        /* ============================================= */

        const franjaSuperior =
            document.querySelector(
                ".barra-inicio-superior"
            );

        const franjaInferior =
            document.querySelector(
                ".barra-inicio-inferior"
            );

        /* ================================================= */
/*          VARIABLES DE FUNCIONAMIENTO              */
/* ================================================= */

let ajusteLogotipo = 0;

let ajusteNombreComercialX = 0;
let ajusteNombreComercialY = 0;

let tamanoNombreComercialEscritorio = "20px";
let tamanoNombreComercialMovil = "20px";

let ajusteNombreComercialXEscritorio = 0;
let ajusteNombreComercialYEscritorio = 0;

let ajusteNombreComercialXMovil = 0;
let ajusteNombreComercialYMovil = 0;

let nombreComercialEscritorio = "";
let nombreComercialMovil = "";

let tipoCarritoSeleccionado = "bolsita";


let ajusteCarritoX = 0;

let ajusteCarritoY = 0;

/* VARIABLES DE POSICIÓN DEL BUSCADOR */

let ajusteBuscadorX = 0;

let ajusteBuscadorY = 0;

/* TAMAÑO DEL BUSCADOR */

let tamanoBuscadorSeleccionado = "mediano";

/* INTERVALO PARA MANTENER LAS FLECHAS PRESIONADAS */

let intervaloLogotipo = null;

let intervaloCarrito = null;

let intervaloBuscador = null;


        /* ================================================= */
        /*       FUNCIÓN PARA ACTUALIZAR VARIABLES CSS       */
        /* ================================================= */

        function actualizarVariableCSS(
            variable,
            valor
        ) {
            document.documentElement.style.setProperty(
                variable,
                valor
            );
        }


        /* ================================================= */
        /*              LOGOTIPO: POSICIÓN                   */
        /* ================================================= */

        function aplicarAjusteLogotipo() {

            actualizarVariableCSS(
                "--ajuste-logotipo-x",
                `${ajusteLogotipo}px`
            );
        }


        function moverLogotipo(direccion) {

            ajusteLogotipo +=
                direccion * 10;

            aplicarAjusteLogotipo();
        }


        function iniciarMovimientoLogotipo(
            direccion
        ) {

            moverLogotipo(direccion);

            intervaloLogotipo =
                setInterval(
                    function () {
                        moverLogotipo(
                            direccion
                        );
                    },
                    80
                );
        }


        function detenerMovimientoLogotipo() {

            clearInterval(
                intervaloLogotipo
            );

            intervaloLogotipo = null;
        }

        /* ================================================= */
/*          IDENTIFICAR CLIENTE DEL USUARIO          */
/* ================================================= */

const {
    data: usuarioCliente,
    error: errorUsuarioCliente
} = await clienteSupabase
    .from("usuarios")
    .select("cliente_id")
    .eq("auth_user_id", session.user.id)
    .maybeSingle();


if (errorUsuarioCliente) {

    console.error(
        "Error al obtener cliente del usuario:",
        errorUsuarioCliente
    );

}


if (!usuarioCliente) {

    console.error(
        "El usuario no tiene un cliente asignado."
    );

    return;
}


const clienteId =
    usuarioCliente.cliente_id;


console.log(
    "CLIENTE ACTUAL:",
    clienteId
);


         /* ================================================= */
        /*             CARGAR CONFIGURACIÓN                  */
        /* ================================================= */

        const {
            data: configuracionGuardada,
            error
        } = await clienteSupabase
            .from("configuracion_inicio")
            .select("*")
           .eq("cliente_id", clienteId)
            .maybeSingle();

        
/* ========================================= */
/* POSICIÓN BOTÓN ACEPTAR EN ESCRITORIO      */
/* ========================================= */

const botonAceptarNombreComercial = document.getElementById(
    "aceptar-nombre-comercial"
);

if (botonAceptarNombreComercial && window.innerWidth > 768) {
    const posicionGuardada =
        configuracionGuardada?.aceptar_nombre_comercial_top_escritorio;

    botonAceptarNombreComercial.style.top =
        `${posicionGuardada ?? 315}px`;
}




        /* ================================================= */
        /*                 ERROR DE CARGA                    */
        /* ================================================= */

        if (error) {

            console.error(
                "Error al cargar configuración:",
                error
            );
        }


        /* ================================================= */
        /*        APLICAR CONFIGURACIÓN GUARDADA             */
        /* ================================================= */

        if (configuracionGuardada) {


            /* --------------------------------------------- */
            /* COLORES                                        */
            /* --------------------------------------------- */

            actualizarVariableCSS(
                "--color-franjas",
                configuracionGuardada.color_franjas ||
                "white"
            );

            actualizarVariableCSS(
                "--color-boton-menu",
                configuracionGuardada.color_boton_menu ||
                "#159c96"
            );

            actualizarVariableCSS(
                "--color-texto-menu",
                configuracionGuardada.color_texto_menu ||
                "#f2f2f2"
            );

            actualizarVariableCSS(
                "--color-panel-menu",
                configuracionGuardada.color_panel_menu ||
                "#D8E2EE"
            );


            /* --------------------------------------------- */
            /* CONTROLES DE COLOR                             */
            /* --------------------------------------------- */

            colorFranjas.value =
                configuracionGuardada.color_franjas ||
                "#ffffff";

            colorBotonMenu.value =
                configuracionGuardada.color_boton_menu ||
                "#159c96";

            colorTextoMenu.value =
                configuracionGuardada.color_texto_menu ||
                "#f2f2f2";

            colorPanelMenu.value =
                configuracionGuardada.color_panel_menu ||
                "#D8E2EE";


            /* --------------------------------------------- */
            /* CARRITO                                       */
            /* --------------------------------------------- */

            mostrarCarrito.checked =
                configuracionGuardada.mostrar_carrito !== false;

            botonCarrito.classList.toggle(
                "oculto",
                !mostrarCarrito.checked
            );

                /* --------------------------------------------- */
/* CAMBIAR TIPO DE CARRITO                       */
/* --------------------------------------------- */

if (tipoBolsita) {

    tipoBolsita.addEventListener(
        "change",
        function () {

            if (!tipoBolsita.checked) {
                return;
            }

            tipoCarritoSeleccionado =
                "bolsita";

            aplicarTipoCarrito();
        }
    );
}


if (tipoCarrito) {

    tipoCarrito.addEventListener(
        "change",
        function () {

            if (!tipoCarrito.checked) {
                return;
            }

            tipoCarritoSeleccionado =
                "carrito";

            aplicarTipoCarrito();
        }
    );
}


            /* --------------------------------------------- */
            /* LOGOTIPO                                      */
            /* --------------------------------------------- */

            mostrarLogotipo.checked =
                configuracionGuardada.mostrar_logotipo !== false;

          /* --------------------------------------------- */
/* NOMBRE COMERCIAL                              */
/* --------------------------------------------- */

mostrarNombreComercial.checked =
    configuracionGuardada.mostrar_nombre_comercial !== false;


/* ================================================= */
/*       CARGAR NOMBRE SEGÚN DISPOSITIVO             */
/* ================================================= */

nombreComercialEscritorio =
    configuracionGuardada
        .nombre_comercial_escritorio
        || configuracionGuardada
            .nombre_comercial
        || "";

nombreComercialMovil =
    configuracionGuardada
        .nombre_comercial_movil
        || configuracionGuardada
            .nombre_comercial
        || "";


/* ================================================= */
/*       SELECCIONAR NOMBRE ACTUAL                   */
/* ================================================= */

if (window.innerWidth <= 768) {

    nombreComercial.value =
        nombreComercialMovil;

} else {

    nombreComercial.value =
        nombreComercialEscritorio;
}


/* --------------------------------------------- */
/* FUENTE DEL NOMBRE COMERCIAL                   */
/* --------------------------------------------- */

fuenteNombreComercial.value =
    configuracionGuardada.fuente_nombre_comercial
    || "Arial";
            
/* ================================================= */
/*       CARGAR TAMAÑO SEGÚN DISPOSITIVO             */
/* ================================================= */

tamanoNombreComercialEscritorio =
    configuracionGuardada
        .tamano_nombre_comercial_escritorio
        || configuracionGuardada
            .tamano_nombre_comercial
        || "20px";

tamanoNombreComercialMovil =
    configuracionGuardada
        .tamano_nombre_comercial_movil
        || configuracionGuardada
            .tamano_nombre_comercial
        || "20px";


/* ================================================= */
/*       CARGAR POSICIÓN ESCRITORIO                  */
/* ================================================= */

ajusteNombreComercialXEscritorio =
    configuracionGuardada
        .ajuste_nombre_comercial_x_escritorio
        ?? configuracionGuardada
            .ajuste_nombre_comercial_x
        ?? 0;

ajusteNombreComercialYEscritorio =
    configuracionGuardada
        .ajuste_nombre_comercial_y_escritorio
        ?? configuracionGuardada
            .ajuste_nombre_comercial_y
        ?? 0;


/* ================================================= */
/*       CARGAR POSICIÓN MÓVIL                       */
/* ================================================= */

ajusteNombreComercialXMovil =
    configuracionGuardada
        .ajuste_nombre_comercial_x_movil
        ?? configuracionGuardada
            .ajuste_nombre_comercial_x
        ?? 0;

ajusteNombreComercialYMovil =
    configuracionGuardada
        .ajuste_nombre_comercial_y_movil
        ?? configuracionGuardada
            .ajuste_nombre_comercial_y
        ?? 0;


/* ================================================= */
/*       SELECCIONAR DISPOSITIVO ACTUAL              */
/* ================================================= */

if (window.innerWidth <= 768) {

    tamanoNombreComercial.value =
        tamanoNombreComercialMovil;

    ajusteNombreComercialX =
        ajusteNombreComercialXMovil;

    ajusteNombreComercialY =
        ajusteNombreComercialYMovil;

} else {

    tamanoNombreComercial.value =
        tamanoNombreComercialEscritorio;

    ajusteNombreComercialX =
        ajusteNombreComercialXEscritorio;

    ajusteNombreComercialY =
        ajusteNombreComercialYEscritorio;
}


/* ================================================= */
/*       APLICAR FUENTE Y TAMAÑO                     */
/* ================================================= */

actualizarVariableCSS(
    "--fuente-nombre-comercial",
    fuenteNombreComercial.value
);

actualizarVariableCSS(
    "--tamano-nombre-comercial",
    tamanoNombreComercial.value
);


/* ================================================= */
/*       APLICAR POSICIÓN                            */
/* ================================================= */

aplicarAjusteNombreComercial();


            /* --------------------------------------------- */
            /* BUSCADOR                                      */
            /* --------------------------------------------- */

            mostrarBuscador.checked =
                configuracionGuardada.mostrar_buscador !== false;

            buscador.classList.toggle(
                "oculto",
                !mostrarBuscador.checked
            );


            /* --------------------------------------------- */
            /* POSICIÓN DEL LOGOTIPO                         */
            /* --------------------------------------------- */

            ajusteLogotipo =
                configuracionGuardada.ajuste_logotipo_x ||
                0;

            aplicarAjusteLogotipo();
        }

        
/* ================================================= */
/*          CONFIGURACIÓN DEL CARRITO                */
/* ================================================= */

if (configuracionGuardada) {

    tipoCarritoSeleccionado =
        configuracionGuardada.tipo_carrito ?? "bolsita";

    ajusteCarritoX =
        configuracionGuardada.ajuste_carrito_x ?? 0;

    ajusteCarritoY =
        configuracionGuardada.ajuste_carrito_y ?? 0;

    aplicarAjusteCarrito();

    console.log("POSICIÓN DEL CARRITO AL CARGAR:", {
        ajusteX: ajusteCarritoX,
        ajusteY: ajusteCarritoY,
        anchoPantalla: window.innerWidth
    });
}



            /* --------------------------------------------- */
/* OPCIÓN SELECCIONADA                           */
/* --------------------------------------------- */

if (tipoBolsita) {

    tipoBolsita.checked =
        tipoCarritoSeleccionado === "bolsita";
}

if (tipoCarrito) {

    tipoCarrito.checked =
        tipoCarritoSeleccionado === "carrito";
}


/* --------------------------------------------- */
/* MOSTRAR ICONO SELECCIONADO                    */
/* --------------------------------------------- */

const iconoBolsita =
    document.getElementById("icono-bolsita");

const iconoCarrito =
    document.getElementById("icono-carrito");


function aplicarTipoCarrito() {

    if (!iconoBolsita || !iconoCarrito) {
        return;
    }

    if (tipoCarritoSeleccionado === "carrito") {

        iconoBolsita.classList.add("oculto");
        iconoCarrito.classList.remove("oculto");

        iconoCarrito.style.display = "block";

    } else {

        iconoBolsita.classList.remove("oculto");
        iconoCarrito.classList.add("oculto");

    }
}


aplicarTipoCarrito();


/* ================================================= */
/*                  MOSTRAR LOGOTIPO                  */
/* ================================================= */

if (
    configuracionGuardada &&
    configuracionGuardada.logotipo_url &&
    configuracionGuardada.mostrar_logotipo !== false
) {

    const imagenLogotipo =
        document.createElement("img");

    imagenLogotipo.src =
        configuracionGuardada.logotipo_url;

    imagenLogotipo.id =
        "logotipo-franja";

    franjaSuperior.appendChild(
        imagenLogotipo
    );

    aplicarAjusteLogotipo();
}
           
        /* ================================================= */
/*             MOSTRAR NOMBRE COMERCIAL               */
/* ================================================= */

const esMovilActual =
    window.innerWidth <= 768;

const nombreParaMostrar =
    esMovilActual
        ? nombreComercialMovil
        : nombreComercialEscritorio;


if (
    configuracionGuardada &&
    nombreParaMostrar &&
    configuracionGuardada.mostrar_nombre_comercial !== false
) {

    const nombreEncabezado =
        document.createElement("div");

    nombreEncabezado.id =
        "nombre-comercial-encabezado";

    nombreEncabezado.textContent =
        nombreParaMostrar;

    franjaSuperior.appendChild(
        nombreEncabezado
    );

    aplicarAjusteNombreComercial();
}



        /* ================================================= */
        /*               TERMINÓ LA CARGA                    */
        /* ================================================= */

        franjaSuperior.classList.remove(
            "cargando"
        );


        /* ================================================= */
        /*                    MENÚ                           */
        /* ================================================= */

        botonMenu.addEventListener(
            "click",
            function () {

                panelMenu.classList.toggle(
                    "menu-abierto"
                );
            }
        );


        /* ================================================= */
        /*                OPCIÓN INICIO                      */
        /* ================================================= */

        if (opcionInicio) {

            opcionInicio.addEventListener(
                "click",
                function () {

                    panelMenu.classList.remove(
                        "menu-abierto"
                    );

                    setTimeout(
                        function () {

                            formularioInicio.classList.add(
                                "formulario-abierto"
                            );

                        },
                        250
                    );
                }
            );
        }


        /* ================================================= */
        /*               OPCIÓN CABECERA                     */
        /* ================================================= */

        if (opcionesMenu[1]) {

            opcionesMenu[1].addEventListener(
                "click",
                function () {

                    panelMenu.classList.remove(
                        "menu-abierto"
                    );

                    setTimeout(
                        function () {

                            formularioCabecera.classList.add(
                                "formulario-abierto"
                            );

                        },
                        250
                    );
                }
            );
        }


        /* ================================================= */
        /*          CONFIGURAR NOMBRE COMERCIAL               */
        /* ================================================= */

        botonNombreComercial.addEventListener(
            "click",
            function () {

                formularioCabecera.classList.remove(
                    "formulario-abierto"
                );

                formularioNombreComercial.classList.add(
                    "formulario-abierto"
                );
            }
        );

          botonConfigurarCarrito.addEventListener("click", function () {
          formularioCabecera.classList.remove("formulario-abierto");
          formularioCarrito.classList.add("formulario-abierto");
});


            
/* ================================================= */
/*            CONFIGURAR BUSCADOR                    */
/* ================================================= */

botonConfigurarBuscador.addEventListener(
    "click",
    function () {

        formularioCabecera.classList.remove(
            "formulario-abierto"
        );

        formularioBuscador.classList.add(
            "formulario-abierto"
        );

    }
);
      

        /* ================================================= */
        /*            CONFIGURAR LOGOTIPO                    */
        /* ================================================= */

        botonConfigurarLogotipo.addEventListener(
            "click",
            function () {

                formularioCabecera.classList.remove(
                    "formulario-abierto"
                );

                formularioLogotipo.classList.add(
                    "formulario-abierto"
                );
            }
        );


        /* ================================================= */
        /*              BOTÓN SELECCIONAR LOGO                */
        /* ================================================= */

        botonLogotipo.addEventListener(
            "click",
            function () {

                archivoLogotipo.click();
            }
        );


        /* ================================================= */
        /*              VISTA PREVIA DEL LOGO                */
        /* ================================================= */

        archivoLogotipo.addEventListener(
            "change",
            function () {

                const archivo =
                    archivoLogotipo.files[0];

                if (!archivo) {
                    return;
                }

                const imagen =
                    new Image();

                imagen.onload =
                    function () {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        const contexto =
                            canvas.getContext(
                                "2d"
                            );

                        canvas.width =
                            imagen.width;

                        canvas.height =
                            imagen.height;

                        contexto.drawImage(
                            imagen,
                            0,
                            0
                        );

                        const datos =
                            contexto.getImageData(
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );

                        for (
                            let i = 0;
                            i < datos.data.length;
                            i += 4
                        ) {

                            const rojo =
                                datos.data[i];

                            const verde =
                                datos.data[i + 1];

                            const azul =
                                datos.data[i + 2];

                            if (
                                rojo > 240 &&
                                verde > 240 &&
                                azul > 240
                            ) {

                                datos.data[i + 3] = 0;
                            }
                        }

                        contexto.putImageData(
                            datos,
                            0,
                            0
                        );

                        const imagenTransparente =
                            document.createElement(
                                "img"
                            );

                        imagenTransparente.src =
                            canvas.toDataURL(
                                "image/png"
                            );

                        vistaLogotipo.innerHTML =
                            "";

                        vistaLogotipo.appendChild(
                            imagenTransparente
                        );
                    };

                imagen.src =
                    URL.createObjectURL(
                        archivo
                    );
            }
        );


        /* ================================================= */
        /*       MOVIMIENTO DEL LOGOTIPO                     */
        /* ================================================= */

        flechaLogotipoIzquierda.addEventListener(
            "mousedown",
            function () {

                iniciarMovimientoLogotipo(
                    -1
                );
            }
        );

        flechaLogotipoDerecha.addEventListener(
            "mousedown",
            function () {

                iniciarMovimientoLogotipo(
                    1
                );
            }
        );

        document.addEventListener(
            "mouseup",
            detenerMovimientoLogotipo
        );


 /* ================================================= */
/*     MOVIMIENTO DEL NOMBRE COMERCIAL               */
/* ================================================= */

let intervaloNombreComercial = null;

/* ------------------------------------------------- */
/* LIMITAR POSICIÓN DEL NOMBRE DENTRO DE LA FRANJA   */
/* ------------------------------------------------- */

function limitarAjusteNombreComercial() {

    const nombreEncabezado =
        document.getElementById(
            "nombre-comercial-encabezado"
        );

    if (!nombreEncabezado) {
        return;
    }

    const anchoFranja =
        franjaSuperior.clientWidth;

    const altoFranja =
        franjaSuperior.clientHeight;

    const anchoNombre =
        nombreEncabezado.offsetWidth;

    const altoNombre =
        nombreEncabezado.offsetHeight;


    /* --------------------------------------------- */
    /* LÍMITES HORIZONTALES                           */
    /* --------------------------------------------- */

    const limiteX =
        Math.floor(
            Math.max(
                0,
                (anchoFranja - anchoNombre) / 2
            )
        );


    /* --------------------------------------------- */
    /* LÍMITES VERTICALES                             */
    /* --------------------------------------------- */

    const limiteY =
        Math.floor(
            Math.max(
                0,
                (altoFranja - altoNombre) / 2
            )
        );


    ajusteNombreComercialX =
        Math.round(
            Math.max(
                -limiteX,
                Math.min(
                    limiteX,
                    ajusteNombreComercialX
                )
            )
        );


    ajusteNombreComercialY =
        Math.round(
            Math.max(
                -limiteY,
                Math.min(
                    limiteY,
                    ajusteNombreComercialY
                )
            )
        );
}

/* ------------------------------------------------- */
/* APLICAR POSICIÓN                                  */
/* ------------------------------------------------- */

function aplicarAjusteNombreComercial() {

    limitarAjusteNombreComercial();

    actualizarVariableCSS(
        "--ajuste-x",
        `${ajusteNombreComercialX}px`
    );

    actualizarVariableCSS(
        "--ajuste-y",
        `${ajusteNombreComercialY}px`
    );
}


/* ------------------------------------------------- */
/* MOVER NOMBRE                                      */
/* ------------------------------------------------- */

function moverNombreComercial(
    direccionX,
    direccionY
) {

    ajusteNombreComercialX +=
        direccionX * 10;

    ajusteNombreComercialY +=
        direccionY * 10;

    aplicarAjusteNombreComercial();
}


/* ------------------------------------------------- */
/* INICIAR MOVIMIENTO                                */
/* ------------------------------------------------- */

function iniciarMovimientoNombreComercial(
    direccionX,
    direccionY
) {

    detenerMovimientoNombreComercial();

    moverNombreComercial(
        direccionX,
        direccionY
    );

    intervaloNombreComercial =
        setInterval(
            function () {

                moverNombreComercial(
                    direccionX,
                    direccionY
                );

            },
            80
        );
}


/* ------------------------------------------------- */
/* DETENER MOVIMIENTO                                */
/* ------------------------------------------------- */

function detenerMovimientoNombreComercial() {

    if (intervaloNombreComercial) {

        clearInterval(
            intervaloNombreComercial
        );

        intervaloNombreComercial = null;
    }
}


/* ------------------------------------------------- */
/* BOTONES DE MOVIMIENTO                             */
/* ------------------------------------------------- */

function configurarFlechaNombreComercial(
    boton,
    direccionX,
    direccionY
) {

    if (!boton) {
        return;
    }


    boton.addEventListener(
        "pointerdown",
        function (evento) {

            evento.preventDefault();

            iniciarMovimientoNombreComercial(
                direccionX,
                direccionY
            );
        }
    );


    boton.addEventListener(
        "pointerup",
        detenerMovimientoNombreComercial
    );


    boton.addEventListener(
        "pointerleave",
        detenerMovimientoNombreComercial
    );


    boton.addEventListener(
        "pointercancel",
        detenerMovimientoNombreComercial
    );
}


/* ------------------------------------------------- */
/* CONFIGURAR LAS CUATRO DIRECCIONES                 */
/* ------------------------------------------------- */

configurarFlechaNombreComercial(
    flechaNombreComercialIzquierda,
    -1,
    0
);

configurarFlechaNombreComercial(
    flechaNombreComercialDerecha,
    1,
    0
);

configurarFlechaNombreComercial(
    flechaNombreComercialArriba,
    0,
    -1
);

configurarFlechaNombreComercial(
    flechaNombreComercialAbajo,
    0,
    1
);


/* ------------------------------------------------- */
/* SOLTAR EN CUALQUIER PARTE                         */
/* ------------------------------------------------- */

document.addEventListener(
    "pointerup",
    detenerMovimientoNombreComercial
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoNombreComercial
);

/* ================================================= */
/*          MOVIMIENTO DEL CARRITO                   */
/* ================================================= */

function limitarAjusteCarrito() {

    if (!botonCarrito) {
        return;
    }

    const franjaRect =
        franjaSuperior.getBoundingClientRect();

    const carritoRect =
        botonCarrito.getBoundingClientRect();


    /* --------------------------------------------- */
    /* LÍMITE HORIZONTAL IZQUIERDO                   */
    /* --------------------------------------------- */

    const limiteIzquierdo =
        franjaRect.left -
        carritoRect.left;


    /* --------------------------------------------- */
    /* LÍMITE HORIZONTAL DERECHO                     */
    /* --------------------------------------------- */

    const limiteDerecho =
        franjaRect.right -
        carritoRect.right;


    /* --------------------------------------------- */
    /* LÍMITE VERTICAL SUPERIOR                      */
    /* --------------------------------------------- */

    const limiteSuperior =
        franjaRect.top -
        carritoRect.top;


    /* --------------------------------------------- */
    /* LÍMITE VERTICAL INFERIOR                      */
    /* --------------------------------------------- */

    const limiteInferior =
        franjaRect.bottom -
        carritoRect.bottom;


    ajusteCarritoX =
        Math.max(
            ajusteCarritoX + limiteIzquierdo,
            Math.min(
                ajusteCarritoX + limiteDerecho,
                ajusteCarritoX
            )
        );

    ajusteCarritoY =
        Math.max(
            ajusteCarritoY + limiteSuperior,
            Math.min(
                ajusteCarritoY + limiteInferior,
                ajusteCarritoY
            )
        );
}


/* --------------------------------------------- */
/* APLICAR POSICIÓN                              */
/* --------------------------------------------- */

function aplicarAjusteCarrito() {

    actualizarVariableCSS(
        "--ajuste-carrito-x",
        `${ajusteCarritoX}px`
    );

    actualizarVariableCSS(
        "--ajuste-carrito-y",
        `${ajusteCarritoY}px`
    );
}


/* ============================================= */
/*       APLICAR TAMAÑO DEL BUSCADOR             */
/* ============================================= */

function aplicarTamanoBuscador() {

    if (!buscador || !tamanoBuscador) {
        return;
    }

   
const tamanos = {
    pequeno: {
        ancho: "110px",
        alto: "22px"
    },
    mediano: {
        ancho: "150px",
        alto: "25px"
    },
    grande: {
        ancho: "250px",
        alto: "32px"
    },
    extragrande: {
        ancho: "calc(100vw - 250px)",
        alto: "30px"
    }
};


    const seleccionado =
        tamanos[tamanoBuscadorSeleccionado] ||
        tamanos.mediano;

    buscador.style.width = seleccionado.ancho;
    buscador.style.height = seleccionado.alto;

    const campoBusqueda =
        document.getElementById("campo-busqueda");

    const botonBusqueda =
        document.getElementById("boton-busqueda");

    if (campoBusqueda) {
        campoBusqueda.style.height = "100%";
    }

    if (botonBusqueda) {
        botonBusqueda.style.height = "100%";
        botonBusqueda.style.width = "35px";
    }
}


/* ============================================= */
/*       CAMBIAR TAMAÑO AL ELEGIR OPCIÓN         */
/* ============================================= */

if (tamanoBuscador) {

    tamanoBuscador.addEventListener(
        "change",
        function () {

            tamanoBuscadorSeleccionado =
                tamanoBuscador.value;

            aplicarTamanoBuscador();

        }
    );
}



/* --------------------------------------------- */
/* APLICAR POSICIÓN DEL BUSCADOR                 */
/* --------------------------------------------- */

function aplicarAjusteBuscador() {

    actualizarVariableCSS(
        "--ajuste-buscador-x",
        `${ajusteBuscadorX}px`
    );

    actualizarVariableCSS(
        "--ajuste-buscador-y",
        `${ajusteBuscadorY}px`
    );

}


/* ============================================= */
/*       MOVIMIENTO DEL BUSCADOR                 */
/* ============================================= */

function moverBuscador(direccionX, direccionY) {

    ajusteBuscadorX += direccionX * 10;
    ajusteBuscadorY += direccionY * 10;

    aplicarAjusteBuscador();
}


/* ============================================= */
/*       INICIAR MOVIMIENTO                      */
/* ============================================= */

function iniciarMovimientoBuscador(direccionX, direccionY) {

    detenerMovimientoBuscador();

    moverBuscador(direccionX, direccionY);

    intervaloBuscador = setInterval(function () {

        moverBuscador(direccionX, direccionY);

    }, 80);
}


/* ============================================= */
/*       DETENER MOVIMIENTO                      */
/* ============================================= */

function detenerMovimientoBuscador() {

    if (intervaloBuscador) {

        clearInterval(intervaloBuscador);

        intervaloBuscador = null;
    }
}


/* ============================================= */
/*       CONFIGURAR CADA FLECHA                  */
/* ============================================= */

function configurarFlechaBuscador(
    boton,
    direccionX,
    direccionY
) {

    if (!boton) {
        return;
    }

    boton.addEventListener("pointerdown", function (evento) {

        evento.preventDefault();

        iniciarMovimientoBuscador(
            direccionX,
            direccionY
        );

    });

    boton.addEventListener(
        "pointerup",
        detenerMovimientoBuscador
    );

    boton.addEventListener(
        "pointerleave",
        detenerMovimientoBuscador
    );

    boton.addEventListener(
        "pointercancel",
        detenerMovimientoBuscador
    );
}


/* ============================================= */
/*       CONECTAR LAS CUATRO FLECHAS             */
/* ============================================= */

configurarFlechaBuscador(
    flechaBuscadorArriba,
    0,
    -1
);

configurarFlechaBuscador(
    flechaBuscadorIzquierda,
    -1,
    0
);

configurarFlechaBuscador(
    flechaBuscadorDerecha,
    1,
    0
);

configurarFlechaBuscador(
    flechaBuscadorAbajo,
    0,
    1
);


/* ============================================= */
/*       DETENER AL SOLTAR EL BOTÓN              */
/* ============================================= */

document.addEventListener(
    "pointerup",
    detenerMovimientoBuscador
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoBuscador
);




/* --------------------------------------------- */
/* MOVER CARRITO                                 */
/* --------------------------------------------- */

function moverCarrito(
    direccionX,
    direccionY
) {

    ajusteCarritoX +=
        direccionX * 10;

    ajusteCarritoY +=
        direccionY * 10;

    aplicarAjusteCarrito();
}




/* --------------------------------------------- */
/* INICIAR MOVIMIENTO                            */
/* --------------------------------------------- */

function iniciarMovimientoCarrito(
    direccionX,
    direccionY
) {

    detenerMovimientoCarrito();

    moverCarrito(
        direccionX,
        direccionY
    );

    intervaloCarrito =
        setInterval(
            function () {

                moverCarrito(
                    direccionX,
                    direccionY
                );

            },
            80
        );
}


/* --------------------------------------------- */
/* DETENER MOVIMIENTO                            */
/* --------------------------------------------- */

function detenerMovimientoCarrito() {

    if (intervaloCarrito) {

        clearInterval(
            intervaloCarrito
        );

        intervaloCarrito = null;
    }
}


/* --------------------------------------------- */
/* CONFIGURAR FLECHA                             */
/* --------------------------------------------- */

function configurarFlechaCarrito(
    boton,
    direccionX,
    direccionY
) {

    if (!boton) {
        return;
    }


    boton.addEventListener(
        "pointerdown",
        function (evento) {

            evento.preventDefault();

            iniciarMovimientoCarrito(
                direccionX,
                direccionY
            );
        }
    );


    boton.addEventListener(
        "pointerup",
        detenerMovimientoCarrito
    );


    boton.addEventListener(
        "pointerleave",
        detenerMovimientoCarrito
    );


    boton.addEventListener(
        "pointercancel",
        detenerMovimientoCarrito
    );
}


/* --------------------------------------------- */
/* CUATRO DIRECCIONES                            */
/* --------------------------------------------- */

configurarFlechaCarrito(
    flechaCarritoIzquierda,
    -1,
    0
);

configurarFlechaCarrito(
    flechaCarritoDerecha,
    1,
    0
);

configurarFlechaCarrito(
    flechaCarritoArriba,
    0,
    -1
);

configurarFlechaCarrito(
    flechaCarritoAbajo,
    0,
    1
);


/* --------------------------------------------- */
/* SOLTAR EN CUALQUIER PARTE                    */
/* --------------------------------------------- */

document.addEventListener(
    "pointerup",
    detenerMovimientoCarrito
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoCarrito
);


/* --------------------------------------------- */
/* MOVER BUSCADOR                                */
/* --------------------------------------------- */

function moverBuscador(
    direccionX,
    direccionY
) {

    ajusteBuscadorX += direccionX * 10;
    ajusteBuscadorY += direccionY * 10;

    aplicarAjusteBuscador();
}


/* --------------------------------------------- */
/* INICIAR MOVIMIENTO                            */
/* --------------------------------------------- */

function iniciarMovimientoBuscador(
    direccionX,
    direccionY
) {

    detenerMovimientoBuscador();

    moverBuscador(
        direccionX,
        direccionY
    );

    intervaloBuscador = setInterval(
        function () {

            moverBuscador(
                direccionX,
                direccionY
            );

        },
        80
    );
}


/* --------------------------------------------- */
/* DETENER MOVIMIENTO                            */
/* --------------------------------------------- */

function detenerMovimientoBuscador() {

    if (intervaloBuscador) {

        clearInterval(intervaloBuscador);

        intervaloBuscador = null;
    }
}


/* --------------------------------------------- */
/* CONFIGURAR FLECHA                             */
/* --------------------------------------------- */

function configurarFlechaBuscador(
    boton,
    direccionX,
    direccionY
) {

    if (!boton) {
        return;
    }

    boton.addEventListener(
        "pointerdown",
        function (evento) {

            evento.preventDefault();

            iniciarMovimientoBuscador(
                direccionX,
                direccionY
            );
        }
    );

    boton.addEventListener(
        "pointerup",
        detenerMovimientoBuscador
    );

    boton.addEventListener(
        "pointerleave",
        detenerMovimientoBuscador
    );

    boton.addEventListener(
        "pointercancel",
        detenerMovimientoBuscador
    );
}


/* --------------------------------------------- */
/* CUATRO DIRECCIONES                            */
/* --------------------------------------------- */

configurarFlechaBuscador(
    flechaBuscadorIzquierda,
    -1,
    0
);

configurarFlechaBuscador(
    flechaBuscadorDerecha,
    1,
    0
);

configurarFlechaBuscador(
    flechaBuscadorArriba,
    0,
    -1
);

configurarFlechaBuscador(
    flechaBuscadorAbajo,
    0,
    1
);


/* --------------------------------------------- */
/* SOLTAR EN CUALQUIER PARTE                    */
/* --------------------------------------------- */

document.addEventListener(
    "pointerup",
    detenerMovimientoBuscador
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoBuscador
);





        /* ================================================= */
        /*          CAMBIO DE FUENTE                          */
        /* ================================================= */

        fuenteNombreComercial.addEventListener(
            "change",
            function () {

                actualizarVariableCSS(
                    "--fuente-nombre-comercial",
                    fuenteNombreComercial.value
                );
            }
        );


        /* ================================================= */
        /*          CAMBIO DE TAMAÑO                          */
        /* ================================================= */

        tamanoNombreComercial.addEventListener(
            "change",
            function () {

                actualizarVariableCSS(
                    "--tamano-nombre-comercial",
                    tamanoNombreComercial.value
                );
            }
        );


        /* ================================================= */
        /*         ACEPTAR CONFIGURACIÓN LOGOTIPO             */
        /* ================================================= */

        aceptarLogotipo.addEventListener(
            "click",
            async function () {

                const datosLogo = {

                    mostrar_logotipo:
                        mostrarLogotipo.checked,

                    ajuste_logotipo_x:
                        ajusteLogotipo
                };


                const {
    error
} = await clienteSupabase
    .from(
        "configuracion_inicio"
    )
    .update(
        datosLogo
    )
    .eq(
        "cliente_id",
        clienteId
    );


                if (error) {

                    console.error(
                        "Error al guardar configuración del logotipo:",
                        error
                    );

                    return;
                }


                const imagenLogotipo =
                    document.getElementById(
                        "logotipo-franja"
                    );


                if (imagenLogotipo) {

                    imagenLogotipo.classList.toggle(
                        "oculto",
                        !mostrarLogotipo.checked
                    );
                }


                formularioLogotipo.classList.remove(
                    "formulario-abierto"
                );

                formularioCabecera.classList.add(
                    "formulario-abierto"
                );
            }
        );


           /* ================================================= */
          /*          ACEPTAR CONFIGURACIÓN DEL CARRITO        */
         /* ================================================= */

           aceptarCarrito.addEventListener(
          "click",
           async function () {

            const {
    error
} = await clienteSupabase
    .from("configuracion_inicio")
    .update({

        mostrar_carrito:
            mostrarCarrito.checked,

        tipo_carrito:
            tipoCarritoSeleccionado,

        ajuste_carrito_x:
            ajusteCarritoX,

        ajuste_carrito_y:
            ajusteCarritoY

    })
    .eq(
        "cliente_id",
        clienteId
    );



        if (error) {

            console.error(
                "Error al guardar configuración del carrito:",
                error
            );

            return;
        }


        botonCarrito.classList.toggle(
            "oculto",
            !mostrarCarrito.checked
        );


        aplicarTipoCarrito();


        formularioCarrito.classList.remove(
            "formulario-abierto"
        );


        formularioCabecera.classList.add(
            "formulario-abierto"
        );
    }
);



/* ================================================= */
/*          ACEPTAR CONFIGURACIÓN DEL BUSCADOR        */
/* ================================================= */

aceptarBuscador.addEventListener(
    "click",
    function () {

        formularioBuscador.classList.remove(
            "formulario-abierto"
        );

        formularioCabecera.classList.add(
            "formulario-abierto"
        );

    }
);



 /* ================================================= */
/*       ACEPTAR NOMBRE COMERCIAL                    */
/* ================================================= */

aceptarNombreComercial.addEventListener(
    "click",
    async function () {


        

        /* --------------------------------------------- */
        /* CREAR / OBTENER NOMBRE EN LA FRANJA           */
        /* --------------------------------------------- */

        let nombreEncabezado =
            document.getElementById(
                "nombre-comercial-encabezado"
            );

        if (!nombreEncabezado) {

            nombreEncabezado =
                document.createElement("div");

            nombreEncabezado.id =
                "nombre-comercial-encabezado";

            franjaSuperior.appendChild(
                nombreEncabezado
            );
        }


        /* --------------------------------------------- */
        /* IDENTIFICAR DISPOSITIVO                       */
        /* --------------------------------------------- */

        const esMovil =
            window.innerWidth <= 768;


        /* --------------------------------------------- */
        /* GUARDAR NOMBRE SEGÚN DISPOSITIVO              */
        /* --------------------------------------------- */

        if (esMovil) {

            nombreComercialMovil =
                nombreComercial.value;

        } else {

            nombreComercialEscritorio =
                nombreComercial.value;
        }


        /* --------------------------------------------- */
        /* ACTUALIZAR TEXTO                              */
        /* --------------------------------------------- */

        nombreEncabezado.textContent =
            nombreComercial.value;


        /* --------------------------------------------- */
        /* ACTUALIZAR FUENTE                             */
        /* --------------------------------------------- */

        actualizarVariableCSS(
            "--fuente-nombre-comercial",
            fuenteNombreComercial.value
        );


        /* --------------------------------------------- */
        /* ACTUALIZAR TAMAÑO                             */
        /* --------------------------------------------- */

        actualizarVariableCSS(
            "--tamano-nombre-comercial",
            tamanoNombreComercial.value
        );


        /* --------------------------------------------- */
        /* APLICAR POSICIÓN                              */
        /* --------------------------------------------- */

        aplicarAjusteNombreComercial();


        /* --------------------------------------------- */
        /* MOSTRAR / OCULTAR                             */
        /* --------------------------------------------- */

        nombreEncabezado.classList.toggle(
            "oculto",
            !mostrarNombreComercial.checked
        );


        /* ================================================= */
        /*       GUARDAR TAMAÑO Y POSICIÓN                    */
        /* ================================================= */

        if (esMovil) {

            tamanoNombreComercialMovil =
                tamanoNombreComercial.value;

            ajusteNombreComercialXMovil =
                ajusteNombreComercialX;

            ajusteNombreComercialYMovil =
                ajusteNombreComercialY;

        } else {

            tamanoNombreComercialEscritorio =
                tamanoNombreComercial.value;

            ajusteNombreComercialXEscritorio =
                ajusteNombreComercialX;

            ajusteNombreComercialYEscritorio =
                ajusteNombreComercialY;
        }


        /* ================================================= */
        /*       DATOS GENERALES                              */
        /* ================================================= */

        const datosNombreComercial = {

            fuente_nombre_comercial:
                fuenteNombreComercial.value,

            mostrar_nombre_comercial:
                mostrarNombreComercial.checked
        };


        /* ================================================= */
        /*       GUARDAR NOMBRE SEGÚN DISPOSITIVO             */
        /* ================================================= */

        if (esMovil) {

            datosNombreComercial
                .nombre_comercial_movil =
                    nombreComercialMovil;

        } else {

            datosNombreComercial
                .nombre_comercial_escritorio =
                    nombreComercialEscritorio;
        }


        /* ================================================= */
        /*       GUARDAR TAMAÑO Y POSICIÓN                    */
        /* ================================================= */

        if (esMovil) {

            datosNombreComercial
                .tamano_nombre_comercial_movil =
                    tamanoNombreComercialMovil;

            datosNombreComercial
                .ajuste_nombre_comercial_x_movil =
                    ajusteNombreComercialXMovil;

            datosNombreComercial
                .ajuste_nombre_comercial_y_movil =
                    ajusteNombreComercialYMovil;

        } else {

            datosNombreComercial
                .tamano_nombre_comercial_escritorio =
                    tamanoNombreComercialEscritorio;

            datosNombreComercial
                .ajuste_nombre_comercial_x_escritorio =
                    ajusteNombreComercialXEscritorio;

            datosNombreComercial
                .ajuste_nombre_comercial_y_escritorio =
                    ajusteNombreComercialYEscritorio;
        }

if (window.innerWidth > 768) {
    datosNombreComercial.aceptar_nombre_comercial_top_escritorio =
        parseInt(
            getComputedStyle(aceptarNombreComercial).top,
            10
        ) || 315;
}




        /* --------------------------------------------- */
        /* GUARDAR EN SUPABASE                           */
        /* --------------------------------------------- */

        const {
            error
        } = await clienteSupabase
            .from("configuracion_inicio")
            .update(datosNombreComercial)
           .eq("cliente_id", clienteId);


        /* --------------------------------------------- */
        /* ERROR                                         */
        /* --------------------------------------------- */

        if (error) {

            console.error(
                "Error al guardar nombre comercial:",
                error
            );

            return;
        }


        /* --------------------------------------------- */
        /* CERRAR FORMULARIO                             */
        /* --------------------------------------------- */

        formularioNombreComercial.classList.remove(
            "formulario-abierto"
        );

        formularioCabecera.classList.add(
            "formulario-abierto"
        );
    }
);
      

        /* ================================================= */
        /*          ACEPTAR CONFIGURACIÓN CABECERA            */
        /* ================================================= */

        aceptarCabecera.addEventListener(
            "click",
            async function () {


                const archivo =
                    archivoLogotipo.files[0];


                let logotipoUrl =
                    configuracionGuardada?.logotipo_url ||
                    null;


                /* ----------------------------------------- */
                /* SUBIR LOGOTIPO                            */
                /* ----------------------------------------- */

                if (archivo) {

                    const nombreArchivo =
                        `logotipo_${Date.now()}_${archivo.name}`;


                    const {
                        error: errorSubida
                    } = await clienteSupabase
                        .storage
                        .from("imagenes")
                        .upload(
                            `logotipos/${nombreArchivo}`,
                            archivo,
                            {
                                upsert: false
                            }
                        );


                    if (errorSubida) {

                        console.error(
                            "Error al subir logotipo:",
                            errorSubida
                        );

                        return;
                    }


                    const {
                        data: urlLogotipo
                    } =
                        clienteSupabase
                            .storage
                            .from("imagenes")
                            .getPublicUrl(
                                `logotipos/${nombreArchivo}`
                            );


                    logotipoUrl =
                        urlLogotipo.publicUrl;


                    let imagenFranja =
                        document.getElementById(
                            "logotipo-franja"
                        );


                    if (!imagenFranja) {

                        imagenFranja =
                            document.createElement(
                                "img"
                            );

                        imagenFranja.id =
                            "logotipo-franja";

                        franjaSuperior.appendChild(
                            imagenFranja
                        );
                    }


                    imagenFranja.src =
                        logotipoUrl;


                    imagenFranja.classList.toggle(
                        "oculto",
                        !mostrarLogotipo.checked
                    );
                }


                /* ----------------------------------------- */
                /* VISIBILIDAD                               */
                /* ----------------------------------------- */

                botonCarrito.classList.toggle(
                    "oculto",
                    !mostrarCarrito.checked
                );


                buscador.classList.toggle(
                    "oculto",
                    !mostrarBuscador.checked
                );


                /* ----------------------------------------- */
                /* GUARDAR EN SUPABASE                       */
                /* ----------------------------------------- */

                const {
                    error: errorGuardado
                } = await clienteSupabase
                    .from(
                        "configuracion_inicio"
                    )
                   
                   .update({

    logotipo_url:
        logotipoUrl,

    mostrar_carrito:
        mostrarCarrito.checked,

    mostrar_nombre_comercial:
        mostrarNombreComercial.checked,

    mostrar_buscador:
        mostrarBuscador.checked,

    tipo_carrito:
        tipoCarritoSeleccionado,

    ajuste_carrito_x:
        ajusteCarritoX,

    ajuste_carrito_y:
        ajusteCarritoY
})

     .eq(
    "cliente_id",
    clienteId
);            


                if (errorGuardado) {

                    console.error(
                        "Error al guardar encabezado:",
                        errorGuardado
                    );

                    return;
                }


                formularioCabecera.classList.remove(
                    "formulario-abierto"
                );
            }
        );


        /* ================================================= */
        /*         ACEPTAR CONFIGURACIÓN DE INICIO            */
        /* ================================================= */

        aceptarInicio.addEventListener(
            "click",
            async function () {


                const archivo =
                    archivoLogotipo.files[0];


                let logotipoUrl =
                    configuracionGuardada?.logotipo_url ||
                    null;


                /* ----------------------------------------- */
                /* SUBIR LOGOTIPO                            */
                /* ----------------------------------------- */

                if (archivo) {

                    const nombreArchivo =
                        `logotipo_${Date.now()}_${archivo.name}`;


                    const {
                        error: errorSubida
                    } = await clienteSupabase
                        .storage
                        .from("imagenes")
                        .upload(
                            `logotipos/${nombreArchivo}`,
                            archivo,
                            {
                                upsert: false
                            }
                        );


                    if (errorSubida) {

                        console.error(
                            "Error al subir logotipo:",
                            errorSubida
                        );

                        return;
                    }


                    const {
                        data: urlLogotipo
                    } =
                        clienteSupabase
                            .storage
                            .from("imagenes")
                            .getPublicUrl(
                                `logotipos/${nombreArchivo}`
                            );


                    logotipoUrl =
                        urlLogotipo.publicUrl;


                    let imagenFranja =
                        document.getElementById(
                            "logotipo-franja"
                        );


                    if (!imagenFranja) {

                        imagenFranja =
                            document.createElement(
                                "img"
                            );

                        imagenFranja.id =
                            "logotipo-franja";

                        franjaSuperior.appendChild(
                            imagenFranja
                        );
                    }


                    imagenFranja.src =
                        logotipoUrl;
                }


                /* ----------------------------------------- */
                /* ACTUALIZAR VARIABLES CSS                  */
                /* ----------------------------------------- */

                actualizarVariableCSS(
                    "--color-franjas",
                    colorFranjas.value
                );

                actualizarVariableCSS(
                    "--color-boton-menu",
                    colorBotonMenu.value
                );

                actualizarVariableCSS(
                    "--color-texto-menu",
                    colorTextoMenu.value
                );

                actualizarVariableCSS(
                    "--color-panel-menu",
                    colorPanelMenu.value
                );


                /* ----------------------------------------- */
                /* GUARDAR CONFIGURACIÓN                     */
                /* ----------------------------------------- */

                const configuracion = {

                    
                      cliente_id: clienteId,

                    color_franjas:
                        colorFranjas.value,

                    color_boton_menu:
                        colorBotonMenu.value,

                    color_texto_menu:
                        colorTextoMenu.value,

                    color_panel_menu:
                        colorPanelMenu.value,

                    logotipo_url:
                        logotipoUrl
                };


             const {
    error
} = await clienteSupabase
    .from("configuracion_inicio")
    .update(configuracion)
    .eq(
        "cliente_id",
        clienteId
    );


                if (error) {

                    console.error(
                        "Error al guardar configuración:",
                        error
                    );

                    return;
                }


                formularioInicio.classList.remove(
                    "formulario-abierto"
                );
            }
        );


        /* ================================================= */
        /*                 BOTÓN DE BÚSQUEDA                  */
        /* ================================================= */

        botonBusqueda.addEventListener(
            "click",
            function () {

                buscador.classList.toggle(
                    "expandido"
                );
            }
        );

    }
);

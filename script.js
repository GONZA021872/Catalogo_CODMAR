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

document.addEventListener("DOMContentLoaded", async function () {

    /* ================================================= */
    /*              SESIÓN DEL USUARIO                   */
    /* ================================================= */

    const pantallaLogin =
        document.getElementById("pantalla-login");

    const paginaInicio =
        document.getElementById("pagina-inicio");


    /* ================================================= */
/*        MOSTRAR U OCULTAR CONTRASEÑA               */
/* ================================================= */

const campoPassword = document.getElementById("login-password");
const botonMostrarPassword = document.getElementById("mostrar-password");

if (campoPassword && botonMostrarPassword) {

    const iconoOjoCerrado = `
        <svg viewBox="0 0 24 24"
             width="23" height="23"
             fill="none"
             stroke="currentColor"
             stroke-width="1.8"
             stroke-linecap="round"
             stroke-linejoin="round"
             aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M4 4 20 20"/>
        </svg>`;

    const iconoOjoAbierto = `
        <svg viewBox="0 0 24 24"
             width="23" height="23"
             fill="none"
             stroke="currentColor"
             stroke-width="1.8"
             stroke-linecap="round"
             stroke-linejoin="round"
             aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>`;

    function actualizarOjo() {
        const visible = campoPassword.type === "text";

        botonMostrarPassword.innerHTML =
            visible ? iconoOjoAbierto : iconoOjoCerrado;

        botonMostrarPassword.setAttribute(
            "aria-label",
            visible ? "Ocultar contraseña" : "Mostrar contraseña"
        );

        botonMostrarPassword.title =
            visible ? "Ocultar contraseña" : "Mostrar contraseña";
    }

    // Estado inicial
    campoPassword.type = "password";
     actualizarOjo();

    // Mostrar u ocultar contraseña
    botonMostrarPassword.onclick = function (evento) {
        evento.preventDefault();

        campoPassword.type =
            campoPassword.type === "password" ? "text" : "password";

        actualizarOjo();
    };
}



    // Ocultar ambas pantallas mientras se comprueba la sesión.
    pantallaLogin.style.display = "none";
    paginaInicio.style.display = "none";

  let modoRecuperacion = false;

clienteSupabase.auth.onAuthStateChange(function (evento) {
    if (evento === "PASSWORD_RECOVERY") {
        modoRecuperacion = true;

        const formularioNuevaPassword =
            document.getElementById("formulario-nueva-password");

        const formularioRecuperacion =
            document.getElementById("formulario-recuperacion");

        if (formularioNuevaPassword) {
            formularioNuevaPassword.hidden = false;
        }

        if (formularioRecuperacion) {
            formularioRecuperacion.hidden = true;
        }

        pantallaLogin.style.setProperty(
            "display", "flex", "important"
        );

       campoPassword.type = "password";
    actualizarOjo();

        paginaInicio.style.setProperty(
            "display", "none", "important"
        );
    }
});
  
  
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

    if (session && !modoRecuperacion) {
        console.log(
            "Usuario autenticado:",
            session.user.id
        );

        pantallaLogin.style.setProperty(
            "display", "none", "important"
        );

        paginaInicio.style.setProperty(
            "display", "block", "important"
        );

    } else {
        console.log("No hay usuario autenticado.");

        paginaInicio.style.setProperty(
            "display", "none", "important"
        );

        pantallaLogin.style.setProperty(
            "display", "flex", "important"
        );
    }


    /* ================================================= */
    /*                  BOTÓN SALIR                      */
    /* ================================================= */

    const botonSalir =
        document.getElementById("boton-salir");

    if (botonSalir) {
        botonSalir.addEventListener("click", async () => {

            const { error } =
                await clienteSupabase.auth.signOut();

            if (error) {
                console.error(
                    "Error al cerrar sesión:",
                    error
                );

                alert(
                    "No se pudo cerrar la sesión. Intenta nuevamente."
                );

                return;
            }

            paginaInicio.style.setProperty(
                "display", "none", "important"
            );

            pantallaLogin.style.setProperty(
                "display", "flex", "important"

               );

              campoPassword.type = "password";
              actualizarOjo();
            console.log("Sesión cerrada correctamente.");
        });
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
        botonLogin.addEventListener("click", async function () {

            const email = loginEmail.value.trim();
            const password = loginPassword.value;

            mensajeLogin.textContent = "";
            botonLogin.disabled = true;

            try {
                const { data, error } =
                    await clienteSupabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                if (error) {
                    console.error(
                        "Error al iniciar sesión:",
                        error
                    );

                   mensajeLogin.textContent =
                       "Error de acceso: " + error.message;

                    return;
                }

                if (data.session) {
                    // Recargar para iniciar toda la configuración
                    // con la sesión ya establecida.
                    window.location.reload();
                    return;
                }

            } catch (error) {
                console.error(
                    "Error inesperado al iniciar sesión:",
                    error
                );

                mensajeLogin.textContent =
                    "No fue posible iniciar sesión. Inténtalo nuevamente.";

            } finally {
                botonLogin.disabled = false;
            }
        });
    }


/* ================================================= */
/*          RECUPERACIÓN DE CONTRASEÑA               */
/* ================================================= */

const botonMostrarRecuperacion =
    document.getElementById("boton-mostrar-recuperacion");

const formularioRecuperacion =
    document.getElementById("formulario-recuperacion");

const botonEnviarRecuperacion =
    document.getElementById("boton-enviar-recuperacion");

const botonCancelarRecuperacion =
    document.getElementById("boton-cancelar-recuperacion");

const mensajeRecuperacion =
    document.getElementById("mensaje-recuperacion");

const formularioNuevaPassword =
    document.getElementById("formulario-nueva-password");

const nuevaPassword =
    document.getElementById("nueva-password");

const confirmarNuevaPassword =
    document.getElementById("confirmar-nueva-password");

const botonGuardarNuevaPassword =
    document.getElementById("boton-guardar-nueva-password");

const mensajeNuevaPassword =
    document.getElementById("mensaje-nueva-password");


if (botonMostrarRecuperacion && formularioRecuperacion) {
    botonMostrarRecuperacion.addEventListener("click", function () {
        formularioRecuperacion.hidden = false;
        formularioNuevaPassword.hidden = true;
        mensajeRecuperacion.textContent = "";
        mensajeLogin.textContent = "";
    });
}


if (botonCancelarRecuperacion && formularioRecuperacion) {
    botonCancelarRecuperacion.addEventListener("click", function () {
        formularioRecuperacion.hidden = true;
        mensajeRecuperacion.textContent = "";
    });
}


if (botonEnviarRecuperacion) {
    botonEnviarRecuperacion.addEventListener("click", async function () {
        const email = loginEmail.value.trim();

        mensajeRecuperacion.textContent = "";

        if (!email || !loginEmail.checkValidity()) {
            mensajeRecuperacion.textContent =
                "Escribe primero un correo electrónico válido en el campo de acceso.";
            return;
        }

        botonEnviarRecuperacion.disabled = true;

        try {
            const { error } =
                await clienteSupabase.auth.resetPasswordForEmail(email, {
                    redirectTo:
                        "https://gonza021872.github.io/Catalogo_CODMAR/"
                });

            if (error) {
                console.error("Error al solicitar recuperación:", error);
                mensajeRecuperacion.textContent =
                    "No se pudo enviar el correo: " + error.message;
                return;
            }

            mensajeRecuperacion.textContent =
                "Si la cuenta existe, recibirás un correo con las instrucciones de recuperación.";
        } catch (error) {
            console.error("Error inesperado en recuperación:", error);
            mensajeRecuperacion.textContent =
                "Ocurrió un error al solicitar la recuperación.";
        } finally {
            botonEnviarRecuperacion.disabled = false;
        }
    });
}


if (botonGuardarNuevaPassword) {
    botonGuardarNuevaPassword.addEventListener("click", async function () {
        mensajeNuevaPassword.textContent = "";

        if (nuevaPassword.value.length < 6) {
            mensajeNuevaPassword.textContent =
                "La contraseña debe tener al menos 6 caracteres.";
            return;
        }

        if (nuevaPassword.value !== confirmarNuevaPassword.value) {
            mensajeNuevaPassword.textContent =
                "Las contraseñas no coinciden.";
            return;
        }

        botonGuardarNuevaPassword.disabled = true;

        try {
            const { error } =
                await clienteSupabase.auth.updateUser({
                    password: nuevaPassword.value
                });

            if (error) {
                console.error("Error al cambiar contraseña:", error);
                mensajeNuevaPassword.textContent =
                    "No se pudo cambiar la contraseña: " + error.message;
                return;
            }

            mensajeNuevaPassword.textContent =
                "Contraseña actualizada. Ya puedes iniciar sesión.";

            nuevaPassword.value = "";
            confirmarNuevaPassword.value = "";

            formularioNuevaPassword.hidden = true;
            formularioRecuperacion.hidden = true;

            await clienteSupabase.auth.signOut();

            pantallaLogin.style.setProperty("display", "flex", "important");
            paginaInicio.style.setProperty("display", "none", "important");

        } catch (error) {
            console.error("Error inesperado al cambiar contraseña:", error);
            mensajeNuevaPassword.textContent =
                "Ocurrió un error al cambiar la contraseña.";
        } finally {
            botonGuardarNuevaPassword.disabled = false;
        }
    });
}


    

/* ================================================= */
/*          REGISTRO DE NUEVO NEGOCIO                */
/* ================================================= */

const botonMostrarRegistro =
    document.getElementById("boton-mostrar-registro");

const formularioRegistro =
    document.getElementById("formulario-registro");

const botonCancelarRegistro =
    document.getElementById("boton-cancelar-registro");

const botonRegistrarNegocio =
    document.getElementById("boton-registrar-negocio");

const registroNombreComercial =
    document.getElementById("registro-nombre-comercial");

const registroEmail =
    document.getElementById("registro-email");

const registroPassword =
    document.getElementById("registro-password");

const mensajeRegistro =
    document.getElementById("mensaje-registro");


if (botonMostrarRegistro && formularioRegistro) {
    botonMostrarRegistro.addEventListener("click", function () {
        formularioRegistro.hidden = false;
        mensajeRegistro.textContent = "";
    });
}


if (botonCancelarRegistro && formularioRegistro) {
    botonCancelarRegistro.addEventListener("click", function () {
        formularioRegistro.hidden = true;
        mensajeRegistro.textContent = "";
    });
}


if (
    botonRegistrarNegocio &&
    registroNombreComercial &&
    registroEmail &&
    registroPassword &&
    mensajeRegistro
) {
    botonRegistrarNegocio.addEventListener(
        "click",
        async function () {

            const nombreNegocio =
                registroNombreComercial.value.trim();

            const emailNuevo =
                registroEmail.value.trim();

            const passwordNuevo =
                registroPassword.value;

            mensajeRegistro.textContent = "";

            if (!nombreNegocio || !emailNuevo || !passwordNuevo) {
                mensajeRegistro.textContent =
                    "Completa todos los campos.";
                return;
            }

            if (!registroEmail.checkValidity()) {
                mensajeRegistro.textContent =
                    "Introduce un correo electrónico válido.";
                return;
            }

            if (passwordNuevo.length < 6) {
                mensajeRegistro.textContent =
                    "La contraseña debe tener al menos 6 caracteres.";
                return;
            }

            botonRegistrarNegocio.disabled = true;

            try {
                const { data, error } =
                    await clienteSupabase.auth.signUp({
                        email: emailNuevo,
                        password: passwordNuevo,
                        options: {
                            data: {
                                nombre_comercial: nombreNegocio
                            }
                        }
                    });

                if (error) {
                    console.error(
                        "Error al registrar negocio:",
                        error
                    );

                    mensajeRegistro.textContent =
                        "No se pudo crear la cuenta: " +
                        error.message;

                    return;
                }

                if (data.session) {
                    mensajeRegistro.textContent =
                        "Cuenta creada. Entrando al sistema...";

                    window.location.reload();
                    return;
                }

                mensajeRegistro.textContent =
                    "Registro recibido. Revisa tu correo para " +
                    "confirmar la cuenta si Supabase lo solicita.";

            } catch (error) {
                console.error(
                    "Error inesperado en el registro:",
                    error
                );

                mensajeRegistro.textContent =
                    "Ocurrió un error al registrar el negocio.";

            } finally {
                botonRegistrarNegocio.disabled = false;
            }
        }
    );
}



    /* ================================================= */
    /*       DETENER CARGA SI NO HAY SESIÓN              */
    /* ================================================= */

    if (!session) {
        return;
    }


    /* ================================================= */
    /*       IDENTIFICAR DISPOSITIVO INICIAL             */
    /* ================================================= */

    const esMovil =
        window.matchMedia("(max-width: 768px)").matches;


    /* ================================================= */
    /*                ELEMENTOS DEL MENÚ                 */
    /* ================================================= */

    const botonMenu =
        document.getElementById("boton-menu");

    const panelMenu =
        document.getElementById("panel-menu");

    const opcionesMenu =
        document.querySelectorAll(".opcion-menu");

    const opcionInicio =
        document.querySelector(".opcion-menu");


    /* ================================================= */
    /*                   FORMULARIOS                     */
    /* ================================================= */

    const formularioInicio =
        document.getElementById("formulario-inicio");

    const formularioCabecera =
        document.getElementById("formulario-cabecera");

    const formularioNombreComercial =
        document.getElementById("formulario-nombre-comercial");

    const formularioLogotipo =
        document.getElementById("formulario-logotipo");

    const formularioCarrito =
        document.getElementById("formulario-carrito");

    const formularioBuscador =
        document.getElementById("formulario-buscador");


    /* ================================================= */
    /*           BOTONES DE CONFIGURACIÓN                */
    /* ================================================= */

    const botonNombreComercial =
        document.getElementById("boton-nombre-comercial");

    const botonConfigurarCarrito =
        document.getElementById("boton-configurar-carrito");

    const botonConfigurarBuscador =
        document.getElementById("boton-configurar-buscador");

    const aceptarBuscador =
        document.getElementById("aceptar-buscador");

    const aceptarCarrito =
        document.getElementById("aceptar-carrito");

    const aceptarNombreComercial =
        document.getElementById("aceptar-nombre-comercial");

    const botonConfigurarLogotipo =
        document.getElementById("boton-configurar-logotipo");

    const aceptarLogotipo =
        document.getElementById("aceptar-logotipo");

    const aceptarInicio =
        document.getElementById("aceptar-inicio");

    const aceptarCabecera =
        document.getElementById("aceptar-cabecera");

   
    /* ================================================= */
    /*              CONFIGURACIÓN GENERAL               */
    /* ================================================= */

    const colorFranjas =
        document.getElementById("color-franjas");

    const colorBotonMenu =
        document.getElementById("color-boton-menu");

    const colorTextoMenu =
        document.getElementById("color-texto-menu");

    const colorPanelMenu =
        document.getElementById("color-panel-menu");






    /* ================================================= */
    /*                      CARRITO                      */
    /* ================================================= */

    const mostrarCarrito =
        document.getElementById("mostrar-carrito");

    const botonCarrito =
        document.querySelector(".boton-carrito");


    /* ================================================= */
    /*                 NOMBRE COMERCIAL                  */
    /* ================================================= */

    const mostrarNombreComercial =
        document.getElementById("mostrar-nombre-comercial");

    const nombreComercial =
        document.getElementById("nombre-comercial");

    const fuenteNombreComercial =
        document.getElementById("fuente-nombre-comercial");

    const tamanoNombreComercial =
        document.getElementById("tamano-nombre-comercial");


    /* ================================================= */
    /*                     BUSCADOR                      */
    /* ================================================= */

    const mostrarBuscador =
        document.getElementById("mostrar-buscador");

    const buscador =
        document.getElementById("buscador");

    const botonBusqueda =
        document.getElementById("boton-busqueda");


    /* ================================================= */
    /*              CONFIGURACIÓN DEL BUSCADOR           */
    /* ================================================= */

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

    const reducirBuscador =
        document.getElementById("reducir-buscador");

    const agrandarBuscador =
        document.getElementById("agrandar-buscador");


    /* ================================================= */
    /*                     LOGOTIPO                      */
    /* ================================================= */

    const archivoLogotipo =
        document.getElementById("archivo-logotipo");

    const vistaLogotipo =
        document.getElementById("vista-logotipo");

    const botonLogotipo =
        document.getElementById("boton-logotipo");

    const mostrarLogotipo =
        document.getElementById("mostrar-logotipo");

    
/* ================================================= */
/*                FLECHAS DEL LOGOTIPO               */
/* ================================================= */

const flechaLogotipoIzquierda =
    document.getElementById("flecha-logotipo-izquierda");

const flechaLogotipoDerecha =
    document.getElementById("flecha-logotipo-derecha");

const flechaLogotipoArriba =
    document.getElementById("flecha-logotipo-arriba");

const flechaLogotipoAbajo =
    document.getElementById("flecha-logotipo-abajo");

   

    /* ================================================= */
    /*            FLECHAS DEL NOMBRE COMERCIAL           */
    /* ================================================= */

    const flechaNombreComercialIzquierda =
        document.getElementById("flecha-nombre-comercial-izquierda");

    const flechaNombreComercialDerecha =
        document.getElementById("flecha-nombre-comercial-derecha");

    const flechaNombreComercialArriba =
        document.getElementById("flecha-nombre-comercial-arriba");

    const flechaNombreComercialAbajo =
        document.getElementById("flecha-nombre-comercial-abajo");


    /* ================================================= */
    /*               CONFIGURACIÓN DEL CARRITO           */
    /* ================================================= */

    const tipoBolsita =
        document.getElementById("tipo-bolsita");

    const tipoCarrito =
        document.getElementById("tipo-carrito");


    /* ================================================= */
    /*          FLECHAS DE POSICIÓN DEL CARRITO          */
    /* ================================================= */

    const flechaCarritoIzquierda =
        document.getElementById("flecha-carrito-izquierda");

    const flechaCarritoDerecha =
        document.getElementById("flecha-carrito-derecha");

    const flechaCarritoArriba =
        document.getElementById("flecha-carrito-arriba");

    const flechaCarritoAbajo =
        document.getElementById("flecha-carrito-abajo");


    /* ================================================= */
    /*                FRANJAS PRINCIPALES                */
    /* ================================================= */

    const franjaSuperior =
        document.querySelector(".barra-inicio-superior");

    const franjaInferior =
        document.querySelector(".barra-inicio-inferior");


    /* ================================================= */
    /*            VARIABLES DE FUNCIONAMIENTO            */
    /* ================================================= */

    let ajusteLogotipo = 0;

   // Posición horizontal del logotipo.
   let ajusteLogotipoEscritorio = 0;
   let ajusteLogotipoMovil = 0;

  // Posición vertical del logotipo.
    let ajusteLogotipoYEscritorio = 0;
    let ajusteLogotipoYMovil = 0;

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


    // Posición del carrito en computadora.
    let ajusteCarritoXEscritorio = 0;
    let ajusteCarritoYEscritorio = 0;

    // Posición del carrito en celular.
    let ajusteCarritoXMovil = 0;
    let ajusteCarritoYMovil = 0;

    // Posición activa del carrito.
    let ajusteCarritoX = 0;
    let ajusteCarritoY = 0;

    
/* ================================================= */
/*              VARIABLES DEL BUSCADOR               */
/* ================================================= */

let ajusteBuscadorX = 0;

let ajusteBuscadorY = 0;

let anchoBuscadorSeleccionado = 150;

let altoBuscadorSeleccionado = 25;

    

    /* ================================================= */
    /*             VARIABLES DE LOS INTERVALOS           */
    /* ================================================= */

    let intervaloLogotipo = null;
    let intervaloCarrito = null;
    let intervaloBuscador = null;


    /* ================================================= */
    /*          ACTUALIZAR VARIABLES CSS                 */
    /* ================================================= */

    function actualizarVariableCSS(variable, valor) {
        document.documentElement.style.setProperty(
            variable,
            valor
        );
    }


    /* ================================================= */
    /*                LOGOTIPO: POSICIÓN                 */
    /* ================================================= */

   
function aplicarAjusteLogotipo() {

    const esMovilActual =
        window.matchMedia("(max-width: 768px)").matches;

    const ajusteXActual = esMovilActual
        ? ajusteLogotipoMovil
        : ajusteLogotipoEscritorio;

    const ajusteYActual = esMovilActual
        ? ajusteLogotipoYMovil
        : ajusteLogotipoYEscritorio;

    actualizarVariableCSS(
        "--ajuste-logotipo-x",
        `${ajusteXActual}px`
    );

    actualizarVariableCSS(
        "--ajuste-logotipo-y",
        `${ajusteYActual}px`
    );
}


function moverLogotipo(direccionX, direccionY = 0) {

    const esMovilActual =
        window.matchMedia("(max-width: 768px)").matches;

    if (esMovilActual) {
        ajusteLogotipoMovil += direccionX * 10;
        ajusteLogotipoYMovil += direccionY * 10;
    } else {
        ajusteLogotipoEscritorio += direccionX * 10;
        ajusteLogotipoYEscritorio += direccionY * 10;
    }

    aplicarAjusteLogotipo();
}


function iniciarMovimientoLogotipo(direccionX, direccionY = 0) {

    detenerMovimientoLogotipo();

    moverLogotipo(direccionX, direccionY);

    intervaloLogotipo = setInterval(function () {
        moverLogotipo(direccionX, direccionY);
    }, 80);
}


function detenerMovimientoLogotipo() {

    if (intervaloLogotipo !== null) {
        clearInterval(intervaloLogotipo);
        intervaloLogotipo = null;
    }
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


    const clienteId = usuarioCliente.cliente_id;

    console.log("CLIENTE ACTUAL:", clienteId);


    /* ================================================= */
    /*               CARGAR CONFIGURACIÓN                */
    /* ================================================= */

    const {
        data: configuracionGuardada,
        error
    } = await clienteSupabase
        .from("configuracion_inicio")
        .select("*")
        .eq("cliente_id", clienteId)
        .maybeSingle();


   
/* ================================================= */
/*          RECUPERAR CONFIGURACIÓN DEL BUSCADOR      */
/* ================================================= */

if (configuracionGuardada) {

    ajusteBuscadorX = Number(
        (esMovil
            ? configuracionGuardada.ajuste_buscador_x_movil
            : configuracionGuardada.ajuste_buscador_x_escritorio)
        ?? configuracionGuardada.ajuste_buscador_x
        ?? 0
    );

    ajusteBuscadorY = Number(
        (esMovil
            ? configuracionGuardada.ajuste_buscador_y_movil
            : configuracionGuardada.ajuste_buscador_y_escritorio)
        ?? configuracionGuardada.ajuste_buscador_y
        ?? 0
    );

    anchoBuscadorSeleccionado = Number(
        (esMovil
            ? configuracionGuardada.ancho_buscador_movil
            : configuracionGuardada.ancho_buscador_escritorio)
        ?? configuracionGuardada.ancho_buscador
        ?? 150
    );

    altoBuscadorSeleccionado = Number(
        (esMovil
            ? configuracionGuardada.alto_buscador_movil
            : configuracionGuardada.alto_buscador_escritorio)
        ?? configuracionGuardada.alto_buscador
        ?? 25
    );
}


     aplicarTamanoBuscador();
    aplicarAjusteBuscador();

    /* ================================================= */
    /*       POSICIÓN DEL BOTÓN ACEPTAR EN ESCRITORIO     */
    /* ================================================= */

    const botonAceptarNombreComercial =
        document.getElementById("aceptar-nombre-comercial");

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

    if (configuracionGuardada) {

        /* --------------------------------------------- */
        /* COLORES SEGÚN DISPOSITIVO                     */
        /* --------------------------------------------- */

        const colorFranjasActual = esMovil
            ? (
                configuracionGuardada.color_franjas_movil
                || configuracionGuardada.color_franjas
                || "#ffffff"
            )
            : (
                configuracionGuardada.color_franjas_escritorio
                || configuracionGuardada.color_franjas
                || "#ffffff"
            );

        const colorBotonMenuActual = esMovil
            ? (
                configuracionGuardada.color_boton_menu_movil
                || configuracionGuardada.color_boton_menu
                || "#159c96"
            )
            : (
                configuracionGuardada.color_boton_menu_escritorio
                || configuracionGuardada.color_boton_menu
                || "#159c96"
            );
   
        const colorTextoMenuActual = esMovil
            ? (
                configuracionGuardada.color_texto_menu_movil
                || configuracionGuardada.color_texto_menu
                || "#f2f2f2"
            )
            : (
                configuracionGuardada.color_texto_menu_escritorio
                || configuracionGuardada.color_texto_menu
                || "#f2f2f2"
            );

        const colorPanelMenuActual = esMovil
            ? (
                configuracionGuardada.color_panel_menu_movil
                || configuracionGuardada.color_panel_menu
                || "#D8E2EE"
            )
            : (
                configuracionGuardada.color_panel_menu_escritorio
                || configuracionGuardada.color_panel_menu
                || "#D8E2EE"
            );

        actualizarVariableCSS(
            "--color-franjas",
            colorFranjasActual
        );

        actualizarVariableCSS(
            "--color-boton-menu",
            colorBotonMenuActual
        );

        actualizarVariableCSS(
            "--color-texto-menu",
            colorTextoMenuActual
        );

        actualizarVariableCSS(
            "--color-panel-menu",
            colorPanelMenuActual
        );

        /* CONTROLES DE COLOR */

        colorFranjas.value = colorFranjasActual;
        colorBotonMenu.value = colorBotonMenuActual;
        colorTextoMenu.value = colorTextoMenuActual;
        colorPanelMenu.value = colorPanelMenuActual;

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
            tipoBolsita.addEventListener("change", function () {

                if (!tipoBolsita.checked) {
                    return;
                }

                tipoCarritoSeleccionado = "bolsita";

                aplicarTipoCarrito();
            });
        }


        if (tipoCarrito) {
            tipoCarrito.addEventListener("change", function () {

                if (!tipoCarrito.checked) {
                    return;
                }

                tipoCarritoSeleccionado = "carrito";

                aplicarTipoCarrito();
            });
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
            configuracionGuardada.nombre_comercial_escritorio
            || configuracionGuardada.nombre_comercial
            || "";

        nombreComercialMovil =
            configuracionGuardada.nombre_comercial_movil
            || configuracionGuardada.nombre_comercial
            || "";


        /* ================================================= */
        /*       SELECCIONAR NOMBRE ACTUAL                   */
        /* ================================================= */

        if (esMovil) {
            nombreComercial.value = nombreComercialMovil;
        } else {
            nombreComercial.value = nombreComercialEscritorio;
        }


        /* --------------------------------------------- */
        /* FUENTE DEL NOMBRE COMERCIAL                   */
        /* --------------------------------------------- */

        fuenteNombreComercial.value =
            configuracionGuardada.fuente_nombre_comercial || "Arial";


        /* ================================================= */
        /*       CARGAR TAMAÑO SEGÚN DISPOSITIVO             */
        /* ================================================= */

        tamanoNombreComercialEscritorio =
            configuracionGuardada.tamano_nombre_comercial_escritorio
            || configuracionGuardada.tamano_nombre_comercial
            || "20px";

        tamanoNombreComercialMovil =
            configuracionGuardada.tamano_nombre_comercial_movil
            || configuracionGuardada.tamano_nombre_comercial
            || "20px";


        /* ================================================= */
        /*       CARGAR POSICIÓN ESCRITORIO                  */
        /* ================================================= */

        ajusteNombreComercialXEscritorio =
            configuracionGuardada.ajuste_nombre_comercial_x_escritorio
            ?? configuracionGuardada.ajuste_nombre_comercial_x
            ?? 0;

        ajusteNombreComercialYEscritorio =
            configuracionGuardada.ajuste_nombre_comercial_y_escritorio
            ?? configuracionGuardada.ajuste_nombre_comercial_y
            ?? 0;


        /* ================================================= */
        /*       CARGAR POSICIÓN MÓVIL                       */
        /* ================================================= */

        ajusteNombreComercialXMovil =
            configuracionGuardada.ajuste_nombre_comercial_x_movil
            ?? configuracionGuardada.ajuste_nombre_comercial_x
            ?? 0;

        ajusteNombreComercialYMovil =
            configuracionGuardada.ajuste_nombre_comercial_y_movil
            ?? configuracionGuardada.ajuste_nombre_comercial_y
            ?? 0;


        /* ================================================= */
        /*       SELECCIONAR DISPOSITIVO ACTUAL              */
        /* ================================================= */

        if (esMovil) {

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

ajusteLogotipoEscritorio =
    configuracionGuardada.ajuste_logotipo_x ?? 0;

ajusteLogotipoMovil =
    configuracionGuardada.ajuste_logotipo_x_movil ?? 0;

ajusteLogotipoYEscritorio =
    configuracionGuardada.ajuste_logotipo_y_escritorio ?? 0;

ajusteLogotipoYMovil =
    configuracionGuardada.ajuste_logotipo_y_movil ?? 0;

aplicarAjusteLogotipo();
    }


       /* ================================================= */
/*             CONFIGURACIÓN DEL CARRITO             */
/* ================================================= */

if (configuracionGuardada) {

   tipoCarritoSeleccionado = esMovil
    ? (
        configuracionGuardada.tipo_carrito_movil
        ?? configuracionGuardada.tipo_carrito
        ?? "bolsita"
    )
    : (
        configuracionGuardada.tipo_carrito_escritorio
        ?? configuracionGuardada.tipo_carrito
        ?? "bolsita"
    );


        // Cargar posición guardada para computadora.
        ajusteCarritoXEscritorio =
            configuracionGuardada.ajuste_carrito_x_escritorio
            ?? configuracionGuardada.ajuste_carrito_x
            ?? 0;

        ajusteCarritoYEscritorio =
            configuracionGuardada.ajuste_carrito_y_escritorio
            ?? configuracionGuardada.ajuste_carrito_y
            ?? 0;


        // Cargar posición guardada para celular.
        ajusteCarritoXMovil =
            configuracionGuardada.ajuste_carrito_x_movil
            ?? configuracionGuardada.ajuste_carrito_x
            ?? 0;

        ajusteCarritoYMovil =
            configuracionGuardada.ajuste_carrito_y_movil
            ?? configuracionGuardada.ajuste_carrito_y
            ?? 0;


        // Seleccionar la posición del dispositivo actual.
        if (esMovil) {

            ajusteCarritoX = ajusteCarritoXMovil;
            ajusteCarritoY = ajusteCarritoYMovil;

        } else {

            ajusteCarritoX = ajusteCarritoXEscritorio;
            ajusteCarritoY = ajusteCarritoYEscritorio;
        }


        aplicarAjusteCarrito();


        console.log("POSICIÓN DEL CARRITO AL CARGAR:", {
            dispositivo: esMovil ? "celular" : "computadora",
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

// Se reutiliza esMovil, declarado en el bloque anterior.

const logotipoUrl = esMovil
    ? configuracionGuardada?.logotipo_url_movil
    : configuracionGuardada?.logotipo_url_escritorio;

if (
    configuracionGuardada &&
    logotipoUrl &&
    configuracionGuardada.mostrar_logotipo !== false
) {

    const imagenLogotipo = document.createElement("img");

    imagenLogotipo.src = logotipoUrl;
    imagenLogotipo.id = "logotipo-franja";

    franjaSuperior.appendChild(imagenLogotipo);

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

    franjaSuperior.appendChild(nombreEncabezado);

    aplicarAjusteNombreComercial();
}


/* ================================================= */
/*               TERMINÓ LA CARGA                    */
/* ================================================= */

franjaSuperior.classList.remove("cargando");


/* ================================================= */
/*                    MENÚ                           */
/* ================================================= */

botonMenu.addEventListener("click", function () {

    panelMenu.classList.toggle("menu-abierto");
});


/* ================================================= */
/*                OPCIÓN INICIO                      */
/* ================================================= */

if (opcionInicio) {

    opcionInicio.addEventListener("click", function () {

        panelMenu.classList.remove("menu-abierto");

        setTimeout(function () {

            formularioInicio.classList.add(
                "formulario-abierto"
            );

        }, 250);
    });
}


/* ================================================= */
/*               OPCIÓN CABECERA                     */
/* ================================================= */

if (opcionesMenu[1]) {

    opcionesMenu[1].addEventListener("click", function () {

        panelMenu.classList.remove("menu-abierto");

        setTimeout(function () {

            formularioCabecera.classList.add(
                "formulario-abierto"
            );

        }, 250);
    });
}


/* ================================================= */
/*          CONFIGURAR NOMBRE COMERCIAL               */
/* ================================================= */

botonNombreComercial.addEventListener("click", function () {

    formularioCabecera.classList.remove(
        "formulario-abierto"
    );

    formularioNombreComercial.classList.add(
        "formulario-abierto"
    );
});


/* ================================================= */
/*              CONFIGURAR CARRITO                   */
/* ================================================= */

botonConfigurarCarrito.addEventListener("click", function () {

    formularioCabecera.classList.remove(
        "formulario-abierto"
    );

    formularioCarrito.classList.add(
        "formulario-abierto"
    );
});


/* ================================================= */
/*              CONFIGURAR BUSCADOR                  */
/* ================================================= */

botonConfigurarBuscador.addEventListener("click", function () {

    formularioCabecera.classList.remove(
        "formulario-abierto"
    );

    formularioBuscador.classList.add(
        "formulario-abierto"
    );
});


/* ================================================= */
/*              CONFIGURAR LOGOTIPO                  */
/* ================================================= */

botonConfigurarLogotipo.addEventListener("click", function () {

    formularioCabecera.classList.remove(
        "formulario-abierto"
    );

    formularioLogotipo.classList.add(
        "formulario-abierto"
    );
});


/* ================================================= */
/*              BOTÓN SELECCIONAR LOGO               */
/* ================================================= */

botonLogotipo.addEventListener("click", function () {

    archivoLogotipo.click();
});


/* ================================================= */
/*              VISTA PREVIA DEL LOGO                */
/* ================================================= */

archivoLogotipo.addEventListener("change", function () {

    const archivo = archivoLogotipo.files[0];

    if (!archivo) {
        return;
    }

    const imagen = new Image();

    imagen.onload = function () {

        const canvas = document.createElement("canvas");
        const contexto = canvas.getContext("2d");

        canvas.width = imagen.width;
        canvas.height = imagen.height;

        contexto.drawImage(
            imagen,
            0,
            0
        );

        const datos = contexto.getImageData(
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

            const rojo = datos.data[i];
            const verde = datos.data[i + 1];
            const azul = datos.data[i + 2];

            if (
                rojo > 240 &&
                verde > 240 &&
                azul > 240
            ) {
                datos.data[i + 3] = 0;
            }
        }

        contexto.putImageData(datos, 0, 0);

        const imagenTransparente =
            document.createElement("img");

        imagenTransparente.src =
            canvas.toDataURL("image/png");

        vistaLogotipo.innerHTML = "";

        vistaLogotipo.appendChild(
            imagenTransparente
        );
    };

    imagen.src = URL.createObjectURL(archivo);
});


/* ================================================= */
/*             MOVIMIENTO DEL LOGOTIPO               */
/* ================================================= */

function configurarFlechaLogotipo(boton, direccionX, direccionY = 0) {

    if (!boton) {
        return;
    }

    boton.addEventListener("pointerdown", function (evento) {

        evento.preventDefault();

        detenerMovimientoLogotipo();
        iniciarMovimientoLogotipo(direccionX, direccionY);
    });
}


configurarFlechaLogotipo(
    flechaLogotipoIzquierda,
    -1,
    0
);

configurarFlechaLogotipo(
    flechaLogotipoDerecha,
    1,
    0
);

configurarFlechaLogotipo(
    flechaLogotipoArriba,
    0,
    -1
);

configurarFlechaLogotipo(
    flechaLogotipoAbajo,
    0,
    1
);


document.addEventListener(
    "pointerup",
    detenerMovimientoLogotipo
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoLogotipo
);


/* ================================================= */
/*          MOVIMIENTO DEL NOMBRE COMERCIAL           */
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


    const limiteX = Math.floor(
        Math.max(
            0,
            (anchoFranja - anchoNombre) / 2
        )
    );

    const limiteY = Math.floor(
        Math.max(
            0,
            (altoFranja - altoNombre) / 2
        )
    );


    ajusteNombreComercialX = Math.round(
        Math.max(
            -limiteX,
            Math.min(
                limiteX,
                ajusteNombreComercialX
            )
        )
    );

    ajusteNombreComercialY = Math.round(
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

function moverNombreComercial(direccionX, direccionY) {

    ajusteNombreComercialX += direccionX * 10;
    ajusteNombreComercialY += direccionY * 10;

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

    intervaloNombreComercial = setInterval(function () {

        moverNombreComercial(
            direccionX,
            direccionY
        );

    }, 80);
}


/* ------------------------------------------------- */
/* DETENER MOVIMIENTO                                */
/* ------------------------------------------------- */

function detenerMovimientoNombreComercial() {

    if (intervaloNombreComercial) {

        clearInterval(intervaloNombreComercial);

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

    boton.addEventListener("pointerdown", function (evento) {

        evento.preventDefault();

        iniciarMovimientoNombreComercial(
            direccionX,
            direccionY
        );
    });

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
/*             MOVIMIENTO DEL CARRITO                */
/* ================================================= */

function limitarAjusteCarrito() {

    if (!botonCarrito || !franjaSuperior) {
        return;
    }

    const franjaRect =
        franjaSuperior.getBoundingClientRect();

    const carritoRect =
        botonCarrito.getBoundingClientRect();


    const limiteIzquierdo =
        franjaRect.left - carritoRect.left;

    const limiteDerecho =
        franjaRect.right - carritoRect.right;

    const limiteSuperior =
        franjaRect.top - carritoRect.top;

    const limiteInferior =
        franjaRect.bottom - carritoRect.bottom;


    // Mantener el carrito dentro de los límites de la franja.

    ajusteCarritoX = Math.max(
        ajusteCarritoX + limiteIzquierdo,
        Math.min(
            ajusteCarritoX + limiteDerecho,
            ajusteCarritoX
        )
    );

    ajusteCarritoY = Math.max(
        ajusteCarritoY + limiteSuperior,
        Math.min(
            ajusteCarritoY + limiteInferior,
            ajusteCarritoY
        )
    );
}


/* --------------------------------------------- */
/* APLICAR POSICIÓN DEL CARRITO                  */
/* --------------------------------------------- */

function aplicarAjusteCarrito() {

    const esMovilCarrito =
        window.matchMedia("(max-width: 768px)").matches;

    if (esMovilCarrito) {

        ajusteCarritoX = ajusteCarritoXMovil;
        ajusteCarritoY = ajusteCarritoYMovil;

    } else {

        ajusteCarritoX = ajusteCarritoXEscritorio;
        ajusteCarritoY = ajusteCarritoYEscritorio;
    }

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
/*       APLICAR TAMAÑO DEL BUSCADOR              */
/* ============================================= */


function aplicarTamanoBuscador() {

    if (!buscador) {
        return;
    }

    buscador.style.boxSizing = "border-box";

    buscador.style.width =
        anchoBuscadorSeleccionado + "px";

    buscador.style.height =
        altoBuscadorSeleccionado + "px";

    buscador.style.flex = "0 0 auto";
    buscador.style.minWidth = "0";
    buscador.style.maxWidth = "none";

    const campoBusqueda =
        document.getElementById("campo-busqueda");

    const botonBusqueda =
        document.getElementById("boton-busqueda");

    if (campoBusqueda) {
        campoBusqueda.style.boxSizing = "border-box";
        campoBusqueda.style.height = "100%";
        campoBusqueda.style.minWidth = "0";
    }

    if (botonBusqueda) {
        botonBusqueda.style.boxSizing = "border-box";
        botonBusqueda.style.height = "100%";
        botonBusqueda.style.width = "35px";
        botonBusqueda.style.flex = "0 0 35px";
    }
}


/* ============================================= */
/*       FLECHAS PARA CAMBIAR EL ANCHO            */
/* ============================================= */

let intervaloTamanoBuscador = null;


function cambiarAnchoBuscador(direccion) {

    const anchoMaximo =
        Math.floor(window.innerWidth * 0.75);

    anchoBuscadorSeleccionado = Math.max(
        100,
        Math.min(
            anchoMaximo,
            anchoBuscadorSeleccionado + direccion * 20
        )
    );

    aplicarTamanoBuscador();
}


function iniciarCambioTamanoBuscador(direccion) {

    detenerCambioTamanoBuscador();

    cambiarAnchoBuscador(direccion);

    intervaloTamanoBuscador = setInterval(function () {

        cambiarAnchoBuscador(direccion);

    }, 80);
}


function detenerCambioTamanoBuscador() {

    if (intervaloTamanoBuscador !== null) {

        clearInterval(intervaloTamanoBuscador);

        intervaloTamanoBuscador = null;
    }
}








/* --------------------------------------------- */
/* BOTÓN REDUCIR                                 */
/* --------------------------------------------- */

if (reducirBuscador) {

    reducirBuscador.addEventListener(
        "pointerdown",
        function (evento) {

            evento.preventDefault();

            iniciarCambioTamanoBuscador(-1);
        }
    );
}


/* --------------------------------------------- */
/* BOTÓN AGRANDAR                                */
/* --------------------------------------------- */

if (agrandarBuscador) {

    agrandarBuscador.addEventListener(
        "pointerdown",
        function (evento) {

            evento.preventDefault();

            iniciarCambioTamanoBuscador(1);
        }
    );
}


document.addEventListener(
    "pointerup",
    detenerCambioTamanoBuscador
);

document.addEventListener(
    "pointercancel",
    detenerCambioTamanoBuscador
);


/* ============================================= */
/*       POSICIÓN DEL BUSCADOR                   */
/* ============================================= */

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
/*       MOVER EL BUSCADOR                       */
/* ============================================= */

function moverBuscador(direccionX, direccionY) {

    const paso = 4;

    ajusteBuscadorX += direccionX * paso;
    ajusteBuscadorY += direccionY * paso;

    aplicarAjusteBuscador();
}


/* ============================================= */
/*       INICIAR MOVIMIENTO                      */
/* ============================================= */

function iniciarMovimientoBuscador(
    direccionX,
    direccionY
) {

    detenerMovimientoBuscador();

    moverBuscador(
        direccionX,
        direccionY
    );

    intervaloBuscador = setInterval(function () {

        moverBuscador(
            direccionX,
            direccionY
        );

    }, 80);
}


/* ============================================= */
/*       DETENER MOVIMIENTO                      */
/* ============================================= */

function detenerMovimientoBuscador() {

    if (intervaloBuscador !== null) {

        clearInterval(intervaloBuscador);

        intervaloBuscador = null;
    }
}


/* ============================================= */
/*       CONFIGURAR FLECHAS DEL BUSCADOR         */
/* ============================================= */

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


document.addEventListener(
    "pointerup",
    detenerMovimientoBuscador
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoBuscador
);


/* ============================================= */
/*       APLICAR CONFIGURACIÓN INICIAL           */
/* ============================================= */

aplicarTamanoBuscador();
aplicarAjusteBuscador();



/* ============================================= */
/*              MOVIMIENTO DEL CARRITO           */
/* ============================================= */

function moverCarrito(direccionX, direccionY) {

    ajusteCarritoX += direccionX * 10;
    ajusteCarritoY += direccionY * 10;

    const esMovilCarrito =
        window.matchMedia("(max-width: 768px)").matches;

    if (esMovilCarrito) {

        ajusteCarritoXMovil = ajusteCarritoX;
        ajusteCarritoYMovil = ajusteCarritoY;

    } else {

        ajusteCarritoXEscritorio = ajusteCarritoX;
        ajusteCarritoYEscritorio = ajusteCarritoY;
    }

    aplicarAjusteCarrito();
}


/* --------------------------------------------- */
/* INICIAR MOVIMIENTO DEL CARRITO                */
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

    intervaloCarrito = setInterval(function () {

        moverCarrito(
            direccionX,
            direccionY
        );

    }, 80);
}


/* --------------------------------------------- */
/* DETENER MOVIMIENTO DEL CARRITO                */
/* --------------------------------------------- */

function detenerMovimientoCarrito() {

    if (intervaloCarrito !== null) {

        clearInterval(intervaloCarrito);

        intervaloCarrito = null;
    }
}


/* --------------------------------------------- */
/* CONFIGURAR FLECHAS DEL CARRITO                */
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
/* CUATRO DIRECCIONES DEL CARRITO                */
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


document.addEventListener(
    "pointerup",
    detenerMovimientoCarrito
);

document.addEventListener(
    "pointercancel",
    detenerMovimientoCarrito
);


/* ================================================= */
/*              CAMBIO DE FUENTE                     */
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
/*              CAMBIO DE TAMAÑO                     */
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
/*         ACEPTAR CONFIGURACIÓN DEL LOGOTIPO         */
/* ================================================= */

aceptarLogotipo.addEventListener(
    "click",
    async function () {

        const archivo = archivoLogotipo.files[0];

        const esMovilLogo =
            window.matchMedia("(max-width: 768px)").matches;

        const columnaLogotipo = esMovilLogo
            ? "logotipo_url_movil"
            : "logotipo_url_escritorio";

        let logotipoUrl = esMovilLogo
            ? configuracionGuardada?.logotipo_url_movil || null
            : configuracionGuardada?.logotipo_url_escritorio || null;


        /* SUBIR IMAGEN SI SE SELECCIONÓ UN ARCHIVO */

        if (archivo) {

            const nombreArchivo =
                `logotipo_${Date.now()}_${archivo.name}`;

            const { error: errorSubida } = await clienteSupabase
                .storage
                .from("imagenes")
                .upload(
                    `logotipos/${nombreArchivo}`,
                    archivo
                );

            if (errorSubida) {

                console.error(
                    "Error al subir el logotipo:",
                    errorSubida
                );

                return;
            }

            const { data } = clienteSupabase
                .storage
                .from("imagenes")
                .getPublicUrl(
                    `logotipos/${nombreArchivo}`
                );

            logotipoUrl = data.publicUrl;
        }


     
/* PREPARAR DATOS */

const datosLogo = {

    [columnaLogotipo]: logotipoUrl,

    mostrar_logotipo:
        mostrarLogotipo.checked,

    ajuste_logotipo_x:
        ajusteLogotipoEscritorio,

    ajuste_logotipo_x_movil:
        ajusteLogotipoMovil,

    ajuste_logotipo_y_escritorio:
        ajusteLogotipoYEscritorio,

    ajuste_logotipo_y_movil:
        ajusteLogotipoYMovil
};



        /* GUARDAR EN SUPABASE */

        const { error } = await clienteSupabase
            .from("configuracion_inicio")
            .update(datosLogo)
            .eq("cliente_id", clienteId);

        if (error) {

            console.error(
                "Error al guardar el logotipo:",
                error
            );

            return;
        }


        /* ACTUALIZAR CONFIGURACIÓN EN MEMORIA */

        if (configuracionGuardada) {

            Object.assign(
                configuracionGuardada,
                datosLogo
            );
        }


        /* ACTUALIZAR LOGOTIPO EN LA FRANJA */

        let imagen =
            document.getElementById("logotipo-franja");

        if (logotipoUrl) {

            if (!imagen) {

                imagen = document.createElement("img");

                imagen.id = "logotipo-franja";

                franjaSuperior.appendChild(imagen);
            }

            imagen.src = logotipoUrl;

            aplicarAjusteLogotipo();

            imagen.classList.toggle(
                "oculto",
                !mostrarLogotipo.checked
            );

        } else if (imagen) {

            imagen.classList.add("oculto");
        }


        /* CERRAR FORMULARIO */

        archivoLogotipo.value = "";

        formularioLogotipo.classList.remove(
            "formulario-abierto"
        );

        formularioCabecera.classList.add(
            "formulario-abierto"
        );
    }
);



/* ================================================= */
/*         ACEPTAR CONFIGURACIÓN DEL CARRITO          */
/* ================================================= */

aceptarCarrito.addEventListener(
    "click",
    async function () {

        // Identificar el dispositivo al guardar.
        const esMovilCarrito =
            window.matchMedia("(max-width: 768px)").matches;

        // Actualizar únicamente la posición del dispositivo actual.
        if (esMovilCarrito) {

            ajusteCarritoXMovil = ajusteCarritoX;
            ajusteCarritoYMovil = ajusteCarritoY;

        } else {

            ajusteCarritoXEscritorio = ajusteCarritoX;
            ajusteCarritoYEscritorio = ajusteCarritoY;
        }

        
        // Guardar la configuración del dispositivo actual.
        const datosCarrito = {

            mostrar_carrito:
                mostrarCarrito.checked,

            tipo_carrito:
                tipoCarritoSeleccionado,

            tipo_carrito_escritorio:
                esMovilCarrito
                    ? (
                        configuracionGuardada?.tipo_carrito_escritorio
                        ?? configuracionGuardada?.tipo_carrito
                        ?? "bolsita"
                    )
                    : tipoCarritoSeleccionado,

            tipo_carrito_movil:
                esMovilCarrito
                    ? tipoCarritoSeleccionado
                    : (
                        configuracionGuardada?.tipo_carrito_movil
                        ?? configuracionGuardada?.tipo_carrito
                        ?? "bolsita"
                    ),

            ajuste_carrito_x_escritorio:
                ajusteCarritoXEscritorio,

            ajuste_carrito_y_escritorio:
                ajusteCarritoYEscritorio,

            ajuste_carrito_x_movil:
                ajusteCarritoXMovil,

            ajuste_carrito_y_movil:
                ajusteCarritoYMovil,

            // Mantener los campos generales por compatibilidad.
            ajuste_carrito_x:
                ajusteCarritoX,

            ajuste_carrito_y:
                ajusteCarritoY
        };



        const { error } = await clienteSupabase
            .from("configuracion_inicio")
            .update(datosCarrito)
            .eq("cliente_id", clienteId);

        if (error) {

            console.error(
                "Error al guardar configuración del carrito:",
                error
            );

            alert(
                "No se pudo guardar la configuración del carrito."
            );

            return;
        }

        // Actualizar la configuración que está en memoria.
        if (configuracionGuardada) {

            Object.assign(
                configuracionGuardada,
                datosCarrito
            );
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

        console.log(
            "Configuración del carrito guardada:",
            datosCarrito
        );
    }
);


/* ================================================= */
/*         ACEPTAR CONFIGURACIÓN DEL BUSCADOR         */
/* ================================================= */

aceptarBuscador.addEventListener(
    "click",
    async function () {

        /* IDENTIFICAR DISPOSITIVO */

        const esMovilBuscador =
            window.matchMedia("(max-width: 768px)").matches;


        /* PREPARAR DATOS DEL DISPOSITIVO ACTUAL */

        const datosBuscador = esMovilBuscador
            ? {
                ajuste_buscador_x_movil:
                    ajusteBuscadorX,

                ajuste_buscador_y_movil:
                    ajusteBuscadorY,

                ancho_buscador_movil:
                    anchoBuscadorSeleccionado,

                alto_buscador_movil:
                    altoBuscadorSeleccionado
            }
            : {
                ajuste_buscador_x_escritorio:
                    ajusteBuscadorX,

                ajuste_buscador_y_escritorio:
                    ajusteBuscadorY,

                ancho_buscador_escritorio:
                    anchoBuscadorSeleccionado,

                alto_buscador_escritorio:
                    altoBuscadorSeleccionado
            };


        /* GUARDAR EN SUPABASE */

        const { error: errorBuscador } =
            await clienteSupabase
                .from("configuracion_inicio")
                .update(datosBuscador)
                .eq("cliente_id", clienteId);


        if (errorBuscador) {

            console.error(
                "Error al guardar configuración del buscador:",
                errorBuscador
            );

            alert(
                "No se pudo guardar la configuración del buscador."
            );

            return;
        }


        /* ACTUALIZAR CONFIGURACIÓN EN MEMORIA */

        if (configuracionGuardada) {

            Object.assign(
                configuracionGuardada,
                datosBuscador
            );
        }


        /* CERRAR FORMULARIO */

        formularioBuscador.classList.remove(
            "formulario-abierto"
        );

        formularioCabecera.classList.add(
            "formulario-abierto"
        );


        console.log(
            "Configuración del buscador guardada:",
            datosBuscador
        );
    }
);




/* ================================================= */
/*         ACEPTAR NOMBRE COMERCIAL                   */
/* ================================================= */

aceptarNombreComercial.addEventListener(
    "click",
    async function () {

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


        /* IDENTIFICAR DISPOSITIVO */

        const esMovilNombre =
            window.innerWidth <= 768;


        /* GUARDAR NOMBRE */

        if (esMovilNombre) {

            nombreComercialMovil =
                nombreComercial.value;

        } else {

            nombreComercialEscritorio =
                nombreComercial.value;
        }


        nombreEncabezado.textContent =
            nombreComercial.value;


        /* ACTUALIZAR FUENTE Y TAMAÑO */

        actualizarVariableCSS(
            "--fuente-nombre-comercial",
            fuenteNombreComercial.value
        );

        actualizarVariableCSS(
            "--tamano-nombre-comercial",
            tamanoNombreComercial.value
        );


        /* APLICAR POSICIÓN */

        aplicarAjusteNombreComercial();


        /* MOSTRAR U OCULTAR */

        nombreEncabezado.classList.toggle(
            "oculto",
            !mostrarNombreComercial.checked
        );


        /* GUARDAR AJUSTES SEGÚN DISPOSITIVO */

        if (esMovilNombre) {

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


        /* DATOS GENERALES */

        const datosNombreComercial = {

            fuente_nombre_comercial:
                fuenteNombreComercial.value,

            mostrar_nombre_comercial:
                mostrarNombreComercial.checked
        };


        /* GUARDAR NOMBRE SEGÚN DISPOSITIVO */

        if (esMovilNombre) {

            datosNombreComercial.nombre_comercial_movil =
                nombreComercialMovil;

            datosNombreComercial.tamano_nombre_comercial_movil =
                tamanoNombreComercialMovil;

            datosNombreComercial.ajuste_nombre_comercial_x_movil =
                ajusteNombreComercialXMovil;

            datosNombreComercial.ajuste_nombre_comercial_y_movil =
                ajusteNombreComercialYMovil;

        } else {

            datosNombreComercial.nombre_comercial_escritorio =
                nombreComercialEscritorio;

            datosNombreComercial.tamano_nombre_comercial_escritorio =
                tamanoNombreComercialEscritorio;

            datosNombreComercial.ajuste_nombre_comercial_x_escritorio =
                ajusteNombreComercialXEscritorio;

            datosNombreComercial.ajuste_nombre_comercial_y_escritorio =
                ajusteNombreComercialYEscritorio;
        }


        /* POSICIÓN DEL BOTÓN ACEPTAR EN ESCRITORIO */

        if (window.innerWidth > 768) {

            datosNombreComercial.aceptar_nombre_comercial_top_escritorio =
                parseInt(
                    getComputedStyle(
                        aceptarNombreComercial
                    ).top,
                    10
                ) || 315;
        }


        /* GUARDAR EN SUPABASE */

        const { error } = await clienteSupabase
            .from("configuracion_inicio")
            .update(datosNombreComercial)
            .eq("cliente_id", clienteId);


        if (error) {

            console.error(
                "Error al guardar nombre comercial:",
                error
            );

            return;
        }


        if (configuracionGuardada) {

            Object.assign(
                configuracionGuardada,
                datosNombreComercial
            );
        }


        formularioNombreComercial.classList.remove(
            "formulario-abierto"
        );

        formularioCabecera.classList.add(
            "formulario-abierto"
        );
    }
);


/* ================================================= */
/*          ACEPTAR CONFIGURACIÓN DE CABECERA         */
/* ================================================= */

aceptarCabecera.addEventListener(
    "click",
    async function () {

        const archivo = archivoLogotipo.files[0];

        let logotipoUrl =
            configuracionGuardada?.logotipo_url || null;


        /* SUBIR LOGOTIPO SI SE SELECCIONÓ */

        if (archivo) {

            const nombreArchivo =
                `logotipo_${Date.now()}_${archivo.name}`;

            const { error: errorSubida } = await clienteSupabase
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

            const { data: urlLogotipo } = clienteSupabase
                .storage
                .from("imagenes")
                .getPublicUrl(
                    `logotipos/${nombreArchivo}`
                );

            logotipoUrl = urlLogotipo.publicUrl;


            let imagenFranja =
                document.getElementById("logotipo-franja");

            if (!imagenFranja) {

                imagenFranja =
                    document.createElement("img");

                imagenFranja.id =
                    "logotipo-franja";

                franjaSuperior.appendChild(imagenFranja);
            }

            imagenFranja.src = logotipoUrl;

            imagenFranja.classList.toggle(
                "oculto",
                !mostrarLogotipo.checked
            );
        }


        /* ACTUALIZAR VISIBILIDAD */

        botonCarrito.classList.toggle(
            "oculto",
            !mostrarCarrito.checked
        );

        buscador.classList.toggle(
            "oculto",
            !mostrarBuscador.checked
        );


         /* GUARDAR CONFIGURACIÓN */

        const { error: errorGuardado } = await clienteSupabase
            .from("configuracion_inicio")
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
                    tipoCarritoSeleccionado

            })
            .eq("cliente_id", clienteId);


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
/*          ACEPTAR CONFIGURACIÓN DE INICIO           */
/* ================================================= */

aceptarInicio.addEventListener(
    "click",
    async function () {

        const archivo = archivoLogotipo.files[0];

        let logotipoUrl =
            configuracionGuardada?.logotipo_url || null;


        /* SUBIR LOGOTIPO SI SE SELECCIONÓ */

        if (archivo) {

            const nombreArchivo =
                `logotipo_${Date.now()}_${archivo.name}`;

            const { error: errorSubida } = await clienteSupabase
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

            const { data: urlLogotipo } = clienteSupabase
                .storage
                .from("imagenes")
                .getPublicUrl(
                    `logotipos/${nombreArchivo}`
                );

            logotipoUrl = urlLogotipo.publicUrl;


            let imagenFranja =
                document.getElementById("logotipo-franja");

            if (!imagenFranja) {

                imagenFranja =
                    document.createElement("img");

                imagenFranja.id =
                    "logotipo-franja";

                franjaSuperior.appendChild(imagenFranja);
            }

            imagenFranja.src = logotipoUrl;
        }


     
        /* PREPARAR CONFIGURACIÓN */

       const configuracion = {
    cliente_id: clienteId,

    color_franjas_escritorio: esMovil
        ? (configuracionGuardada?.color_franjas_escritorio || "#ffffff")
        : colorFranjas.value,

    color_franjas_movil: esMovil
        ? colorFranjas.value
        : (configuracionGuardada?.color_franjas_movil || "#ffffff"),

    color_boton_menu_escritorio: esMovil
        ? (configuracionGuardada?.color_boton_menu_escritorio || "#159c96")
        : colorBotonMenu.value,

    color_boton_menu_movil: esMovil
        ? colorBotonMenu.value
        : (configuracionGuardada?.color_boton_menu_movil || "#159c96"),

    color_texto_menu_escritorio: esMovil
        ? (configuracionGuardada?.color_texto_menu_escritorio || "#f2f2f2")
        : colorTextoMenu.value,

    color_texto_menu_movil: esMovil
        ? colorTextoMenu.value
        : (configuracionGuardada?.color_texto_menu_movil || "#f2f2f2"),

    color_panel_menu_escritorio: esMovil
        ? (configuracionGuardada?.color_panel_menu_escritorio || "#D8E2EE")
        : colorPanelMenu.value,

    color_panel_menu_movil: esMovil
        ? colorPanelMenu.value
        : (configuracionGuardada?.color_panel_menu_movil || "#D8E2EE"),

    logotipo_url: logotipoUrl
};


        /* GUARDAR EN SUPABASE */

        const { error } = await clienteSupabase
            .from("configuracion_inicio")
            .update(configuracion)
            .eq("cliente_id", clienteId);


        if (error) {

            console.error(
                "Error al guardar configuración:",
                error
                
            );

            return;
        }

        if (configuracionGuardada) {

            Object.assign(
                configuracionGuardada,
                configuracion
            );
        }

  

/* APLICAR COLORES DEL DISPOSITIVO ACTUAL */

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

/* CERRAR CONFIGURACIÓN Y REGRESAR AL MENÚ */

formularioInicio.classList.remove(
    "formulario-abierto"
);

panelMenu.classList.remove(
    "menu-abierto"
);

        
    }
);


/* ================================================= */
/*                 BOTÓN DE BÚSQUEDA                  */
/* ================================================= */

if (botonBusqueda && buscador) {

    botonBusqueda.addEventListener(
        "click",
        function () {

            buscador.classList.toggle("expandido");
        }
    );
}




/* ================================================= */
/*          FIN DEL BLOQUE PRINCIPAL                  */
/* ================================================= */


}); 

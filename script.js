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
        SUPABASE_KEY,
        {
            global: {
                // Evitar que el navegador reutilice una configuración antigua de Supabase.
                fetch: (input, init = {}) =>
                    fetch(input, { ...init, cache: "no-store" })
            }
        }
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


 // Ocultar las pantallas mientras se comprueba la sesión.
    pantallaLogin.style.setProperty("display", "none", "important");
    paginaInicio.style.setProperty("display", "none", "important");

    let modoRecuperacion = false;

   
    // Detectar la recuperación antes de decidir qué pantalla mostrar.
    const { data: { session }, error: errorSesion } =
        await clienteSupabase.auth.getSession();

    if (errorSesion) {
        console.error("Error al obtener la sesión:", errorSesion);
    }

    const parametrosAcceso = new URLSearchParams(window.location.search);
    const negocioSlugAcceso = parametrosAcceso.get("negocio");
    let sesionValidaParaNegocio = true;

    if (negocioSlugAcceso) {
        const { data: identidadAcceso, error: errorIdentidadAcceso } =
            await clienteSupabase
                .from("configuracion_tienda_codmar_publica")
                .select("nombre_comercial, negocio_slug")
                .eq("negocio_slug", negocioSlugAcceso)
                .maybeSingle();

        if (errorIdentidadAcceso) {
            console.error("No se pudo identificar el negocio de este acceso:", errorIdentidadAcceso);
        }

        if (identidadAcceso) {
            const nombreAcceso = (identidadAcceso.nombre_comercial || "").trim() || "CODMAR";
            const tituloLogin = document.getElementById("nombre-plataforma-login");
            const tituloRegistro = document.getElementById("nombre-plataforma-registro");
            if (tituloLogin) tituloLogin.textContent = nombreAcceso;
            if (tituloRegistro) tituloRegistro.textContent = nombreAcceso;
            const tituloRecuperacion = document.getElementById("nombre-plataforma-recuperacion");
            if (tituloRecuperacion) tituloRecuperacion.textContent = nombreAcceso;
            document.title = nombreAcceso + " | Acceso";
        }

        if (session) {
            const { data: usuarioAcceso } = await clienteSupabase
                .from("usuarios")
                .select("cliente_id")
                .eq("auth_user_id", session.user.id)
                .maybeSingle();

            const { data: clienteAcceso } = usuarioAcceso
                ? await clienteSupabase
                    .from("clientes")
                    .select("slug")
                    .eq("id", usuarioAcceso.cliente_id)
                    .maybeSingle()
                : { data: null };

            if (!clienteAcceso || clienteAcceso.slug !== negocioSlugAcceso) {
                sesionValidaParaNegocio = false;
                await clienteSupabase.auth.signOut();
                const avisoAcceso = document.getElementById("mensaje-login");
                if (avisoAcceso) {
                    avisoAcceso.textContent = "Esta dirección corresponde a otro negocio. Inicia sesión con la cuenta correcta.";
                }
            }
        }
    }

    // Comprobar si la URL contiene información del enlace de recuperación.
    const hashActual = window.location.hash;
    const parametrosActuales = new URLSearchParams(
        window.location.search
    );

    const esRecuperacion =
        hashActual.includes("type=recovery") ||
        parametrosActuales.get("type") === "recovery";

    if (esRecuperacion) {
        modoRecuperacion = true;
    }

    // Escuchar el evento de recuperación de Supabase.
    clienteSupabase.auth.onAuthStateChange(function (evento, sesionEvento) {
        if (evento === "PASSWORD_RECOVERY") {
            modoRecuperacion = true;
            mostrarFormularioNuevaPassword();
        }
    });

    function mostrarFormularioNuevaPassword() {
    const pantallaRecuperacion =
        document.getElementById("pantalla-recuperacion");

    const formularioRecuperacion =
        document.getElementById("formulario-recuperacion");

    const formularioNuevaPassword =
        document.getElementById("formulario-nueva-password");

    const pantallaRegistro =
        document.getElementById("pantalla-registro");

    pantallaLogin.style.setProperty("display", "none", "important");

    if (pantallaRegistro) {
        pantallaRegistro.style.setProperty("display", "none", "important");
    }

    paginaInicio.style.setProperty("display", "none", "important");

    if (pantallaRecuperacion) {
        pantallaRecuperacion.hidden = false;
        pantallaRecuperacion.style.setProperty(
            "display", "flex", "important"
        );
    }

    if (formularioRecuperacion) {
        formularioRecuperacion.hidden = true;
    }

    if (formularioNuevaPassword) {
        formularioNuevaPassword.hidden = false;
    }
}

    if (modoRecuperacion) {
        mostrarFormularioNuevaPassword();
    } else if (session && sesionValidaParaNegocio) {
        console.log("Usuario autenticado:", session.user.id);

        pantallaLogin.style.setProperty("display", "none", "important");
        paginaInicio.style.setProperty("display", "block", "important");
    } else {
        console.log("No hay usuario autenticado.");

        paginaInicio.style.setProperty("display", "none", "important");
        pantallaLogin.style.setProperty("display", "flex", "important");
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

const pantallaRecuperacion =
    document.getElementById("pantalla-recuperacion");

const formularioRecuperacion =
    document.getElementById("formulario-recuperacion");

const correoRecuperacion =
    document.getElementById("correo-recuperacion");

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


/* ABRIR VENTANA DE RECUPERACIÓN */

if (botonMostrarRecuperacion && pantallaRecuperacion) {
    botonMostrarRecuperacion.addEventListener("click", async function () {

        const parametrosVistaRecuperacion = new URLSearchParams(window.location.search);
        const slugVistaRecuperacion = parametrosVistaRecuperacion.get("negocio");
        if (slugVistaRecuperacion) {
            const { data: identidadVistaRecuperacion } = await clienteSupabase
                .from("configuracion_tienda_codmar_publica")
                .select("nombre_comercial")
                .eq("negocio_slug", slugVistaRecuperacion)
                .maybeSingle();

            if (identidadVistaRecuperacion?.nombre_comercial) {
                const tituloRecuperacion = document.getElementById("nombre-plataforma-recuperacion");
                tituloRecuperacion.textContent = identidadVistaRecuperacion.nombre_comercial;
                document.title = identidadVistaRecuperacion.nombre_comercial + " | Recuperar cuenta";
            }
        }

        pantallaLogin.style.setProperty("display", "none", "important");

        pantallaRecuperacion.hidden = false;
        pantallaRecuperacion.style.setProperty("display", "flex", "important");

        if (formularioRecuperacion) {
            formularioRecuperacion.reset();
        }

        if (formularioNuevaPassword) {
            formularioNuevaPassword.hidden = true;
        }

        mensajeRecuperacion.textContent = "";
        mensajeLogin.textContent = "";
    });
}


/* VOLVER AL ACCESO */

if (botonCancelarRecuperacion && pantallaRecuperacion) {
    botonCancelarRecuperacion.addEventListener("click", function () {

        pantallaRecuperacion.style.setProperty("display", "none", "important");
        pantallaRecuperacion.hidden = true;

        pantallaLogin.style.setProperty("display", "flex", "important");

        mensajeRecuperacion.textContent = "";
    });
}


/* ENVIAR ENLACE DE RECUPERACIÓN */

if (botonEnviarRecuperacion && correoRecuperacion) {
    botonEnviarRecuperacion.addEventListener("click", async function () {

        const email = correoRecuperacion.value.trim();

        mensajeRecuperacion.textContent = "";

        if (!email || !correoRecuperacion.checkValidity()) {
            mensajeRecuperacion.textContent =
                "Escribe un correo electrónico válido.";
            correoRecuperacion.focus();
            return;
        }

        botonEnviarRecuperacion.disabled = true;

        try {
            const parametrosRecuperacion = new URLSearchParams(window.location.search);
            const negocioSlugRecuperacion = parametrosRecuperacion.get("negocio");

            if (negocioSlugRecuperacion) {
                const { data: identidadRecuperacion, error: errorIdentidadRecuperacion } =
                    await clienteSupabase
                        .from("configuracion_tienda_codmar_publica")
                        .select("nombre_comercial")
                        .eq("negocio_slug", negocioSlugRecuperacion)
                        .maybeSingle();

                if (!errorIdentidadRecuperacion && identidadRecuperacion?.nombre_comercial) {
                    const tituloRecuperacion = document.getElementById("nombre-plataforma-recuperacion");
                    if (tituloRecuperacion) {
                        tituloRecuperacion.textContent = identidadRecuperacion.nombre_comercial;
                    }
                    document.title = identidadRecuperacion.nombre_comercial + " | Recuperar cuenta";
                }
            }

            const destinoRecuperacion =
                "https://gonza021872.github.io/Catalogo_CODMAR/" +
                (negocioSlugRecuperacion
                    ? "?negocio=" + encodeURIComponent(negocioSlugRecuperacion)
                    : "");

            const { error } =
                await clienteSupabase.auth.resetPasswordForEmail(email, {
                    redirectTo: destinoRecuperacion
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
           pantallaRecuperacion.style.setProperty("display", "none", "important");
           pantallaRecuperacion.hidden = true;

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

    const registroConfirmarPassword =
    document.getElementById("registro-confirmar-password");

const mensajeRegistro =
    document.getElementById("mensaje-registro");



/* ========================================= */
/*   NAVEGACIÓN ENTRE ACCESO Y REGISTRO      */
/* ========================================= */

const pantallaRegistro =
    document.getElementById("pantalla-registro");

if (
    botonMostrarRegistro &&
    pantallaLogin &&
    pantallaRegistro &&
    mensajeRegistro
) {
    botonMostrarRegistro.addEventListener("click", function () {
        pantallaLogin.style.display = "none";
        pantallaRegistro.style.display = "flex";
        mensajeRegistro.textContent = "";
    });
}

if (
    botonCancelarRegistro &&
    pantallaLogin &&
    pantallaRegistro &&
    mensajeRegistro
) {
    botonCancelarRegistro.addEventListener("click", function () {
        pantallaRegistro.style.display = "none";
        pantallaLogin.style.display = "flex";
        mensajeRegistro.textContent = "";
    });
}


if (
    botonRegistrarNegocio &&
    registroNombreComercial &&
    registroEmail &&
    registroPassword &&
    registroConfirmarPassword &&
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

                const confirmarPassword =
                registroConfirmarPassword.value;

            mensajeRegistro.textContent = "";

            if (!nombreNegocio || !emailNuevo || !passwordNuevo) {
                mensajeRegistro.textContent =
                    "Completa todos los campos.";
                return;
            }
            if (passwordNuevo !== confirmarPassword) {
              mensajeRegistro.textContent =
           "Las contraseñas no coinciden.";
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

    if (!session || !sesionValidaParaNegocio) {
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
/*           ACEPTAR CONFIGURACIÓN CABECERA           */
/* ================================================= */

aceptarCabecera.addEventListener("click", function () {

    formularioCabecera.classList.remove(
        "formulario-abierto"
    );

});


   
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


     
/* ============================================= */
/*       ABRIR Y CERRAR PANEL DE COMPRAS         */
/* ============================================= */

const panelComprasCODMAR =
    document.getElementById("panel-compras-codmar");

const cerrarPanelCompras =
    document.getElementById("cerrar-panel-compras");



/* ============================================= */
/*       MOSTRAR PRODUCTOS DEL CARRITO           */
/* ============================================= */

function mostrarProductosCarritoCODMAR() {

    const lista =
        document.getElementById("lista-productos-carrito");

    const totalGeneral =
        document.getElementById("total-general-carrito");

    if (!lista || !totalGeneral) {
        return;
    }

    lista.innerHTML = "";

    let total = 0;

    // ENCABEZADOS DE LAS COLUMNAS

    const encabezados = document.createElement("div");
    encabezados.className = "encabezados-nota-codmar";

    encabezados.innerHTML = `
        <span>CANTIDAD</span>
        <span>PRODUCTO</span>
        <span>PRECIO</span>
        <span>IMPORTE</span>
    `;

    lista.appendChild(encabezados);

    // CARRITO VACÍO

    if (carritoCODMAR.length === 0) {

        const vacio = document.createElement("p");
        vacio.className = "carrito-vacio";
        vacio.textContent = "Tu carrito está vacío.";

        lista.appendChild(vacio);

        totalGeneral.textContent = "$0.00";

        return;
    }

    // PRODUCTOS

    carritoCODMAR.forEach(function (producto) {

        const precio = Number(producto.precio_codmar) || 0;
        const cantidad = Number(producto.cantidad) || 0;
        const importe = precio * cantidad;

        total += importe;

        const fila = document.createElement("div");
        fila.className = "fila-nota-codmar";

        const cantidadColumna = document.createElement("span");
        cantidadColumna.textContent = cantidad;

        const productoColumna = document.createElement("span");
        productoColumna.textContent =
            producto.nombre +
            (producto.presentacion ? " " + producto.presentacion : "");

        const precioColumna = document.createElement("span");
        precioColumna.textContent = "$" + precio.toFixed(2);

        const importeColumna = document.createElement("span");
        importeColumna.textContent = "$" + importe.toFixed(2);

        fila.appendChild(cantidadColumna);
        fila.appendChild(productoColumna);
        fila.appendChild(precioColumna);
        fila.appendChild(importeColumna);

        lista.appendChild(fila);

    });

    totalGeneral.textContent = "$" + total.toFixed(2);

}



// ABRIR O CERRAR CON EL BOTÓN SUPERIOR

if (botonCarrito && panelComprasCODMAR) {

    botonCarrito.addEventListener("click", function () {

    panelComprasCODMAR.classList.toggle("activo");

    mostrarProductosCarritoCODMAR();
       

    });

}

// CERRAR CON LA X

if (cerrarPanelCompras && panelComprasCODMAR) {

    cerrarPanelCompras.addEventListener("click", function () {

        panelComprasCODMAR.classList.remove("activo");

    });

}




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

    const colorNombreComercial =
        document.getElementById("color-nombre-comercial");


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

    // Aplicar el color guardado directamente a las dos franjas.
    // Así ningún color predeterminado del CSS puede sustituirlo al recargar.
    function aplicarColorFranjasEnEncabezados(color) {
        if (!color) return;

        actualizarVariableCSS("--color-franjas", color);

        document.querySelectorAll(
            ".barra-inicio-superior, .barra-inicio-inferior"
        ).forEach(function (franja) {
            franja.style.setProperty(
                "background-color",
                color,
                "important"
            );
        });
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

    const { data: datosNegocioActual, error: errorDatosNegocio } = await clienteSupabase
        .from("clientes")
        .select("slug,nombre_comercial")
        .eq("id", clienteId)
        .maybeSingle();

    if (errorDatosNegocio) {
        console.error("No se pudo cargar la identidad del negocio:", errorDatosNegocio);
    }

    // El ejemplo de categoría es exclusivo de CODMAR.
    // Los demás negocios conservan el campo vacío para escribir su propio giro.
    const campoNombreCategoria = document.getElementById("nombre-categoria");
    const nombreNegocioNormalizado = (datosNegocioActual?.nombre_comercial || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const slugNegocioNormalizado = (datosNegocioActual?.slug || "").toLowerCase();

    if (campoNombreCategoria) {
        const esCodmar = nombreNegocioNormalizado === "codmar" ||
            slugNegocioNormalizado.startsWith("codmar");
        campoNombreCategoria.placeholder = esCodmar ? "Ej. Medicamentos" : "";
    }

    const enlaceTiendaNegocio = document.getElementById("boton-abrir-tienda");
    if (datosNegocioActual?.slug && enlaceTiendaNegocio) {
        enlaceTiendaNegocio.href = "tienda.html?negocio=" + encodeURIComponent(datosNegocioActual.slug);
        enlaceTiendaNegocio.textContent = "Mi tienda pública";
        enlaceTiendaNegocio.title = "Abrir y compartir la tienda pública de este negocio";
        enlaceTiendaNegocio.setAttribute("aria-label", "Abrir tienda pública de " + (datosNegocioActual.nombre_comercial || "este negocio"));
    }

    console.log("CLIENTE ACTUAL:", clienteId);

    // =============================================
    // ACTUALIZAR PRECIOS DE PRODUCTOS EXISTENTES
    // =============================================
    const ventanaActualizarPrecios = document.getElementById("formulario-actualizar-precios");
    const botonCerrarActualizarPrecios = document.getElementById("cerrar-actualizar-precios");
    const productoSeleccionadoPrecio = document.getElementById("producto-seleccionado-precio");
    const campoPrecioPublicoEditar = document.getElementById("precio-publico-editar");
    const campoPrecioCodmarEditar = document.getElementById("precio-codmar-editar");
    const botonGuardarPrecios = document.getElementById("guardar-precios-producto");
    const mensajeActualizarPrecios = document.getElementById("mensaje-actualizar-precios");
    let productoPrecioSeleccionado = null;
    const formatoPrecioActualizar = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    });

    function cerrarVentanaActualizarPrecios() {
        ventanaActualizarPrecios?.classList.remove("formulario-abierto");
        productoPrecioSeleccionado = null;
        if (productoSeleccionadoPrecio) productoSeleccionadoPrecio.textContent = "Toca la foto del medicamento que deseas actualizar.";
        if (campoPrecioPublicoEditar) campoPrecioPublicoEditar.value = "";
        if (campoPrecioCodmarEditar) campoPrecioCodmarEditar.value = "";
        if (mensajeActualizarPrecios) mensajeActualizarPrecios.textContent = "";
    }

    function abrirVentanaActualizarPrecios() {
        panelMenu?.classList.remove("menu-abierto");
        formularioCategorias?.classList.remove("formulario-abierto");
        ventanaActualizarPrecios?.classList.add("formulario-abierto");
    }

    botonCerrarActualizarPrecios?.addEventListener("click", cerrarVentanaActualizarPrecios);

    botonGuardarPrecios?.addEventListener("click", async function () {
        mensajeActualizarPrecios.textContent = "";

        if (!productoPrecioSeleccionado) {
            mensajeActualizarPrecios.textContent = "Primero toca la foto del medicamento que deseas actualizar.";
            return;
        }

        const precioPublico = Number(campoPrecioPublicoEditar.value);
        const precioCodmar = Number(campoPrecioCodmarEditar.value);

        if (campoPrecioPublicoEditar.value.trim() === "" ||
            campoPrecioCodmarEditar.value.trim() === "" ||
            !Number.isFinite(precioPublico) ||
            !Number.isFinite(precioCodmar) ||
            precioPublico < 0 ||
            precioCodmar < 0) {
            mensajeActualizarPrecios.textContent = "Escribe ambos precios con cantidades válidas, iguales o mayores que cero.";
            return;
        }

        if (precioCodmar > precioPublico) {
            mensajeActualizarPrecios.textContent = "El precio CODMAR no puede ser mayor al precio público.";
            return;
        }

        botonGuardarPrecios.disabled = true;
        mensajeActualizarPrecios.textContent = "Guardando precios...";

        try {
            const { data, error } = await clienteSupabase
                .from("catalogo_codmar")
                .update({
                    precio_publico: precioPublico,
                    precio_codmar: precioCodmar
                })
                .eq("id", productoPrecioSeleccionado.id)
                .eq("cliente_id", clienteId)
                .eq("activo", true)
                .select("id,nombre,presentacion,precio_publico,precio_codmar")
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error("No se actualizó ningún producto. Verifica que siga activo y pertenezca a este negocio.");
            }

            productoPrecioSeleccionado = { ...productoPrecioSeleccionado, ...data };
            campoPrecioPublicoEditar.value = Number(data.precio_publico).toFixed(2);
            campoPrecioCodmarEditar.value = Number(data.precio_codmar).toFixed(2);
            productoSeleccionadoPrecio.textContent = data.nombre +
                (data.presentacion ? " · " + data.presentacion : "") +
                " · Precios actualizados";

            mensajeActualizarPrecios.textContent = "¡Precios actualizados correctamente!";
            await cargarMedicamentosCatalogo();
        } catch (error) {
            console.error("Error al actualizar precios:", error);
            const detalleError = error?.hint || error?.details || error?.message || "Error desconocido.";
            mensajeActualizarPrecios.textContent = "No se pudieron guardar los precios. " + detalleError;
        } finally {
            botonGuardarPrecios.disabled = false;
        }
    });



// CARRITO DE COMPRAS CODMAR
let carritoCODMAR = [];

console.log("CLIENTE ACTUAL:", clienteId);


    /* ================================================= */
/*       CARGAR MEDICAMENTOS DEL NEGOCIO ACTUAL       */
/* ================================================= */

async function cargarMedicamentosCatalogo(offset = 0, agregar = false) {

    const contenedor = document.querySelector(".contenido-inicio");

    if (!contenedor) {
        return;
    }

    const tamanoPagina = 50;
    let seccion;
    let lista;

    try {

        if (agregar) {
            seccion = contenedor.querySelector(".catalogo-medicamentos-codmar");
            lista = seccion?.querySelector(".lista-medicamentos-codmar");

            if (!seccion || !lista) {
                return;
            }
        } else {
            const seccionAnterior =
                contenedor.querySelector(".catalogo-medicamentos-codmar");

            if (seccionAnterior?._observadorCarga) {
                seccionAnterior._observadorCarga.disconnect();
            }

            contenedor.innerHTML = "";
            seccion = document.createElement("section");
            seccion.className = "catalogo-medicamentos-codmar";

            const titulo = document.createElement("h2");
            titulo.textContent = "MEDICAMENTOS";

            // En el sistema administrativo solo se muestra el acceso de ADMINISTRACIÓN.
            // Las ventas se realizan desde la página pública de tienda.
            const controlesModo = document.createElement("div");
            controlesModo.className = "controles-modo-catalogo";

            const botonAdministracion = document.createElement("button");
            botonAdministracion.textContent = "ADMINISTRACIÓN";
            botonAdministracion.type = "button";
            botonAdministracion.classList.add("modo-activo");

            controlesModo.appendChild(botonAdministracion);

            const botonActualizarPreciosPrincipal = document.createElement("button");
            botonActualizarPreciosPrincipal.textContent = "ACTUALIZAR PRECIOS";
            botonActualizarPreciosPrincipal.type = "button";
            botonActualizarPreciosPrincipal.classList.add("modo-activo");
            botonActualizarPreciosPrincipal.addEventListener(
                "click",
                abrirVentanaActualizarPrecios
            );
            controlesModo.appendChild(botonActualizarPreciosPrincipal);

            seccion.appendChild(controlesModo);

            lista = document.createElement("div");
            lista.className = "lista-medicamentos-codmar";
            seccion.appendChild(titulo);
            seccion.appendChild(lista);
            contenedor.appendChild(seccion);
        }

        const { data: medicamentos, error } = await clienteSupabase
            .from("catalogo_codmar")
            .select("id,nombre,presentacion,categoria,precio_publico,precio_codmar,tachar_precio_publico,imagen_url,imagen_path")
            .eq("cliente_id", clienteId)
            .eq("activo", true)
            .order("nombre", { ascending: true })
            .range(offset, offset + tamanoPagina - 1);

        if (error) {
            throw error;
        }

        if (!medicamentos || medicamentos.length === 0) {
            const botonAnterior = seccion.querySelector(".boton-cargar-mas-codmar");
            if (botonAnterior) {
                botonAnterior.remove();
            }
            if (seccion._observadorCarga) {
                seccion._observadorCarga.disconnect();
                seccion._observadorCarga = null;
            }
            if (offset === 0) {
                const aviso = document.createElement("p");
                aviso.className = "mensaje-catalogo-medicamentos";
                aviso.textContent = "Todavía no hay productos registrados en esta categoría.";
                seccion.appendChild(aviso);
            }
            return;
        }

        const formatoPrecio = new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN"
        });

        medicamentos.forEach(function (medicamento) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-medicamento-codmar";

            if (medicamento.imagen_url) {
                const imagen = document.createElement("img");
                imagen.src = medicamento.imagen_url;
                imagen.alt = medicamento.nombre || "Producto";
                imagen.loading = "lazy";
                imagen.onerror = function () {
                    this.style.display = "none";
                };
                tarjeta.appendChild(imagen);

                {
                    const selectorImagen = document.createElement("input");
                    selectorImagen.type = "file";
                    selectorImagen.accept = "image/*";
                    selectorImagen.hidden = true;
                    selectorImagen.setAttribute("aria-label", "Cambiar foto de " + (medicamento.nombre || "producto"));

                    imagen.title = "Haz clic para cambiar la foto";
                    imagen.style.cursor = "pointer";
                    imagen.addEventListener("click", function (evento) {
                        evento.stopPropagation();

                        // En modo Actualizar precios, la foto selecciona el medicamento.
                        // Fuera de ese modo, conserva la función de cambiar la imagen.
                        if (ventanaActualizarPrecios?.classList.contains("formulario-abierto")) {
                            productoPrecioSeleccionado = medicamento;
                            productoSeleccionadoPrecio.textContent = medicamento.nombre +
                                (medicamento.presentacion ? " · " + medicamento.presentacion : "");
                            campoPrecioPublicoEditar.value = Number(medicamento.precio_publico ?? 0).toFixed(2);
                            campoPrecioCodmarEditar.value = Number(medicamento.precio_codmar ?? 0).toFixed(2);
                            mensajeActualizarPrecios.textContent = "Medicamento seleccionado. Modifica los precios y guarda los cambios.";
                            return;
                        }

                        selectorImagen.click();
                    });

                    selectorImagen.addEventListener("change", async function () {
                        const nuevaImagen = selectorImagen.files[0];
                        if (!nuevaImagen || !nuevaImagen.type.startsWith("image/")) {
                            return;
                        }

                        const extension = (nuevaImagen.name.split(".").pop() || "jpg").toLowerCase();
                        const carpetaCategoria = (medicamento.categoria || "medicamentos")
                            .trim()
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "_")
                            .replace(/^_|_$/g, "");
                        const rutaImagenNueva = `productos/${clienteId}/${carpetaCategoria}/${Date.now()}_${crypto.randomUUID()}.${extension}`;

                        try {
                            const { error: errorCarga } = await clienteSupabase.storage
                                .from("imagenes")
                                .upload(rutaImagenNueva, nuevaImagen, {
                                    upsert: false,
                                    contentType: nuevaImagen.type
                                });

                            if (errorCarga) throw errorCarga;

                            const { data: urlImagen } = clienteSupabase.storage
                                .from("imagenes")
                                .getPublicUrl(rutaImagenNueva);

                            const { error: errorActualizar } = await clienteSupabase
                                .from("catalogo_codmar")
                                .update({ imagen_url: urlImagen.publicUrl, imagen_path: rutaImagenNueva })
                                .eq("id", medicamento.id)
                                .eq("cliente_id", clienteId);

                            if (errorActualizar) {
                                await clienteSupabase.storage.from("imagenes").remove([rutaImagenNueva]);
                                throw errorActualizar;
                            }

                            await cargarMedicamentosCatalogo();
                        } catch (error) {
                            alert("No se pudo cambiar la fotografía: " + error.message);
                        }
                    });

                    tarjeta.appendChild(selectorImagen);
                }
            }

            const nombre = document.createElement("h3");
            nombre.textContent = medicamento.nombre || "Sin nombre";
            tarjeta.appendChild(nombre);

            if (medicamento.presentacion) {
                const presentacion = document.createElement("p");
                presentacion.className = "presentacion-medicamento-codmar";
                presentacion.textContent = medicamento.presentacion;
                tarjeta.appendChild(presentacion);
            }

            const precioPublico = document.createElement("p");
            precioPublico.className = "precio-publico-medicamento";
            precioPublico.textContent = "Precio público: " +
                formatoPrecioActualizar.format(Number(medicamento.precio_publico));

            if (medicamento.tachar_precio_publico) {
                precioPublico.classList.add("precio-tachado");
            }
            tarjeta.appendChild(precioPublico);

            const precioCodmar = document.createElement("p");
            precioCodmar.className = "precio-codmar-medicamento";
            precioCodmar.textContent = "Precio: " +
                formatoPrecioActualizar.format(Number(medicamento.precio_codmar));
            tarjeta.appendChild(precioCodmar);

            {
                const botonEliminar = document.createElement("button");
                botonEliminar.textContent = "ELIMINAR";
                botonEliminar.className = "boton-eliminar-medicamento";
                botonEliminar.type = "button";
                botonEliminar.addEventListener("click", async function () {
                    await eliminarMedicamentoCatalogo(medicamento, tarjeta);
                });
                tarjeta.appendChild(botonEliminar);
            }

            lista.appendChild(tarjeta);
        });

        if (seccion._observadorCarga) {
            seccion._observadorCarga.disconnect();
            seccion._observadorCarga = null;
        }

        const botonAnterior = seccion.querySelector(".boton-cargar-mas-codmar");
        if (botonAnterior) {
            botonAnterior.remove();
        }

        if (medicamentos.length === tamanoPagina) {
            const botonCargarMas = document.createElement("button");
            botonCargarMas.type = "button";
            botonCargarMas.className = "boton-cargar-mas-codmar";
            botonCargarMas.textContent = "Cargar más productos";
            botonCargarMas.addEventListener("click", async function () {
                botonCargarMas.disabled = true;
                botonCargarMas.textContent = "Cargando…";
                await cargarMedicamentosCatalogo(offset + tamanoPagina, true);
            });
            seccion.appendChild(botonCargarMas);

            if ("IntersectionObserver" in window) {
                seccion._observadorCarga = new IntersectionObserver(
                    function (entradas) {
                        if (entradas.some(entrada => entrada.isIntersecting)) {
                            seccion._observadorCarga.unobserve(botonCargarMas);
                            botonCargarMas.click();
                        }
                    },
                    { root: contenedor, rootMargin: "250px" }
                );
                seccion._observadorCarga.observe(botonCargarMas);
            }
        }

    } catch (error) {
        console.error("Error al cargar productos del catálogo:", error);

        const aviso = document.createElement("p");
        aviso.className = "mensaje-catalogo-medicamentos";
        aviso.textContent = "No se pudieron cargar los productos.";

        if (agregar && seccion) {
            seccion.appendChild(aviso);
        } else {
            contenedor.innerHTML = "";
            contenedor.appendChild(aviso);
        }
    }
}


function normalizarClaveLote(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .replace(/\.(jpg|jpeg|png|webp|gif|bmp|avif|heic|heif)$/i, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function esArchivoImagenLote(archivo) {
    return !!archivo && (
        (archivo.type || "").startsWith("image/") ||
        /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(archivo.name || "")
    );
}

function clavesPosiblesFotoLote(nombreArchivo) {
    const sinExtension = String(nombreArchivo || "").replace(/\.[^.]+$/, "");
    const claves = [normalizarClaveLote(sinExtension)];
    const sinId = sinExtension.replace(/^\s*\d{1,8}[_\-\s]+/, "");
    const claveSinId = normalizarClaveLote(sinId);
    if (claveSinId && !claves.includes(claveSinId)) claves.push(claveSinId);
    return claves.filter(Boolean);
}

function abrirCargaMasivaProductos(categoriaFija = null) {
    if (!window.XLSX) {
        alert("No se pudo abrir el lector de Excel. Revisa que tengas internet y actualiza la página.");
        return;
    }
    const anterior = document.getElementById("ventana-carga-masiva-codmar");
    if (anterior) anterior.remove();
    const fondo = document.createElement("div");
    fondo.id = "ventana-carga-masiva-codmar";
    fondo.className = "fondo-carga-masiva-codmar";
    const panel = document.createElement("section");
    panel.className = "panel-carga-masiva-codmar";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const titulo = document.createElement("h2");
    titulo.textContent = "IMPORTAR PRODUCTOS POR CATEGORÍA";
    panel.appendChild(titulo);
    const cerrar = document.createElement("button");
    cerrar.type = "button";
    cerrar.className = "cerrar-carga-masiva-codmar";
    cerrar.textContent = "CERRAR";
    cerrar.addEventListener("click", () => fondo.remove());
    panel.appendChild(cerrar);
    function crearCampo(etiquetaTexto, tipo) {
        const etiqueta = document.createElement("label");
        etiqueta.className = "campo-carga-masiva-codmar";
        const texto = document.createElement("span");
        texto.textContent = etiquetaTexto;
        const entrada = document.createElement("input");
        entrada.type = "file";
        entrada.accept = tipo === "excel" ? ".xlsx,.xls" : "image/*";
        if (tipo === "carpeta") {
            entrada.multiple = true;
            entrada.setAttribute("webkitdirectory", "");
            entrada.setAttribute("directory", "");
        }
        etiqueta.append(texto, entrada);
        panel.appendChild(etiqueta);
        return entrada;
    }
    const archivoExcel = crearCampo("1. Archivo Excel (.xls o .xlsx)", "excel");
    const archivoFotos = crearCampo("2. Carpeta con las fotografías", "carpeta");
    const campoLote = document.createElement("label");
    campoLote.className = "campo-carga-masiva-codmar";
    const textoLote = document.createElement("span");
    textoLote.textContent = "Lote que deseas cargar (máximo 100 productos)";
    const selectorLote = document.createElement("select");
    const opcionLoteInicial = document.createElement("option");
    opcionLoteInicial.value = "";
    opcionLoteInicial.textContent = "Primero selecciona y lee el Excel";
    selectorLote.appendChild(opcionLoteInicial);
    selectorLote.disabled = true;
    campoLote.append(textoLote, selectorLote);
    panel.appendChild(campoLote);
    const campoCategoria = document.createElement("label");
    campoCategoria.className = "campo-carga-masiva-codmar";
    const textoCategoria = document.createElement("span");
    textoCategoria.textContent = "Categoría para los productos";
    const selectorCategoria = document.createElement("select");
    (Array.isArray(categorias) ? categorias : []).forEach(categoria => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectorCategoria.appendChild(opcion);
    });
    if (categoriaFija) {
        if (!Array.from(selectorCategoria.options).some(o => o.value === categoriaFija)) {
            const opcion = document.createElement("option");
            opcion.value = categoriaFija;
            opcion.textContent = categoriaFija;
            selectorCategoria.appendChild(opcion);
        }
        selectorCategoria.value = categoriaFija;
        selectorCategoria.disabled = true;
        campoCategoria.hidden = true;
    } else {
        if (!selectorCategoria.options.length) {
            const opcion = document.createElement("option");
            opcion.value = "medicamentos";
            opcion.textContent = "medicamentos";
            selectorCategoria.appendChild(opcion);
        }
        const categoriaMedicamentos = Array.from(selectorCategoria.options).find(o => /medicamento/i.test(o.value));
        if (categoriaMedicamentos) selectorCategoria.value = categoriaMedicamentos.value;
        campoCategoria.append(textoCategoria, selectorCategoria);
        panel.appendChild(campoCategoria);
    }
    const zonaColumnas = document.createElement("div");
    zonaColumnas.className = "columnas-carga-masiva-codmar";
    panel.appendChild(zonaColumnas);
    const estado = document.createElement("p");
    estado.className = "estado-carga-masiva-codmar";
    estado.setAttribute("aria-live", "polite");
    panel.appendChild(estado);
    const botonRevisar = document.createElement("button");
    botonRevisar.type = "button";
    botonRevisar.textContent = "LEER EXCEL";
    botonRevisar.className = "boton-accion-carga-masiva-codmar";
    panel.appendChild(botonRevisar);
    const botonSubir = document.createElement("button");
    botonSubir.type = "button";
    botonSubir.textContent = "SUBIR PRODUCTOS";
    botonSubir.className = "boton-accion-carga-masiva-codmar";
    botonSubir.disabled = true;
    panel.appendChild(botonSubir);
    fondo.appendChild(panel);
    document.body.appendChild(fondo);
    let filasPreparadas = [];
    let mapaImagenes = new Map();
    let revisionCompleta = false;
    function selectorColumna(nombre, opciones, sugerida, opcional) {
        const etiqueta = document.createElement("label");
        etiqueta.className = "campo-carga-masiva-codmar";
        const texto = document.createElement("span");
        texto.textContent = nombre;
        const select = document.createElement("select");
        if (!opcional && sugerida < 0) { const sinSeleccion = document.createElement("option"); sinSeleccion.value = ""; sinSeleccion.textContent = "Elige una columna"; select.appendChild(sinSeleccion); }
        if (opcional) {
            const o = document.createElement("option");
            o.value = "";
            o.textContent = opcional;
            select.appendChild(o);
        }
        opciones.forEach((opcion, indice) => {
            const o = document.createElement("option");
            o.value = String(indice);
            o.textContent = opcion;
            select.appendChild(o);
        });
        if (sugerida >= 0) select.value = String(sugerida);
        etiqueta.append(texto, select);
        zonaColumnas.appendChild(etiqueta);
        return select;
    }
    function normalizarEncabezado(valor) {
        return normalizarClaveLote(valor).replace(/ /g, "");
    }
    function numeroPrecio(valor) {
        if (typeof valor === "number") return valor;
        let texto = String(valor || "").trim().replace(/[$\s]/g, "");
        if (texto.includes(",") && !texto.includes(".")) texto = texto.replace(",", ".");
        else texto = texto.replace(/,/g, "");
        if (texto === "") return NaN;
        const numero = Number(texto);
        return Number.isFinite(numero) ? Math.round((numero + Number.EPSILON) * 100) / 100 : NaN;
    }
    function mostrarSelectorColumnas(matriz, indiceEncabezado) {
        zonaColumnas.innerHTML = "";
        const encabezado = indiceEncabezado >= 0 ? matriz[indiceEncabezado] : null;
        const muestra = matriz.slice(indiceEncabezado >= 0 ? indiceEncabezado + 1 : 0)
            .find(fila => Array.isArray(fila) && fila.some(celda => String(celda || "").trim()));
        const maxColumnas = Math.max((encabezado || []).length, (muestra || []).length);
        const opciones = Array.from({ length: maxColumnas }, (_, i) => {
            const etiqueta = encabezado && encabezado[i] ? String(encabezado[i]).trim() : "";
            const valor = muestra && muestra[i] !== undefined ? String(muestra[i]).trim() : "";
            return String.fromCharCode(65 + i) + (etiqueta ? " — " + etiqueta : "") + (valor ? " (ej. " + valor.slice(0, 30) + ")" : "");
        });
        const etiquetas = (encabezado || []).map(normalizarEncabezado);
        const encontrar = claves => etiquetas.findIndex(h => claves.includes(h));
        const colNombre = selectorColumna("Columna del nombre del producto", opciones, encontrar(["producto", "nombre", "medicamento", "descripcion", "articulo"]), null);
        const colPublico = selectorColumna("Columna del precio público", opciones, encontrar(["preciopublico", "publico", "preciomaximo", "maximo", "precio", "pventa", "preciolista"]), null);
        const colCodmar = selectorColumna("Columna del precio CODMAR", opciones, encontrar(["preciocodmar", "codmar", "preciocosto", "costo", "precioespecial", "preciodistribuidor", "preciooferta"]), null);
        const colPresentacion = selectorColumna("Presentación (si viene separada)", opciones, encontrar(["presentacion", "contenido"]), "Usar el nombre completo");
        const colCategoria = selectorColumna("Categoría (si viene en Excel)", opciones, encontrar(["categoria", "seccion", "familia"]), "Usar categoría seleccionada arriba");
        const colImagen = selectorColumna("Nombre de archivo de foto (si viene en Excel)", opciones, encontrar(["imagen", "foto", "archivoimagen", "nombreimagen"]), "Buscar foto por nombre del producto");
        return { colNombre, colPublico, colCodmar, colPresentacion, colCategoria, colImagen };
    }
    let mapaColumnas = null;
    let matrizExcel = null;
    let indiceEncabezadoActual = -1;
    async function prepararRevision() {
        revisionCompleta = false;
        botonSubir.disabled = true;
        estado.textContent = "";
        if (!archivoExcel.files.length || !archivoFotos.files.length) {
            estado.textContent = "Selecciona el Excel y la carpeta que contiene las imágenes.";
            return;
        }
        if (!matrizExcel) {
            const datos = new Uint8Array(await archivoExcel.files[0].arrayBuffer());
            const libro = window.XLSX.read(datos, { type: "array", cellDates: true });
            const nombreHoja = libro.SheetNames[0];
            matrizExcel = window.XLSX.utils.sheet_to_json(libro.Sheets[nombreHoja], { header: 1, defval: "", raw: false });
            if (!matrizExcel.length) throw new Error("El Excel no tiene filas de información.");
            indiceEncabezadoActual = -1;
            for (let i = 0; i < Math.min(20, matrizExcel.length); i++) {
                const valores = (matrizExcel[i] || []).map(normalizarEncabezado);
                if (valores.some(v => ["producto", "nombre", "medicamento", "descripcion"].includes(v)) &&
                    valores.some(v => ["preciocodmar", "codmar", "preciocosto", "costo", "preciopublico", "publico", "preciomaximo", "maximo", "precio"].includes(v))) {
                    indiceEncabezadoActual = i;
                    break;
                }
            }
            const filasDetectadas = matrizExcel.slice(indiceEncabezadoActual >= 0 ? indiceEncabezadoActual + 1 : 0)
                .filter(fila => Array.isArray(fila) && fila.some(celda => String(celda || "").trim()));
            const numeroLotesDetectados = Math.ceil(filasDetectadas.length / 100);
            selectorLote.innerHTML = "";
            for (let lote = 0; lote < numeroLotesDetectados; lote++) {
                const desde = lote * 100 + 1;
                const hasta = Math.min((lote + 1) * 100, filasDetectadas.length);
                const opcion = document.createElement("option");
                opcion.value = String(lote);
                opcion.textContent = "Lote " + (lote + 1) + ": productos " + desde + " al " + hasta;
                selectorLote.appendChild(opcion);
            }
            selectorLote.disabled = numeroLotesDetectados === 0;
            mapaColumnas = mostrarSelectorColumnas(matrizExcel, indiceEncabezadoActual);
            botonRevisar.textContent = "VALIDAR LOTE";
            zonaColumnas.addEventListener("change", function () { revisionCompleta = false; botonSubir.disabled = true; });
            estado.textContent = "Excel leído: " + filasDetectadas.length + " productos. Selecciona el lote, confirma las columnas y pulsa VALIDAR LOTE.";
            return;
        }
        const filasDatos = matrizExcel.slice(indiceEncabezadoActual >= 0 ? indiceEncabezadoActual + 1 : 0);
        const filasConDatos = filasDatos.map((fila, i) => ({ fila, indice: i })).filter(item => item.fila.some(c => String(c || "").trim()));
        if (!filasConDatos.length) throw new Error("No encontré productos en el Excel.");
        const numeroLotes = Math.ceil(filasConDatos.length / 100);
        const loteAnterior = Number(selectorLote.value || 0);
        selectorLote.innerHTML = "";
        for (let lote = 0; lote < numeroLotes; lote++) {
            const desde = lote * 100 + 1;
            const hasta = Math.min((lote + 1) * 100, filasConDatos.length);
            const opcion = document.createElement("option");
            opcion.value = String(lote);
            opcion.textContent = "Lote " + (lote + 1) + " — productos " + desde + " a " + hasta;
            selectorLote.appendChild(opcion);
        }
        selectorLote.value = String(Math.min(loteAnterior, Math.max(0, numeroLotes - 1)));
        if (mapaColumnas.colNombre.value === "" || mapaColumnas.colPublico.value === "" || mapaColumnas.colCodmar.value === "") throw new Error("Elige las columnas correctas para nombre, precio público y precio CODMAR.");
        mapaImagenes = new Map();
        Array.from(archivoFotos.files).filter(esArchivoImagenLote).forEach(f => {
            clavesPosiblesFotoLote(f.name).forEach(clave => {
                if (!mapaImagenes.has(clave)) mapaImagenes.set(clave, f);
            });
        });
        const inicioLote = Number(selectorLote.value || 0) * 100;
        const filasDelLote = filasConDatos.slice(inicioLote, inicioLote + 100);
        filasPreparadas = filasDelLote.map(({ fila, indice }) => {
            const obtener = select => select.value === "" ? "" : fila[Number(select.value)] ?? "";
            const nombre = String(obtener(mapaColumnas.colNombre)).trim();
            const precioPublico = numeroPrecio(obtener(mapaColumnas.colPublico));
            const precioCodmar = numeroPrecio(obtener(mapaColumnas.colCodmar));
            const presentacion = String(obtener(mapaColumnas.colPresentacion)).trim();
            const categoria = categoriaFija || String(obtener(mapaColumnas.colCategoria)).trim() || selectorCategoria.value;
            const archivoDeclarado = String(obtener(mapaColumnas.colImagen)).trim();
            const clavesFoto = archivoDeclarado ? [normalizarClaveLote(archivoDeclarado)] : [normalizarClaveLote(nombre), normalizarClaveLote(nombre + " " + presentacion)];
            const foto = clavesFoto.map(k => mapaImagenes.get(k)).find(Boolean) || null;
            const problemas = [];
            if (!nombre) problemas.push("falta nombre");
            if (!Number.isFinite(precioPublico) || precioPublico < 0) problemas.push("precio público inválido");
            if (!Number.isFinite(precioCodmar) || precioCodmar < 0) problemas.push("precio CODMAR inválido");
            if (Number.isFinite(precioPublico) && Number.isFinite(precioCodmar) && precioCodmar > precioPublico) problemas.push("CODMAR supera el público");
            if (!foto) problemas.push("falta foto con nombre coincidente");
            if (foto && foto.size > 8 * 1024 * 1024) problemas.push("foto mayor a 8 MB");
            return { nombre, presentacion, categoria, precioPublico, precioCodmar, foto, problemas, numero: indice + 1 };
        });
        const vistosEnLote = new Set();
        filasPreparadas.forEach(f => {
            const clave = normalizarClaveLote(f.nombre);
            if (clave && vistosEnLote.has(clave)) f.problemas.push("producto repetido dentro del Excel");
            if (clave) vistosEnLote.add(clave);
        });
        const invalidas = filasPreparadas.filter(f => f.problemas.length);
        const resumen = invalidas.map(f => "Fila " + f.numero + ": " + (f.nombre || "sin nombre") + " — " + f.problemas.join(", ")).join("\n");
        estado.textContent = "Encontré " + filasPreparadas.length + " productos en este lote. " + (invalidas.length ? invalidas.length + " necesitan corrección antes de subir.\n" + resumen : "Los nombres, precios e imágenes coinciden. Ya puedes subir el lote.");
        revisionCompleta = invalidas.length === 0;
        botonSubir.disabled = !revisionCompleta;
    }
    archivoExcel.addEventListener("change", () => {
        matrizExcel = null;
        mapaColumnas = null;
        zonaColumnas.innerHTML = "";
        selectorLote.innerHTML = "";
        const opcion = document.createElement("option");
        opcion.value = "";
        opcion.textContent = "Primero lee el Excel";
        selectorLote.appendChild(opcion);
        selectorLote.disabled = true;
        filasPreparadas = [];
        revisionCompleta = false;
        botonSubir.disabled = true;
        botonRevisar.textContent = "LEER EXCEL";
        estado.textContent = archivoExcel.files[0] ? "Archivo seleccionado: " + archivoExcel.files[0].name : "";
    });
    archivoFotos.addEventListener("change", () => {
        revisionCompleta = false;
        botonSubir.disabled = true;
        const cantidad = Array.from(archivoFotos.files || []).filter(esArchivoImagenLote).length;
        estado.textContent = cantidad
            ? "Fotografías seleccionadas: " + cantidad + ". Ahora valida el lote."
            : "No se encontraron fotografías en la selección.";
    });
    selectorCategoria.addEventListener("change", () => { revisionCompleta = false; botonSubir.disabled = true; });
    selectorLote.addEventListener("change", () => { revisionCompleta = false; botonSubir.disabled = true; });
    botonRevisar.addEventListener("click", async function () {
        botonRevisar.disabled = true;
        try { await prepararRevision(); }
        catch (error) { estado.textContent = error.message || "No pude revisar esos archivos."; }
        finally { botonRevisar.disabled = false; }
    });
    botonSubir.addEventListener("click", async function () {
        if (!revisionCompleta || !filasPreparadas.length) return;
        botonSubir.disabled = true;
        botonRevisar.disabled = true;
        archivoExcel.disabled = true;
        archivoFotos.disabled = true;
        selectorCategoria.disabled = true;
        let cargados = 0;
        let fotoActual = null;
        let loteTerminado = false;
        try {
            estado.textContent = "Revisando que no se repitan productos…";
            const existentes = new Set();
            for (let inicio = 0; ; inicio += 1000) {
                const respuesta = await clienteSupabase.from("catalogo_codmar").select("id,nombre,presentacion").eq("cliente_id", clienteId).order("id", { ascending: true }).range(inicio, inicio + 999);
                if (respuesta.error) throw respuesta.error;
                (respuesta.data || []).forEach(p => existentes.add(normalizarClaveLote(p.nombre)));
                if (!respuesta.data || respuesta.data.length < 1000) break;
            }
            const repetidos = filasPreparadas.filter(f => existentes.has(normalizarClaveLote(f.nombre)));
            filasPreparadas = filasPreparadas.filter(f => !existentes.has(normalizarClaveLote(f.nombre)));
            if (!filasPreparadas.length) throw new Error("Los productos de este lote ya estaban en el catálogo; no se repitieron.");
            if (repetidos.length) estado.textContent = "Omitiré " + repetidos.length + " producto(s) que ya existen y subiré los " + filasPreparadas.length + " nuevos.";
            for (let i = 0; i < filasPreparadas.length; i++) {
                const fila = filasPreparadas[i];
                estado.textContent = "Subiendo " + (i + 1) + " de " + filasPreparadas.length + ": " + fila.nombre;
                const extension = (fila.foto.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
                const nombreArchivo = normalizarClaveLote(fila.nombre).replace(/\s+/g, "_").slice(0, 80) || "producto";
                const rutaImagen = "productos/" + clienteId + "/" + normalizarClaveLote(fila.categoria).replace(/\s+/g, "_") + "/lote_" + Date.now() + "_" + i + "_" + nombreArchivo + "." + extension;
                const tipoImagen = fila.foto.type || ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", bmp: "image/bmp", avif: "image/avif", heic: "image/heic", heif: "image/heif" }[extension] || "application/octet-stream");
                const subida = await clienteSupabase.storage.from("imagenes").upload(rutaImagen, fila.foto, { upsert: false, contentType: tipoImagen });
                if (subida.error) throw subida.error;
                fotoActual = rutaImagen;
                const url = clienteSupabase.storage.from("imagenes").getPublicUrl(rutaImagen).data.publicUrl;
                const insercion = await clienteSupabase.from("catalogo_codmar").insert({ cliente_id: clienteId, nombre: fila.nombre, presentacion: fila.presentacion || null, categoria: fila.categoria, precio_publico: fila.precioPublico, precio_codmar: fila.precioCodmar, imagen_url: url, imagen_path: rutaImagen, activo: true });
                if (insercion.error) {
                    await clienteSupabase.storage.from("imagenes").remove([rutaImagen]);
                    fotoActual = null;
                    throw insercion.error;
                }
                existentes.add(normalizarClaveLote(fila.nombre));
                fotoActual = null;
                cargados++;
            }
            estado.textContent = "Listo: se cargaron " + cargados + " productos nuevos con sus imágenes. Los que ya existían se omitieron.";
            loteTerminado = true;
            await cargarMedicamentosCatalogo();
        } catch (error) {
            if (fotoActual) await clienteSupabase.storage.from("imagenes").remove([fotoActual]);
            estado.textContent = (error.message || "Ocurrió un problema durante la carga.") + (cargados ? " Se alcanzaron a guardar " + cargados + " productos; quita esas filas para continuar con el resto." : "");
        } finally {
            archivoExcel.disabled = false;
            archivoFotos.disabled = false;
            selectorCategoria.disabled = false;
            botonRevisar.disabled = false;
            botonSubir.disabled = loteTerminado;
        }
    });
}

/* ACTUALIZAR CONTADOR DE PIEZAS DEL CARRITO */

async function eliminarMedicamentoCatalogo(medicamento, tarjeta) {

    const confirmar = window.confirm(
        "¿Deseas eliminar definitivamente " +
        medicamento.nombre +
        "?\n\nSe borrará del catálogo y no podrá recuperarse."
    );

    if (!confirmar) {
        return;
    }

    try {

        const { data, error } = await clienteSupabase
            .from("catalogo_codmar")
            .delete()
            .eq("id", medicamento.id)
            .eq("cliente_id", clienteId)
            .select("id");

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error(
                "No se pudo eliminar el medicamento."
            );
        }

        let imagenEliminada = true;

        if (medicamento.imagen_path) {

            const { error: errorImagen } =
                await clienteSupabase
                    .storage
                    .from("imagenes")
                    .remove([medicamento.imagen_path]);

            if (errorImagen) {

                imagenEliminada = false;

                console.error(
                    "Error al eliminar la imagen:",
                    errorImagen
                );
            }
        }

        tarjeta.remove();

        if (imagenEliminada) {

            alert(
                "Medicamento eliminado correctamente."
            );

        } else {

            alert(
                "El medicamento fue eliminado, pero no se pudo borrar su fotografía."
            );
        }

    } catch (error) {

        console.error(
            "Error al eliminar medicamento:",
            error
        );

        alert(
            "No se pudo eliminar el medicamento. Revisa la consola."
        );
    }
}

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

    const campoTelefonoPedidos = document.getElementById("telefono-pedidos");
    const botonGuardarTelefonoPedidos = document.getElementById("guardar-whatsapp-pedidos");

    if (campoTelefonoPedidos) {
        campoTelefonoPedidos.value = configuracionGuardada?.telefono_pedidos || "";
    }

    if (botonGuardarTelefonoPedidos && campoTelefonoPedidos) {
        botonGuardarTelefonoPedidos.addEventListener("click", async function () {
            const telefono = campoTelefonoPedidos.value.replace(/\D/g, "");
            if (telefono.length < 10 || telefono.length > 15) {
                alert("Escribe un número de WhatsApp válido con código de país.");
                campoTelefonoPedidos.focus();
                return;
            }

            botonGuardarTelefonoPedidos.disabled = true;
            const { error: errorTelefono } = await clienteSupabase
                .from("configuracion_inicio")
                .update({ telefono_pedidos: telefono })
                .eq("cliente_id", clienteId);

            if (errorTelefono) {
                console.error("No se pudo guardar el WhatsApp de pedidos:", errorTelefono);
                alert("No se pudo guardar el número de WhatsApp.");
            } else {
                if (configuracionGuardada) configuracionGuardada.telefono_pedidos = telefono;
                alert("WhatsApp de pedidos guardado correctamente.");
            }
            botonGuardarTelefonoPedidos.disabled = false;
        });
    }


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

        // Leer el dispositivo al momento de aplicar el color, no usar un valor anterior.
        const esMovilColorFranjas =
            window.matchMedia("(max-width: 768px)").matches;

        // Cada pantalla usa exclusivamente su propio color guardado.
        // La columna general antigua puede contener el azul marino anterior.
        const colorFranjasActual = esMovilColorFranjas
            ? (configuracionGuardada.color_franjas_movil || "#ffffff")
            : (configuracionGuardada.color_franjas_escritorio || "#ffffff");

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

        aplicarColorFranjasEnEncabezados(colorFranjasActual);

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

        if (colorNombreComercial) {
            const colorGuardado = configuracionGuardada.color_nombre_comercial || "#000000";
            colorNombreComercial.value = colorGuardado;
            actualizarVariableCSS("--color-nombre-comercial", colorGuardado);
        }


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
/*             OPCIÓN CATEGORÍAS                     */
/* ================================================= */

const botonCategorias =
    document.getElementById("boton-categorias");

const formularioCategorias =
    document.getElementById("formulario-categorias");

const cerrarCategorias =
    document.getElementById("cerrar-categorias");

const nombreCategoria =
    document.getElementById("nombre-categoria");

const aceptarCategoria =
    document.getElementById("aceptar-categoria");

const nombreCategoriaBorrar =
    document.getElementById("nombre-categoria-borrar");

const borrarCategoria =
    document.getElementById("borrar-categoria");

const mensajeCategorias =
    document.getElementById("mensaje-categorias");

const tituloAccionCategoria =
    document.getElementById("titulo-accion-categoria");

const listaCategoriasGestion =
    document.getElementById("lista-categorias-gestion");

const botonConfiguracion =
    document.getElementById("boton-configuracion");

const listaCategorias =
    document.getElementById("panel-menu");

let categorias = [];


/* ============================================= */
/* CARGAR CATEGORÍAS GUARDADAS                    */
/* ============================================= */

try {
    const categoriasGuardadas =
        localStorage.getItem("codmar_categorias");

    categorias = categoriasGuardadas
        ? JSON.parse(categoriasGuardadas)
        : [];

    if (!Array.isArray(categorias)) {
        categorias = [];
    }

    categorias = categorias.filter(function (categoria) {
        return typeof categoria === "string";
    });

} catch (error) {
    categorias = [];
}


/* ============================================= */
/* GUARDAR CATEGORÍAS EN SUPABASE                 */
/* ============================================= */

async function guardarCategorias() {

    try {

        const { error } = await clienteSupabase
            .from("configuracion_inicio")
            .update({
                categorias: categorias
            })
            .eq("cliente_id", clienteId);

        if (error) {
            throw error;
        }

        if (configuracionGuardada) {
            configuracionGuardada.categorias = [...categorias];
        }

        return true;

    } catch (error) {

        console.error(
            "Error al guardar categorías en Supabase:",
            error
        );

        mensajeCategorias.textContent =
            "No se pudieron guardar las categorías.";

        return false;
    }
}


/* ============================================= */
/* MOSTRAR CATEGORÍAS EN EL MENÚ                  */
/* ============================================= */

function mostrarCategorias() {

    if (!listaCategorias || !botonConfiguracion) {
        return;
    }

    listaCategorias
        .querySelectorAll(".opcion-categoria")
        .forEach(function (elemento) {
            elemento.remove();
        });

    categorias.forEach(function (categoria) {

        const opcion = document.createElement("div");

        opcion.className =
            "opcion-menu opcion-categoria";

        opcion.textContent = categoria;

        /* ABRIR REGISTRO DINÁMICO DE PRODUCTOS */

        opcion.addEventListener("click", function () {

            const categoriaActual = categoria.trim();

            if (!categoriaActual) {
                return;
            }

            panelMenu.classList.remove("menu-abierto");

            const ventanaAnterior =
                document.getElementById("ventana-captura-medicamento");

            if (ventanaAnterior) {
                ventanaAnterior.remove();
            }

            const ventana = document.createElement("div");
            ventana.id = "ventana-captura-medicamento";
            ventana.className = "formulario-inicio formulario-abierto";

            const titulo = document.createElement("h2");
            titulo.textContent =
                "REGISTRAR: " + categoriaActual.toLocaleUpperCase();

            const nombre = document.createElement("input");
            nombre.type = "text";
           nombre.placeholder = "Nombre del medicamento";
            nombre.autocomplete = "off";
            nombre.maxLength = 150;

           
const archivo = document.createElement("input");
archivo.type = "file";
archivo.accept = "image/*";
archivo.capture = "environment";
archivo.className = "input-fotografia-oculto";
archivo.style.display = "none";

// FILA DEL SELECTOR Y LA VISTA PREVIA

const filaFotografia = document.createElement("div");

filaFotografia.className = "fila-fotografia-producto";

// BOTÓN PARA SELECCIONAR FOTOGRAFÍA

const botonSeleccionarFoto = document.createElement("button");
botonSeleccionarFoto.type = "button";
botonSeleccionarFoto.textContent = "SELECCIONAR ARCHIVO";

botonSeleccionarFoto.className =
    "boton-seleccionar-fotografia";

botonSeleccionarFoto.addEventListener("click", function () {
    archivo.click();
});

// RECUADRO PEQUEÑO PARA LA FOTOGRAFÍA

const contenedorVistaPrevia =
    document.createElement("div");

contenedorVistaPrevia.className =
    "contenedor-vista-previa-producto";

// IMAGEN DE VISTA PREVIA

// IMAGEN DE VISTA PREVIA

const vistaPrevia = document.createElement("img");

vistaPrevia.className = "vista-previa-producto";

contenedorVistaPrevia.appendChild(vistaPrevia);

// AGREGAR LOS ELEMENTOS A LA FILA

filaFotografia.appendChild(archivo);
filaFotografia.appendChild(botonSeleccionarFoto);
filaFotografia.appendChild(contenedorVistaPrevia);


  // =============================================
// MENSAJE Y BOTONES
// =============================================

const mensaje = document.createElement("p");
mensaje.setAttribute("aria-live", "polite");

const guardar = document.createElement("button");
guardar.type = "button";
guardar.textContent = "GUARDAR";
guardar.className = "boton-guardar-captura";

const cancelar = document.createElement("button");
cancelar.type = "button";
cancelar.textContent = "CANCELAR";
cancelar.className = "boton-cancelar-captura";

const botones = document.createElement("div");
botones.className = "contenedor-botones-captura";

botones.appendChild(guardar);
botones.appendChild(cancelar);


           // =============================================
// AGREGAR ELEMENTOS A LA VENTANA
// =============================================

ventana.appendChild(titulo);

// El importador se abre desde la categoría actual y queda limitado a ella.
const bloqueImportarCategoria = document.createElement("div");
bloqueImportarCategoria.className = "bloque-importar-productos-categoria";

const etiquetaImportarCategoria = document.createElement("span");
etiquetaImportarCategoria.className = "etiqueta-importar-productos-categoria";
etiquetaImportarCategoria.textContent = "CARGA MASIVA";

const botonImportarCategoria = document.createElement("button");
botonImportarCategoria.type = "button";
botonImportarCategoria.textContent = "IMPORTAR PRODUCTOS";
botonImportarCategoria.className = "boton-accion-carga-masiva-codmar boton-importar-productos-categoria";
botonImportarCategoria.addEventListener("click", function () {
    abrirCargaMasivaProductos(categoriaActual);
});

bloqueImportarCategoria.appendChild(etiquetaImportarCategoria);
bloqueImportarCategoria.appendChild(botonImportarCategoria);
ventana.appendChild(bloqueImportarCategoria);

ventana.appendChild(nombre);
ventana.appendChild(filaFotografia);
ventana.appendChild(mensaje);
ventana.appendChild(botones);

document.body.appendChild(ventana);

hacerVentanaMovible(ventana, titulo);
            // =============================================
            // VISTA PREVIA DE LA FOTOGRAFÍA
            // =============================================

            let urlPrevia = null;

            archivo.addEventListener("change", function () {

                const imagen = archivo.files[0];

                if (urlPrevia) {
                    URL.revokeObjectURL(urlPrevia);
                    urlPrevia = null;
                }

                vistaPrevia.removeAttribute("src");
                vistaPrevia.style.display = "none";

                if (!imagen) {
                    return;
                }

                if (!imagen.type.startsWith("image/")) {
                    archivo.value = "";
                    mensaje.textContent =
                        "Selecciona un archivo de imagen válido.";
                    return;
                }

                urlPrevia = URL.createObjectURL(imagen);
                vistaPrevia.src = urlPrevia;
                vistaPrevia.style.display = "block";
                mensaje.textContent = "";
            });

            // =============================================
            // GUARDAR PRODUCTO
            // =============================================

            guardar.addEventListener("click", async function () {

                const nombreMedicamento = nombre.value.trim();

                if (!nombreMedicamento) {
                    mensaje.textContent =
                        "Escribe el nombre del medicamento.";
                    nombre.focus();
                    return;
                }

                if (!archivo.files.length) {
                    mensaje.textContent =
                        "Selecciona o toma una fotografía.";
                    return;
                }

                const imagenMedicamento = archivo.files[0];




    /* CERRAR PRIMERA VENTANA */

    ventana.remove();

    /* CREAR SEGUNDA VENTANA */

    const ventanaPrecios = document.createElement("div");

    ventanaPrecios.id = "ventana-precios-medicamento";
    ventanaPrecios.className =
        "formulario-inicio formulario-abierto";

    const tituloPrecios = document.createElement("h2");
    tituloPrecios.textContent = "DATOS DEL MEDICAMENTO";

    const nombreMostrado = document.createElement("p");
    nombreMostrado.textContent =
        "Medicamento: " + nombreMedicamento;

    const precioPublico = document.createElement("input");
    precioPublico.type = "number";
    precioPublico.min = "0";
    precioPublico.step = "0.01";
    precioPublico.placeholder = "Precio público";

    const precioCodmar = document.createElement("input");
    precioCodmar.type = "number";
    precioCodmar.min = "0";
    precioCodmar.step = "0.01";
    precioCodmar.placeholder = "Precio CODMAR";

    const opcionTacharPrecio = document.createElement("label");

opcionTacharPrecio.className = "opcion-tachar-precio";

const tacharPrecioPublico = document.createElement("input");

tacharPrecioPublico.type = "checkbox";
tacharPrecioPublico.checked = false;

opcionTacharPrecio.appendChild(tacharPrecioPublico);

opcionTacharPrecio.appendChild(
    document.createTextNode(" Tachar precio público")
);

    const mensajePrecios = document.createElement("p");
    mensajePrecios.setAttribute("aria-live", "polite");

    const botonGuardarProducto =
        document.createElement("button");

    botonGuardarProducto.type = "button";
    botonGuardarProducto.textContent = "GUARDAR PRODUCTO";

    const botonRegresar = document.createElement("button");

    botonRegresar.type = "button";
    botonRegresar.textContent = "REGRESAR";

    const botonesPrecios = document.createElement("div");

    botonesPrecios.style.display = "flex";
    botonesPrecios.style.justifyContent = "center";
    botonesPrecios.style.flexWrap = "wrap";
    botonesPrecios.style.gap = "10px";
    botonesPrecios.style.marginTop = "15px";

    botonesPrecios.appendChild(botonGuardarProducto);
    botonesPrecios.appendChild(botonRegresar);

    ventanaPrecios.appendChild(tituloPrecios);
ventanaPrecios.appendChild(nombreMostrado);
ventanaPrecios.appendChild(precioPublico);
ventanaPrecios.appendChild(precioCodmar);

// OPCIÓN PARA TACHAR EL PRECIO PÚBLICO

ventanaPrecios.appendChild(opcionTacharPrecio);

ventanaPrecios.appendChild(mensajePrecios);
ventanaPrecios.appendChild(botonesPrecios);

    document.body.appendChild(ventanaPrecios);

   
    hacerVentanaMovible(ventanaPrecios, tituloPrecios);

    /* REGRESAR A LA CAPTURA */

    botonRegresar.addEventListener("click", function () {

        ventanaPrecios.remove();
        document.body.appendChild(ventana);

    });

/* GUARDAR MEDICAMENTO EN SUPABASE */

botonGuardarProducto.addEventListener(
    "click",
    async function () {

        const publico = precioPublico.value.trim();
        const codmar = precioCodmar.value.trim();

        // VALIDAR PRECIOS

        if (
            publico === "" ||
            codmar === "" ||
            !Number.isFinite(Number(publico)) ||
            !Number.isFinite(Number(codmar)) ||
            Number(publico) < 0 ||
            Number(codmar) < 0
        ) {
            mensajePrecios.textContent =
                "Escribe ambos precios correctamente.";
            return;
        }

        if (Number(codmar) > Number(publico)) {
            mensajePrecios.textContent =
                "El precio CODMAR no puede ser mayor al precio público.";
            return;
        }

        if (!imagenMedicamento) {
            mensajePrecios.textContent =
                "No se encontró la fotografía del medicamento.";
            return;
        }

        botonGuardarProducto.disabled = true;

        mensajePrecios.textContent =
            "Guardando medicamento...";

        let rutaImagen = null;

        try {

            // PREPARAR NOMBRE DE LA IMAGEN

            const extension =
                imagenMedicamento.name.split(".").pop().toLowerCase();

            const nombreArchivo =
                `${Date.now()}_${crypto.randomUUID()}.${extension}`;

            // RUTA EN STORAGE SEGÚN LA CATEGORÍA

const carpetaCategoria = categoriaActual
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

rutaImagen =
    `productos/${clienteId}/${carpetaCategoria}/${nombreArchivo}`;
              


            // SUBIR FOTOGRAFÍA

            const { error: errorImagen } =
                    await clienteSupabase.storage
                    .from("imagenes")
                    .upload(
                        rutaImagen,
                        imagenMedicamento,
                        {
                            upsert: false,
                            contentType: imagenMedicamento.type
                        }
                    );

            if (errorImagen) {
                throw errorImagen;
            }

            // OBTENER URL PÚBLICA

            const { data: urlImagen } =
                 
               clienteSupabase.storage
              .from("imagenes")
              .getPublicUrl(rutaImagen);   
                   
            // PREPARAR REGISTRO

           
            const nuevoProducto = {

    cliente_id: clienteId,

    nombre: nombreMedicamento,

    categoria: categoriaActual,

    precio_publico: Number(publico),

    precio_codmar: Number(codmar),
tachar_precio_publico: tacharPrecioPublico.checked,

    imagen_url: urlImagen.publicUrl,

    imagen_path: rutaImagen,

    activo: true

};


            // GUARDAR EN LA TABLA CORRECTA

            const { data, error } = await clienteSupabase
                .from("catalogo_codmar")
                .insert(nuevoProducto)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log(
                "Medicamento guardado correctamente:",
                data
            );

            mensajePrecios.textContent =
                "¡Medicamento guardado correctamente!";

             // ACTUALIZAR EL CATÁLOGO SIN RECARGAR LA PÁGINA
            await cargarMedicamentosCatalogo();


            // CERRAR VENTANA DESPUÉS DE GUARDAR

            setTimeout(function () {

                if (urlPrevia) {
                    URL.revokeObjectURL(urlPrevia);
                }

                ventana.remove();

            }, 1200);

        } catch (error) {

            console.error(
                "Error al guardar medicamento:",
                error
            );

            // ELIMINAR IMAGEN SI FALLÓ EL REGISTRO

            if (rutaImagen) {

                     await clienteSupabase.storage
                    .from("imagenes")
                    .remove([rutaImagen]);

            }

            mensajePrecios.textContent =
                "No se pudo guardar: " + error.message;

        } finally {

            botonGuardarProducto.disabled = false;

        }

    }
);
    precioPublico.focus();

});


            cancelar.addEventListener("click", function () {

                if (urlPrevia) {
                    URL.revokeObjectURL(urlPrevia);
                }

                ventana.remove();
            });

            nombre.focus();
        });

        listaCategorias.insertBefore(
            opcion,
            botonConfiguracion
        );

        // Las categorías dinámicas se mantienen juntas, antes de
        // Configuración. Tienda pública permanece antes de Salir.
    });
}


/* ============================================= */
/* PREPARAR EL FORMULARIO DE CATEGORÍAS           */
/* ============================================= */

function prepararNuevaCategoria() {

    nombreCategoria.value = "";

    tituloAccionCategoria.textContent =
        "Escribe el nombre de la nueva categoría:";

    aceptarCategoria.textContent = "ACEPTAR";

    mensajeCategorias.textContent = "";
    if (nombreCategoriaBorrar) nombreCategoriaBorrar.value = "";
}

/* ============================================= */
/* CONTENEDOR DE ADMINISTRACIÓN DE CATEGORÍAS     */
/* ============================================= */

function mostrarCategoriasParaAdministrar() {
    listaCategoriasGestion.innerHTML = "";
}


/* ============================================= */
/* EVENTOS DE CONFIGURACIÓN DE CATEGORÍAS         */
/* ============================================= */

if (
    botonCategorias &&
    formularioCategorias &&
    nombreCategoria &&
    aceptarCategoria &&
    nombreCategoriaBorrar &&
    borrarCategoria &&
    cerrarCategorias &&
    mensajeCategorias &&
    tituloAccionCategoria &&
    listaCategoriasGestion
) {

    /* ABRIR VENTANA */

    botonCategorias.addEventListener(
        "click",
        function () {

            panelMenu.classList.remove("menu-abierto");

            prepararNuevaCategoria();

            mostrarCategoriasParaAdministrar();

            setTimeout(function () {

                formularioCategorias.classList.add(
                    "formulario-abierto"
                );

                nombreCategoria.focus();

            }, 250);
        }
    );


    /* ACEPTAR O GUARDAR CATEGORÍA */

       aceptarCategoria.addEventListener(
        "click",
         async function () {
            const nombre =
                nombreCategoria.value.trim();

            if (!nombre) {

                mensajeCategorias.textContent =
                    "Escribe el nombre de la categoría.";

                nombreCategoria.focus();
                return;
            }

            const repetida = categorias.some(
                function (categoria) {
                    return categoria.toLocaleLowerCase() ===
                        nombre.toLocaleLowerCase();
                }
            );

            if (repetida) {

                mensajeCategorias.textContent =
                    "Ya existe una categoría con ese nombre.";

                nombreCategoria.focus();
                return;
            }

            const categoriasAnteriores = [...categorias];

            categorias.push(nombre);
     

             if (!(await guardarCategorias())) {
              
            

                categorias = categoriasAnteriores;
                return;
            }

            mostrarCategorias();

            mostrarCategoriasParaAdministrar();

            prepararNuevaCategoria();

            mensajeCategorias.textContent =
                "Categoría guardada correctamente.";
        }
    );



/* BORRAR CATEGORÍA DESDE LA MISMA VENTANA */

borrarCategoria.addEventListener("click", async function () {
    const nombre = nombreCategoriaBorrar.value.trim();

    if (!nombre) {
        mensajeCategorias.textContent =
            "Escribe el nombre de la categoría que deseas borrar.";
        nombreCategoriaBorrar.focus();
        return;
    }

    const normalizar = valor => valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLocaleLowerCase();

    const indice = categorias.findIndex(
        categoria => normalizar(categoria) === normalizar(nombre)
    );

    if (indice === -1) {
        mensajeCategorias.textContent =
            "No se encontró esa categoría en la lista guardada.";
        nombreCategoriaBorrar.focus();
        return;
    }

    const confirmar = window.confirm(
        '¿Deseas borrar la categoría "' + categorias[indice] +
        '" del menú? Los productos y sus fotografías se conservarán.'
    );

    if (!confirmar) return;

    const categoriasAnteriores = [...categorias];
    categorias.splice(indice, 1);

    if (!(await guardarCategorias())) {
        categorias = categoriasAnteriores;
        return;
    }

    mostrarCategorias();
    mostrarCategoriasParaAdministrar();
    nombreCategoriaBorrar.value = "";
    mensajeCategorias.textContent =
        "Categoría borrada del menú. Los productos y las fotografías se conservaron.";
});

    /* CERRAR VENTANA */

    cerrarCategorias.addEventListener(
        "click",
        function () {

            formularioCategorias.classList.remove(
                "formulario-abierto"
            );

            prepararNuevaCategoria();
        }
    );


    /* GUARDAR CON ENTER */

    nombreCategoria.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key === "Enter") {

                evento.preventDefault();

                aceptarCategoria.click();
            }
        }
    );
}


/* ============================================= */
/* CARGAR CATEGORÍAS AL INICIAR                   */
/* ============================================= */

if (configuracionGuardada) {

    categorias = Array.isArray(configuracionGuardada.categorias)
        ? configuracionGuardada.categorias.filter(
            categoria => typeof categoria === "string"
        )
        : [];

} else {

    categorias = [];
}

console.log(
    "CATEGORÍAS RECUPERADAS DEL CLIENTE:",
    clienteId,
    categorias
);

mostrarCategorias();

// MOSTRAR LOS MEDICAMENTOS DEL NEGOCIO AL ABRIR EL CATÁLOGO
cargarMedicamentosCatalogo();


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

    // Guarda también el tamaño para que la Tienda lo reciba sin pulsar ACEPTAR.
    window.clearTimeout(temporizadorGuardarPosicionBuscador);
    temporizadorGuardarPosicionBuscador = window.setTimeout(
        guardarPosicionBuscadorAutomatica,
        450
    );
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

let temporizadorGuardarPosicionBuscador = null;

async function guardarPosicionBuscadorAutomatica() {
    try {
        const esMovilActual = window.matchMedia("(max-width: 768px)").matches;
        const datosPosicion = esMovilActual
            ? {
                ajuste_buscador_x_movil: ajusteBuscadorX,
                ajuste_buscador_y_movil: ajusteBuscadorY,
                ancho_buscador_movil: anchoBuscadorSeleccionado,
                alto_buscador_movil: altoBuscadorSeleccionado
            }
            : {
                ajuste_buscador_x_escritorio: ajusteBuscadorX,
                ajuste_buscador_y_escritorio: ajusteBuscadorY,
                ancho_buscador_escritorio: anchoBuscadorSeleccionado,
                alto_buscador_escritorio: altoBuscadorSeleccionado
            };

        const { data, error } = await clienteSupabase
            .from("configuracion_inicio")
            .update(datosPosicion)
            .eq("cliente_id", clienteId)
            .select("cliente_id");

        if (error || !data || data.length === 0) {
            console.error(
                "No se pudo guardar automáticamente la posición del buscador:",
                error || "No se encontró la configuración del negocio."
            );
            return;
        }

        if (configuracionGuardada) {
            Object.assign(configuracionGuardada, datosPosicion);
        }
    } catch (error) {
        console.error("Error inesperado al guardar la posición del buscador:", error);
    }
}

function moverBuscador(direccionX, direccionY) {

    const paso = 4;

    ajusteBuscadorX += direccionX * paso;
    ajusteBuscadorY += direccionY * paso;

    aplicarAjusteBuscador();

    // Guarda la última posición al terminar de usar las flechas.
    // El pequeño retraso evita enviar una consulta por cada repetición del botón.
    window.clearTimeout(temporizadorGuardarPosicionBuscador);
    temporizadorGuardarPosicionBuscador = window.setTimeout(
        guardarPosicionBuscadorAutomatica,
        450
    );
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


function obtenerRutaLogotipoPropio(url) {
    if (!url) return null;
    const marcador = "/storage/v1/object/public/imagenes/";
    const posicion = url.indexOf(marcador);
    if (posicion === -1) return null;
    let ruta = url.slice(posicion + marcador.length).split("?")[0];
    try { ruta = decodeURIComponent(ruta); } catch (_) {}
    return ruta.startsWith(`negocios/${clienteId}/logotipo/`) ? ruta : null;
}

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

        const urlLogotipoAnterior = logotipoUrl;
        let rutaLogotipoNueva = null;

        /* SUBIR IMAGEN SI SE SELECCIONÓ UN ARCHIVO */

        if (archivo) {

    const nombreArchivo =
        `logotipo_${Date.now()}_${archivo.name}`;

    const rutaLogotipo =
        `negocios/${clienteId}/logotipo/${nombreArchivo}`;

    rutaLogotipoNueva = rutaLogotipo;

    const { error: errorSubida } = await clienteSupabase
        .storage
        .from("imagenes")
        .upload(
            rutaLogotipo,
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
            rutaLogotipo
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

            if (rutaLogotipoNueva) {
                await clienteSupabase.storage.from("imagenes").remove([rutaLogotipoNueva]);
            }
            return;
        }

        const rutaLogotipoAnterior = obtenerRutaLogotipoPropio(urlLogotipoAnterior);
        if (rutaLogotipoNueva && rutaLogotipoAnterior && rutaLogotipoAnterior !== rutaLogotipoNueva) {
            const { error: errorEliminar } = await clienteSupabase.storage
                .from("imagenes")
                .remove([rutaLogotipoAnterior]);
            if (errorEliminar) {
                console.error("El nuevo logotipo quedó guardado, pero no se pudo borrar el anterior:", errorEliminar);
            }
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

        window.clearTimeout(temporizadorGuardarPosicionBuscador);

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

        const { data: filasActualizadas, error: errorBuscador } =
            await clienteSupabase
                .from("configuracion_inicio")
                .update(datosBuscador)
                .eq("cliente_id", clienteId)
                .select("cliente_id");


        if (errorBuscador || !filasActualizadas || filasActualizadas.length === 0) {

            console.error(
                "Error al guardar configuración del buscador:",
                errorBuscador
            );

            alert(
                errorBuscador
                    ? "No se pudo guardar la configuración del buscador."
                    : "No se encontró la configuración de este negocio para guardar la posición."
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
/*       COLOR DEL NOMBRE COMERCIAL EN TIEMPO REAL   */
/* ================================================= */

let temporizadorColorNombreComercial = null;

async function guardarColorNombreComercial() {
    if (!colorNombreComercial) return;

    const colorSeleccionado = colorNombreComercial.value;
    const { error: errorColor } = await clienteSupabase
        .from("configuracion_inicio")
        .update({ color_nombre_comercial: colorSeleccionado })
        .eq("cliente_id", clienteId);

    if (errorColor) {
        console.error("No se pudo guardar el color del nombre comercial:", errorColor);
        return;
    }

    if (configuracionGuardada) {
        configuracionGuardada.color_nombre_comercial = colorSeleccionado;
    }
}

if (colorNombreComercial) {
    colorNombreComercial.addEventListener("input", function () {
        actualizarVariableCSS("--color-nombre-comercial", colorNombreComercial.value);

        const nombreVisible = document.getElementById("nombre-comercial-encabezado");
        if (nombreVisible) nombreVisible.style.color = colorNombreComercial.value;

        clearTimeout(temporizadorColorNombreComercial);
        temporizadorColorNombreComercial = setTimeout(
            guardarColorNombreComercial,
            300
        );
    });

    colorNombreComercial.addEventListener("change", function () {
        clearTimeout(temporizadorColorNombreComercial);
        guardarColorNombreComercial();
    });
}


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

            color_nombre_comercial:
                colorNombreComercial?.value || "#000000",

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

        // Mantener el nombre general de la cuenta sincronizado con el encabezado.
        const { error: errorActualizarNombreCuenta } = await clienteSupabase
            .from("clientes")
            .update({ nombre_comercial: nombreComercial.value.trim() })
            .eq("id", clienteId);

        if (errorActualizarNombreCuenta) {
            console.error("No se pudo sincronizar el nombre comercial de la cuenta:", errorActualizarNombreCuenta);
        } else if (datosNegocioActual) {
            datosNegocioActual.nombre_comercial = nombreComercial.value.trim();
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
/*          ACEPTAR CONFIGURACIÓN DE INICIO           */
/* ================================================= */

aceptarInicio.addEventListener(
    "click",
    async function () {

        const archivo = archivoLogotipo.files[0];

        let logotipoUrl =
            configuracionGuardada?.logotipo_url || null;

        const urlLogotipoAnteriorInicio = logotipoUrl;
        let rutaLogotipoNuevaInicio = null;

        /* SUBIR LOGOTIPO SI SE SELECCIONÓ */

        if (archivo) {

            const nombreArchivo =
                `logotipo_${Date.now()}_${archivo.name}`;

            const rutaLogotipo =
                `negocios/${clienteId}/logotipo/${nombreArchivo}`;

            rutaLogotipoNuevaInicio = rutaLogotipo;

            const { error: errorSubida } = await clienteSupabase
                .storage
                .from("imagenes")
                .upload(
                    rutaLogotipo,
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
                    rutaLogotipo
                );

            logotipoUrl = urlLogotipo.publicUrl;

            let imagenFranja =
                document.getElementById("logotipo-franja");

            if (!imagenFranja) {

                imagenFranja =
                    document.createElement("img");

                imagenFranja.id = "logotipo-franja";

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

            if (rutaLogotipoNuevaInicio) {
                await clienteSupabase.storage.from("imagenes").remove([rutaLogotipoNuevaInicio]);
            }
            return;
        }

        const rutaLogotipoAnteriorInicio = obtenerRutaLogotipoPropio(urlLogotipoAnteriorInicio);
        if (rutaLogotipoNuevaInicio && rutaLogotipoAnteriorInicio && rutaLogotipoAnteriorInicio !== rutaLogotipoNuevaInicio) {
            const { error: errorEliminarInicio } = await clienteSupabase.storage
                .from("imagenes")
                .remove([rutaLogotipoAnteriorInicio]);
            if (errorEliminarInicio) {
                console.error("El nuevo logotipo quedó guardado, pero no se pudo borrar el anterior:", errorEliminarInicio);
            }
        }

        if (configuracionGuardada) {

            Object.assign(
                configuracionGuardada,
                configuracion
            );
        }


        /* APLICAR COLORES DEL DISPOSITIVO ACTUAL */

        aplicarColorFranjasEnEncabezados(colorFranjas.value);

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

/* =========================================
   PERMITIR ARRASTRAR LAS VENTANAS CODMAR
========================================= */

function hacerVentanaMovible(ventana, encabezado) {

    if (!ventana || !encabezado) return;

    let moviendo = false;
    let posicionX = 0;
    let posicionY = 0;

    encabezado.style.cursor = "move";

    encabezado.addEventListener("mousedown", function(e) {

        if (e.target.closest("button, input, select, textarea")) return;

        moviendo = true;

        const rect = ventana.getBoundingClientRect();

        posicionX = e.clientX - rect.left;
        posicionY = e.clientY - rect.top;

       ventana.style.position = "fixed";
       ventana.style.left = rect.left + "px";
       ventana.style.top = rect.top + "px";
       ventana.style.margin = "0";
       ventana.style.transform = "none";

        e.preventDefault();
    });

    document.addEventListener("mousemove", function(e) {

        if (!moviendo) return;

        ventana.style.left = (e.clientX - posicionX) + "px";
        ventana.style.top = (e.clientY - posicionY) + "px";
    });

    document.addEventListener("mouseup", function() {
        moviendo = false;
    });
}

// =============================================
// HACER MOVIBLES LAS VENTANAS DE CONFIGURACIÓN
// =============================================

hacerVentanaMovible(
    document.getElementById("formulario-inicio"),
    document.querySelector("#formulario-inicio h2")
);

hacerVentanaMovible(
    document.getElementById("formulario-cabecera"),
    document.querySelector("#formulario-cabecera h2")
);

hacerVentanaMovible(
    document.getElementById("formulario-categorias"),
    document.querySelector("#formulario-categorias h2")
);

hacerVentanaMovible(
    document.getElementById("formulario-actualizar-precios"),
    document.querySelector("#formulario-actualizar-precios h2")
);

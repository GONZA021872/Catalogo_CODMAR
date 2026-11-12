(() => {
  "use strict";

  const SUPABASE_URL = "https://lkajqjiiqatleydroibw.supabase.co";
  const SUPABASE_KEY = "sb_publishable_tfOFSgp4Rq8Q6WKSWhstaA_VsdxHk9D";
  const TELEFONO_PEDIDOS = "5212282116197";
  // Evitar que el navegador reutilice respuestas antiguas al recargar la tienda.
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      fetch: (input, init = {}) => fetch(input, { ...init, cache: "no-store" })
    }
  });

  const porId = (id) => document.getElementById(id);
  const contenedor = porId("productos-tienda");
  const estado = porId("estado-tienda");
  const categoriasEl = porId("categorias-tienda");
  const buscador = porId("buscar-productos");
  const formatoPrecio = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
  const parametrosTienda = new URLSearchParams(window.location.search);
  const negocioSlugTienda = (parametrosTienda.get("negocio") || "co-d-mar-1").trim();

  let categoriaActiva = "";
  let termino = "";
  let pagina = 0;
  const TAMANO_PAGINA = 1000;
  let cargando = false;
  let hayMas = true;
  let observador = null;
  let temporizadorBusqueda = null;
  let carrito = [];
  let telefonoPedidosTienda = "";
  let nombreTiendaActiva = "CODMAR";

  function textoSeguro(valor) {
    return String(valor ?? "").trim();
  }

  function crearTarjeta(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto-tienda";

    const zonaImagen = document.createElement("div");
    zonaImagen.className = "imagen-producto";
    if (producto.imagen_url) {
      const imagen = document.createElement("img");
      imagen.src = producto.imagen_url;
      imagen.alt = textoSeguro(producto.nombre) || "Producto CODMAR";
      imagen.loading = "lazy";
      imagen.onerror = () => {
        imagen.remove();
        zonaImagen.classList.add("sin-imagen");
        zonaImagen.textContent = "Imagen no disponible";
      };
      zonaImagen.appendChild(imagen);
    } else {
      zonaImagen.classList.add("sin-imagen");
      zonaImagen.textContent = "Imagen no disponible";
    }

    const datos = document.createElement("div");
    datos.className = "datos-producto";
    const nombre = document.createElement("h2");
    nombre.textContent = textoSeguro(producto.nombre) || "Producto sin nombre";
    datos.appendChild(nombre);

    const presentacion = document.createElement("p");
    presentacion.className = "presentacion-producto";
    presentacion.textContent = textoSeguro(producto.presentacion);
    datos.appendChild(presentacion);

    const precioReferencia = document.createElement("p");
    precioReferencia.className = "precio-referencia";
    precioReferencia.textContent = "Precio público: " +
      formatoPrecio.format(Number(producto.precio_publico) || 0);
    precioReferencia.classList.add("precio-tachado");
    datos.appendChild(precioReferencia);

    const precio = document.createElement("p");
    precio.className = "precio-producto";
    precio.textContent = "Precio: " +
      formatoPrecio.format(Number(producto.precio) || 0);
    datos.appendChild(precio);

    const agregar = document.createElement("button");
    agregar.type = "button";
    agregar.className = "boton-agregar";
    agregar.textContent = "Agregar al carrito";
    agregar.addEventListener("click", () => abrirSelectorProducto(producto));
    datos.appendChild(agregar);

    tarjeta.append(zonaImagen, datos);
    return tarjeta;
  }

  function mostrarEstado(mensaje, tipo = "") {
    estado.textContent = mensaje;
    estado.className = "estado-tienda" + (tipo ? " " + tipo : "");
  }

  async function cargarCategorias() {
    // Cargar y aplicar la identidad de la tienda en cuanto responda Supabase,
    // sin esperar a que termine la consulta independiente de categorías.
    const respuestaConfigPromise = supabase
      .from("configuracion_tienda_codmar_publica")
      .select("*")
      .eq("negocio_slug", negocioSlugTienda)
      .maybeSingle()
      .then(respuesta => {
        if (respuesta.error) {
          console.error("No se pudo cargar la identidad de la tienda:", respuesta.error);
          return respuesta;
        }
        if (respuesta.data) aplicarIdentidad(respuesta.data);
        else console.error("La vista pública no devolvió la configuración de la tienda.");
        return respuesta;
      });

    const respuestaCategorias = await supabase
      .from("catalogo_codmar_publico")
      .select("categoria")
      .eq("negocio_slug", negocioSlugTienda)
      .order("categoria");

    if (respuestaCategorias.error) throw respuestaCategorias.error;
    const categoriasUnicas = new Map();
    (respuestaCategorias.data || []).forEach(item => {
      const categoria = textoSeguro(item.categoria);
      if (!categoria) return;
      const clave = categoria.toLocaleLowerCase("es");
      if (!categoriasUnicas.has(clave)) categoriasUnicas.set(clave, categoria);
    });
    const categorias = [...categoriasUnicas.values()]
      .sort((a, b) => a.localeCompare(b, "es"));

    categoriasEl.querySelectorAll("button:not([data-categoria=''])").forEach(b => b.remove());
    categorias.forEach(categoria => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "categoria";
      boton.dataset.categoria = categoria;
      boton.textContent = categoria;
      boton.addEventListener("click", () => seleccionarCategoria(categoria));
      categoriasEl.appendChild(boton);
    });

    await respuestaConfigPromise;
  }

  let configuracionTiendaActiva = null;

  function valorNumerico(config, campoMovil, campoEscritorio, campoGeneral, defecto = 0, movil = false) {
    const valor = movil
      ? (config[campoMovil] ?? config[campoGeneral] ?? defecto)
      : (config[campoEscritorio] ?? config[campoGeneral] ?? defecto);
    const numero = Number.parseFloat(valor);
    return Number.isFinite(numero) ? numero : defecto;
  }

  function aplicarIdentidad(config) {
    if (!config) return;
    configuracionTiendaActiva = config;
    telefonoPedidosTienda = String(config.telefono_pedidos || "").replace(/\\D/g, "");
    nombreTiendaActiva = textoSeguro(config.nombre_comercial) || "CODMAR";

    // Administración trabaja con un ajuste distinto para computadora y celular.
    const movil = window.matchMedia("(max-width: 768px)").matches;
    const raiz = document.documentElement.style;
    const encabezado = porId("encabezado-tienda");
    const nombreEl = porId("nombre-tienda");
    const logo = porId("logo-tienda");
    const buscadorEl = porId("busqueda-tienda");
    const carritoEl = porId("abrir-carrito");
    const iconoBolsa = porId("icono-bolsita-tienda");
    const iconoCarrito = porId("icono-carrito-tienda");

    const nombre = (movil
      ? config.nombre_comercial_movil
      : config.nombre_comercial_escritorio) || config.nombre_comercial || "CODMAR";
    nombreEl.textContent = textoSeguro(nombre) || "CODMAR";
    document.title = (textoSeguro(nombre) || "CODMAR") + " | Tienda";
    const pieTienda = document.querySelector(".pie-tienda");
    if (pieTienda) pieTienda.textContent = (textoSeguro(nombre) || "CODMAR") + " · Catálogo en línea";
    nombreEl.hidden = config.mostrar_nombre_comercial === false;

    const fuente = textoSeguro(config.fuente_nombre_comercial) || "Arial";
    const tamanoNombre = (movil
      ? config.tamano_nombre_comercial_movil
      : config.tamano_nombre_comercial_escritorio) || config.tamano_nombre_comercial || "20px";
    raiz.setProperty("--fuente-nombre-comercial", fuente);
    const colorNombre = /^#[0-9a-f]{6}$/i.test(String(config.color_nombre_comercial || ""))
      ? config.color_nombre_comercial : "#000000";
    raiz.setProperty("--color-nombre-comercial", colorNombre);
    raiz.setProperty("--tamano-nombre-comercial", /^\d+(\.\d+)?(px|rem|em|%)$/i.test(String(tamanoNombre)) ? tamanoNombre : "20px");
    raiz.setProperty("--ajuste-x", valorNumerico(config, "ajuste_nombre_comercial_x_movil", "ajuste_nombre_comercial_x_escritorio", "ajuste_nombre_comercial_x", 0, movil) + "px");
    raiz.setProperty("--ajuste-y", valorNumerico(config, "ajuste_nombre_comercial_y_movil", "ajuste_nombre_comercial_y_escritorio", "ajuste_nombre_comercial_y", 0, movil) + "px");

    const logoUrl = (movil
      ? (config.logotipo_url_movil || config.logotipo_url_escritorio)
      : (config.logotipo_url_escritorio || config.logotipo_url_movil)) || config.logotipo_url || "";
    const mostrarLogo = config.mostrar_logotipo !== false && Boolean(logoUrl);
    if (mostrarLogo) {
      if (logo.src !== logoUrl) logo.src = logoUrl;
      logo.hidden = false;
      logo.onerror = () => { logo.hidden = true; };
    } else {
      logo.hidden = true;
    }
    raiz.setProperty("--ajuste-logotipo-x", valorNumerico(
      config, "ajuste_logotipo_x_movil", "ajuste_logotipo_x", "ajuste_logotipo_x", 0, movil
    ) + "px");
    raiz.setProperty("--ajuste-logotipo-y", valorNumerico(
      config, "ajuste_logotipo_y_movil", "ajuste_logotipo_y_escritorio", null, 0, movil
    ) + "px");

    // La franja de Tienda usa exactamente el color guardado por Administración.
    // Tienda usa el mismo color específico que Administración para cada dispositivo.
    // No recurrir a color_franjas general: conserva un azul marino antiguo.
    const colorConfigurado = movil
      ? config.color_franjas_movil
      : config.color_franjas_escritorio;
    const color = /^#[0-9a-f]{6}$/i.test(String(colorConfigurado || "").trim())
      ? String(colorConfigurado).trim()
      : "#ffffff";
    raiz.setProperty("--color-marca", color);
    raiz.setProperty("--color-franjas", color);
    if (encabezado) {
      encabezado.style.setProperty("background-color", color, "important");
    }
    const metaColor = document.querySelector('meta[name="theme-color"]');
    if (metaColor) metaColor.setAttribute("content", color);

    buscadorEl.hidden = config.mostrar_buscador === false;
    buscadorEl.style.display = config.mostrar_buscador === false ? "none" : "flex";
    const anchoBuscador = valorNumerico(config, "ancho_buscador_movil", "ancho_buscador_escritorio", "ancho_buscador", 150, movil);
    const altoBuscador = valorNumerico(config, "alto_buscador_movil", "alto_buscador_escritorio", "alto_buscador", 25, movil);
    raiz.setProperty("--buscador-ancho", Math.max(100, anchoBuscador) + "px");
    raiz.setProperty("--buscador-alto", Math.max(20, altoBuscador) + "px");
    raiz.setProperty("--ajuste-buscador-x", valorNumerico(config, "ajuste_buscador_x_movil", "ajuste_buscador_x_escritorio", "ajuste_buscador_x", 0, movil) + "px");
    raiz.setProperty("--ajuste-buscador-y", valorNumerico(config, "ajuste_buscador_y_movil", "ajuste_buscador_y_escritorio", "ajuste_buscador_y", 0, movil) + "px");

    carritoEl.hidden = config.mostrar_carrito === false;
    carritoEl.style.display = config.mostrar_carrito === false ? "none" : "flex";
    const tipoCarrito = (movil
      ? (config.tipo_carrito_movil || config.tipo_carrito)
      : (config.tipo_carrito_escritorio || config.tipo_carrito)) || "bolsita";
    iconoBolsa.hidden = tipoCarrito !== "bolsita";
    iconoCarrito.hidden = tipoCarrito !== "carrito";
    carritoEl.setAttribute("aria-label", tipoCarrito === "carrito" ? "Abrir carrito de compras" : "Abrir bolsa de compras");
    raiz.setProperty("--ajuste-carrito-x", valorNumerico(config, "ajuste_carrito_x_movil", "ajuste_carrito_x_escritorio", "ajuste_carrito_x", 0, movil) + "px");
    raiz.setProperty("--ajuste-carrito-y", valorNumerico(config, "ajuste_carrito_y_movil", "ajuste_carrito_y_escritorio", "ajuste_carrito_y", 0, movil) + "px");

    // Se conserva background-color con prioridad !important, aplicado arriba.
  }

  window.addEventListener("resize", () => {
    if (configuracionTiendaActiva) aplicarIdentidad(configuracionTiendaActiva);
  });

  function seleccionarCategoria(categoria) {
    categoriaActiva = categoria;
    categoriasEl.querySelectorAll(".categoria").forEach(boton => {
      boton.classList.toggle("activa", boton.dataset.categoria === categoria);
    });
    reiniciarCatalogo();
  }

  function reiniciarCatalogo() {
    pagina = 0;
    hayMas = true;
    contenedor.innerHTML = "";
    porId("fin-catalogo").textContent = "";
    if (observador) observador.disconnect();
    cargarProductos();
  }

  async function cargarProductos() {
    if (cargando || !hayMas) return;
    cargando = true;
    mostrarEstado("Cargando productos…");
    try {
      let consulta = supabase.from("catalogo_codmar_publico")
        .select("id,nombre,presentacion,categoria,precio_publico,precio,imagen_url")
        .eq("negocio_slug", negocioSlugTienda)
        .order("nombre", { ascending: true })
        .range(pagina * TAMANO_PAGINA, (pagina + 1) * TAMANO_PAGINA - 1);

      if (categoriaActiva) consulta = consulta.ilike("categoria", categoriaActiva);
      if (termino) {
        const seguro = termino.replace(/[,%()*._]/g, " ").trim();
        if (seguro) consulta = consulta.or("nombre.ilike.%" + seguro + "%,presentacion.ilike.%" + seguro + "%");
      }

      const { data, error } = await consulta;
      if (error) throw error;
      const productos = data || [];
      productos.forEach(producto => contenedor.appendChild(crearTarjeta(producto)));
      hayMas = productos.length === TAMANO_PAGINA;
      pagina += 1;

      if (!contenedor.children.length) {
        mostrarEstado("No encontramos productos con esos criterios.", "vacio");
      } else {
        mostrarEstado(contenedor.children.length + " productos mostrados.");
      }
      if (!hayMas) porId("fin-catalogo").textContent = "Has llegado al final del catálogo.";
    } catch (error) {
      console.error("Error al cargar tienda CODMAR:", error);
      mostrarEstado("No se pudo cargar el catálogo. Actualiza la página para intentarlo de nuevo.", "error");
    } finally {
      cargando = false;
    }
  }

  function prepararCargaAutomatica() {
    const sentinel = porId("observador-tienda");
    if (!("IntersectionObserver" in window)) {
      sentinel.textContent = "Desplázate y usa el botón para cargar más.";
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "boton-agregar";
      boton.textContent = "Cargar más productos";
      boton.addEventListener("click", cargarProductos);
      sentinel.appendChild(boton);
      return;
    }
    observador = new IntersectionObserver(entradas => {
      if (entradas.some(entrada => entrada.isIntersecting)) cargarProductos();
    }, { rootMargin: "500px" });
    observador.observe(sentinel);
  }

  let productoSeleccionado = null;
  let cantidadSeleccionada = 1;

  function abrirSelectorProducto(producto) {
    productoSeleccionado = producto;
    cantidadSeleccionada = 1;
    const urlImagen = textoSeguro(producto.imagen_url);
    const imagen = porId("imagen-selector-producto");
    imagen.removeAttribute("src");
    if (urlImagen) imagen.src = urlImagen;
    imagen.alt = textoSeguro(producto.nombre) || "Producto CODMAR";
    porId("titulo-selector-producto").textContent = textoSeguro(producto.nombre) || "Producto sin nombre";
    porId("presentacion-selector-producto").textContent = textoSeguro(producto.presentacion);
    porId("precio-selector-producto").textContent = formatoPrecio.format(Number(producto.precio) || 0);
    actualizarSelectorProducto();
    porId("fondo-selector-producto").hidden = false;
    document.body.classList.add("selector-producto-abierto");
  }

  function actualizarSelectorProducto() {
    const precio = Number(productoSeleccionado && productoSeleccionado.precio) || 0;
    porId("cantidad-selector-producto").textContent = String(cantidadSeleccionada);
    porId("importe-selector-producto").textContent = formatoPrecio.format(precio * cantidadSeleccionada);
  }

  function cerrarSelectorProducto() {
    porId("fondo-selector-producto").hidden = true;
    document.body.classList.remove("selector-producto-abierto");
    productoSeleccionado = null;
  }

  function agregarAlCarrito(producto, cantidadAgregar) {
    const existente = carrito.find(item => item.id === producto.id);
    if (existente) existente.cantidad += cantidadAgregar;
    else carrito.push({
      id: producto.id,
      nombre: textoSeguro(producto.nombre),
      presentacion: textoSeguro(producto.presentacion),
      precio: Number(producto.precio) || 0,
      cantidad: cantidadAgregar
    });
    actualizarCarrito();
    porId("abrir-carrito").classList.add("carrito-actualizado");
    window.setTimeout(() => porId("abrir-carrito").classList.remove("carrito-actualizado"), 450);
  }

  porId("menos-selector-producto").addEventListener("click", () => {
    cantidadSeleccionada = Math.max(1, cantidadSeleccionada - 1);
    actualizarSelectorProducto();
  });
  porId("mas-selector-producto").addEventListener("click", () => {
    cantidadSeleccionada += 1;
    actualizarSelectorProducto();
  });
  porId("cerrar-selector-producto").addEventListener("click", cerrarSelectorProducto);
  porId("fondo-selector-producto").addEventListener("click", evento => {
    if (evento.target === porId("fondo-selector-producto")) cerrarSelectorProducto();
  });
  porId("confirmar-agregar-producto").addEventListener("click", () => {
    if (!productoSeleccionado) return;
    agregarAlCarrito(productoSeleccionado, cantidadSeleccionada);
    cerrarSelectorProducto();
  });

  function actualizarCarrito() {
    const items = porId("items-carrito");
    items.innerHTML = "";
    let total = 0;
    let piezas = 0;

    const encabezados = document.createElement("div");
    encabezados.className = "encabezados-nota-tienda";
    encabezados.innerHTML = "<span>CANTIDAD</span><span>PRODUCTO</span><span>PRECIO</span><span>IMPORTE</span>";
    items.appendChild(encabezados);

    carrito.forEach(item => {
      const importe = item.precio * item.cantidad;
      const fila = document.createElement("div");
      fila.className = "fila-nota-tienda";

      const cantidadColumna = document.createElement("div");
      cantidadColumna.className = "cantidad-nota-tienda";
      const cantidad = document.createElement("b");
      cantidad.textContent = String(item.cantidad);
      cantidadColumna.append(cantidad);

      const productoColumna = document.createElement("span");
      productoColumna.className = "producto-nota-tienda";
      productoColumna.textContent = item.nombre + (item.presentacion ? " " + item.presentacion : "");

      const precioColumna = document.createElement("span");
      precioColumna.textContent = formatoPrecio.format(item.precio);

      const importeColumna = document.createElement("span");
      importeColumna.textContent = formatoPrecio.format(importe);

      fila.append(cantidadColumna, productoColumna, precioColumna, importeColumna);
      items.appendChild(fila);
      total += importe;
      piezas += item.cantidad;
    });

    if (!carrito.length) {
      const vacio = document.createElement("p");
      vacio.className = "carrito-vacio";
      vacio.textContent = "Tu carrito está vacío.";
      items.appendChild(vacio);
    }
    porId("total-carrito").textContent = formatoPrecio.format(total);
    porId("contador-carrito").textContent = String(piezas);
    porId("enviar-pedido").disabled = !carrito.length;
  }

  function abrirCarrito() {
    porId("fondo-carrito").hidden = false;
    document.body.classList.add("carrito-abierto");
  }

  function cerrarCarrito() {
    porId("fondo-carrito").hidden = true;
    document.body.classList.remove("carrito-abierto");
  }

  function enviarPedido() {
    if (!carrito.length) return;
    if (!telefonoPedidosTienda) {
      mostrarEstado("Esta tienda aún no ha configurado su WhatsApp para recibir pedidos.", "error");
      return;
    }
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const fecha = new Date().toLocaleString("es-MX", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    // Ticket para celular: encabezado único, producto en su renglón
    // y cantidad, precio e importe alineados debajo en una sola línea.
    const monedaTicket = valor => "$" + (Number(valor) || 0).toLocaleString("es-MX", {
      maximumFractionDigits: 0
    });
    const anchoCantidad = 8;
    const anchoPrecio = 9;
    const encabezado = "CANTIDAD".padEnd(anchoCantidad) +
      "PRECIO".padStart(anchoPrecio) +
      "IMPORTE".padStart(9);
    const separadorPunteado = "................................";
    const anchoNombre = 26;
    const ajustarNombreTicket = texto => {
      const nombre = String(texto || "").replace(/\\s+/g, " ").trim();
      if (nombre.length <= anchoNombre) return nombre;
      const espacioRestante = anchoNombre - 1;
      const caracteresInicio = Math.ceil(espacioRestante / 2);
      const caracteresFinal = Math.floor(espacioRestante / 2);
      return nombre.slice(0, caracteresInicio) + "…" +
        nombre.slice(-caracteresFinal);
    };
    const lineasProductos = carrito.flatMap(item => {
      const nombreCompleto = (item.nombre + (item.presentacion ? " " + item.presentacion : "")).trim();
      const nombre = ajustarNombreTicket(nombreCompleto);
      const valores = String(item.cantidad).padStart(3).padEnd(anchoCantidad) +
        monedaTicket(item.precio).padStart(anchoPrecio) +
        monedaTicket(item.precio * item.cantidad).padStart(9);
      return [nombre, valores, ""];
    });
    const totalTexto = "TOTAL".padEnd(17) + monedaTicket(total).padStart(9);
    const mensaje = [
      nombreTiendaActiva,
      "TICKET DE PEDIDO",
      "Fecha: " + fecha,
      "",
      "```",
      encabezado,
      "",
      ...lineasProductos,
      separadorPunteado,
      totalTexto,
      "```",
    ].join("\n");
    window.open("https://wa.me/" + telefonoPedidosTienda + "?text=" + encodeURIComponent(mensaje), "_blank", "noopener");
  }

  buscador.addEventListener("input", () => {
    window.clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = window.setTimeout(() => {
      termino = buscador.value.trim();
      reiniciarCatalogo();
    }, 250);
  });
  categoriasEl.querySelector('[data-categoria=""]').addEventListener("click", () => seleccionarCategoria(""));
  porId("abrir-carrito").addEventListener("click", abrirCarrito);
  porId("cerrar-carrito").addEventListener("click", cerrarCarrito);
  porId("fondo-carrito").addEventListener("click", evento => {
    if (evento.target === porId("fondo-carrito")) cerrarCarrito();
  });
  porId("enviar-pedido").addEventListener("click", enviarPedido);
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") cerrarCarrito();
  });

  // Mantener la tienda sincronizada con los cambios de Administración.
  let actualizandoConfiguracionTienda = false;

  async function actualizarConfiguracionTienda() {
    // No permitir consultas simultáneas que puedan aplicar respuestas fuera de orden.
    if (actualizandoConfiguracionTienda) return;
    actualizandoConfiguracionTienda = true;

    try {
      const { data, error } = await supabase
        .from("configuracion_tienda_codmar_publica")
        .select("*")
        .eq("negocio_slug", negocioSlugTienda)
        .maybeSingle();

      if (error) throw error;
      if (data) aplicarIdentidad(data);
    } catch (error) {
      console.error("No se pudo actualizar la configuración de la tienda:", error);
    } finally {
      actualizandoConfiguracionTienda = false;
    }
  }

  async function iniciar() {
    try {
      await cargarCategorias();
      prepararCargaAutomatica();
      await cargarProductos();

      // Actualiza la tienda en cuanto Administración guarda un cambio.
      // Se conserva la consulta periódica como respaldo si Realtime no está disponible.
      supabase
        .channel("sincronizacion-configuracion-tienda")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "configuracion_inicio"
          },
          () => actualizarConfiguracionTienda()
        )
        .subscribe();

      window.setInterval(actualizarConfiguracionTienda, 2000);
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) actualizarConfiguracionTienda();
      });
    } catch (error) {
      console.error("No se pudo iniciar la tienda CODMAR:", error);
      mostrarEstado("No se pudo conectar con la tienda CODMAR.", "error");
    }
  }
  iniciar();
})();

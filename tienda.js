(() => {
  "use strict";

  const SUPABASE_URL = "https://lkajqjiiqatleydroibw.supabase.co";
  const SUPABASE_KEY = "sb_publishable_tfOFSgp4Rq8Q6WKSWhstaA_VsdxHk9D";
  const TELEFONO_PEDIDOS = "5212282116197";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const porId = (id) => document.getElementById(id);
  const contenedor = porId("productos-tienda");
  const estado = porId("estado-tienda");
  const categoriasEl = porId("categorias-tienda");
  const buscador = porId("buscar-productos");
  const formatoPrecio = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

  let categoriaActiva = "";
  let termino = "";
  let pagina = 0;
  const TAMANO_PAGINA = 48;
  let cargando = false;
  let hayMas = true;
  let observador = null;
  let temporizadorBusqueda = null;
  let carrito = [];

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
    agregar.addEventListener("click", () => agregarAlCarrito(producto));
    datos.appendChild(agregar);

    tarjeta.append(zonaImagen, datos);
    return tarjeta;
  }

  function mostrarEstado(mensaje, tipo = "") {
    estado.textContent = mensaje;
    estado.className = "estado-tienda" + (tipo ? " " + tipo : "");
  }

  async function cargarCategorias() {
    const [respuestaCategorias, respuestaConfig] = await Promise.all([
      supabase.from("catalogo_codmar_publico").select("categoria").order("categoria"),
      supabase.from("configuracion_tienda_codmar_publica").select("*").maybeSingle()
    ]);

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

    if (!respuestaConfig.error && respuestaConfig.data) aplicarIdentidad(respuestaConfig.data);
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
    nombreEl.hidden = config.mostrar_nombre_comercial === false;

    const fuente = textoSeguro(config.fuente_nombre_comercial) || "Arial";
    const tamanoNombre = (movil
      ? config.tamano_nombre_comercial_movil
      : config.tamano_nombre_comercial_escritorio) || config.tamano_nombre_comercial || "20px";
    raiz.setProperty("--fuente-nombre-comercial", fuente);
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
    const colorConfigurado = movil
      ? (config.color_franjas_movil || config.color_franjas)
      : (config.color_franjas_escritorio || config.color_franjas);
    const color = /^#[0-9a-f]{6}$/i.test(String(colorConfigurado || ""))
      ? String(colorConfigurado).trim()
      : "#314f6d";
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

    if (encabezado) encabezado.style.backgroundColor = color;
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

  function agregarAlCarrito(producto) {
    const existente = carrito.find(item => item.id === producto.id);
    if (existente) existente.cantidad += 1;
    else carrito.push({
      id: producto.id,
      nombre: textoSeguro(producto.nombre),
      presentacion: textoSeguro(producto.presentacion),
      precio: Number(producto.precio) || 0,
      cantidad: 1
    });
    actualizarCarrito();
    porId("abrir-carrito").classList.add("carrito-actualizado");
    window.setTimeout(() => porId("abrir-carrito").classList.remove("carrito-actualizado"), 450);
  }

  function actualizarCarrito() {
    const items = porId("items-carrito");
    items.innerHTML = "";
    let total = 0;
    let piezas = 0;
    carrito.forEach(item => {
      const fila = document.createElement("article");
      fila.className = "item-carrito";
      const descripcion = document.createElement("div");
      const titulo = document.createElement("strong");
      titulo.textContent = item.nombre;
      const presentacion = document.createElement("small");
      presentacion.textContent = item.presentacion;
      const precio = document.createElement("span");
      precio.textContent = formatoPrecio.format(item.precio) + " c/u";
      descripcion.append(titulo, presentacion, precio);

      const controles = document.createElement("div");
      controles.className = "controles-cantidad";
      const menos = document.createElement("button");
      menos.type = "button"; menos.textContent = "−"; menos.setAttribute("aria-label", "Quitar una unidad");
      menos.addEventListener("click", () => cambiarCantidad(item.id, -1));
      const cantidad = document.createElement("b");
      cantidad.textContent = String(item.cantidad);
      const mas = document.createElement("button");
      mas.type = "button"; mas.textContent = "+"; mas.setAttribute("aria-label", "Agregar una unidad");
      mas.addEventListener("click", () => cambiarCantidad(item.id, 1));
      controles.append(menos, cantidad, mas);
      fila.append(descripcion, controles);
      items.appendChild(fila);
      total += item.precio * item.cantidad;
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

  function cambiarCantidad(id, cambio) {
    const item = carrito.find(producto => producto.id === id);
    if (!item) return;
    item.cantidad += cambio;
    if (item.cantidad <= 0) carrito = carrito.filter(producto => producto.id !== id);
    actualizarCarrito();
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
    const lineas = carrito.map(item =>
      "- " + item.cantidad + " x " + item.nombre +
      (item.presentacion ? " (" + item.presentacion + ")" : "") +
      " = " + formatoPrecio.format(item.precio * item.cantidad)
    );
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    const mensaje = "Hola, quiero realizar este pedido en CODMAR:\n\n" +
      lineas.join("\n") + "\n\nTotal estimado: " + formatoPrecio.format(total) +
      "\n\n¿Me confirman disponibilidad y entrega?";
    window.open("https://wa.me/" + TELEFONO_PEDIDOS + "?text=" + encodeURIComponent(mensaje), "_blank", "noopener");
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

  async function iniciar() {
    try {
      await cargarCategorias();
      prepararCargaAutomatica();
      await cargarProductos();
    } catch (error) {
      console.error("No se pudo iniciar la tienda CODMAR:", error);
      mostrarEstado("No se pudo conectar con la tienda CODMAR.", "error");
    }
  }
  iniciar();
})();

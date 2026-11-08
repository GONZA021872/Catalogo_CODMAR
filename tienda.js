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

    if (producto.presentacion) {
      const presentacion = document.createElement("p");
      presentacion.className = "presentacion-producto";
      presentacion.textContent = textoSeguro(producto.presentacion);
      datos.appendChild(presentacion);
    }

    const precio = document.createElement("p");
    precio.className = "precio-producto";
    precio.textContent = formatoPrecio.format(Number(producto.precio_publico) || 0);
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
    const categorias = [...new Set((respuestaCategorias.data || [])
      .map(item => textoSeguro(item.categoria))
      .filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

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

  function aplicarIdentidad(config) {
    const movil = window.matchMedia("(max-width: 700px)").matches;
    const nombre = (movil ? config.nombre_comercial_movil : config.nombre_comercial_escritorio)
      || config.nombre_comercial || "CODMAR";
    if (config.mostrar_nombre_comercial !== false) {
      porId("nombre-tienda").textContent = nombre.trim() || "CODMAR";
    }
    const logoUrl = movil
      ? (config.logotipo_url_movil || config.logotipo_url_escritorio)
      : (config.logotipo_url_escritorio || config.logotipo_url_movil);
    const logo = porId("logo-tienda");
    if (config.mostrar_logotipo !== false && logoUrl) {
      logo.src = logoUrl;
      logo.hidden = false;
      logo.onerror = () => { logo.hidden = true; };
    }
    const color = movil ? config.color_franjas_movil : config.color_franjas_escritorio;
    if (color && /^#[0-9a-f]{6}$/i.test(color)) {
      document.documentElement.style.setProperty("--color-marca", color);
    }
  }

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
        .select("id,nombre,presentacion,categoria,precio_publico,tachar_precio_publico,imagen_url")
        .order("nombre", { ascending: true })
        .range(pagina * TAMANO_PAGINA, (pagina + 1) * TAMANO_PAGINA - 1);

      if (categoriaActiva) consulta = consulta.eq("categoria", categoriaActiva);
      if (termino) {
        const seguro = termino.replace(/[,%()]/g, " ").trim();
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
      precio: Number(producto.precio_publico) || 0,
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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==== TOAST PERSONALIZADO ==== */
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Eliminar después de animación
  setTimeout(() => {
    toast.remove();
  }, 4000); // 3.5s de animación + margen
}

function customConfirm(message) {
  return new Promise((resolve) => {
    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    // Caja
    const box = document.createElement("div");
    box.className = "confirm-box";
    box.innerHTML = `
      <h3>⚠️ Confirmación</h3>
      <p>${message}</p>
      <div class="confirm-buttons">
        <button class="accept">Aceptar</button>
        <button class="cancel">Cancelar</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Eventos
    box.querySelector(".accept").onclick = () => {
      resolve(true);
      overlay.remove();
    };
    box.querySelector(".cancel").onclick = () => {
      resolve(false);
      overlay.remove();
    };
  });
}


// 🔑 Configuración Supabase
const SUPABASE_URL = "https://zxkswjdghlarqiaqiodl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4a3N3amRnaGxhcnFpYXFpb2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzgxNjMsImV4cCI6MjA3MDk1NDE2M30.AZj-ByEb-3i-R9sgKMvixayIbxkE_Vhhgt9I_5wXS-Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎛️ Elementos del DOM
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const agregarProductoBtn = document.getElementById("agregarProductoBtn");
const listaProductos = document.getElementById("listaProductos");

// Inputs producto
const nombreInput = document.getElementById("nombreProducto");
const precioInput = document.getElementById("precioProducto");
const descripcionInput = document.getElementById("descripcionProducto");
const imagenInput = document.getElementById("imagenProducto");

// Referencias
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger"); // asegúrate que existe en tu HTML
const overlay = document.querySelector(".overlay");

// 👉 Abrir/cerrar en móvil
function openSidebar() {
  sidebar?.classList.add("open");
  overlay?.classList.add("active");
}
function closeSidebar() {
  sidebar?.classList.remove("open");
  overlay?.classList.remove("active");
}
hamburger?.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  overlay?.classList.toggle("active", isOpen);
});
overlay?.addEventListener("click", closeSidebar);

// 🔐 Login con Supabase Auth
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!email || !password) {
    showToast("⚠️ Ingresa correo y contraseña", "info");
    return;
  }

  // 👉 Iniciar sesión en Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Error de login:", error);
  showToast("❌ Error al iniciar sesión: " + error.message, "error");
    return;
  }

  showToast("✅ Bienvenido, acceso correcto", "success");

  // 👉 Ocultar login y mostrar panel admin
  loginSection.style.display = "none";
  adminSection.style.display = "block";

  // Mostrar menú y botón
  sidebar.classList.remove("hidden");
  hamburger?.classList.remove("hidden");

  // Abrir sidebar en móvil
  if (window.matchMedia("(max-width: 768px)").matches) {
    openSidebar();
  } else {
    sidebar.classList.add("open");
  }

  overlay && (overlay.style.display = "");

  // 👉 Cargar los datos después del login
  cargarProductos();
  cargarEmpresa();
  cargarHistorias();
  cargarEquipo();
  cargarPromos();
  cargarTestimonios();
  cargarNoticias();
  cargarConfiguraciones();
});

// 🚪 Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();

  showToast("👋 Sesión cerrada", "info");

  adminSection.style.display = "none";
  loginSection.style.display = "block";

  // Esconder menú/botón
  sidebar.classList.remove("open");
  sidebar.classList.add("hidden");
  hamburger?.classList.add("hidden");
  overlay?.classList.remove("active");
});

// 🔄 Al cargar la página, comprobar si ya hay sesión activa
document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Ya hay sesión activa → ir directo al panel admin
    loginSection.style.display = "none";
    adminSection.style.display = "block";

    sidebar.classList.remove("hidden");
    hamburger?.classList.remove("hidden");

    if (window.matchMedia("(max-width: 768px)").matches) {
      openSidebar();
    } else {
      sidebar.classList.add("open");
    }

    overlay && (overlay.style.display = "");

    // 👉 Cargar datos automáticamente
    cargarProductos();
    cargarEmpresa();
    cargarHistorias();
    cargarEquipo();
    cargarPromos();
    cargarTestimonios();
    cargarNoticias();
    cargarConfiguraciones();
  }
});

// 📱 Función para abrir/cerrar el sidebar en móviles
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.querySelector(".overlay");

  if (!sidebar.classList.contains("open")) {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  } else {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }
};



// ===============================
// 📚 CATEGORÍAS CENTRALIZADAS
// ===============================
const CATEGORIAS = [
  "Pollo",
  "Carne",
  "Camarón",
  "Pescado",
  "Gaseosa",
  "Infusiones",
  "Alcohol",
  "Dulces"
];

function cargarCategoriasFormulario() {
  const selectCategoria = document.getElementById("categoriaProducto");
  if (!selectCategoria) return;

  // Limpiar por si acaso
  selectCategoria.innerHTML = `<option value="">-- Selecciona una categoría --</option>`;

  CATEGORIAS.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });
}


// ➕ Agregar producto con imagen y categoría
agregarProductoBtn.addEventListener("click", async () => {
  const nombre = document.getElementById("nombreProducto").value;
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const descripcion = document.getElementById("descripcionProducto").value;
  const categoria = document.getElementById("categoriaProducto").value;
  const imagenFile = document.getElementById("imagenProducto").files[0];

  if (!nombre || !precio || !descripcion || !categoria || !imagenFile) {
    showToast("⚠️ Completa todos los campos (incluye categoría)", "info");
    return;
  }

  // Validación de categoría
  if (!CATEGORIAS.includes(categoria)) {
    showToast("⚠️ Categoría inválida", "error");
    return;
  }

  try {
    mostrarLoader();
    const fileName = `${Date.now()}_${imagenFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("productosweb")
      .upload(fileName, imagenFile, { upsert: true });
    if (uploadError) {
      showToast("❌ Error al subir la imagen", "error");
      console.error(uploadError);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from("productosweb")
      .getPublicUrl(fileName);
    const urlImagen = publicUrlData.publicUrl;
    const user = (await supabase.auth.getUser()).data.user;
    const { error: insertError } = await supabase.from("productos_web").insert([
      { nombre, precio, descripcion, categoria, imagen_url: urlImagen, imagen_path: fileName, owner_id: user.id },
    ]);
    if (insertError) {
      showToast("❌ Error al guardar producto", "error");
      console.error(insertError);
      return;
    }
    showToast("✅ Producto agregado correctamente", "success");
    document.getElementById("nombreProducto").value = "";
    document.getElementById("precioProducto").value = "";
    document.getElementById("descripcionProducto").value = "";
    document.getElementById("categoriaProducto").value = "";
    document.getElementById("imagenProducto").value = "";
    cargarProductos();
  } catch (err) {
    console.error("⚠️ Error inesperado:", err);
    showToast("❌ Ocurrió un error inesperado", "error");
  } finally {
    ocultarLoader();
  }
});

// 📥 Cargar lista de productos (con buscador y filtro)
async function cargarProductos() {
  const listaProductos = document.getElementById("listaProductos");
  listaProductos.innerHTML = "<li>Cargando productos...</li>";
  const { data: activos, error: err1 } = await supabase.from("productos_web").select("*").order("created_at", { ascending: false });
  const { data: pausados, error: err2 } = await supabase.from("productos_pausados").select("*").order("created_at", { ascending: false });
  if (err1 || err2) {
    listaProductos.innerHTML = "<li>⚠️ Error al cargar productos</li>";
    console.error(err1 || err2);
    return;
  }

  listaProductos.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
      <input type="text" id="buscadorProducto" placeholder="🔍 Buscar producto..." style="flex:1;padding:5px;">
      <select id="filtroCategoria" style="padding:5px;">
        <option value="">Todas las categorías</option>
        ${CATEGORIAS.map(cat => `<option value="${cat}">${cat}</option>`).join("")}
      </select>
    </div>
    <h3>🟢 Productos activos</h3>
    <ul id="listaActivos">${!activos.length ? "<p>No hay productos activos</p>" : generarHTML(activos, false)}</ul>
    ${activos.length ? `<button id="btnPausar" class="btn danger">⏸️ Pausar seleccionados</button>` : ""}
    <hr>
    <h3>🕓 Productos pausados</h3>
    <ul id="listaPausados">${!pausados.length ? "<p>No hay productos pausados</p>" : generarHTML(pausados, true)}</ul>
    ${pausados.length ? `<button id="btnReactivar" class="btn success">▶️ Reactivar seleccionados</button>` : ""}
  `;

  const btnPausar = document.getElementById("btnPausar");
  const btnReactivar = document.getElementById("btnReactivar");
  if (btnPausar) btnPausar.onclick = pausarProductosSeleccionados;
  if (btnReactivar) btnReactivar.onclick = reactivarProductosSeleccionados;

  // 🔍 Filtrado dinámico
  const buscador = document.getElementById("buscadorProducto");
  const filtro = document.getElementById("filtroCategoria");
  function aplicarFiltro() {
    const texto = buscador.value.toLowerCase();
    const cat = filtro.value;
    filtrarYMostrar(activos, pausados, texto, cat);
  }
  buscador.addEventListener("input", aplicarFiltro);
  filtro.addEventListener("change", aplicarFiltro);
}

// 🧩 Generar HTML reutilizable
function generarHTML(productos, pausado) {
  return productos.map(p => `
    <li>
      <input type="checkbox" class="${pausado ? "pausado-checkbox" : "producto-checkbox"}" data-id="${p.id}">
      <strong>${p.nombre}</strong> - S/ ${p.precio}<br>🏷️ ${p.categoria}<br>
      <img src="${p.imagen_url}" width="50"><br>
      <button onclick="editarProducto('${p.id}','${p.nombre}','${p.precio}','${p.descripcion}','${p.categoria}','${p.imagen_path}','${p.imagen_url}',${pausado})">Editar</button>
      <button onclick="eliminarProducto('${p.id}','${p.imagen_path}',${pausado})">Eliminar</button>
    </li>`).join("");
}

// 🎯 Aplicar filtro a listas
function filtrarYMostrar(activos, pausados, texto, cat) {
  const listaA = document.getElementById("listaActivos");
  const listaP = document.getElementById("listaPausados");
  const filtradosA = activos.filter(p => p.nombre.toLowerCase().includes(texto) && (!cat || p.categoria === cat));
  const filtradosP = pausados.filter(p => p.nombre.toLowerCase().includes(texto) && (!cat || p.categoria === cat));
  listaA.innerHTML = filtradosA.length ? generarHTML(filtradosA, false) : "<p>No hay resultados</p>";
  listaP.innerHTML = filtradosP.length ? generarHTML(filtradosP, true) : "<p>No hay resultados</p>";
}

// === PAUSAR / REACTIVAR PRODUCTOS ===
async function pausarProductosSeleccionados() {
  const seleccionados = Array.from(document.querySelectorAll(".producto-checkbox:checked")).map((chk) => chk.dataset.id);
  if (!seleccionados.length) {
    showToast("⚠️ No hay productos seleccionados", "info");
    return;
  }
  const confirmar = await customConfirm(`⏸️ ¿Pausar ${seleccionados.length} producto(s)?`);
  if (!confirmar) return;
  mostrarLoader();
  try {
    const { data: productos, error } = await supabase.from("productos_web").select("*").in("id", seleccionados);
    if (error) throw error;
    const { error: insertError } = await supabase.from("productos_pausados").insert(productos);
    if (insertError) throw insertError;
    const { error: deleteError } = await supabase.from("productos_web").delete().in("id", seleccionados);
    if (deleteError) throw deleteError;
    showToast("⏸️ Productos pausados correctamente", "success");
    await cargarProductos();
  } catch (err) {
    console.error(err);
    showToast("❌ Error al pausar productos", "error");
  } finally {
    ocultarLoader();
  }
}

async function reactivarProductosSeleccionados() {
  const seleccionados = Array.from(document.querySelectorAll(".pausado-checkbox:checked")).map((chk) => chk.dataset.id);
  if (!seleccionados.length) {
    showToast("⚠️ No hay productos seleccionados", "info");
    return;
  }
  const confirmar = await customConfirm(`▶️ ¿Reactivar ${seleccionados.length} producto(s)?`);
  if (!confirmar) return;
  mostrarLoader();
  try {
    const { data: productos, error } = await supabase.from("productos_pausados").select("*").in("id", seleccionados);
    if (error) throw error;
    const { error: insertError } = await supabase.from("productos_web").insert(productos);
    if (insertError) throw insertError;
    const { error: deleteError } = await supabase.from("productos_pausados").delete().in("id", seleccionados);
    if (deleteError) throw deleteError;
    showToast("✅ Productos reactivados correctamente", "success");
    await cargarProductos();
  } catch (err) {
    console.error(err);
    showToast("❌ Error al reactivar productos", "error");
  } finally {
    ocultarLoader();
  }
}

// ✏️ Editar producto con opción de cambiar la imagen directamente
window.editarProducto = async function (id, nombre, precio, descripcion, categoria, imagenPath, imagenUrl, esPausado = false) {
  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");
  modal.innerHTML = `
  <div class="modal-content">
    <h3>Editar producto</h3>
    <label>Nombre:</label>
    <input id="editNombre" type="text" value="${nombre}">
    <label>Precio:</label>
    <input id="editPrecio" type="number" value="${precio}">
    <label>Descripción:</label>
    <textarea id="editDescripcion">${descripcion}</textarea>
    <label>Categoría:</label>
    <select id="editCategoria">
      ${CATEGORIAS.map(cat => `
        <option value="${cat}" ${categoria === cat ? "selected" : ""}>${cat}</option>
      `).join("")}
    </select>
    <label>Imagen actual:</label>
    <img src="${imagenUrl}" alt="Imagen actual">
    <label>Cambiar imagen:</label>
    <input type="file" id="editImagen" accept="image/*">
    <div class="modal-actions">
      <button id="guardarEdicion" style="background:#42a5f5; color:#fff;">Guardar</button>
      <button id="cancelarEdicion" style="background:#ef5350; color:#fff;">Cancelar</button>
    </div>
  </div>
`;
  document.body.appendChild(modal);
  document.getElementById("cancelarEdicion").onclick = () => modal.remove();
  document.getElementById("guardarEdicion").onclick = async () => {
    const nuevoNombre = document.getElementById("editNombre").value.trim();
    const nuevoPrecio = parseFloat(document.getElementById("editPrecio").value);
    const nuevaDescripcion = document.getElementById("editDescripcion").value.trim();
    const nuevaCategoria = document.getElementById("editCategoria").value;
    const nuevaImagenFile = document.getElementById("editImagen").files[0];
    if (!nuevoNombre || !nuevoPrecio || !nuevaDescripcion || !nuevaCategoria) {
      showToast("⚠️ Todos los campos son obligatorios", "info");
      return;
    }

    if (!CATEGORIAS.includes(nuevaCategoria)) {
      showToast("⚠️ Categoría inválida", "error");
      return;
    }

    let nuevoImagenPath = imagenPath;
    let nuevaUrlImagen = null;
    if (nuevaImagenFile) {
      await supabase.storage.from("productosweb").remove([imagenPath]);
      const newFileName = `${Date.now()}_${nuevaImagenFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("productosweb")
        .upload(newFileName, nuevaImagenFile, { upsert: true });
      if (uploadError) {
        showToast("❌ Error al subir la nueva imagen", "error");
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("productosweb").getPublicUrl(newFileName);
      nuevaUrlImagen = publicUrlData.publicUrl;
      nuevoImagenPath = newFileName;
    }
    await actualizarProducto(id, nuevoNombre, nuevoPrecio, nuevaDescripcion, nuevaCategoria, nuevaUrlImagen, nuevoImagenPath, esPausado);
    modal.remove();
  };
};

async function actualizarProducto(
  id,
  nombre,
  precio,
  descripcion,
  categoria,
  imagenUrl = null,
  imagenPath,
  esPausado = false
) {
  try {
    mostrarLoader();

    const tabla = esPausado ? "productos_pausados" : "productos_web";

    const datosActualizar = {
      nombre,
      precio,
      descripcion,
      categoria,
      imagen_path: imagenPath
    };

    if (imagenUrl) {
      datosActualizar.imagen_url = imagenUrl;
    }

    const { error } = await supabase
      .from(tabla)
      .update(datosActualizar)
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast("❌ Error al actualizar producto", "error");
      return;
    }

    showToast("✅ Producto actualizado correctamente", "success");
    await cargarProductos();
  } catch (err) {
    console.error("⚠️ Error inesperado:", err);
    showToast("❌ Ocurrió un error inesperado", "error");
  } finally {
    ocultarLoader();
  }
}

window.eliminarProducto = async function (id, imagenPath, esPausado = false) {
  const confirmar = await customConfirm("🗑️ ¿Eliminar este producto?");
  if (!confirmar) return;

  try {
    mostrarLoader();

    const tabla = esPausado ? "productos_pausados" : "productos_web";

    // 1️⃣ Eliminar imagen del storage
    if (imagenPath) {
      const { error: storageError } = await supabase
        .storage
        .from("productosweb")
        .remove([imagenPath]);

      if (storageError) {
        console.error(storageError);
        showToast("⚠️ No se pudo eliminar la imagen", "info");
      }
    }

    // 2️⃣ Eliminar registro de la tabla
    const { error } = await supabase
      .from(tabla)
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast("❌ Error al eliminar producto", "error");
      return;
    }

    showToast("🗑️ Producto eliminado correctamente", "success");
    await cargarProductos();

  } catch (err) {
    console.error("⚠️ Error inesperado:", err);
    showToast("❌ Ocurrió un error inesperado", "error");
  } finally {
    ocultarLoader();
  }
};


// 🔄 Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarCategoriasFormulario(); // 👈 ESTA LÍNEA
  cargarProductos();
});


// =========================
// Empresa - Información
// =========================

// Crear registro empresa (solo si no existe)
async function crearEmpresa(payload) {
  const user = (await supabase.auth.getUser()).data.user;
  payload.owner_id = user.id;

  const { data, error } = await supabase
    .from("empresa")
    .insert([payload])
    .select()
    .single();

  if (error) {
    showToast("❌ Error al crear empresa", "error");
    console.error(error);
    return null;
  }
  return data;
}

// Editar empresa
async function editarEmpresa(id, payload) {
  const { data, error } = await supabase
    .from("empresa")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    showToast("❌ Error al actualizar empresa", "error");
    console.error(error);
    return null;
  }
  return data;
}

// Guardar empresa (decide si crea o edita)
async function guardarEmpresa() {
  const id = document.getElementById("empresaId").value;
  const logoFile = document.getElementById("logoEmpresa").files[0];

  let logoUrl = null;
  let logoPath = null;

  try {
    mostrarLoader();

    // 📤 Subir logo si hay
    if (logoFile) {
      const fileName = `logo_${Date.now()}_${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("empresa")
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) {
        showToast("❌ Error al subir logo", "error");
        console.error(uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("empresa")
        .getPublicUrl(fileName);

      logoUrl = publicUrlData.publicUrl;
      logoPath = fileName;
    }

    // 👇 Procesar URL o iframe de Google Maps
    let mapsInput = document.getElementById("mapsEmpresa").value.trim();
    let mapsUrl = mapsInput;

    if (mapsInput.startsWith("<iframe")) {
      // Extraer solo el src
      const match = mapsInput.match(/src="([^"]+)"/);
      if (match && match[1]) {
        mapsUrl = match[1];
      }
    }

    // Payload
    const payload = {
      nombre_comercial: document.getElementById("nombreEmpresa").value,
      direccion: document.getElementById("direccionEmpresa").value,
      telefono: document.getElementById("telefonoEmpresa").value,
      whatsapp: document.getElementById("whatsappEmpresa").value,
      email: document.getElementById("emailEmpresa").value,
      horarios: document.getElementById("horariosEmpresa").value,
      facebook: document.getElementById("facebookEmpresa").value,
      instagram: document.getElementById("instagramEmpresa").value,
      tiktok: document.getElementById("tiktokEmpresa").value,
      maps_url: mapsUrl || "", // ✅ solo src o url limpio
      updated_at: new Date(),
    };

    if (logoUrl && logoPath) {
      payload.logo_url = logoUrl;
      payload.logo_path = logoPath;
    }

    let data;
    if (id) {
      data = await editarEmpresa(id, payload);
    } else {
      payload.created_at = new Date();
      data = await crearEmpresa(payload);
    }

    if (data) {
      document.getElementById("empresaId").value = data.id;
      if (data.logo_path) {
        document.getElementById("previewLogo").dataset.logoPath = data.logo_path;
      }
      showToast("✅ Empresa guardada correctamente", "success");
      cargarEmpresa();
    }
  } catch (err) {
    console.error("⚠️ Error al guardar empresa:", err);
    showToast("❌ Ocurrió un error al guardar empresa", "error");
  } finally {
    ocultarLoader();
  }
}

// 🗑️ Eliminar empresa con confirmación y loader
window.eliminarEmpresa = async function (id, logoPath) {
  if (!id) return;

  const confirmar = await customConfirm(
    "⚠️ ¿Seguro que deseas eliminar la empresa?"
  );
  if (!confirmar) {
    showToast("❎ Eliminación cancelada. La empresa sigue activa.", "info");
    return;
  }

  try {
    mostrarLoader();

    const { error } = await supabase.from("empresa").delete().eq("id", id);
    if (error) {
      showToast("❌ Error al eliminar empresa", "error");
      console.error(error);
      return;
    }

    if (logoPath) {
      await supabase.storage.from("empresa").remove([logoPath]);
    }

    showToast("✅ Empresa eliminada correctamente", "success");

    document.getElementById("formEmpresa").reset();
    document.getElementById("previewLogo").src = "";
    document.getElementById("empresaId").value = "";
    document.getElementById("previewLogo").dataset.logoPath = "";
    document.getElementById("formEmpresa").style.display = "block";
    document.getElementById("empresaPreview").style.display = "none";
  } catch (err) {
    console.error("⚠️ Error al eliminar empresa:", err);
    showToast("❌ Ocurrió un error al eliminar empresa", "error");
  } finally {
    ocultarLoader();
  }
};

// 📥 Cargar empresa (preview)
async function cargarEmpresa() {
  const { data, error } = await supabase
    .from("empresa")
    .select("*")
    .limit(1)
    .single();

  const form = document.getElementById("formEmpresa");
  const preview = document.getElementById("empresaPreview");

  if (error || !data) {
    form.style.display = "block";
    preview.style.display = "none";
    return;
  }

  document.getElementById("empresaId").value = data.id;
  if (data.logo_path) {
    document.getElementById("previewLogo").dataset.logoPath = data.logo_path;
  }

  form.style.display = "none";
  preview.style.display = "block";

  preview.innerHTML = `
    <div class="card">
      <h3>${data.nombre_comercial}</h3>
      <p><strong>Dirección:</strong> ${data.direccion || "-"}</p>
      <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>
      <p><strong>WhatsApp:</strong> ${data.whatsapp || "-"}</p>
      <p><strong>Email:</strong> ${data.email || "-"}</p>
      <p><strong>Horarios:</strong> ${data.horarios || "-"}</p>
      <p><strong>Facebook:</strong> ${data.facebook || "-"}</p>
      <p><strong>Instagram:</strong> ${data.instagram || "-"}</p>
      <p><strong>TikTok:</strong> ${data.tiktok || "-"}</p>
      ${
        data.maps_url
          ? `<div style="margin:10px 0;" id="mapContainer">
              <iframe id="mapFrame" src="${data.maps_url}" 
                width="100%" height="250" style="border:0; border-radius:8px;" 
                allowfullscreen="" loading="lazy"></iframe>
            </div>`
          : ""
      }
      ${
        data.logo_url
          ? `<img src="${data.logo_url}" style="max-width:150px; border-radius:8px;">`
          : ""
      }
      <div class="lista-botones">
        <button onclick="editarVistaEmpresa()">✏️ Editar</button>
        <button onclick="eliminarEmpresa('${data.id}', '${data.logo_path || ""}')" class="logout">🗑️ Eliminar</button>
      </div>
    </div>
  `;

  // ✅ Verificar si el iframe carga correctamente
  if (data.maps_url) {
    const iframe = document.getElementById("mapFrame");

    // Si no carga en 5s → mostrar toast
    setTimeout(() => {
      if (!iframe.contentWindow || iframe.contentWindow.length === 0) {
        showToast("⚠️ El mapa no pudo cargarse. Revisa tu conexión o bloqueador de anuncios.", "error");
      }
    }, 5000);

    // También escuchamos el evento onerror del iframe
    iframe.onerror = () => {
      showToast("⚠️ El mapa no pudo cargarse. Revisa tu conexión o bloqueador de anuncios.", "error");
    };
  }
}


// ✏️ Editar (muestra el form con datos)
window.editarVistaEmpresa = async function () {
  const id = document.getElementById("empresaId").value;
  const { data } = await supabase.from("empresa").select("*").eq("id", id).single();
  if (!data) return;

  document.getElementById("nombreEmpresa").value = data.nombre_comercial || "";
  document.getElementById("direccionEmpresa").value = data.direccion || "";
  document.getElementById("telefonoEmpresa").value = data.telefono || "";
  document.getElementById("whatsappEmpresa").value = data.whatsapp || "";
  document.getElementById("emailEmpresa").value = data.email || "";
  document.getElementById("horariosEmpresa").value = data.horarios || "";
  document.getElementById("facebookEmpresa").value = data.facebook || "";
  document.getElementById("instagramEmpresa").value = data.instagram || "";
  document.getElementById("tiktokEmpresa").value = data.tiktok || "";
  document.getElementById("mapsEmpresa").value = data.maps_url || "";
  document.getElementById("previewLogo").src = data.logo_url || "";

  document.getElementById("formEmpresa").style.display = "block";
  document.getElementById("empresaPreview").style.display = "none";
};

// =========================
// Eventos
// =========================
document
  .getElementById("guardarEmpresaBtn")
  .addEventListener("click", guardarEmpresa);

// Inicializar
cargarEmpresa();

// =========================
// Historia
// =========================

// ➕ Agregar nueva historia con loader
async function agregarHistoria() {
  const titulo = document.getElementById("tituloHistoria").value;
  const texto = document.getElementById("textoHistoria").value;
  const imagenFile = document.getElementById("imagenHistoria").files[0];

  let imagenUrl = null;
  let imagenPath = null;

  try {
    // Mostrar loader
    mostrarLoader();

    if (imagenFile) {
      const fileName = `historia_${Date.now()}_${imagenFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("historia")
        .upload(fileName, imagenFile, { upsert: true });

      if (uploadError) {
        showToast("❌ Error al subir imagen de historia", "error");
        console.error(uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("historia")
        .getPublicUrl(fileName);

      imagenUrl = publicUrlData.publicUrl;
      imagenPath = fileName;
    }

    const payload = {
      titulo,
      texto,
      imagen_url: imagenUrl,
      imagen_path: imagenPath,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await supabase.from("historia").insert([payload]);
    if (error) {
   showToast("❌ Error al guardar historia", "error");
      console.error(error);
      return;
    }

    showToast("✅ Historia agregada correctamente", "success");
    limpiarFormularioHistoria();
    cargarHistorias();
  } catch (err) {
    console.error("⚠️ Error en agregarHistoria:", err);
    showToast("❌ Ocurrió un error al agregar historia", "error");
  } finally {
    // Ocultar loader
    ocultarLoader();
  }
}

// Listar historias en el panel
async function cargarHistorias() {
  const { data, error } = await supabase
    .from("historia")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const lista = document.getElementById("listaHistorias");
  lista.innerHTML = "";

  data.forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${h.titulo}</strong>
        <p>${h.texto || ""}</p>
        ${h.imagen_url ? `<img src="${h.imagen_url}" alt="Historia" style="max-width:150px;">` : ""}
      </div>
      <div class="lista-botones">
        <button data-action="edit" data-id="${h.id}">✏️ Editar</button>
        <button data-action="delete" data-id="${h.id}">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(li);
  });
}

// 🗑️ Eliminar historia con confirmación y loader
async function eliminarHistoria(id) {
  if (!id) {
    ashowToast("⚠️ No se encontró la historia a eliminar.", "info");
    return;
  }

    const confirmar = await customConfirm("⚠️ ¿Seguro que deseas eliminar esta historia?");
  if (!confirmar) {
    showToast("❎ Eliminación cancelada. La historia sigue registrada.", "info");
    return;
  }

  try {
    // Mostrar loader
    mostrarLoader();

    const { error } = await supabase.from("historia").delete().eq("id", id);
    if (error) {
     showToast("❌ Error al eliminar historia", "error");

      console.error(error);
      return;
    }

    showToast("✅ Historia eliminada correctamente", "success");
    cargarHistorias();
  } catch (err) {
    console.error("⚠️ Error en eliminarHistoria:", err);
    showToast("❌ Ocurrió un error al eliminar historia", "error");
  } finally {
    // Ocultar loader
    ocultarLoader();
  }
}


// Cargar historia en el formulario para editar
// ✏️ Modal para editar historia
async function editarHistoria(id) {
  const { data, error } = await supabase
    .from("historia")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
   showToast("❌ Error al cargar historia para edición", "error");
    console.error(error);
    return;
  }

  // Crear modal
  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Editar Historia</h3>

      <label>Título:</label>
      <input id="editTituloHistoria" type="text" value="${data.titulo || ""}">

      <label>Texto:</label>
      <textarea id="editTextoHistoria">${data.texto || ""}</textarea>

      <label>Imagen actual:</label>
      ${data.imagen_url ? `<img src="${data.imagen_url}" style="max-width:100%; border-radius:8px; margin-bottom:10px;">` : "<p>Sin imagen</p>"}

      <label>Cambiar imagen:</label>
      <input type="file" id="editImagenHistoria" accept="image/*">

      <div class="modal-actions">
        <button id="guardarEdicionHistoria" style="background:#42a5f5; color:#fff;">Guardar</button>
        <button id="cancelarEdicionHistoria" style="background:#ef5350; color:#fff;">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Botón cancelar
  document.getElementById("cancelarEdicionHistoria").onclick = () => modal.remove();

  // Botón guardar
  document.getElementById("guardarEdicionHistoria").onclick = async () => {
    const payload = {
      titulo: document.getElementById("editTituloHistoria").value,
      texto: document.getElementById("editTextoHistoria").value,
      updated_at: new Date(),
    };

    const newImgFile = document.getElementById("editImagenHistoria").files[0];
    if (newImgFile) {
      // borrar imagen anterior si había
      if (data.imagen_path) {
        await supabase.storage.from("historia").remove([data.imagen_path]);
      }

      const newFileName = `historia_${Date.now()}_${newImgFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("historia")
        .upload(newFileName, newImgFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("historia")
          .getPublicUrl(newFileName);
        payload.imagen_url = publicUrlData.publicUrl;
        payload.imagen_path = newFileName;
      }
    }

    const { error: updateError } = await supabase
      .from("historia")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      showToast("❌ Error al actualizar historia", "error");
      console.error(updateError);
      return;
    }

    showToast("✅ Historia actualizada correctamente", "success");
    modal.remove();
    cargarHistorias();
  };
}


// Función para limpiar formulario
function limpiarFormularioHistoria() {
  document.getElementById("tituloHistoria").value = "";
  document.getElementById("textoHistoria").value = "";
  document.getElementById("imagenHistoria").value = "";
  document.getElementById("previewHistoria").src = "";
  document.getElementById("historiaId").value = "";

  document.getElementById("agregarHistoriaBtn").style.display = "inline-block";
  document.getElementById("guardarEdicionHistoriaBtn").style.display = "none";
}

// =========================
// Eventos de botones
// =========================
document.getElementById("agregarHistoriaBtn").addEventListener("click", agregarHistoria);


// Delegación de eventos para Editar / Eliminar en la lista
document.getElementById("listaHistorias").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "edit") editarHistoria(id);
  if (btn.dataset.action === "delete") eliminarHistoria(id);
});

// Al cargar, mostrar historias
cargarHistorias();

// =========================
// Equipo / Cocineros
// =========================

// --- Fallback por si el loader no existe ---
window.mostrarLoader = window.mostrarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.add("show");
};
window.ocultarLoader = window.ocultarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.remove("show");
};

// ➕ Agregar nuevo miembro con loader
async function agregarMiembro() {
  const nombre = document.getElementById("nombreMiembro").value;
  const puesto = document.getElementById("puestoMiembro").value;
  const descripcion = document.getElementById("descripcionMiembro").value;
  const fotoFile = document.getElementById("fotoMiembro").files[0];

  let fotoUrl = null;
  let fotoPath = null;

  try {
    mostrarLoader();

    if (fotoFile) {
      const fileName = `equipo_${Date.now()}_${fotoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("equipo")
        .upload(fileName, fotoFile, { upsert: true });

      if (uploadError) {
        showToast("❌ Error al subir foto del miembro", "error");
        console.error(uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("equipo")
        .getPublicUrl(fileName);

      fotoUrl = publicUrlData.publicUrl;
      fotoPath = fileName;
    }

    const payload = {
      nombre,
      puesto,
      descripcion,
      foto_url: fotoUrl,
      foto_path: fotoPath,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await supabase.from("equipo").insert([payload]);
    if (error) {
      showToast("❌ Error al guardar miembro", "error");
      console.error(error);
      return;
    }

    showToast("✅ Miembro agregado correctamente", "success");
    limpiarFormularioEquipo();
    cargarEquipo();
  } catch (err) {
    console.error("⚠️ Error en agregarMiembro:", err);
    showToast("❌ Ocurrió un error al agregar miembro", "error");
  } finally {
    ocultarLoader();
  }
}

// 📋 Listar equipo en el panel
async function cargarEquipo() {
  const { data, error } = await supabase
    .from("equipo")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const lista = document.getElementById("listaEquipo");
  lista.innerHTML = "";

  data.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${m.nombre}</strong> - <em>${m.puesto}</em>
        <p>${m.descripcion || ""}</p>
        ${m.foto_url ? `<img src="${m.foto_url}" alt="Foto" style="max-width:120px;">` : ""}
      </div>
      <div class="lista-botones">
        <button class="btnEditar" data-id="${m.id}">✏️ Editar</button>
        <button class="btnEliminar" data-id="${m.id}">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(li);
  });

  // Reasignar eventos
  document.querySelectorAll(".btnEditar").forEach(btn => {
    btn.addEventListener("click", () => editarMiembro(btn.dataset.id));
  });
  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", () => eliminarMiembro(btn.dataset.id));
  });
}

// 🗑️ Eliminar miembro con confirmación y loader
async function eliminarMiembro(id) {
  if (!id) {
    showToast("⚠️ No se encontró el miembro a eliminar.", "info");
    return;
  }

  const confirmar = await customConfirm("⚠️ ¿Seguro que deseas eliminar este miembro del equipo?");
  if (!confirmar) {
    showToast("❎ Eliminación cancelada. El miembro sigue registrado.", "info");
    return;
  }

  try {
    mostrarLoader();

    const { error } = await supabase.from("equipo").delete().eq("id", id);
    if (error) {
    showToast("❌ Error al eliminar miembro", "error");
      console.error(error);
      return;
    }

    showToast("✅ Miembro eliminado correctamente", "success");
    cargarEquipo();
  } catch (err) {
    console.error("⚠️ Error en eliminarMiembro:", err);
    showToast("❌ Ocurrió un error al eliminar miembro", "error");
  } finally {
    ocultarLoader();
  }
}

// ✏️ Editar miembro con modal
async function editarMiembro(id) {
  const { data, error } = await supabase.from("equipo").select("*").eq("id", id).single();
  if (error) {
    showToast("❌ Error al cargar miembro", "error");
    console.error(error);
    return;
  }

  // Crear modal
  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Editar Miembro</h3>

      <label>Nombre:</label>
      <input id="editNombreMiembro" type="text" value="${data.nombre || ""}">

      <label>Puesto:</label>
      <input id="editPuestoMiembro" type="text" value="${data.puesto || ""}">

      <label>Descripción:</label>
      <textarea id="editDescripcionMiembro">${data.descripcion || ""}</textarea>

      <label>Foto actual:</label>
      ${data.foto_url ? `<img src="${data.foto_url}" style="max-width:120px; border-radius:8px; margin-bottom:10px;">` : "<p>Sin foto</p>"}

      <label>Cambiar foto:</label>
      <input type="file" id="editFotoMiembro" accept="image/*">

      <div class="modal-actions">
        <button id="guardarEdicionMiembro" style="background:#42a5f5; color:#fff;">Guardar</button>
        <button id="cancelarEdicionMiembro" style="background:#ef5350; color:#fff;">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Botón cancelar
  document.getElementById("cancelarEdicionMiembro").onclick = () => modal.remove();

  // Botón guardar
  document.getElementById("guardarEdicionMiembro").onclick = async () => {
    const payload = {
      nombre: document.getElementById("editNombreMiembro").value,
      puesto: document.getElementById("editPuestoMiembro").value,
      descripcion: document.getElementById("editDescripcionMiembro").value,
      updated_at: new Date(),
    };

    const newFotoFile = document.getElementById("editFotoMiembro").files[0];
    if (newFotoFile) {
      if (data.foto_path) {
        await supabase.storage.from("equipo").remove([data.foto_path]);
      }

      const newFileName = `equipo_${Date.now()}_${newFotoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("equipo")
        .upload(newFileName, newFotoFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("equipo")
          .getPublicUrl(newFileName);
        payload.foto_url = publicUrlData.publicUrl;
        payload.foto_path = newFileName;
      }
    }

    const { error: updateError } = await supabase
      .from("equipo")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      showToast("❌ Error al actualizar miembro", "error");
      console.error(updateError);
      return;
    }

    showToast("✅ Miembro actualizado correctamente", "success");
    modal.remove();
    cargarEquipo();
  };
}

// 🧹 Limpiar formulario
function limpiarFormularioEquipo() {
  const nombre = document.getElementById("nombreMiembro");
  const puesto = document.getElementById("puestoMiembro");
  const desc = document.getElementById("descripcionMiembro");
  const file = document.getElementById("fotoMiembro");
  const prev = document.getElementById("previewMiembro");
  const idInput = document.getElementById("equipoId");
  const btnGuardarEdicion = document.getElementById("guardarEdicionMiembroBtn");

  if (nombre) nombre.value = "";
  if (puesto) puesto.value = "";
  if (desc) desc.value = "";
  if (file) file.value = "";
  if (prev) prev.src = "";

  if (idInput) idInput.value = "";
  if (btnGuardarEdicion) btnGuardarEdicion.style.display = "none";

  const btnAgregar = document.getElementById("agregarMiembroBtn");
  if (btnAgregar) btnAgregar.style.display = "inline-block";
}

// 🚀 Enlazar botón Agregar Miembro al cargar
document.addEventListener("DOMContentLoaded", () => {
  const btnAgregar = document.getElementById("agregarMiembroBtn");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", async () => {
      btnAgregar.disabled = true;
      try {
        await agregarMiembro();
      } finally {
        btnAgregar.disabled = false;
      }
    });
  }

  // Preview de imagen
  const inputFoto = document.getElementById("fotoMiembro");
  const preview = document.getElementById("previewMiembro");
  if (inputFoto && preview) {
    inputFoto.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      preview.src = f ? URL.createObjectURL(f) : "";
    });
  }

  cargarEquipo();
});

// =========================
// Promociones
// =========================


// --- Fallback por si no existen funciones de loader global ---
window.mostrarLoader = window.mostrarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.add("show");
};
window.ocultarLoader = window.ocultarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.remove("show");
};

// =========================
// 🔥 Activar una promoción (solo UNA a la vez)
// =========================
async function activarPromocion(idPromo) {
  mostrarLoader();

  // 1. Obtener datos de la promoción
  const { data: promo, error: e1 } = await supabase
    .from("promociones")
    .select("*")
    .eq("id", idPromo)
    .single();

  if (e1 || !promo) {
    console.log("Error al leer promociones:", e1);
    showToast("❌ Error al obtener la promoción", "error");
    ocultarLoader();
    return;
  }

  // 2. Eliminar la promoción activa previa
  const { error: e2 } = await supabase
    .from("promocion_activa")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (e2) {
    console.log("Error eliminando previa:", e2);
    showToast("❌ No se pudo actualizar el estado", "error");
    ocultarLoader();
    return;
  }

  // 3. Insertar nueva activa
  const { error: e3 } = await supabase.from("promocion_activa").insert([{
    promo_id: promo.id,
    nombre: promo.nombre,
    precio: promo.precio,
    fecha_vigencia: promo.fecha_vigencia,
    foto_url: promo.foto_url,
    activo: true
  }]);

  if (e3) {
    console.log("Error insert:", e3);
    showToast("❌ Error al activar la promoción", "error");
  } else {
    showToast("🔥 Promoción activada exitosamente", "success");

    // ⛔🔥 ACTUALIZA TODO EN EL MOMENTO SIN RECARGAR
    await cargarPromos();
  }

  ocultarLoader();
}



// =========================
// ⛔ Suspender promoción
// =========================
async function suspenderPromocion(idPromo) {

  const { error } = await supabase
    .from("promocion_activa")
    .delete()
    .eq("promo_id", idPromo);

  if (error) {
    console.log("Error suspendiendo:", error);
    showToast("❌ No se pudo suspender la promoción", "error");
  } else {
    showToast("⛔ Promoción suspendida", "info");
    
    // 🔥 REFRESCAR LISTA DE PROMOS Y ESTADO SIN RECARGAR
    cargarPromos();
  }
}



// =========================
// ➕ Agregar nueva promoción
// =========================
async function agregarPromo() {
  const nombre = document.getElementById("nombrePromo").value;
  const precio = parseFloat(document.getElementById("precioPromo").value) || 0;
  const fechaVigencia = document.getElementById("fechaVigenciaPromo").value;
  const fotoFile = document.getElementById("fotoPromo").files[0];

  let fotoUrl = null;
  let fotoPath = null;

  try {
    mostrarLoader();

    // Subir imagen a Storage
    if (fotoFile) {
      const fileName = `promo_${Date.now()}_${fotoFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("promociones")
        .upload(fileName, fotoFile);

      if (uploadError) {
        console.error(uploadError);
        showToast("❌ Error al subir foto", "error");
        return;
      }

      fotoPath = fileName;
      fotoUrl = supabase.storage.from("promociones").getPublicUrl(fileName).data.publicUrl;
    }

    // Insertar promoción
    const { error } = await supabase.from("promociones").insert([
      {
        nombre,
        precio,
        fecha_vigencia: fechaVigencia,
        foto_url: fotoUrl,
        foto_path: fotoPath,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    if (error) {
      console.error(error);
      showToast("❌ Error al guardar promoción", "error");
      return;
    }

    showToast("✅ Promoción agregada correctamente", "success");
    limpiarFormularioPromo();
    cargarPromos();
  } catch (err) {
    console.error(err);
  } finally {
    ocultarLoader();
  }
}

// =========================
// 📋 Listar promociones con estado visual
// =========================
async function cargarPromos() {

  // 1. Obtener promoción activa
  const { data: activa } = await supabase
    .from("promocion_activa")
    .select("*")
    .single();

  // 2. Obtener todas las promociones
  const { data: promos, error } = await supabase
    .from("promociones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const lista = document.getElementById("listaPromos");
  const boxActiva = document.getElementById("promoActivaContainer");

  lista.innerHTML = "";
  boxActiva.innerHTML = "";

  // ============================
  // Mostrar promoción activa
  // ============================
  if (activa) {
    boxActiva.innerHTML = `
      <div class="promo-card">
        <strong>${activa.nombre}</strong> - S/ ${activa.precio}<br>
        Vigencia: ${activa.fecha_vigencia || "Sin fecha"}<br>
        ${activa.foto_url ? `<img src="${activa.foto_url}" style="max-width:120px;margin-top:5px;">` : ""}
        <div class="promo-activa-label">ACTIVA</div>
        <button 
          class="btn-suspender" 
          data-id="${activa.promo_id}"
          style="margin-top:8px;background:#fb8c00;color:white;"
        >
          ⛔ Suspender
        </button>
      </div>
    `;
  } else {
    boxActiva.innerHTML = `<em>No hay promoción activa</em>`;
  }

  // ============================
  // Listar las otras promociones
  // ============================
  promos.forEach((p) => {
    const esActiva = activa && activa.promo_id === p.id;

    // Si es la activa, NO se lista aquí
    if (esActiva) return;

    const li = document.createElement("li");
    li.classList.add("promo-card");

    li.innerHTML = `
      <strong>${p.nombre}</strong> - S/ ${p.precio.toFixed(2)}<br>
      Vigencia: ${p.fecha_vigencia || "Sin fecha"}<br>
      ${p.foto_url ? `<img src="${p.foto_url}" style="max-width:120px;margin-top:5px;">` : ""}
      <br><span style="font-size:12px;color:#666">ID: ${p.id}</span>
      
      <div class="lista-botones" style="margin-top:10px;">
        <button data-action="edit" data-id="${p.id}">✏️ Editar</button>
        <button data-action="delete" data-id="${p.id}">🗑️ Eliminar</button>

        <button 
          data-action="activar" 
          data-id="${p.id}"
          ${activa ? "disabled" : ""}
          style="background:#43a047;color:white;"
        >
          🔥 Activar
        </button>
      </div>
    `;

    lista.appendChild(li);
  });

  // ============================
  // Eventos
  // ============================
  document
    .querySelectorAll("button[data-action='edit']")
    .forEach((btn) => btn.addEventListener("click", () => editarPromo(btn.dataset.id)));

  document
    .querySelectorAll("button[data-action='delete']")
    .forEach((btn) => btn.addEventListener("click", () => eliminarPromo(btn.dataset.id)));

  document
    .querySelectorAll("button[data-action='activar']")
    .forEach((btn) => btn.addEventListener("click", () => activarPromocion(btn.dataset.id)));

  // botón suspender de la promoción activa
  const btnSusp = document.querySelector(".btn-suspender");
  if (btnSusp) {
    btnSusp.addEventListener("click", () => suspenderPromocion(btnSusp.dataset.id));
  }
}


// =========================
// 🗑️ Eliminar promoción
// =========================
async function eliminarPromo(id) {
  const confirmar = await customConfirm("¿Eliminar esta promoción?");

  if (!confirmar) return;

  const { error } = await supabase.from("promociones").delete().eq("id", id);

  if (error) {
    showToast("❌ Error al eliminar", "error");
    return;
  }

  showToast("🗑️ Eliminada correctamente", "success");
  cargarPromos();
}

// =========================
// ✏️ Editar promoción
// =========================
async function editarPromo(id) {
  const { data, error } = await supabase
    .from("promociones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showToast("❌ Error al cargar datos", "error");
    return;
  }

  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Editar Promoción</h3>

      <label>Nombre:</label>
      <input id="editNombrePromo" type="text" value="${data.nombre || ""}">
      
      <label>Precio:</label>
      <input id="editPrecioPromo" type="number" value="${data.precio || 0}">

      <label>Fecha vigencia:</label>
      <input id="editFechaVigenciaPromo" type="date" value="${data.fecha_vigencia || ""}">

      <label>Imagen:</label>
      ${data.foto_url ? `<img src="${data.foto_url}" style="max-width:120px;">` : ""}

      <input type="file" id="editFotoPromo" accept="image/*">

      <div class="modal-actions">
        <button id="guardarEdicionPromo" class="btn-save">Guardar</button>
        <button id="cancelarEdicionPromo" class="btn-cancel">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("cancelarEdicionPromo").onclick = () => modal.remove();

  document.getElementById("guardarEdicionPromo").onclick = async () => {
    try {
      mostrarLoader();

      const payload = {
        nombre: document.getElementById("editNombrePromo").value,
        precio: parseFloat(document.getElementById("editPrecioPromo").value) || 0,
        fecha_vigencia: document.getElementById("editFechaVigenciaPromo").value,
        updated_at: new Date()
      };

      const newFile = document.getElementById("editFotoPromo").files[0];

      if (newFile) {
        const fileName = `promo_${Date.now()}_${newFile.name}`;

        await supabase.storage.from("promociones").upload(fileName, newFile);

        payload.foto_url = supabase.storage.from("promociones").getPublicUrl(fileName).data.publicUrl;
        payload.foto_path = fileName;
      }

      await supabase.from("promociones").update(payload).eq("id", id);

      showToast("✅ Actualizado correctamente", "success");
      modal.remove();
      cargarPromos();

    } catch (err) {
      console.error(err);
      showToast("❌ Ocurrió un error", "error");
    } finally {
      ocultarLoader();
    }
  };
};

// =========================
// 🧹 Limpiar formulario
// =========================
function limpiarFormularioPromo() {
  document.getElementById("nombrePromo").value = "";
  document.getElementById("precioPromo").value = "";
  document.getElementById("fotoPromo").value = "";
  document.getElementById("previewPromo").src = "";
  document.getElementById("fechaVigenciaPromo").value = "";
}

// =========================
// Eventos Iniciales
// =========================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("agregarPromoBtn")?.addEventListener("click", agregarPromo);

  const inputFoto = document.getElementById("fotoPromo");
  if (inputFoto) {
    inputFoto.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      document.getElementById("previewPromo").src = f ? URL.createObjectURL(f) : "";
    });
  }

  cargarPromos();
});

// =========================
// Exponer funciones globales
// =========================
window.editarPromo = editarPromo;
window.eliminarPromo = eliminarPromo;

// =========================
// Testimonios
// =========================

// --- Fallback por si no existen funciones de loader global ---
window.mostrarLoader = window.mostrarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.add("show");
};
window.ocultarLoader = window.ocultarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.remove("show");
};

// ➕ Agregar nuevo testimonio con loader
async function agregarTestimonio() {
  const nombre = document.getElementById("nombreTestimonio").value;
  const opinion = document.getElementById("opinionTestimonio").value;
  const estrellas = parseInt(document.getElementById("estrellasTestimonio").value) || 0;

  if (estrellas < 1 || estrellas > 5) {
    showToast("⚠️ Las estrellas deben ser un número entre 1 y 5", "info");
    return;
  }

  try {
    mostrarLoader();

    const payload = {
      nombre,
      opinion,
      estrellas,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await supabase.from("testimonios").insert([payload]);
    if (error) {
      showToast("❌ Error al guardar testimonio", "error");
      console.error(error);
      return;
    }

    showToast("✅ Testimonio agregado correctamente", "success");
    limpiarFormularioTestimonio();
    cargarTestimonios();
  } catch (err) {
    console.error("⚠️ Error en agregarTestimonio:", err);
    showToast("❌ Ocurrió un error al guardar testimonio", "error");
  } finally {
    ocultarLoader();
  }
}

// 📋 Listar testimonios
async function cargarTestimonios() {
  const { data, error } = await supabase
    .from("testimonios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const lista = document.getElementById("listaTestimonios");
  lista.innerHTML = "";

  data.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${t.nombre}</strong> <br>
        "${t.opinion || ""}" <br>
        ⭐ ${"★".repeat(t.estrellas)}${"☆".repeat(5 - t.estrellas)}
      </div>
      <div class="lista-botones">
        <button data-action="edit" data-id="${t.id}">✏️ Editar</button>
        <button data-action="delete" data-id="${t.id}">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(li);
  });

  lista.querySelectorAll("button[data-action='edit']").forEach(btn =>
    btn.addEventListener("click", () => editarTestimonio(btn.dataset.id))
  );
  lista.querySelectorAll("button[data-action='delete']").forEach(btn =>
    btn.addEventListener("click", () => eliminarTestimonio(btn.dataset.id))
  );
}

// 🗑️ Eliminar testimonio con loader
async function eliminarTestimonio(id) {
  if (!id) {
    showToast("⚠️ No se encontró el testimonio a eliminar.", "info");
    return;
  }

   const confirmar = await customConfirm("⚠️ ¿Seguro que deseas eliminar este testimonio?");
  if (!confirmar) {
    showToast("❎ Eliminación cancelada. El testimonio sigue activo.", "info");
    return;
  }

  try {
    mostrarLoader();

    const { error } = await supabase.from("testimonios").delete().eq("id", id);
    if (error) {
      showToast("❌ Error al eliminar testimonio", "error");
      console.error(error);
      return;
    }

    showToast("✅ Testimonio eliminado correctamente", "success");
    cargarTestimonios();
  } catch (err) {
    console.error("⚠️ Error en eliminarTestimonio:", err);
    showToast("❌ Ocurrió un error al eliminar testimonio", "error");
  } finally {
    ocultarLoader();
  }
}

// ✏️ Editar testimonio con modal (sin loader)
async function editarTestimonio(id) {
  const { data, error } = await supabase
    .from("testimonios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showToast("❌ Error al cargar testimonio", "error");
    console.error(error);
    return;
  }

  // Crear modal
  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Editar Testimonio</h3>

      <label>Nombre:</label>
      <input id="editNombreTestimonio" type="text" value="${data.nombre || ""}">

      <label>Opinión:</label>
      <textarea id="editOpinionTestimonio">${data.opinion || ""}</textarea>

      <label>Estrellas (1-5):</label>
      <input id="editEstrellasTestimonio" type="number" min="1" max="5" value="${data.estrellas || 0}">

      <div class="modal-actions">
        <button id="guardarEdicionTestimonio" style="background:#42a5f5; color:#fff;">Guardar</button>
        <button id="cancelarEdicionTestimonio" style="background:#ef5350; color:#fff;">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Botón cancelar
  document.getElementById("cancelarEdicionTestimonio").onclick = () => modal.remove();

  // Botón guardar
  document.getElementById("guardarEdicionTestimonio").onclick = async () => {
    const estrellas = parseInt(document.getElementById("editEstrellasTestimonio").value) || 0;
    if (estrellas < 1 || estrellas > 5) {
      showToast("⚠️ Las estrellas deben estar entre 1 y 5", "info");
      return;
    }

    const payload = {
      nombre: document.getElementById("editNombreTestimonio").value,
      opinion: document.getElementById("editOpinionTestimonio").value,
      estrellas,
      updated_at: new Date(),
    };

    const { error: updateError } = await supabase
      .from("testimonios")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      showToast("❌ Error al actualizar testimonio", "error");
      console.error(updateError);
      return;
    }

    showToast("✅ Testimonio actualizado correctamente", "success");
    modal.remove();
    cargarTestimonios();
  };
}

// 🧹 Limpiar formulario
function limpiarFormularioTestimonio() {
  document.getElementById("nombreTestimonio").value = "";
  document.getElementById("opinionTestimonio").value = "";
  document.getElementById("estrellasTestimonio").value = "";
}

// =========================
// Eventos
// =========================
document.getElementById("agregarTestimonioBtn").addEventListener("click", async () => {
  const btn = document.getElementById("agregarTestimonioBtn");
  btn.disabled = true;
  try {
    await agregarTestimonio();
  } finally {
    btn.disabled = false;
  }
});

// =========================
// Noticias / Blog con Foto
// =========================

// --- Fallback por si no existen funciones de loader global ---
window.mostrarLoader = window.mostrarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.add("show");
};
window.ocultarLoader = window.ocultarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.remove("show");
};

// ➕ Agregar nueva noticia con loader
async function agregarNoticia() {
  const titulo = document.getElementById("tituloNoticia").value;
  const contenido = document.getElementById("contenidoNoticia").value;
  const fecha = document.getElementById("fechaNoticia").value;
  const autor = document.getElementById("autorNoticia").value;
  const imagenFile = document.getElementById("imagenNoticia").files[0];

  let imagenUrl = null;
  let imagenPath = null;

  try {
    mostrarLoader();

    if (imagenFile) {
      const fileName = `noticia_${Date.now()}_${imagenFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(fileName, imagenFile, { upsert: true });

      if (uploadError) {
       showToast("❌ Error al subir imagen", "error");
        console.error(uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("galeria")
        .getPublicUrl(fileName);

      imagenUrl = publicUrlData.publicUrl;
      imagenPath = fileName;
    }

    const payload = {
      titulo,
      contenido,
      fecha,
      autor,
      imagen_url: imagenUrl,
      imagen_path: imagenPath,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await supabase.from("galeria").insert([payload]);
    if (error) {
      showToast("❌ Error al guardar noticia", "error");
      console.error(error);
      return;
    }

    showToast("✅ Noticia agregada correctamente", "success");
    limpiarFormularioNoticia();
    cargarNoticias();
  } catch (err) {
    console.error("⚠️ Error en agregarNoticia:", err);
    showToast("❌ Ocurrió un error al guardar la noticia", "error");
  } finally {
    ocultarLoader();
  }
}

// 📋 Listar noticias
async function cargarNoticias() {
  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const lista = document.getElementById("listaNoticias");
  lista.innerHTML = "";

  data.forEach((n) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${n.titulo}</strong> <br>
        <em>${n.fecha || "Sin fecha"} - ${n.autor || "Anónimo"}</em> <br>
        ${n.imagen_url ? `<img src="${n.imagen_url}" alt="Noticia" style="max-width:150px;">` : ""}
        <p>${n.contenido || ""}</p>
      </div>
      <div class="lista-botones">
        <button data-action="edit" data-id="${n.id}">✏️ Editar</button>
        <button data-action="delete" data-id="${n.id}">🗑️ Eliminar</button>
      </div>
    `;
    lista.appendChild(li);
  });

  lista.querySelectorAll("button[data-action='edit']").forEach(btn =>
    btn.addEventListener("click", () => editarNoticia(btn.dataset.id))
  );
  lista.querySelectorAll("button[data-action='delete']").forEach(btn =>
    btn.addEventListener("click", () => eliminarNoticia(btn.dataset.id))
  );
}

// 🗑️ Eliminar noticia con loader
async function eliminarNoticia(id) {
  if (!id) {
    showToast("⚠️ No se encontró la noticia a eliminar.", "info");
    return;
  }

const confirmar = await customConfirm("⚠️ ¿Seguro que deseas eliminar esta noticia?");
  if (!confirmar) {
    showToast("❎ Eliminación cancelada. La noticia sigue activa.", "info");
    return;
  }

  try {
    mostrarLoader();

    const { error } = await supabase.from("galeria").delete().eq("id", id);
    if (error) {
      showToast("❌ Error al eliminar noticia", "error");
      console.error(error);
      return;
    }

    showToast("✅ Noticia eliminada correctamente", "success");
    cargarNoticias();
  } catch (err) {
    console.error("⚠️ Error en eliminarNoticia:", err);
    showToast("❌ Ocurrió un error al eliminar noticia", "error");
  } finally {
    ocultarLoader();
  }
}

// ✏️ Editar noticia con modal (sin loader)
async function editarNoticia(id) {
  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showToast("❌ Error al cargar noticia", "error");
    console.error(error);
    return;
  }

  // Crear modal
  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Editar Noticia</h3>

      <label>Título:</label>
      <input id="editTituloNoticia" type="text" value="${data.titulo || ""}">

      <label>Contenido:</label>
      <textarea id="editContenidoNoticia">${data.contenido || ""}</textarea>

      <label>Fecha:</label>
      <input id="editFechaNoticia" type="date" value="${data.fecha || ""}">

      <label>Autor:</label>
      <input id="editAutorNoticia" type="text" value="${data.autor || ""}">

      <label>Imagen actual:</label>
      ${data.imagen_url ? `<img src="${data.imagen_url}" style="max-width:150px; border-radius:8px; margin-bottom:10px;">` : "<p>Sin imagen</p>"}

      <label>Cambiar imagen:</label>
      <input type="file" id="editImagenNoticia" accept="image/*">

      <div class="modal-actions">
        <button id="guardarEdicionNoticia" style="background:#42a5f5; color:#fff;">Guardar</button>
        <button id="cancelarEdicionNoticia" style="background:#ef5350; color:#fff;">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Botón cancelar
  document.getElementById("cancelarEdicionNoticia").onclick = () => modal.remove();

  // Botón guardar
  document.getElementById("guardarEdicionNoticia").onclick = async () => {
    const payload = {
      titulo: document.getElementById("editTituloNoticia").value,
      contenido: document.getElementById("editContenidoNoticia").value,
      fecha: document.getElementById("editFechaNoticia").value,
      autor: document.getElementById("editAutorNoticia").value,
      updated_at: new Date(),
    };

    const newImagenFile = document.getElementById("editImagenNoticia").files[0];
    if (newImagenFile) {
      // borrar imagen anterior si existía
      if (data.imagen_path) {
        await supabase.storage.from("galeria").remove([data.imagen_path]);
      }

      const newFileName = `noticia_${Date.now()}_${newImagenFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(newFileName, newImagenFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("galeria")
          .getPublicUrl(newFileName);
        payload.imagen_url = publicUrlData.publicUrl;
        payload.imagen_path = newFileName;
      }
    }

    const { error: updateError } = await supabase
      .from("galeria")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      showToast("❌ Error al actualizar noticia", "error");
      console.error(updateError);
      return;
    }

    showToast("✅ Noticia actualizada correctamente", "success");
    modal.remove();
    cargarNoticias();
  };
}

// 🧹 Limpiar formulario (solo para agregar nuevas)
function limpiarFormularioNoticia() {
  document.getElementById("tituloNoticia").value = "";
  document.getElementById("contenidoNoticia").value = "";
  document.getElementById("fechaNoticia").value = "";
  document.getElementById("autorNoticia").value = "";
  document.getElementById("imagenNoticia").value = "";
  document.getElementById("previewNoticia").src = "";
}

// =========================
// Eventos
// =========================
document.getElementById("agregarNoticiaBtn").addEventListener("click", async () => {
  const btn = document.getElementById("agregarNoticiaBtn");
  btn.disabled = true;
  try {
    await agregarNoticia();
  } finally {
    btn.disabled = false;
  }
});

// Al cargar
cargarNoticias();


// =========================
// Configuraciones
// =========================

// --- Fallback del loader (por si no existen globalmente) ---
window.mostrarLoader = window.mostrarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.add("show");
};

window.ocultarLoader = window.ocultarLoader || function () {
  const el = document.getElementById("globalLoader");
  if (el) el.classList.remove("show");
};

// Cargar configuraciones (se llama al iniciar)
async function cargarConfiguraciones() {
  const { data, error } = await supabase
    .from("configuraciones")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error(error);
    return;
  }

  if (data) {
    // rellenar valores
    document.getElementById("colorPrimario").value = data.color_primario || "#000000";
    document.getElementById("colorSecundario").value = data.color_secundario || "#ffffff";
    document.getElementById("textoFooter").value = data.texto_footer || "";
    document.getElementById("avisoPrivacidad").value = data.aviso_privacidad || "";
    document.getElementById("terminosCondiciones").value = data.terminos_condiciones || "";
    document.getElementById("configId").value = data.id;

    // actualizar previews de colores
    document.getElementById("previewPrimario").style.background = data.color_primario;
    document.getElementById("previewSecundario").style.background = data.color_secundario;

    // deshabilitar inputs
    document.querySelectorAll("#config input, #config textarea").forEach(el => el.disabled = true);

    // ocultar formulario y mostrar vista previa
    document.querySelector("#config .form-group").style.display = "none";
    document.getElementById("configPreview").style.display = "block";

document.getElementById("configPreview").innerHTML = `
  <div style="margin-top:15px; padding:10px; border:1px solid #ccc; border-radius:8px;">
    <h3>Vista Previa Configuración</h3>
    <p><strong>Color Primario:</strong> 
      <span style="background:${data.color_primario}; padding:3px 15px; border-radius:4px;"></span>
    </p>
    <p><strong>Color Secundario:</strong> 
      <span style="background:${data.color_secundario}; padding:3px 15px; border-radius:4px;"></span>
    </p>
    <p><strong>Texto Footer:</strong> ${data.texto_footer || "-"}</p>
    <p><strong>Aviso de Privacidad:</strong> ${data.aviso_privacidad || "-"}</p>
    <p><strong>Términos y Condiciones:</strong> ${data.terminos_condiciones || "-"}</p>
  </div>
`;

    // mostrar solo editar / eliminar
    document.getElementById("guardarConfigBtn").style.display = "none";
    document.getElementById("editarConfigBtn").style.display = "inline-block";
    document.getElementById("eliminarConfigBtn").style.display = "inline-block";
  } else {
    limpiarFormularioConfiguracion();
    document.querySelectorAll("#config input, #config textarea").forEach(el => el.disabled = false);
    document.querySelector("#config .form-group").style.display = "block";
    document.getElementById("configPreview").style.display = "none";
    document.getElementById("guardarConfigBtn").style.display = "inline-block";
    document.getElementById("editarConfigBtn").style.display = "none";
    document.getElementById("eliminarConfigBtn").style.display = "none";
  }
}

// 💾 Guardar configuraciones con loader
async function guardarConfiguraciones() {
  const id = document.getElementById("configId").value;

  const payload = {
    color_primario: document.getElementById("colorPrimario").value,
    color_secundario: document.getElementById("colorSecundario").value,
    texto_footer: document.getElementById("textoFooter").value,
    aviso_privacidad: document.getElementById("avisoPrivacidad").value,
    terminos_condiciones: document.getElementById("terminosCondiciones").value,
    updated_at: new Date(),
  };

  try {
    mostrarLoader();

    let error;
    if (id) {
      ({ error } = await supabase
        .from("configuraciones")
        .update(payload)
        .eq("id", id));
    } else {
      payload.created_at = new Date();
      const { data, error: insertError } = await supabase
        .from("configuraciones")
        .insert([payload])
        .select()
        .single();

      error = insertError;
      if (data) document.getElementById("configId").value = data.id;
    }

    if (error) {
      showToast("❌ Error al guardar configuraciones", "error");
      console.error(error);
      return;
    }

    showToast("✅ Configuración guardada correctamente", "success");

    document.querySelectorAll("#config input, #config textarea").forEach(el => el.disabled = true);
    cargarConfiguraciones();
  } catch (err) {
    console.error("⚠️ Error en guardarConfiguraciones:", err);
    showToast("❌ Ocurrió un error al guardar configuración", "error");
  } finally {
    ocultarLoader();
  }
}

// ✏️ Editar configuraciones
async function editarConfiguraciones() {
  const id = document.getElementById("configId").value;
  if (!id) {
    showToast("⚠️ No se encontró la configuración para editar", "info");
    return;
  }

  document.querySelectorAll("#config input, #config textarea").forEach(el => el.disabled = false);
  document.querySelector("#config .form-group").style.display = "block";
  document.getElementById("configPreview").style.display = "none";

  document.getElementById("guardarConfigBtn").style.display = "inline-block";
  document.getElementById("editarConfigBtn").style.display = "none";
}

// 🗑️ Eliminar configuraciones
async function eliminarConfiguraciones() {
  const id = document.getElementById("configId").value;
  if (!id) {
    showToast("⚠️ No hay configuración para eliminar", "info");
    return;
  }

  const confirmar = await customConfirm("⚠️ ¿Seguro que deseas eliminar esta configuración?");
  if (!confirmar) {
    showToast("❎ Eliminación cancelada. La configuración sigue activa.", "info");
    return;
  }

  try {
    mostrarLoader();

    const { error } = await supabase
      .from("configuraciones")
      .delete()
      .eq("id", id);

    if (error) {
      showToast("❌ Error al eliminar configuración", "error");
      console.error(error);
      return;
    }

    showToast("✅ Configuración eliminada correctamente", "success");

    limpiarFormularioConfiguracion();
    document.querySelectorAll("#config input, #config textarea").forEach(el => el.disabled = false);
    document.querySelector("#config .form-group").style.display = "block";
    document.getElementById("configPreview").style.display = "none";
    document.getElementById("guardarConfigBtn").style.display = "inline-block";
    document.getElementById("editarConfigBtn").style.display = "none";
    document.getElementById("eliminarConfigBtn").style.display = "none";
  } catch (err) {
    console.error("⚠️ Error en eliminarConfiguraciones:", err);
    showToast("❌ Ocurrió un error al eliminar configuración", "error");
  } finally {
    ocultarLoader();
  }
}

// Resetear formulario
function limpiarFormularioConfiguracion() {
  document.getElementById("colorPrimario").value = "#000000";
  document.getElementById("colorSecundario").value = "#ffffff";
  document.getElementById("textoFooter").value = "";
  document.getElementById("avisoPrivacidad").value = "";
  document.getElementById("terminosCondiciones").value = "";
  document.getElementById("configId").value = "";

  document.getElementById("previewPrimario").style.background = "#000000";
  document.getElementById("previewSecundario").style.background = "#ffffff";
}

// =========================
// Eventos Configuración
// =========================
document.getElementById("guardarConfigBtn").addEventListener("click", guardarConfiguraciones);
document.getElementById("editarConfigBtn").addEventListener("click", editarConfiguraciones);
document.getElementById("eliminarConfigBtn").addEventListener("click", eliminarConfiguraciones);

document.getElementById("colorPrimario").addEventListener("input", (e) => {
  document.getElementById("previewPrimario").style.background = e.target.value;
});

document.getElementById("colorSecundario").addEventListener("input", (e) => {
  document.getElementById("previewSecundario").style.background = e.target.value;
});

// =========================
// HORARIO (AISLADO)
// =========================

async function cargarHorario() {
  try {
    mostrarLoader();

    const { data, error } = await supabase
      .from("horario_atencion")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (!data) {
      activarEdicionHorario();
      return;
    }

    document.getElementById("horario_apertura").value = data.apertura;
    document.getElementById("horario_cierre").value = data.cierre;
    document.getElementById("horario_id").value = data.id;

    mostrarPreviewHorario(data);
    bloquearHorario();

  } finally {
    ocultarLoader();
  }
}

/* =========================
   FUNCIONES REEMPLAZADAS
   ========================= */

function mostrarPreviewHorario(data) {
  document.getElementById("preview_apertura").textContent = data.apertura;
  document.getElementById("preview_cierre").textContent = data.cierre;

  document.getElementById("horarioForm").style.display = "none";
  document.getElementById("horarioPreview").style.display = "block";
}

function bloquearHorario() {
  document.getElementById("horario_apertura").readOnly = true;
  document.getElementById("horario_cierre").readOnly = true;

  document.getElementById("horario_guardar").style.display = "none";
  document.getElementById("horario_editar").style.display = "inline-block";
}

function activarEdicionHorario() {
  document.getElementById("horario_apertura").readOnly = false;
  document.getElementById("horario_cierre").readOnly = false;

  document.getElementById("horarioForm").style.display = "block";
  document.getElementById("horarioPreview").style.display = "none";

  document.getElementById("horario_guardar").style.display = "inline-block";
  document.getElementById("horario_editar").style.display = "none";
}

/* ========================= */

async function guardarHorario() {
  const id = document.getElementById("horario_id").value;
  const apertura = parseInt(document.getElementById("horario_apertura").value);
  const cierre = parseInt(document.getElementById("horario_cierre").value);

  if (isNaN(apertura) || isNaN(cierre) || apertura >= cierre) {
    showToast("⚠️ Horario inválido", "info");
    return;
  }

  try {
    mostrarLoader();

    const payload = { apertura, cierre };

    let error;
    if (id) {
      ({ error } = await supabase
        .from("horario_atencion")
        .update(payload)
        .eq("id", id));
    } else {
      ({ error } = await supabase
        .from("horario_atencion")
        .insert([payload]));
    }

    if (error) {
      showToast("❌ Error al guardar horario", "error");
      return;
    }

    showToast("✅ Horario guardado", "success");
    cargarHorario();

  } finally {
    ocultarLoader();
  }
}

// Eventos
document.getElementById("horario_guardar").addEventListener("click", guardarHorario);
document.getElementById("horario_editar").addEventListener("click", activarEdicionHorario);

// Init
cargarHorario();

cargarConfiguraciones();











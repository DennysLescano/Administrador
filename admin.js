// --- Firebase & libs ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase, ref, get, set, remove, update
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const XLSX = window.XLSX;



// --- Configuración Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyAYXlV5SEgWfbRtacAEjec2Ve8x6hJtNBA",
  authDomain: "proyecto-restaurante-60eb0.firebaseapp.com",
  databaseURL: "https://proyecto-restaurante-60eb0-default-rtdb.firebaseio.com",
  projectId: "proyecto-restaurante-60eb0",
  storageBucket: "proyecto-restaurante-60eb0.appspot.com",
  messagingSenderId: "459872565031",
  appId: "1:459872565031:web:1633ecd0beb3c98a7c5b02"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// --- Elementos base del DOM 
const lista = document.getElementById("listaProductos");
const agregarBtn = document.getElementById("agregarBtn");
const editarBtn = document.getElementById("editarBtn");
const eliminarBtn = document.getElementById("eliminarBtn");
const historialBtn = document.getElementById("verHistorialBtn");
const exportarBtn = document.getElementById("exportarHistorialBtn");
const selectEditar = document.getElementById("selectEditar");
const selectEliminar = document.getElementById("selectEliminar");
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const logoutBtn = document.getElementById("logoutBtn");
const eliminarHistorialBtn = document.getElementById("eliminarHistorialBtn");

// --- NUEVOS elementos (se crean si no existen) ---
function ensureUI() {
  if (!adminSection) return;

  // Contenedor superior para búsqueda y orden
  let toolbar = document.getElementById("adminToolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.id = "adminToolbar";
    toolbar.style.display = "grid";
    toolbar.style.gridTemplateColumns = "1fr auto auto auto auto";
    toolbar.style.gap = "8px";
    toolbar.style.alignItems = "center";
    toolbar.style.marginBottom = "10px";
    adminSection.prepend(toolbar);
  }

  // Input búsqueda
  let searchInput = document.getElementById("searchInput");
  if (!searchInput) {
    searchInput = document.createElement("input");
    searchInput.id = "searchInput";
    searchInput.placeholder = "Buscar por nombre o categoría…";
    searchInput.autocomplete = "off";
    searchInput.style.padding = "8px";
    searchInput.style.border = "1px solid #ddd";
    searchInput.style.borderRadius = "8px";
    toolbar.appendChild(searchInput);
  }

  // Select de orden
  let sortSelect = document.getElementById("sortSelect");
  if (!sortSelect) {
    sortSelect = document.createElement("select");
    sortSelect.id = "sortSelect";
    sortSelect.style.padding = "8px";
    sortSelect.style.border = "1px solid #ddd";
    sortSelect.style.borderRadius = "8px";
    sortSelect.innerHTML = `
      <option value="nombre">Ordenar: Nombre (A-Z)</option>
      <option value="precio">Ordenar: Precio (desc)</option>
      <option value="categoria">Ordenar: Categoría (A-Z)</option>
    `;
    toolbar.appendChild(sortSelect);
  }

  // Botón Ranking
  let verRankingBtn = document.getElementById("verRankingBtn");
  if (!verRankingBtn) {
    verRankingBtn = document.createElement("button");
    verRankingBtn.id = "verRankingBtn";
    verRankingBtn.textContent = "Ver ranking más vendidos";
    styleButton(verRankingBtn);
    toolbar.appendChild(verRankingBtn);
  }

  // Botón Ganancias
  let verGananciasBtn = document.getElementById("verGananciasBtn");
  if (!verGananciasBtn) {
    verGananciasBtn = document.createElement("button");
    verGananciasBtn.id = "verGananciasBtn";
    verGananciasBtn.textContent = "Ver ganancias (barras)";
    styleButton(verGananciasBtn);
    toolbar.appendChild(verGananciasBtn);
  }

  // Botón Limpiar filtros
  let limpiarBtn = document.getElementById("limpiarFiltrosBtn");
  if (!limpiarBtn) {
    limpiarBtn = document.createElement("button");
    limpiarBtn.id = "limpiarFiltrosBtn";
    limpiarBtn.textContent = "Limpiar filtros";
    styleButton(limpiarBtn);
    toolbar.appendChild(limpiarBtn);
  }

  // Contenedor de paneles
  let paneles = document.getElementById("panelesAdmin");
  if (!paneles) {
    paneles = document.createElement("div");
    paneles.id = "panelesAdmin";
    paneles.style.display = "grid";
    paneles.style.gridTemplateColumns = "1fr 1fr";
    paneles.style.gap = "16px";
    paneles.style.marginTop = "10px";
    adminSection.appendChild(paneles);
  }

  // Panel Ranking
  let rankingPanel = document.getElementById("rankingPanel");
  if (!rankingPanel) {
    rankingPanel = document.createElement("div");
    rankingPanel.id = "rankingPanel";
    rankingPanel.style.border = "1px solid #eee";
    rankingPanel.style.borderRadius = "12px";
    rankingPanel.style.padding = "12px";
    rankingPanel.style.background = "#fff";
    rankingPanel.innerHTML = `
      <h3 style="margin-top:0">🏆 Productos más vendidos</h3>
      <div id="rankingLista">—</div>
      <canvas id="chartRanking" width="600" height="360" style="max-width:100%;"></canvas>
    `;
    paneles.appendChild(rankingPanel);
  } else {
    // Si el canvas no existe aún, lo añadimos
    if (!document.getElementById("chartRanking")) {
      const c = document.createElement("canvas");
      c.id = "chartRanking";
      c.width = 600; c.height = 360; c.style.maxWidth = "100%";
      rankingPanel.appendChild(c);
    }
  }

  // Panel Chart (Ganancias)
  let chartPanel = document.getElementById("chartPanel");
  if (!chartPanel) {
    chartPanel = document.createElement("div");
    chartPanel.id = "chartPanel";
    chartPanel.style.border = "1px solid #eee";
    chartPanel.style.borderRadius = "12px";
    chartPanel.style.padding = "12px";
    chartPanel.style.background = "#fff";
    chartPanel.innerHTML = `<h3 style="margin-top:0">💰 Ganancias</h3>
      <canvas id="chartGanancias" width="600" height="360" style="max-width:100%;"></canvas>`;
    paneles.appendChild(chartPanel);
  }

  return {
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    verRankingBtn: document.getElementById("verRankingBtn"),
    verGananciasBtn: document.getElementById("verGananciasBtn"),
    limpiarFiltrosBtn: document.getElementById("limpiarFiltrosBtn"),
    rankingLista: document.getElementById("rankingLista"),
    chartCanvas: document.getElementById("chartGanancias"),
    rankingCanvas: document.getElementById("chartRanking"),
  };
}

function styleButton(btn) {
  btn.style.padding = "8px 10px";
  btn.style.border = "1px solid #ddd";
  btn.style.borderRadius = "8px";
  btn.style.background = "#f8f8f8";
  btn.style.cursor = "pointer";
}

// --- Toast Notification (con estilos inyectados) ---
function injectToastStylesOnce() {
  if (document.getElementById("toastStyles")) return;
  const style = document.createElement("style");
  style.id = "toastStyles";
  style.textContent = `
  .toast {
    position: fixed;
    right: 16px;
    bottom: 16px;
    background: #222;
    color: #fff;
    padding: 10px 14px;
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.2);
    opacity: 0;
    transform: translateY(10px);
    animation: toast-in .2s ease forwards, toast-out .3s ease 2.7s forwards;
    z-index: 9999;
    font-size: 14px;
  }
  .toast.error{ background:#c0392b; }
  .toast.success{ background:#2ecc71; }
  @keyframes toast-in { to { opacity: 1; transform: translateY(0);} }
  @keyframes toast-out { to { opacity: 0; transform: translateY(10px);} }
  `;
  document.head.appendChild(style);
}
function showToast(message, type = "info") {
  // Crear contenedor si no existe
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Crear el toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Eliminar automáticamente al terminar animación
  toast.addEventListener("animationend", (e) => {
    if (e.animationName === "fadeOut") {
      toast.remove();
    }
  });
}

// --- Modal ---
function injectModalStylesOnce() {
  if (document.getElementById("modalStyles")) return;
  const style = document.createElement("style");
  style.id = "modalStyles";
  style.textContent = `
  .modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.25);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999; animation: modal-bg-in .2s ease;
  }
  @keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
  .modal-box {
    background: #fff; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,.18);
    padding: 28px 24px 18px 24px; min-width: 320px; max-width: 90vw;
    font-family: 'Segoe UI', Arial, sans-serif; position: relative;
    animation: modal-in .25s cubic-bezier(.4,0,.2,1);
  }
  @keyframes modal-in { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-box h2 { margin: 0 0 12px 0; font-size: 1.18em; }
  .modal-box input, .modal-box textarea {
    width: 100%; padding: 8px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #ddd;
    font-size: 1em; box-sizing: border-box;
  }
  .modal-box .modal-actions {
    display: flex; gap: 10px; justify-content: flex-end;
  }
  .modal-box button {
    padding: 7px 16px; border-radius: 8px; border: none; font-weight: 500;
    background: #3498db; color: #fff; cursor: pointer; font-size: 1em;
    transition: background .18s;
  }
  .modal-box button.cancel { background: #bbb; color: #222; }
  .modal-box button:hover:not(.cancel) { background: #217dbb; }
  .modal-box button.cancel:hover { background: #999; }
  `;
  document.head.appendChild(style);
}

// Modal flotante para ingresar texto
function showInputModal({ 
  title = "Ingresar dato", 
  fields = [{label:"Texto",type:"text",name:"valor"}], 
  okText = "Aceptar", 
  cancelText = "Cancelar" 
}) {
  injectModalStylesOnce();
  return new Promise((resolve, reject) => {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    const box = document.createElement("div");
    box.className = "modal-box";
    box.innerHTML = `<h2>${title}</h2>`;

    fields.forEach(f => {
      if (f.type === "textarea") {
        // Campo textarea
        box.innerHTML += `
          <label>${f.label}<br>
            <textarea name="${f.name}" rows="3">${f.value !== undefined ? f.value : ""}</textarea>
          </label>`;
      } else if (f.type === "select" && Array.isArray(f.options)) {
        // Campo select con opciones predefinidas
        const optionsHtml = f.options.map(o => 
          `<option value="${o.value}" ${f.value === o.value ? "selected" : ""}>${o.text}</option>`
        ).join("");
        box.innerHTML += `
          <label>${f.label}<br>
            <select name="${f.name}">
              ${optionsHtml}
            </select>
          </label>`;
      } else {
        // Campo input estándar (text, number, password, etc.)
        box.innerHTML += `
          <label>${f.label}<br>
            <input type="${f.type}" name="${f.name}" autocomplete="off" value="${f.value !== undefined ? f.value : ""}">
          </label>`;
      }
    });

    box.innerHTML += `
      <div class="modal-actions">
        <button class="cancel">${cancelText}</button>
        <button class="ok">${okText}</button>
      </div>
    `;
    bg.appendChild(box);
    document.body.appendChild(bg);

    // Focus primer campo
    setTimeout(() => {
      const first = box.querySelector("input,textarea,select");
      if (first) first.focus();
    }, 100);

    // Eventos
    box.querySelector(".ok").onclick = () => {
      const result = {};
      fields.forEach(f => {
        const el = box.querySelector(`[name="${f.name}"]`);
        result[f.name] = el ? el.value : "";
      });
      document.body.removeChild(bg);
      resolve(result);
    };
    box.querySelector(".cancel").onclick = () => {
      document.body.removeChild(bg);
      reject();
    };
    bg.onclick = e => { 
      if (e.target === bg) { 
        document.body.removeChild(bg); 
        reject(); 
      } 
    };
  });
}


// --- Estado en memoria ---
let productosCache = {}; // productos para filtros/orden

// --- Roles ---
function verificarRolAdmin(uid) {
  return get(ref(db, `roles/${uid}`)).then(s => s.exists() && s.val() === "admin");
}

// --- Render de productos con filtro/orden ---
function renderProductos(filtro = "", orden = "nombre") {
  const lista = document.getElementById("listaProductos");
  const selectEliminar = document.getElementById("selectEliminar");

  if (lista) lista.innerHTML = "";
  if (selectEliminar) selectEliminar.innerHTML = `<option value="">-- Selecciona un producto --</option>`;

  let arr = Object.entries(productosCache).map(([id, p]) => ({ id, ...p }));

  // Filtrar
  if (filtro) {
    const f = filtro.toLowerCase();
    arr = arr.filter(p =>
      (p.nombre || "").toLowerCase().includes(f) ||
      (p.categoria || "").toLowerCase().includes(f)
    );
  }

  // Ordenar
  arr.sort((a, b) => {
    if (orden === "precio") return (b.precio || 0) - (a.precio || 0);
    if (orden === "categoria") return (a.categoria || "").localeCompare(b.categoria || "");
    return (a.nombre || "").localeCompare(b.nombre || "");
  });

  // Render
  arr.forEach(p => {
    if (lista) {
      const li = document.createElement("li");
      li.textContent = `${p.nombre} - S/ ${p.precio} (${p.descripcion || ""}) [${p.categoria || "-"}]`;
      lista.appendChild(li);
    }

    if (selectEliminar) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre;
      selectEliminar.appendChild(opt);
    }
  });

  if (arr.length === 0 && lista) {
    const li = document.createElement("li");
    li.textContent = "No hay productos que coincidan con la búsqueda.";
    lista.appendChild(li);
  }
}

// --- Cargar productos ---
function mostrarProductos() {
  get(ref(db, "productos")).then(snapshot => {
    if (!snapshot.exists()) {
      lista.innerHTML = "<li>No hay productos registrados</li>";
      productosCache = {};
      return;
    }
    productosCache = snapshot.val() || {};
    const ui = ensureUI();
    const filtro = ui?.searchInput?.value || "";
    const orden = ui?.sortSelect?.value || "nombre";
    renderProductos(filtro, orden);
  });
}

// --- CRUD ---
// Función para abrir el selector de fechas y ejecutar la acción indicada
function abrirSelectorFechas(callback) {
  document.getElementById("fechaSelector").style.display = "flex"; // mostramos modal
  document.getElementById("fechaInicioInput").value = "";
  document.getElementById("fechaFinInput").value = "";

  // Al hacer clic en aplicar
  document.getElementById("aplicarFechasBtn").onclick = () => {
    const inicio = document.getElementById("fechaInicioInput").value;
    const fin = document.getElementById("fechaFinInput").value;
    if (!inicio || !fin) {
      showToast("⚠️ Debes seleccionar ambas fechas", "error");
      return;
    }
    document.getElementById("fechaSelector").style.display = "none";
    callback(inicio, fin);
  };

  // Al cancelar
  document.getElementById("cancelarFechasBtn").onclick = () => {
    document.getElementById("fechaSelector").style.display = "none";
  };
}
async function agregarProducto() {
  try {
    const datos = await showInputModal({
      title: "Agregar producto",
      fields: [
        { label: "Nombre del producto", type: "text", name: "nombre" },
        { label: "Precio", type: "number", name: "precio" },
        { label: "Descripción", type: "textarea", name: "descripcion" },
        { 
          label: "Categoría", 
          type: "select", 
          name: "categoria", 
          options: [
            { value: "plato", text: "Plato" },
            { value: "gaseosa", text: "Gaseosa" }
          ] 
        }
      ],
      okText: "Agregar"
    });

    if (!datos.nombre || !datos.precio || !datos.categoria) {
      return showToast("❌ Faltan datos", "error");
    }

    const precio = parseFloat(datos.precio);
    if (isNaN(precio)) return showToast("❌ Precio inválido", "error");

    const categoria = datos.categoria.toLowerCase();
    const id = datos.nombre.toLowerCase().replace(/\s+/g, "_");

    await set(ref(db, "productos/" + id), {
      nombre: datos.nombre,
      precio,
      descripcion: datos.descripcion,
      categoria
    });

    showToast("✅ Producto agregado", "success");
    mostrarProductos();
  } catch {
    showToast("⏹️ Operación cancelada", "info");
  }
}

// 🔍 Buscador dinámico de productos (compartido para editar y eliminar)
async function buscarProducto() {
  return new Promise((resolve, reject) => {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    const box = document.createElement("div");
    box.className = "modal-box";
    box.innerHTML = `
      <h2>Buscar producto</h2>
      <input type="text" id="buscarInputProducto" placeholder="Escribe el nombre..." 
             style="width:100%;padding:8px;margin-bottom:10px;">
      <ul id="listaResultados" 
          style="max-height:200px;overflow-y:auto;padding-left:0;list-style:none;margin:0;"></ul>
      <div class="modal-actions">
        <button class="cancel">Cancelar</button>
      </div>
    `;
    bg.appendChild(box);
    document.body.appendChild(bg);

    const input = box.querySelector("#buscarInputProducto");
    const lista = box.querySelector("#listaResultados");

    function actualizarLista(valor) {
      lista.innerHTML = "";
      const resultados = Object.keys(productosCache).filter(k =>
        productosCache[k].nombre.toLowerCase().includes(valor.toLowerCase())
      );
      if (resultados.length === 0) {
        lista.innerHTML = "<li style='padding:6px;'>Sin resultados</li>";
      } else {
        resultados.forEach(id => {
          const li = document.createElement("li");
          li.textContent = productosCache[id].nombre;
          li.style.padding = "6px";
          li.style.cursor = "pointer";
          li.onclick = () => {
            document.body.removeChild(bg);
            resolve(id);
          };
          lista.appendChild(li);
        });
      }
    }

    input.oninput = e => actualizarLista(e.target.value);
    actualizarLista(""); // mostrar todos al inicio

    box.querySelector(".cancel").onclick = () => {
      document.body.removeChild(bg);
      reject();
    };
    bg.onclick = e => { 
      if (e.target === bg) { 
        document.body.removeChild(bg); 
        reject(); 
      } 
    };
  });
}

// ✏️ Editar producto con buscador y select en categoría
async function editarProducto() {
  try {
    const id = await buscarProducto(); // 👈 ahora usamos el buscador
    if (!id) return showToast("⚠️ No se seleccionó producto", "error");

    const snapshot = await get(ref(db, "productos/" + id));
    if (!snapshot.exists()) return showToast("❌ Producto no encontrado", "error");

    const datos = snapshot.val();

    const editData = await showInputModal({
      title: "Editar producto",
      fields: [
        { label: "Nombre del producto", type: "text", name: "nombre", value: datos.nombre || "" },
        { label: "Precio", type: "number", name: "precio", value: datos.precio || "" },
        { label: "Descripción", type: "textarea", name: "descripcion", value: datos.descripcion || "" },
        { 
          label: "Categoría", 
          type: "select", 
          name: "categoria", 
          value: datos.categoria || "plato",
          options: [
            { value: "plato", text: "Plato" },
            { value: "gaseosa", text: "Gaseosa" }
          ]
        }
      ],
      okText: "Guardar cambios",
      cancelText: "Cancelar"
    });

    if (!editData.nombre || !editData.precio || !editData.categoria)
      return showToast("❌ Faltan datos", "error");

    const precio = parseFloat(editData.precio);
    if (isNaN(precio)) return showToast("❌ Precio inválido", "error");

    const categoria = editData.categoria.toLowerCase();
    const nuevoId = editData.nombre.toLowerCase().replace(/\s+/g, "_");

    const data = {
      nombre: editData.nombre,
      precio,
      descripcion: editData.descripcion,
      categoria
    };

    if (nuevoId !== id) {
      await remove(ref(db, "productos/" + id));
      await set(ref(db, "productos/" + nuevoId), data);
      showToast("✅ Producto editado");
    } else {
      await set(ref(db, "productos/" + id), data);
      showToast("✅ Producto actualizado");
    }

    mostrarProductos();
  } catch {
    showToast("⏹️ Edición cancelada", "info");
  }
}

// 🗑️ Eliminar producto con buscador y confirmación
async function eliminarProducto() {
  try {
    const id = await buscarProducto();
    if (!id) return showToast("⚠️ No se seleccionó producto", "error");

    const snapshot = await get(ref(db, "productos/" + id));
    const nombre = snapshot.exists() ? snapshot.val().nombre : "";

    injectModalStylesOnce();
    return new Promise((resolve, reject) => {
      const bg = document.createElement("div");
      bg.className = "modal-bg";
      const box = document.createElement("div");
      box.className = "modal-box";
      box.innerHTML = `
        <h2>Eliminar producto</h2>
        <p style="margin-bottom:18px;">
          ¿Seguro que deseas eliminar <b>${nombre || "este producto"}</b>?<br>
          Esta acción no se puede deshacer.
        </p>
        <div class="modal-actions">
          <button class="cancel">Cancelar</button>
          <button class="ok" style="background:#c0392b;">Eliminar producto</button>
        </div>
      `;
      bg.appendChild(box);
      document.body.appendChild(bg);

      box.querySelector(".ok").onclick = async () => {
        document.body.removeChild(bg);
        await remove(ref(db, "productos/" + id));
        showToast("✅ Producto eliminado");
        mostrarProductos();
        resolve();
      };
      box.querySelector(".cancel").onclick = () => {
        document.body.removeChild(bg);
        showToast("⏹️ Eliminación cancelada", "info");
        reject();
      };
      bg.onclick = e => { 
        if (e.target === bg) { 
          document.body.removeChild(bg); 
          showToast("⏹️ Eliminación cancelada", "info"); 
          reject(); 
        } 
      };
    });
  } catch {
    showToast("⏹️ Eliminación cancelada", "info");
  }
}


// === VER HISTORIAL CORREGIDO ===
function verHistorial(inicio, fin) {
  const inicioMs = new Date(inicio).getTime();
  const finMs = new Date(fin + "T23:59:59").getTime();

  get(ref(db, "historial")).then(snapshot => {
    injectModalStylesOnce();
    if (!snapshot.exists()) {
      const bg = document.createElement("div");
      bg.className = "modal-bg";
      const box = document.createElement("div");
      box.className = "modal-box";
      box.innerHTML = `
        <h2>📭 Historial de pedidos</h2>
        <p style="margin-bottom:18px;">No hay historial de pedidos en el rango seleccionado.</p>
        <div class="modal-actions">
          <button class="ok">Cerrar</button>
        </div>
      `;
      bg.appendChild(box);
      document.body.appendChild(bg);
      box.querySelector(".ok").onclick = () => document.body.removeChild(bg);
      bg.onclick = e => { if (e.target === bg) document.body.removeChild(bg); };
      return;
    }

    const historial = snapshot.val();
    let encontrados = 0;
    let html = `<div style="max-height:400px;overflow-y:auto;"><table style="width:100%;border-collapse:collapse;font-size:15px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;border-bottom:1px solid #eee;">Fecha</th>
          <th style="padding:8px;border-bottom:1px solid #eee;">Cliente / Mesa</th>
          <th style="padding:8px;border-bottom:1px solid #eee;">Mesero</th>
          <th style="padding:8px;border-bottom:1px solid #eee;">Productos</th>
          <th style="padding:8px;border-bottom:1px solid #eee;">Total</th>
        </tr>
      </thead>
      <tbody>
    `;

    Object.values(historial).forEach(pedido => {
      const fechaMs = Number(pedido.fecha || pedido.creadoEn || 0);
      if (fechaMs >= inicioMs && fechaMs <= finMs) {
        const fecha = new Date(fechaMs).toLocaleString();
        const clienteOMesa = pedido.cliente?.nombre || pedido.mesa || "—";
        const mesero = pedido.mesero || "N/A";

        const productos = (pedido.items || []).map(item => {
          const nombre = item.nombre || "Producto";
          const cantidad = item.cantidad || item.qty || 1;
          let txt = `<b>${nombre}</b> x${cantidad}`;
          if (item.comentario) txt += ` <span style="color:#888;">(${item.comentario})</span>`;
          return txt;
        }).join("<br>") || "(ninguno)";

        html += `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${fecha}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${clienteOMesa}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${mesero}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${productos}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">S/ ${(Number(pedido.total || 0)).toFixed(2)}</td>
          </tr>
        `;
        encontrados++;
      }
    });

    html += "</tbody></table></div>";

    if (encontrados === 0) {
      html = `<p style="margin-bottom:18px;">📭 No se encontraron pedidos en ese rango de fechas.</p>`;
    }

    const bg = document.createElement("div");
    bg.className = "modal-bg";
    const box = document.createElement("div");
    box.className = "modal-box";
    box.style.maxWidth = "700px";
    box.innerHTML = `
      <h2>📜 Historial de pedidos</h2>
      ${html}
      <div class="modal-actions">
        <button class="ok">Cerrar</button>
      </div>
    `;
    bg.appendChild(box);
    document.body.appendChild(bg);
    box.querySelector(".ok").onclick = () => document.body.removeChild(bg);
    bg.onclick = e => { if (e.target === bg) document.body.removeChild(bg); };
  });
}

// === EXPORTAR HISTORIAL CON DISEÑO PROFESIONAL ===
// === EXPORTAR HISTORIAL CON DISEÑO PROFESIONAL ===
async function exportarHistorial(inicio, fin) {
  const inicioLocal = new Date(`${inicio}T00:00:00`);
  const finLocal = new Date(`${fin}T23:59:59`);
  const inicioMs = inicioLocal.getTime();
  const finMs = finLocal.getTime();

  const snap = await get(ref(db, "historial"));
  if (!snap.exists()) return showToast("📭 No hay historial para exportar.", "error");

  const historial = snap.val();
  const datos = [];
  let totalGanado = 0;

  Object.entries(historial).forEach(([id, pedido]) => {
    const fechaMs = parseFechaSegura(
      pedido.fecha || pedido.completadoEn || pedido.creadoEn || pedido.actualizadoEn
    );
    if (!fechaMs || fechaMs < inicioMs || fechaMs > finMs) return;

    let tipoPedido = "Local";
    if (pedido.pagadoPor === "Division de cuenta") tipoPedido = "Local (División)";
    if (pedido.tipo_pedido === "online" || pedido.metodo_pago || pedido.cliente) tipoPedido = "Online";

    const fecha = new Date(fechaMs);
    const fechaFormateada = fecha.toLocaleDateString();
    const hora = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const metodo =
      pedido.metodo_pago ||
      pedido.metodoPago ||
      pedido.division?.detalle?.map(p => p.metodo).join(", ") ||
      pedido.verificacion?.metodo ||
      "Efectivo";

    const cliente = pedido.cliente?.nombre || pedido.nombreCliente || "";
    const mesa = pedido.mesa || "—";
    const mesero = pedido.mesero || pedido.actualizadoPor || "N/A";

    // 🔹 Mostrar total solo en la primera fila de cada pedido
    let mostrarTotal = true;

    (pedido.items || []).forEach(item => {
      const unit = Number(item.precio || item.price || 0);
      const cant = Number(item.cantidad || item.qty || 1);
      const subtotal = unit * cant;

      const fila = {
        "ID Pedido": id,
        "Tipo de pedido": tipoPedido,
        Fecha: fechaFormateada,
        Hora: hora,
        "Método de pago": metodo,
        Producto: item.nombre || "Producto",
        Cantidad: cant,
        "Precio Unitario": unit,
        Subtotal: subtotal,
        Comentario: item.comentario || "",
        "Total Pedido": mostrarTotal ? Number(pedido.total || 0) : "" // 👈 solo primera fila
      };

      if (tipoPedido.includes("Local")) {
        fila.Mesa = mesa;
        fila.Mesero = mesero;
      } else fila.Cliente = cliente || "Anónimo";

      datos.push(fila);
      mostrarTotal = false; // 🔸 después de la primera fila, no repetir total
    });

    totalGanado += Number(pedido.total || 0);
  });

  if (datos.length === 0) {
    showToast("📭 No se encontraron pedidos en ese rango de fechas.", "error");
    return;
  }

  // === Crear hoja con xlsx-js-style ===
  const hojaPedidos = XLSX.utils.json_to_sheet(datos);
  const cabecera = Object.keys(datos[0]);
  hojaPedidos["!cols"] = cabecera.map(col => ({ wch: Math.max(col.length + 2, 12) }));

  // 🟠 Estilo de cabecera
  cabecera.forEach((col, i) => {
    const cell = XLSX.utils.encode_cell({ c: i, r: 0 });
    if (hojaPedidos[cell]) {
      hojaPedidos[cell].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "E38B06" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "B0B0B0" } },
          bottom: { style: "thin", color: { rgb: "B0B0B0" } },
          left: { style: "thin", color: { rgb: "B0B0B0" } },
          right: { style: "thin", color: { rgb: "B0B0B0" } }
        }
      };
    }
  });

  // ⚪ Filas alternadas + negrita en Total Pedido
  for (let r = 1; r <= datos.length; r++) {
    const esPar = r % 2 === 0;
    cabecera.forEach((col, i) => {
      const cell = XLSX.utils.encode_cell({ c: i, r });
      if (hojaPedidos[cell]) {
        const base = {
          fill: { fgColor: { rgb: esPar ? "F9F9F9" : "FFFFFF" } },
          border: { bottom: { style: "thin", color: { rgb: "DDDDDD" } } },
          font: { color: { rgb: "333333" } }
        };
        if (col === "Total Pedido" && hojaPedidos[cell].v) {
          base.font = { bold: true, color: { rgb: "0A4D68" } };
          base.fill = { fgColor: { rgb: "E0F7FA" } };
        }
        hojaPedidos[cell].s = base;
      }
    });
  }

  // === Hoja resumen ===
  const totalPorTipo = {};
  const totalPorMetodo = {};
  datos.forEach(d => {
    if (typeof d["Total Pedido"] === "number") {
      totalPorTipo[d["Tipo de pedido"]] = (totalPorTipo[d["Tipo de pedido"]] || 0) + d["Total Pedido"];
      totalPorMetodo[d["Método de pago"]] = (totalPorMetodo[d["Método de pago"]] || 0) + d["Total Pedido"];
    }
  });

  const resumen = [
    ["Periodo Exportado", `${inicio} al ${fin}`],
    ["Total general", `S/ ${totalGanado.toFixed(2)}`],
    [],
    ["Totales por tipo de pedido:"],
    ...Object.entries(totalPorTipo).map(([k, v]) => [k, `S/ ${v.toFixed(2)}`]),
    [],
    ["Totales por método de pago:"],
    ...Object.entries(totalPorMetodo).map(([k, v]) => [k, `S/ ${v.toFixed(2)}`]),
    [],
    ["Fecha de exportación", new Date().toLocaleString()]
  ];

  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
  hojaResumen["!cols"] = [{ wch: 35 }, { wch: 25 }];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaPedidos, "Historial Detallado");
  XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");

  XLSX.writeFile(libro, `historial_detallado_${inicio}_a_${fin}.xlsx`);
  showToast("✅ Historial exportado con diseño profesional.", "success");
}


function parseFechaSegura(valor) {
  if (!valor) return null;
  let fechaMs = null;
  if (typeof valor === "number") fechaMs = valor < 2000000000 ? valor * 1000 : valor;
  else if (typeof valor === "string") {
    const parsed = Date.parse(valor);
    if (!isNaN(parsed)) fechaMs = parsed;
  }
  const ahora = Date.now();
  if (!fechaMs || isNaN(fechaMs)) return null;
  if (fechaMs > ahora + 2 * 24 * 60 * 60 * 1000) return null;
  if (fechaMs < 946684800000) return null;
  return fechaMs;
}




// === RANKING DE PRODUCTOS MÁS VENDIDOS (LOCAL + ONLINE) ===
async function verRankingMasVendidos(inicio, fin) {
  const inicioMs = new Date(inicio).getTime();
  const finMs = new Date(fin + "T23:59:59").getTime();
  const cont = document.getElementById("rankingLista");
  const chart = document.getElementById("chartRanking");

  const [snapLocal, snapOnline] = await Promise.all([
    get(ref(db, "historial")),
    get(ref(db, "historialOnline")).catch(() => get(ref(db, "pedidosOnline")))
  ]);

  if ((!snapLocal.exists() && !snapOnline.exists())) {
    if (cont) cont.textContent = "No hay historial disponible.";
    if (chart) chart.getContext("2d").clearRect(0, 0, chart.width, chart.height);
    return;
  }

  const historialLocal = snapLocal.exists() ? snapLocal.val() : {};
  const historialOnline = snapOnline.exists() ? snapOnline.val() : {};
  const conteo = {};

  const procesar = (pedido) => {
    const fecha = Number(pedido.fecha || pedido.creadoEn || 0);
    if (fecha >= inicioMs && fecha <= finMs) {
      (pedido.items || []).forEach(item => {
        const nombre = item.nombre || "—";
        const cant = Number(item.cantidad || item.qty || 0);
        conteo[nombre] = (conteo[nombre] || 0) + cant;
      });
    }
  };

  Object.values(historialLocal).forEach(procesar);
  Object.values(historialOnline).forEach(procesar);

  const ranking = Object.entries(conteo)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 20);

  if (!cont) return;
  if (ranking.length === 0) {
    cont.textContent = "No se encontraron ventas en el rango.";
    if (chart) chart.getContext("2d").clearRect(0, 0, chart.width, chart.height);
    return;
  }

  const ul = document.createElement("ol");
  ranking.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.nombre} — ${r.cantidad} vendidos`;
    ul.appendChild(li);
  });
  cont.innerHTML = "";
  cont.appendChild(ul);

  if (chart) {
    const labels = ranking.map(r => r.nombre);
    const values = ranking.map(r => r.cantidad);
    drawHorizontalBarChart(chart, labels, values, "Top Productos");
  }

  showToast("🏆 Ranking generado", "success");
}

// === REPORTE DE GANANCIAS (LOCAL + ONLINE) ===
async function verGanancias(inicio, fin) {
  const inicioMs = new Date(inicio).getTime();
  const finMs = new Date(fin + "T23:59:59").getTime();
  const chart = document.getElementById("chartGanancias");

  try {
    const [snapLocal, snapOnline] = await Promise.all([
      get(ref(db, "historial")),
      get(ref(db, "historialOnline")).catch(() => get(ref(db, "pedidosOnline")))
    ]);

    if (!snapLocal.exists() && !snapOnline.exists()) {
      drawHorizontalBarChart(chart, ["Sin datos"], [0], "Ganancias");
      showToast("📭 No hay historial", "error");
      return;
    }

    const historialLocal = snapLocal.exists() ? snapLocal.val() : {};
    const historialOnline = snapOnline.exists() ? snapOnline.val() : {};
    const buckets = {};

    const procesar = (pedido) => {
      const fecha = Number(pedido.fecha || pedido.creadoEn || 0);
      if (isNaN(fecha) || fecha < inicioMs || fecha > finMs) return;
      const label = new Date(fecha).toISOString().slice(0, 10);
      buckets[label] = (buckets[label] || 0) + Number(pedido.total || 0);
    };

    Object.values(historialLocal).forEach(procesar);
    Object.values(historialOnline).forEach(procesar);

    let labels = Object.keys(buckets).sort();
    let values = labels.map(l => Number(buckets[l].toFixed(2)));

    const MAX_BARS = 20;
    if (labels.length > MAX_BARS) {
      const grouped = {};
      labels.forEach((label, i) => {
        const month = label.slice(0, 7);
        grouped[month] = (grouped[month] || 0) + values[i];
      });
      labels = Object.keys(grouped);
      values = Object.values(grouped);
    }

    chart.height = Math.max(360, labels.length * 32);
    chart.parentElement.style.overflowY = "auto";
    chart.parentElement.style.maxHeight = "400px";

    if (labels.length === 0) {
      drawHorizontalBarChart(chart, ["Sin datos"], [0], "Ganancias");
      showToast("📭 No se encontraron datos en el rango", "error");
      return;
    }

    drawHorizontalBarChart(chart, labels, values, "Ganancias por Día");
    showToast("📊 Reporte generado", "success");
  } catch (error) {
    console.error("❌ Error obteniendo datos:", error);
    showToast("❌ Error al obtener ganancias", "error");
  }
}


// --- Dibujar gráfico horizontal mejorado ---
function drawHorizontalBarChart(canvas, labels, values, title = "Gráfico") {
  if (!canvas) return;

  // Limitar máximo de barras
  const MAX_BARS = 20;
  let displayLabels = labels;
  let displayValues = values;

  if (labels.length > MAX_BARS) {
    // Agrupar por nombre inicial si hay demasiados productos
    const grouped = {};
    labels.forEach((label, i) => {
      const key = label.slice(0, 10); // primeros 10 caracteres
      grouped[key] = (grouped[key] || 0) + values[i];
    });
    displayLabels = Object.keys(grouped);
    displayValues = Object.values(grouped);
  }

  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Fondo degradado
  const gradBg = ctx.createLinearGradient(0, 0, W, H);
  gradBg.addColorStop(0, "#e3f2fd");
  gradBg.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradBg;
  ctx.fillRect(0, 0, W, H);

  // Título
  ctx.fillStyle = "#1565c0";
  ctx.font = "bold 20px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, W / 2, 30);

  const margin = { top: 50, right: 20, bottom: 20, left: 140 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  const maxVal = Math.max(...displayValues, 0);
  const yStep = plotH / displayLabels.length;

  // Animación
  let progress = 0;
  const animationSteps = 40;

  function animate() {
    ctx.clearRect(margin.left, margin.top, plotW, plotH);

    displayLabels.forEach((label, i) => {
      const val = displayValues[i];
      const barLen = maxVal ? (val / maxVal) * plotW * progress : 0;
      const y = margin.top + i * yStep;

      // Gradiente barra
      const grad = ctx.createLinearGradient(margin.left, y, margin.left + barLen, y + yStep);
      grad.addColorStop(0, "#42a5f5");
      grad.addColorStop(1, "#1976d2");
      ctx.fillStyle = grad;

      // Bordes redondeados
      roundRect(ctx, margin.left, y + 6, barLen, yStep - 12, 8);

     // Valor al final (ajustado para no salirse del canvas)
ctx.fillStyle = "#1565c0";
ctx.font = "bold 13px 'Segoe UI', sans-serif";
ctx.textAlign = "left";
ctx.textBaseline = "middle";
let montoTexto = `${val}`;   // 👈 ahora solo el número
let textoX = margin.left + barLen + 8;

// Si el texto se sale del canvas, lo ponemos dentro de la barra
const textoWidth = ctx.measureText(montoTexto).width;
if (textoX + textoWidth > canvas.width - 20) {
  textoX = margin.left + barLen - textoWidth - 8;
  ctx.fillStyle = "#fff"; // Si está dentro de la barra, color blanco
}
ctx.fillText(montoTexto, textoX, y + yStep / 2);


      // Label Y
      ctx.textAlign = "right";
      ctx.fillStyle = "#34495e";
      ctx.font = "13px 'Segoe UI', sans-serif";
      ctx.fillText(label, margin.left - 10, y + yStep / 2);
    });

    if (progress < 1) {
      progress += 1 / animationSteps;
      requestAnimationFrame(animate);
    }
  }

  animate();

  // Tooltip
  canvas.onmousemove = function (e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = false;
    displayLabels.forEach((label, i) => {
      const val = displayValues[i];
      const barLen = maxVal ? (val / maxVal) * plotW : 0;
      const y = margin.top + i * yStep;
      if (mx > margin.left && mx < margin.left + barLen && my > y + 6 && my < y + yStep - 6) {
        canvas.title = `${label}: ${val} vendidos`;
        found = true;
      }
    });
    if (!found) canvas.title = "";
  };
}

// --- Dibujar gráfico de barras mejorado ---
function drawBarChart(canvas, labels, values, title = "Gráfico") {
  if (!canvas) return;

  // Limitar máximo de barras
  const MAX_BARS = 30;
  let displayLabels = labels;
  let displayValues = values;

  if (labels.length > MAX_BARS) {
    // Agrupar por mes si hay demasiados días
    const grouped = {};
    labels.forEach((label, i) => {
      const month = label.slice(0, 7); // YYYY-MM
      grouped[month] = (grouped[month] || 0) + values[i];
    });
    displayLabels = Object.keys(grouped);
    displayValues = Object.values(grouped);
  }

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Fondo degradado
  const gradBg = ctx.createLinearGradient(0, 0, 0, H);
  gradBg.addColorStop(0, "#e3f2fd");
  gradBg.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradBg;
  ctx.fillRect(0, 0, W, H);

  // Título
  ctx.fillStyle = "#1565c0";
  ctx.font = "bold 20px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, W / 2, 35);

  // Márgenes y área útil
  const margin = { top: 60, right: 20, bottom: 80, left: 70 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  // Ejes y grid
  const maxVal = Math.max(...displayValues, 0);
  const yMax = niceMax(maxVal);
  const yTicks = 5;

  ctx.strokeStyle = "#bbdefb";
  ctx.fillStyle = "#2c3e50";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = "13px 'Segoe UI', sans-serif";

  for (let i = 0; i <= yTicks; i++) {
    const y = margin.top + plotH - (i / yTicks) * plotH;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(W - margin.right, y);
    ctx.stroke();
    const val = (yMax * i / yTicks).toFixed(0);
    ctx.fillText(`S/ ${val}`, margin.left - 10, y);
  }

  // Animación de las barras
  let progress = 0;
  const animationSteps = 40;

  function animate() {
    ctx.clearRect(margin.left, margin.top, plotW, plotH);

    // Redibujar grid
    for (let i = 0; i <= yTicks; i++) {
      const y = margin.top + plotH - (i / yTicks) * plotH;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(W - margin.right, y);
      ctx.stroke();
    }

    const n = displayValues.length;
    const gap = 8;
    const barW = Math.max(16, (plotW - gap * (n + 1)) / n);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "12px 'Segoe UI', sans-serif";

    displayValues.forEach((v, i) => {
      const x = margin.left + gap + i * (barW + gap);
      const h = yMax ? (v / yMax) * plotH * progress : 0;
      const y = margin.top + plotH - h;

      // Gradiente barra
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, "#42a5f5");
      grad.addColorStop(1, "#1976d2");
      ctx.fillStyle = grad;

      // Bordes redondeados
      roundRect(ctx, x, y, barW, h, 8);

      // Valor arriba
      ctx.fillStyle = "#1565c0";
      ctx.font = "bold 12px 'Segoe UI', sans-serif";
      ctx.textBaseline = "bottom";
      ctx.fillText(`S/ ${v.toFixed(2)}`, x + barW / 2, y - 5);

      // Label X
      ctx.save();
      ctx.translate(x + barW / 2, H - margin.bottom + 8);
      ctx.rotate(-Math.PI / 6);
      ctx.textBaseline = "top";
      ctx.fillStyle = "#34495e";
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillText(displayLabels[i], 0, 0);
      ctx.restore();
    });

    if (progress < 1) {
      progress += 1 / animationSteps;
      requestAnimationFrame(animate);
    }
  }

  animate();

  // Tooltip
  canvas.onmousemove = function (e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = false;
    displayValues.forEach((v, i) => {
      const x = margin.left + gap + i * (barW + gap);
      const h = yMax ? (v / yMax) * plotH : 0;
      const y = margin.top + plotH - h;
      if (mx > x && mx < x + barW && my > y && my < y + h) {
        canvas.title = `${displayLabels[i]}: S/ ${v.toFixed(2)}`;
        found = true;
      }
    });
    if (!found) canvas.title = "";
  };
}

// Utilidad para dibujar rectángulos redondeados
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}



function niceMax(v) {
  if (v <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = Math.ceil(v / pow);
  if (n <= 2) return 2 * pow;
  if (n <= 5) return 5 * pow;
  return 10 * pow;
}

// -------------------- LOADER --------------------
function mostrarLoader(texto = "Cargando...") {
  const loader = document.getElementById("loaderOverlay");
  const textoLoader = document.getElementById("loaderTexto");

  if (loader) loader.style.display = "flex";
  if (textoLoader) textoLoader.textContent = texto;
}

function ocultarLoader() {
  const loader = document.getElementById("loaderOverlay");
  if (loader) loader.style.display = "none";
}

// -------------------- EVENTOS --------------------
function configurarEventos() {
  const ui = ensureUI();
  if (!ui) return;

  agregarBtn?.addEventListener("click", () => verificarPermiso(agregarProducto));
  editarBtn?.addEventListener("click", () => verificarPermiso(editarProducto));
  eliminarBtn?.addEventListener("click", () => verificarPermiso(eliminarProducto));
  historialBtn?.addEventListener("click", () => abrirSelectorFechas(verHistorial));
  exportarBtn?.addEventListener("click", () => abrirSelectorFechas(exportarHistorial));

  ui.searchInput?.addEventListener("input", () =>
    renderProductos(ui.searchInput.value, ui.sortSelect.value)
  );

  ui.sortSelect?.addEventListener("change", () =>
    renderProductos(ui.searchInput.value, ui.sortSelect.value)
  );

  ui.limpiarFiltrosBtn?.addEventListener("click", () => {
    ui.searchInput.value = "";
    ui.sortSelect.value = "nombre";
    renderProductos("", "nombre");
  });

  ui.verRankingBtn?.addEventListener("click", () =>
    abrirSelectorFechas(verRankingMasVendidos)
  );

  ui.verGananciasBtn?.addEventListener("click", () =>
    abrirSelectorFechas(verGanancias)
  );
}

// -------------------- PERMISOS --------------------
function verificarPermiso(accion) {
  const user = auth.currentUser;

  if (!user) {
    return showToast("❌ No estás autenticado", "error");
  }

  mostrarLoader("Verificando permisos...");

  verificarRolAdmin(user.uid)
    .then((esAdmin) => {
      if (!esAdmin) {
        showToast("🚫 No tienes permiso", "error");
        return;
      }
      accion();
    })
    .catch((error) => {
      console.error(error);
      showToast("❌ Error al verificar permisos", "error");
    })
    .finally(() => {
      ocultarLoader();
    });
}

// -------------------- LOGIN --------------------
loginBtn?.addEventListener("click", () => {
  const email = (emailInput?.value || "").trim();
  const password = passwordInput?.value || "";

  if (!email || !password) {
    return showToast("⚠️ Ingresa correo y contraseña", "error");
  }

  mostrarLoader("Iniciando sesión...");
  loginBtn.disabled = true;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      emailInput.value = "";
      passwordInput.value = "";
      showToast("✅ Sesión iniciada", "success");
    })
    .catch((e) => {
      console.error(e);
      showToast("❌ Credenciales incorrectas", "error");
    })
    .finally(() => {
      ocultarLoader();
      loginBtn.disabled = false;
    });
});

// -------------------- LOGOUT --------------------
logoutBtn?.addEventListener("click", () => {
  mostrarLoader("Cerrando sesión...");

  signOut(auth)
    .then(() => {
      showToast("✅ Sesión cerrada", "info");
    })
    .catch((e) => {
      console.error(e);
      showToast("❌ Error al cerrar sesión", "error");
    })
    .finally(() => {
      ocultarLoader();
    });
});

// -------------------- ESTADO DE SESIÓN --------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarLoader("Validando permisos...");

    verificarRolAdmin(user.uid)
      .then((esAdmin) => {
        if (esAdmin) {
          loginSection.style.display = "none";
          adminSection.style.display = "block";

          ensureUI();
          mostrarProductos();
          configurarEventos();
        } else {
          showToast("🚫 No tienes permisos de administrador", "error");
          signOut(auth);
        }
      })
      .catch((error) => {
        console.error(error);
        showToast("❌ Error al verificar permisos", "error");
      })
      .finally(() => {
        ocultarLoader();
      });

  } else {
    loginSection.style.display = "block";
    adminSection.style.display = "none";
  }
});
// --- Eliminar historial (rango) ---

if (eliminarHistorialBtn) {
  eliminarHistorialBtn.addEventListener("click", async () => {
    // Paso 1: Confirmación inicial
    const confirmarPrimero = await new Promise((resolve) => {
      injectModalStylesOnce();
      const bg = document.createElement("div");
      bg.className = "modal-bg";
      const box = document.createElement("div");
      box.className = "modal-box";
      box.innerHTML = `
        <h2>Eliminar historial (rango)</h2>
        <p style="margin-bottom:18px;">
          ⚠️ Esta acción eliminará pedidos en un rango de fechas.<br>
          <b>¿Deseas continuar?</b>
        </p>
        <div class="modal-actions">
          <button class="cancel">Cancelar</button>
          <button class="ok" style="background:#c0392b;">Continuar</button>
        </div>
      `;
      bg.appendChild(box);
      document.body.appendChild(bg);
      box.querySelector(".ok").onclick = () => { document.body.removeChild(bg); resolve(true); };
      box.querySelector(".cancel").onclick = () => { document.body.removeChild(bg); resolve(false); };
      bg.onclick = e => { if (e.target === bg) { document.body.removeChild(bg); resolve(false); } };
    });
    if (!confirmarPrimero) return;

    // Paso 2: Solicitar credenciales
    let credenciales;
    try {
      credenciales = await showInputModal({
        title: "Reautenticación requerida",
        fields: [
          { label: "Correo de administrador", type: "email", name: "email" },
          { label: "Contraseña", type: "password", name: "password" }
        ],
        okText: "Validar",
        cancelText: "Cancelar"
      });
    } catch {
      showToast("⏹️ Operación cancelada", "info");
      return;
    }
    if (!credenciales.email || !credenciales.password) {
      showToast("⚠️ Debes ingresar usuario y contraseña", "error");
      return;
    }

    // Paso 3: Reautenticar
    try {
      await signInWithEmailAndPassword(auth, credenciales.email, credenciales.password);
    } catch {
      showToast("❌ Credenciales incorrectas", "error");
      return;
    }

    // Paso 4: Seleccionar fechas
    abrirSelectorFechas(async (fechaInicio, fechaFin) => {
      // Paso 5: Confirmación final
      const confirmarFinal = await new Promise((resolve) => {
        injectModalStylesOnce();
        const bg = document.createElement("div");
        bg.className = "modal-bg";
        const box = document.createElement("div");
        box.className = "modal-box";
        box.innerHTML = `
          <h2>Confirmar eliminación</h2>
          <p style="margin-bottom:18px;">
            ¿Estás completamente seguro de eliminar el historial entre<br>
            <b>${fechaInicio}</b> y <b>${fechaFin}</b>?<br>
            <span style="color:#c0392b;">Esta acción no se puede deshacer.</span>
          </p>
          <div class="modal-actions">
            <button class="cancel">Cancelar</button>
            <button class="ok" style="background:#c0392b;">Eliminar historial</button>
          </div>
        `;
        bg.appendChild(box);
        document.body.appendChild(bg);
        box.querySelector(".ok").onclick = () => { document.body.removeChild(bg); resolve(true); };
        box.querySelector(".cancel").onclick = () => { document.body.removeChild(bg); resolve(false); };
        bg.onclick = e => { if (e.target === bg) { document.body.removeChild(bg); resolve(false); } };
      });
      if (!confirmarFinal) return;

      // Paso 6: Eliminar historial
      const inicioMs = new Date(fechaInicio).getTime();
      const finMs = new Date(fechaFin + "T23:59:59").getTime();

      get(ref(db, "historial")).then(snapshot => {
        if (!snapshot.exists()) {
          showToast("📭 No hay historial para eliminar", "error");
          return;
        }

        const historial = snapshot.val();
        const updatesData = {};
        let contador = 0;

        for (const key in historial) {
          const pedido = historial[key];
          const fechaMs = Number(pedido.fecha || 0);
          if (fechaMs >= inicioMs && fechaMs <= finMs) {
            updatesData[`historial/${key}`] = null;
            contador++;
          }
        }

        if (contador === 0) {
          showToast("📭 No se encontraron pedidos en el rango", "error");
          return;
        }

update(ref(db), updatesData)
  .then(() => {
    showToast(`✅ Se eliminaron ${contador} pedidos. Recuerda cerrar sesión si terminas de usar el panel.`, "success");
  })
  .catch(() => showToast("❌ Error al eliminar pedidos", "error"));
      });
    });
  });
}



const API_BASE = "http://localhost:3000/api";

const estadoPaciente = {
  usuario: null,
  sesiones: [],
  sesionSeleccionada: null,
  ejerciciosSesion: [],
  resultados: [],
  metricas: null,
  evolucion: [],
  perfil: null
};

function mostrarPantallaPaciente(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

function pintarMensaje(idContenedor, texto, tipo = "info") {
  const cont = document.getElementById(idContenedor);
  cont.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
}

async function loginPaciente() {
  const username = document.getElementById("paciente-username").value.trim();
  const password = document.getElementById("paciente-password").value.trim();

  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await resp.json();

    if (!resp.ok) {
      pintarMensaje("mensaje-login-paciente", data.mensaje || "No se pudo iniciar sesión", "error");
      return;
    }

    if (data.rol !== "paciente") {
      pintarMensaje("mensaje-login-paciente", "El usuario existe pero no tiene rol de paciente.", "error");
      return;
    }

    estadoPaciente.usuario = data;
    localStorage.setItem("speakmePaciente", JSON.stringify(data));

    await cargarPerfilPaciente();
    await cargarDatosPaciente();
    pintarMensaje("mensaje-login-paciente", "Login correcto. Ya puedes navegar por las pantallas.", "ok");
    mostrarPantallaPaciente("pantalla-home");
  } catch (error) {
    pintarMensaje("mensaje-login-paciente", "Error de conexión con el servidor.", "error");
  }
}

async function cargarPerfilPaciente() {
  if (!estadoPaciente.usuario) return;

  const usuariosResp = await fetch(`${API_BASE}/usuarios`);
  const usuarios = await usuariosResp.json();
  const usuarioCompleto = usuarios.find(u => u.username === estadoPaciente.usuario.username);

  if (!usuarioCompleto) return;

  const pacientesResp = await fetch(`${API_BASE}/pacientes`);
  const pacientes = await pacientesResp.json();
  const perfil = pacientes.find(p => p.id_usuario == usuarioCompleto.id_usuario || p.codigo_paciente === usuarioCompleto.username);

  estadoPaciente.perfil = perfil || null;

  document.getElementById("saludo-paciente").textContent =
    `Bienvenido/a ${estadoPaciente.usuario.nombre || ""}. Desde aquí puedes consultar tus sesiones, resultados y métricas.`;

  const perfilHtml = perfil ? `
    <p><strong>Código paciente:</strong> ${perfil.codigo_paciente}</p>
    <p><strong>Fecha nacimiento:</strong> ${perfil.fecha_nacimiento}</p>
    <p><strong>Sexo:</strong> ${perfil.sexo}</p>
    <p><strong>Diagnóstico principal:</strong> ${perfil.diagnostico_principal}</p>
    <p><strong>Nivel afasia:</strong> ${perfil.nivel_afasia}</p>
    <p><strong>Observaciones:</strong> ${perfil.observaciones || "Sin observaciones"}</p>
  ` : `<p>No se ha encontrado el perfil del paciente asociado a este usuario.</p>`;

  document.getElementById("perfil-paciente").innerHTML = perfilHtml;
}

async function cargarDatosPaciente() {
  if (!estadoPaciente.perfil) return;

  const idPaciente = estadoPaciente.perfil.id_paciente;

  await Promise.all([
    cargarSesionesPaciente(idPaciente),
    cargarResultadosPaciente(idPaciente),
    cargarMetricasPaciente(idPaciente)
  ]);

  pintarHomePaciente();
}

async function cargarSesionesPaciente(idPaciente) {
  try {
    const resp = await fetch(`${API_BASE}/sesiones/paciente/${idPaciente}`);
    const data = await resp.json();
    estadoPaciente.sesiones = Array.isArray(data) ? data : [];
    pintarSesionesPaciente();
    pintarHistorialSesionesPaciente();
  } catch (error) {
    document.getElementById("contenedor-sesiones-paciente").innerHTML = "<p>No se han podido cargar las sesiones.</p>";
  }
}

function pintarSesionesPaciente() {
  const cont = document.getElementById("contenedor-sesiones-paciente");
  if (!estadoPaciente.sesiones.length) {
    cont.innerHTML = "<p>No hay sesiones para este paciente.</p>";
    return;
  }

  cont.innerHTML = estadoPaciente.sesiones.map(s => `
    <div class="tarjeta">
      <p><strong>Sesión #${s.id_sesion}</strong></p>
      <p><strong>Fecha inicio:</strong> ${s.fecha_hora_inicio}</p>
      <p><strong>Estado:</strong> <span class="estado ${s.estado}">${s.estado}</span></p>
      <p><strong>Modo:</strong> ${s.modo}</p>
      <p><strong>Observaciones:</strong> ${s.observaciones || "Sin observaciones"}</p>
      <div class="fila-botones">
        <button class="boton" onclick="verDetalleSesionPaciente(${s.id_sesion})">Ver detalle</button>
        <button class="boton secundario" onclick="cargarEjerciciosDeSesionPaciente(${s.id_sesion})">Cargar ejercicios</button>
      </div>
    </div>
  `).join("");

  document.getElementById("kpi-sesiones-paciente").textContent = estadoPaciente.sesiones.length;
  document.getElementById("kpi-proxima-sesion").textContent = estadoPaciente.sesiones[0]?.id_sesion || "-";
}

async function verDetalleSesionPaciente(idSesion) {
  try {
    const resp = await fetch(`${API_BASE}/sesiones/${idSesion}`);
    const sesion = await resp.json();
    estadoPaciente.sesionSeleccionada = sesion;

    document.getElementById("detalle-sesion-paciente").innerHTML = `
      <p><strong>ID sesión:</strong> ${sesion.id_sesion}</p>
      <p><strong>Fecha inicio:</strong> ${sesion.fecha_hora_inicio}</p>
      <p><strong>Fecha fin:</strong> ${sesion.fecha_hora_fin || "Todavía no finalizada"}</p>
      <p><strong>Estado:</strong> <span class="estado ${sesion.estado}">${sesion.estado}</span></p>
      <p><strong>Modo:</strong> ${sesion.modo}</p>
      <p><strong>Observaciones:</strong> ${sesion.observaciones || "Sin observaciones"}</p>
      <div class="fila-botones">
        <button class="boton" onclick="cargarEjerciciosDeSesionPaciente(${sesion.id_sesion})">Ver ejercicios</button>
        <button class="boton secundario" onclick="mostrarPantallaPaciente('pantalla-ejercicio')">Ir a ejercicio</button>
      </div>
    `;

    mostrarPantallaPaciente("pantalla-detalle-sesion");
  } catch (error) {
    document.getElementById("detalle-sesion-paciente").innerHTML = "<p>No se ha podido cargar el detalle de la sesión.</p>";
  }
}

async function cargarEjerciciosDeSesionPaciente(idSesion) {
  try {
    const resp = await fetch(`${API_BASE}/sesiones/${idSesion}/ejercicios`);
    const ejercicios = await resp.json();
    estadoPaciente.ejerciciosSesion = Array.isArray(ejercicios) ? ejercicios : [];

    document.getElementById("ejercicios-sesion-paciente").innerHTML = estadoPaciente.ejerciciosSesion.length
      ? estadoPaciente.ejerciciosSesion.map(e => `
          <div class="tarjeta">
            <p><strong>Ejercicio:</strong> ${e.nombre || "Ejercicio"}</p>
            <p><strong>Orden:</strong> ${e.orden}</p>
            <p><strong>Tipo:</strong> ${e.tipo_ejercicio || "-"}</p>
            <p><strong>Texto estímulo:</strong> ${e.texto_estimulo || "-"}</p>
            <p><strong>Instrucción:</strong> ${e.instruccion || "-"}</p>
          </div>
        `).join("")
      : "<p>Esta sesión no tiene ejercicios asociados o el backend devuelve otro formato.</p>";

    construirResumenPaciente();
    mostrarPantallaPaciente("pantalla-ejercicio");
  } catch (error) {
    document.getElementById("ejercicios-sesion-paciente").innerHTML = "<p>No se han podido cargar los ejercicios.</p>";
  }
}

function simularGrabacion() {
  document.getElementById("mensaje-ejercicio-paciente").innerHTML = `
    <div class="mensaje ok">
      Respuesta grabada de forma simulada. En este prototipo no se envía audio real, pero sí se mantiene el flujo de sesión.
    </div>
  `;
}

function construirResumenPaciente() {
  const sesion = estadoPaciente.sesionSeleccionada;
  const total = estadoPaciente.ejerciciosSesion.length;

  document.getElementById("resumen-sesion-paciente").innerHTML = `
    <p><strong>Sesión seleccionada:</strong> ${sesion ? sesion.id_sesion : "No seleccionada"}</p>
    <p><strong>Número de ejercicios cargados:</strong> ${total}</p>
    <p><strong>Estado actual:</strong> ${sesion ? sesion.estado : "-"}</p>
    <div class="barra"><div style="width:${total ? Math.min(100, total * 20) : 0}%"></div></div>
    <p>Este resumen es básico y se apoya en la sesión y los ejercicios asociados que devuelve el backend.</p>
  `;
}

function pintarHistorialSesionesPaciente() {
  const cont = document.getElementById("historial-sesiones-paciente");
  if (!estadoPaciente.sesiones.length) {
    cont.innerHTML = "<p>No hay historial de sesiones.</p>";
    return;
  }

  cont.innerHTML = `
    <table class="tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Modo</th>
        </tr>
      </thead>
      <tbody>
        ${estadoPaciente.sesiones.map(s => `
          <tr>
            <td>${s.id_sesion}</td>
            <td>${s.fecha_hora_inicio}</td>
            <td>${s.estado}</td>
            <td>${s.modo}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function cargarResultadosPaciente(idPaciente) {
  try {
    const resp = await fetch(`${API_BASE}/resultados/paciente/${idPaciente}`);
    const data = await resp.json();
    estadoPaciente.resultados = Array.isArray(data) ? data : [];
    pintarResultadosPaciente();
  } catch (error) {
    document.getElementById("resultados-paciente").innerHTML = "<p>No se han podido cargar los resultados.</p>";
  }
}

function pintarResultadosPaciente() {
  const cont = document.getElementById("resultados-paciente");
  if (!estadoPaciente.resultados.length) {
    cont.innerHTML = "<p>No hay resultados registrados.</p>";
    return;
  }

  cont.innerHTML = estadoPaciente.resultados.slice(0, 8).map(r => `
    <div class="tarjeta">
      <p><strong>Ejercicio:</strong> ${r.nombre_ejercicio}</p>
      <p><strong>Intento:</strong> ${r.numero_intento}</p>
      <p><strong>Precisión:</strong> ${r.precision_porcentaje}%</p>
      <p><strong>WER:</strong> ${r.wer}</p>
      <p><strong>Éxito:</strong> ${r.exito ? "Sí" : "No"}</p>
    </div>
  `).join("");
}

async function cargarMetricasPaciente(idPaciente) {
  try {
    const [respMetricas, respEvolucion] = await Promise.all([
      fetch(`${API_BASE}/metricas/paciente/${idPaciente}`),
      fetch(`${API_BASE}/metricas/evolucion/${idPaciente}`)
    ]);

    estadoPaciente.metricas = respMetricas.ok ? await respMetricas.json() : null;
    estadoPaciente.evolucion = respEvolucion.ok ? await respEvolucion.json() : [];

    pintarMetricasPaciente();
  } catch (error) {
    document.getElementById("metricas-globales-paciente").innerHTML = "<p>No se han podido cargar las métricas.</p>";
  }
}

function pintarMetricasPaciente() {
  const m = estadoPaciente.metricas;
  const evo = estadoPaciente.evolucion;

  document.getElementById("kpi-precision-paciente").textContent =
    m && m.precision_media ? `${Number(m.precision_media).toFixed(1)}%` : "0%";

  document.getElementById("metricas-globales-paciente").innerHTML = m ? `
    <p><strong>Precisión media:</strong> ${Number(m.precision_media).toFixed(2)}%</p>
    <p><strong>WER medio:</strong> ${Number(m.wer_medio).toFixed(2)}</p>
    <p><strong>Tiempo respuesta medio:</strong> ${Number(m.tiempo_respuesta_medio).toFixed(2)} ms</p>
    <p><strong>Duración habla media:</strong> ${Number(m.duracion_habla_media).toFixed(2)} ms</p>
    <p><strong>Número de intentos:</strong> ${m.numero_intentos}</p>
    <p><strong>Tasa de éxito:</strong> ${Number(m.tasa_exito).toFixed(2)}%</p>
  ` : "<p>No hay métricas globales disponibles.</p>";

  document.getElementById("evolucion-paciente").innerHTML = evo.length ? `
    <table class="tabla">
      <thead>
        <tr>
          <th>Sesión</th>
          <th>Fecha</th>
          <th>Precisión media</th>
          <th>Tasa éxito</th>
        </tr>
      </thead>
      <tbody>
        ${evo.map(item => `
          <tr>
            <td>${item.id_sesion}</td>
            <td>${item.fecha_hora_inicio}</td>
            <td>${Number(item.precision_media).toFixed(2)}%</td>
            <td>${Number(item.tasa_exito).toFixed(2)}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : "<p>No hay datos de evolución.</p>";
}

function pintarHomePaciente() {
  const lista = document.getElementById("lista-home-paciente");
  lista.innerHTML = `
    <li><strong>Sesiones cargadas:</strong> ${estadoPaciente.sesiones.length}</li>
    <li><strong>Resultados cargados:</strong> ${estadoPaciente.resultados.length}</li>
    <li><strong>Métricas disponibles:</strong> ${estadoPaciente.metricas ? "Sí" : "No"}</li>
    <li><strong>Perfil encontrado:</strong> ${estadoPaciente.perfil ? "Sí" : "No"}</li>
  `;
}

function cerrarSesionPaciente() {
  localStorage.removeItem("speakmePaciente");
  location.reload();
}

window.addEventListener("DOMContentLoaded", async () => {
  const guardado = localStorage.getItem("speakmePaciente");
  if (guardado) {
    estadoPaciente.usuario = JSON.parse(guardado);
    try {
      await cargarPerfilPaciente();
      if (estadoPaciente.perfil) {
        await cargarDatosPaciente();
        mostrarPantallaPaciente("pantalla-home");
      }
    } catch (e) {
      console.log("No se pudo restaurar la sesión del paciente");
    }
  }
});

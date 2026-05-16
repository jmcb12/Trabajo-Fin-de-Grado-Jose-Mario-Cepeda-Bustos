let pacientes = [];
let ejercicios = [];
let sesionesPaciente = [];
let resultadosSesion = [];
let evolucionPaciente = [];
let resultadosHistoricosPaciente = [];
let ejerciciosDisponiblesSesion = [];
let ejerciciosOriginalesSesion = [];

let usuarioLogueado = null;
let idProfesional = null;
let pacienteSeleccionado = null;
let ejercicioEditando = null;
let pacienteEditando = null;
let sesionEditando = null;
let sesionRevisando = null;
let graficaProgreso = null;
let metricasPaciente = null;



if (usuarioLogueado != null) {
  idProfesional = usuarioLogueado.id_profesional;
}


window.onload = function () {
  aplicarEstiloGuardado();
  prepararEventosEditarProfesional();
  mostrarPantalla("pantallaLoginLogopeda");
};


function iniciarSesionLogopeda(event) {
  event.preventDefault();

  let username = document.getElementById("loginUsuarioLogopeda").value.trim();
  let password = document.getElementById("loginPasswordLogopeda").value.trim();

  if (username == "" || password == "") {
    mostrarAvisoBootstrap("Aviso", "Introduce usuario y contraseña", "warning"); return;
  }

  rest.post("/api/auth/login", {
    username: username,
    password: password
  }, function (estado, datos) {

    if (estado != 200) {
      mostrarAvisoBootstrap("Error", "Usuario o contraseña incorrectos", "danger");
      return;
    }

    if (!datos || !datos.usuario || !datos.token) {
      mostrarAvisoBootstrap("Error", "Respuesta de login incorrecta", "danger");
      return;
    }

    let usuario = datos.usuario;

    if (usuario.rol != "logopeda" && usuario.rol != "profesional") {
      mostrarAvisoBootstrap("Error", "Este acceso es solo para profesionales", "danger");
      return;
    }

    sessionStorage.setItem("tokenJWT", datos.token);

    usuarioLogueado = usuario;
    idProfesional = usuario.id_profesional;

    cargarDatosLogopeda();
    cargarPacientes();
    cargarEjercicios();
    mostrarPantalla("pantallaInicio");
    mostrarVistaPrincipal("pacientes");
  });
}

function mostrarPantalla(idPantalla) {
  let pantallas = document.querySelectorAll(".pantalla");

  pantallas.forEach(function (pantalla) {
    pantalla.classList.add("oculto");
  });

  document.getElementById(idPantalla).classList.remove("oculto");

  let menuPerfil = document.getElementById("menuPerfil");
  if (menuPerfil) {
    menuPerfil.classList.add("oculto");
  }
}

function mostrarAvisoBootstrap(titulo, mensaje, tipo) {
  let modalTitulo = document.getElementById("modalAvisoTitulo");
  let modalTexto = document.getElementById("modalAvisoTexto");
  let modalHeader = document.getElementById("modalAvisoHeader");

  modalTitulo.textContent = titulo;
  modalTexto.textContent = mensaje;

  modalHeader.className = "modal-header";

  if (tipo == "success") {
    modalHeader.classList.add("bg-success-subtle");
  }
  else if (tipo == "danger") {
    modalHeader.classList.add("bg-danger-subtle");
  }
  else if (tipo == "warning") {
    modalHeader.classList.add("bg-warning-subtle");
  }
  else {
    modalHeader.classList.add("bg-primary-subtle");
  }

  let modal = new bootstrap.Modal(document.getElementById("modalAvisoBootstrap"));
  modal.show();
}

function mostrarConfirmacionBootstrap(titulo, mensaje, funcionConfirmar) {
  let modalTitulo = document.getElementById("modalConfirmacionTitulo");
  let modalTexto = document.getElementById("modalConfirmacionTexto");
  let botonConfirmar = document.getElementById("btnConfirmarAccionBootstrap");

  modalTitulo.textContent = titulo;
  modalTexto.textContent = mensaje;

  let nuevoBoton = botonConfirmar.cloneNode(true);
  botonConfirmar.parentNode.replaceChild(nuevoBoton, botonConfirmar);

  let modalElemento = document.getElementById("modalConfirmacionBootstrap");
  let modal = new bootstrap.Modal(modalElemento);

  nuevoBoton.addEventListener("click", function () {
    modal.hide();

    if (funcionConfirmar) {
      funcionConfirmar();
    }
  });

  modal.show();
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }

  let fechaObj = new Date(fecha);

  if (isNaN(fechaObj.getTime())) {
    return fecha;
  }

  let dia = String(fechaObj.getDate()).padStart(2, "0");
  let mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  let anio = fechaObj.getFullYear();

  return dia + "-" + mes + "-" + anio;
}

function formatearFechaHora(fecha) {
  if (!fecha) {
    return "---";
  }

  let fechaObj = new Date(fecha);

  if (isNaN(fechaObj.getTime())) {
    return "---";
  }

  let dia = String(fechaObj.getDate()).padStart(2, "0");
  let mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  let anio = fechaObj.getFullYear();

  let horas = String(fechaObj.getHours()).padStart(2, "0");
  let minutos = String(fechaObj.getMinutes()).padStart(2, "0");

  return dia + "-" + mes + "-" + anio + " " + horas + ":" + minutos;
}

function formatearFechaInput(fecha) {
  if (!fecha) {
    return "";
  }

  let fechaObj = new Date(fecha);

  if (isNaN(fechaObj.getTime())) {
    return "";
  }

  let dia = String(fechaObj.getDate()).padStart(2, "0");
  let mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  let anio = fechaObj.getFullYear();

  return anio + "-" + mes + "-" + dia;
}

function formatearTipoEjercicio(tipo) {
  if (!tipo) {
    return "";
  }

  let texto = tipo.replaceAll("_", " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function cargarDatosLogopeda() {
  if (usuarioLogueado == null) {
    mostrarAvisoBootstrap("Aviso", "No has iniciado sesión", "warning"); window.location.href = "../index.html";
    return;
  }

  document.getElementById("tituloBienvenida").textContent =
    "Bienvenido, " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos;

  let fotoPerfilHeader = document.getElementById("fotoPerfilHeader");

  if (fotoPerfilHeader) {
    if (usuarioLogueado.foto_perfil) {
      fotoPerfilHeader.src = usuarioLogueado.foto_perfil;
    } else {
      fotoPerfilHeader.src = "/media/fotosPerfil/default.png";
    }
  }
}

function cargarDatosEjercicioEditar(idEjercicio) {
  rest.get("/api/ejercicios/" + idEjercicio, function (estado, datos) {
    if (estado == 200) {
      ejercicioEditando = datos;
      rellenarFormularioEditarEjercicio(ejercicioEditando);
      mostrarPantalla("pantallaEditarEjercicio");
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar los datos del ejercicio", "danger");
    }
  });
}

function cargarDatosPacienteEditar(idPaciente) {
  rest.get("/api/pacientes/" + idPaciente, function (estado, datos) {
    if (estado == 200) {
      pacienteEditando = datos;
      rellenarFormularioEditarPaciente(pacienteEditando);
      mostrarPantalla("pantallaEditarPaciente");
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar los datos del paciente", "danger");
    }
  });
}

function cargarPacientes() {
  if (idProfesional == null) {
    mostrarAvisoBootstrap("Aviso", "No se ha encontrado el profesional que ha iniciado sesión", "warning");
    return;
  }

  rest.get("/api/profesionales/" + idProfesional + "/pacientes", function (estado, datos) {
    if (estado == 200) {
      pacientes = datos;
      pintarTablaPacientes(pacientes);
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar los pacientes", "danger");
    }
  });
}

function cargarEjercicios() {
  rest.get("/api/ejercicios", function (estado, datos) {
    if (estado == 200) {
      ejercicios = datos;

      let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
        return ejercicio.activo == 1;
      });

      pintarTablaEjercicios(ejerciciosActivos);
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar los ejercicios", "danger");
    }
  });
}

function cargarPacientesConFiltro() {
  if (idProfesional == null) {
    mostrarAvisoBootstrap("Aviso", "No se ha encontrado el profesional que ha iniciado sesión", "warning");
    return;
  }

  rest.get("/api/profesionales/" + idProfesional + "/pacientes", function (estado, datos) {
    if (estado == 200) {
      pacientes = datos;
      filtrarPacientes();
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al recargar los pacientes", "danger");
    }
  });
}

function cargarSesionesPaciente(idPaciente) {
  rest.get("/api/pacientes/" + idPaciente + "/sesiones", function (estado, datos) {
    if (estado == 200) {
      sesionesPaciente = datos;

      if (pacienteSeleccionado != null) {
        document.getElementById("nombrePacienteSesiones").textContent =
          pacienteSeleccionado.nombre + " " + pacienteSeleccionado.apellidos;
      }

      resetearFiltroSesionesPaciente();
      pintarTablaSesionesPaciente(sesionesPaciente);
      mostrarPantalla("pantallaSesionesPaciente");
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar las sesiones del paciente", "danger");
    }
  });
}

function cargarPantallaProgresoPaciente(idPaciente) {
  rest.get("/api/metricas/paciente/" + idPaciente, function (estadoMetricas, datosMetricas) {
    if (estadoMetricas != 200) {
      mostrarAvisoBootstrap("Error", "Error al cargar las métricas globales del paciente", "danger"); return;
    }

    metricasPaciente = datosMetricas;

    rest.get("/api/metricas/evolucion/" + idPaciente, function (estadoEvolucion, datosEvolucion) {
      if (estadoEvolucion != 200) {
        mostrarAvisoBootstrap("Error", "Error al cargar la evolución del paciente", "danger");
        return;
      }

      evolucionPaciente = datosEvolucion;

      rest.get("/api/resultados/paciente/" + idPaciente, function (estadoResultados, datosResultados) {
        if (estadoResultados != 200) {
          mostrarAvisoBootstrap("Error", "Error al cargar los resultados históricos del paciente", "danger");
          return;
        }

        resultadosHistoricosPaciente = datosResultados;

        rellenarMetricasGlobalesPaciente();
        resetearFiltroGraficaProgreso();
        actualizarGraficaProgreso();
        mostrarPantalla("pantallaProgresoPaciente");
      });
    });
  });
}

function cargarPantallaEditarSesion(idSesion) {
  rest.get("/api/sesiones/" + idSesion, function (estadoSesion, datosSesion) {
    if (estadoSesion != 200) {
      mostrarAvisoBootstrap("Error", "Error al cargar la sesión", "danger");
      return;
    }

    sesionEditando = datosSesion;

    rest.get("/api/sesiones/" + idSesion + "/ejercicios", function (estadoEjercicios, datosEjercicios) {
      if (estadoEjercicios != 200) {
        mostrarAvisoBootstrap("Error", "Error al cargar los ejercicios de la sesión", "danger");
        return;
      }

      ejerciciosOriginalesSesion = datosEjercicios;
      rellenarPantallaEditarSesion();
      mostrarPantalla("pantallaEditarSesion");
    });
  });
}

function pintarTablaPacientes(listaPacientes) {
  let tabla = document.getElementById("tablaPacientes");

  tabla.innerHTML = "";

  listaPacientes.forEach(function (paciente) {
    let fila = document.createElement("tr");

    let textoEstado;
    let colorEstado;

    if (paciente.activo == 1) {
      textoEstado = "Activo";
      colorEstado = "lightgreen";
    }
    else {
      textoEstado = "Desactivado";
      colorEstado = "salmon";
    }

    fila.innerHTML = `
        <td>${paciente.nombre}</td>
        <td>${paciente.apellidos}</td>
        <td>${paciente.diagnostico_principal || ""}</td>
        <td>${formatearFechaHora(paciente.ultima_conexion)}</td>
        <td>
            <button 
                onclick="cambiarEstadoPaciente(${paciente.id_paciente}, ${paciente.activo})"
                style="background-color: ${colorEstado};">
                ${textoEstado}
            </button>
        </td>
        <td>
            <button onclick="seleccionarPaciente(${paciente.id_paciente})">
                Seleccionar
            </button>
        </td>
    `;

    tabla.appendChild(fila);
  });
}

function pintarTablaEjercicios(listaEjercicios) {
  let tabla = document.getElementById("tablaEjercicios");

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";

  listaEjercicios.forEach(function (ejercicio) {
    let fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${ejercicio.nombre}</td>
      <td>${formatearTipoEjercicio(ejercicio.tipo_ejercicio)}</td>
      <td>${ejercicio.nivel_dificultad}</td>
      <td>${ejercicio.duracion_maxima_seg}</td>
      <td>
        <button onclick="editarEjercicio(${ejercicio.id_ejercicio})">
          Editar ejercicio
        </button>
      </td>
      <td>
        <button onclick="eliminarEjercicio(${ejercicio.id_ejercicio})">
          Eliminar
        </button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

function pintarTablaPapeleraEjercicios(listaEjercicios) {
  let tabla = document.getElementById("tablaPapeleraEjercicios");

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";

  listaEjercicios.forEach(function (ejercicio) {
    let fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${ejercicio.nombre}</td>
      <td>${formatearTipoEjercicio(ejercicio.tipo_ejercicio)}</td>
      <td>${ejercicio.nivel_dificultad}</td>
      <td>${ejercicio.duracion_maxima_seg}</td>
      <td>
        <button onclick="reactivarEjercicio(${ejercicio.id_ejercicio})">
          Recuperar
        </button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

function pintarTablaSesionesPaciente(listaSesiones) {
  let tabla = document.getElementById("tablaSesionesPaciente");

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";

  if (!listaSesiones || listaSesiones.length == 0) {
    let fila = document.createElement("tr");

    fila.innerHTML = `
    <td colspan="5" style="text-align:center; padding:20px;">
      No se han encontrado sesiones asociadas a este paciente.
    </td>
  `;

    tabla.appendChild(fila);
    return;
  }

  listaSesiones.forEach(function (sesion) {
    let fila = document.createElement("tr");

    let estadoMostrado = sesion.estado || "";
    let fechaRealizacion = "---";

    if (sesion.fecha_hora_fin) {
      fechaRealizacion = formatearFecha(sesion.fecha_hora_fin);
    }

    let botonAccion = "";

    if (sesion.estado == "pendiente") {
      botonAccion = `<button onclick="editarSesion(${sesion.id_sesion})">Editar</button>`;
    }
    else if (sesion.estado == "realizada" || sesion.estado == "revisada") {
      botonAccion = `<button onclick="revisarSesion(${sesion.id_sesion})">Revisar</button>`;
    }

    fila.innerHTML = `
      <td>${formatearFecha(sesion.fecha_hora_inicio)}</td>
      <td>${estadoMostrado}</td>
      <td>${fechaRealizacion}</td>
      <td>${sesion.numero_ejercicios}</td>
      <td>${botonAccion}</td>
    `;

    tabla.appendChild(fila);
  });
}

function pintarTablaResultadosSesion(listaResultados) {
  let tabla = document.getElementById("tablaResultadosSesion");

  if (!tabla) {
    return;
  }

  tabla.innerHTML = "";

  let resultadosAgrupados = agruparResultadosPorEjercicio(listaResultados);

  resultadosAgrupados.forEach(function (resultado) {
    let werMedio = (resultado.suma_wer / resultado.intentos).toFixed(2);
    let precisionMedia = (resultado.suma_precision / resultado.intentos).toFixed(2);
    let tiempoRespuestaMedio = Math.round(resultado.suma_tiempo_respuesta / resultado.intentos);
    let duracionHablaMedia = Math.round(resultado.suma_duracion_habla / resultado.intentos);
    let tasaExito = Math.round((resultado.suma_exito / resultado.intentos) * 100);
    let audioHtml = "No disponible";

    if (resultado.ruta_audio) {
      audioHtml = `
        <audio controls style="max-width:180px;">
          <source src="${resultado.ruta_audio}" type="audio/webm">
          Tu navegador no permite reproducir este audio.
        </audio>
      `;
    }

    let fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${resultado.orden}</td>
      <td>${resultado.nombre_ejercicio}</td>
      <td>${formatearTipoEjercicio(resultado.tipo_ejercicio)}</td>
      <td>${resultado.intentos}</td>
      <td>${werMedio}</td>
      <td>${precisionMedia}</td>
      <td>${tiempoRespuestaMedio}</td>
      <td>${duracionHablaMedia}</td>
      <td>${tasaExito}</td>
      <td>${audioHtml}</td>
    `;

    tabla.appendChild(fila);
  });
}

function filtrarPacientes() {
  let filtro = document.getElementById("filtroPacientes").value;

  if (filtro == "todos") {
    pintarTablaPacientes(pacientes);
  }

  if (filtro == "activo") {
    let pacientesActivos = pacientes.filter(function (paciente) {
      return paciente.activo == 1;
    });

    pintarTablaPacientes(pacientesActivos);
  }

  if (filtro == "desactivado") {
    let pacientesDesactivados = pacientes.filter(function (paciente) {
      return paciente.activo == 0;
    });

    pintarTablaPacientes(pacientesDesactivados);
  }
}

function filtrarEjercicios() {
  let filtro = document.getElementById("filtroEjercicios").value;

  let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 1;
  });

  if (filtro == "todos") {
    pintarTablaEjercicios(ejerciciosActivos);
  }
  else {
    let ejerciciosFiltrados = ejerciciosActivos.filter(function (ejercicio) {
      return ejercicio.tipo_ejercicio == filtro;
    });

    pintarTablaEjercicios(ejerciciosFiltrados);
  }
}

function filtrarPapeleraEjercicios() {
  let filtro = document.getElementById("filtroPapeleraEjercicios").value;

  let ejerciciosInactivos = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 0;
  });

  if (filtro == "todos") {
    pintarTablaPapeleraEjercicios(ejerciciosInactivos);
  }
  else {
    let ejerciciosFiltrados = ejerciciosInactivos.filter(function (ejercicio) {
      return ejercicio.tipo_ejercicio == filtro;
    });

    pintarTablaPapeleraEjercicios(ejerciciosFiltrados);
  }
}

function filtrarSesionesPaciente() {
  let filtro = document.getElementById("filtroSesionesPaciente").value;

  if (filtro == "todos") {
    pintarTablaSesionesPaciente(sesionesPaciente);
  }
  else {
    let sesionesFiltradas = sesionesPaciente.filter(function (sesion) {
      return sesion.estado == filtro;
    });

    pintarTablaSesionesPaciente(sesionesFiltradas);
  }
}

function filtrarEjerciciosCrearSesion() {
  let filtro = document.getElementById("filtroCrearSesionEjercicios").value;
  let listaBiblioteca = document.getElementById("listaBibliotecaEjercicios");
  let items = listaBiblioteca.querySelectorAll("li");

  items.forEach(function (item) {
    let tipo = item.getAttribute("data-tipo-ejercicio");

    if (filtro == "todos" || tipo == filtro) {
      item.style.display = "";
    }
    else {
      item.style.display = "none";
    }
  });
}

function filtrarEjerciciosEditarSesion() {
  let filtro = document.getElementById("filtroEditarSesionEjercicios").value;
  let listaBiblioteca = document.getElementById("listaEditarBibliotecaEjercicios");
  let items = listaBiblioteca.querySelectorAll("li");

  items.forEach(function (item) {
    let tipo = item.getAttribute("data-tipo-ejercicio");

    if (filtro == "todos" || tipo == filtro) {
      item.style.display = "";
    }
    else {
      item.style.display = "none";
    }
  });
}

function resetearFiltroPacientes() {
  let filtro = document.getElementById("filtroPacientes");
  if (filtro) {
    filtro.value = "todos";
  }
}

function resetearFiltroEjercicios() {
  let filtro = document.getElementById("filtroEjercicios");
  if (filtro) {
    filtro.value = "todos";
  }
}

function resetearFiltroPapeleraEjercicios() {
  let filtro = document.getElementById("filtroPapeleraEjercicios");
  if (filtro) {
    filtro.value = "todos";
  }
}

function resetearFiltroSesionesPaciente() {
  let filtro = document.getElementById("filtroSesionesPaciente");
  if (filtro) {
    filtro.value = "todos";
  }
}

function resetearFiltroGraficaProgreso() {
  let filtro = document.getElementById("filtroGraficaProgreso");

  if (filtro) {
    filtro.value = "todas";
  }
}

function eliminarEjercicio(idEjercicio) {
  mostrarConfirmacionBootstrap(
    "Eliminar ejercicio",
    "¿Seguro que quieres eliminar este ejercicio?",
    function () {
      rest.delete("/api/ejercicios/" + idEjercicio, function (estado, respuesta) {
        if (estado == 200) {
          cargarEjercicios();
        }
        else {
          mostrarAvisoBootstrap("Error", "Error al eliminar el ejercicio", "danger");
        }
      });
    }
  );
}

function reactivarEjercicio(idEjercicio) {
  rest.put("/api/ejercicios/" + idEjercicio + "/reactivar", {}, function (estado, respuesta) {
    if (estado == 200) {
      cargarEjercicios();
      filtrarPapeleraEjercicios();
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al reactivar el ejercicio", "danger");
    }
  });
}

function cambiarEstadoPaciente(idPaciente, activo) {
  let nuevoEstado;

  if (activo == 1) {
    mostrarConfirmacionBootstrap(
      "Desactivar paciente",
      "¿Seguro que quieres desactivar este paciente?",
      function () {
        nuevoEstado = 0;

        rest.put("/api/pacientes/" + idPaciente + "/estado", {
          activo: nuevoEstado
        }, function (estado, respuesta) {
          if (estado == 200) {
            cargarPacientesConFiltro();
          }
          else {
            mostrarAvisoBootstrap("Error", "Error al cambiar el estado del paciente", "danger");
          }
        });
      }
    );
  }
  else {
    nuevoEstado = 1;

    rest.put("/api/pacientes/" + idPaciente + "/estado", {
      activo: nuevoEstado
    }, function (estado, respuesta) {
      if (estado == 200) {
        cargarPacientesConFiltro();
      }
      else {
        mostrarAvisoBootstrap("Error", "Error al cambiar el estado del paciente", "danger");
      }
    });
  }
}

function cambiarVistaPrincipal() {
  let vista = document.getElementById("selectorVistaPrincipal").value;

  let bloquePacientes = document.getElementById("bloquePacientes");
  let bloqueEjercicios = document.getElementById("bloqueEjercicios");

  if (vista == "pacientes") {
    bloquePacientes.classList.remove("oculto");
    bloqueEjercicios.classList.add("oculto");
    resetearFiltroPacientes();
    pintarTablaPacientes(pacientes);
  }
  else if (vista == "ejercicios") {
    bloqueEjercicios.classList.remove("oculto");
    bloquePacientes.classList.add("oculto");
    resetearFiltroEjercicios();

    let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
      return ejercicio.activo == 1;
    });

    pintarTablaEjercicios(ejerciciosActivos);
  }
}

function seleccionarPaciente(idPaciente) {
  cargarDatosMenuPaciente(idPaciente);
}

function cerrarSesion() {
  usuarioLogueado = null;
  idProfesional = null;

  pacientes = [];
  ejercicios = [];
  sesionesPaciente = [];
  resultadosSesion = [];

  sessionStorage.removeItem("tokenJWT");

  mostrarPantalla("pantallaLoginLogopeda");
}

function limpiarFormularioPaciente() {
  document.getElementById("formAltaPaciente").reset();
}

function limpiarFormularioEjercicio() {
  document.getElementById("formCrearEjercicio").reset();
  document.getElementById("bloqueImagenDenominacion").classList.add("oculto");
}

function controlarImagenDenominacionCrear() {
  let tipo = document.getElementById("ej_tipo").value;
  let bloque = document.getElementById("bloqueImagenDenominacion");

  if (tipo == "denominacion") {
    bloque.classList.remove("oculto");
  }
  else {
    bloque.classList.add("oculto");
    document.getElementById("ej_imagen_denominacion").value = "";
  }
}

function controlarImagenDenominacionEditar() {
  let tipo = document.getElementById("edit_ej_tipo").value;
  let bloque = document.getElementById("bloqueEditarImagenDenominacion");

  if (tipo == "denominacion") {
    bloque.classList.remove("oculto");
  }
  else {
    bloque.classList.add("oculto");
    document.getElementById("edit_ej_imagen_denominacion").value = "";
  }
}

function restablecerFormularioEditarEjercicio() {
  if (ejercicioEditando != null) {
    rellenarFormularioEditarEjercicio(ejercicioEditando);
  }
}

function restablecerPantallaEditarSesion() {
  if (sesionEditando != null && ejerciciosOriginalesSesion.length >= 0) {
    rellenarPantallaEditarSesion();
  }
}

function restaurarFormularioEditarPaciente() {
  if (pacienteEditando != null) {
    rellenarFormularioEditarPaciente(pacienteEditando);
  }
}

function obtenerInstruccionSegunTipo(tipo) {
  if (tipo == "repeticion_palabra") {
    return "Escucha la palabra y repítela";
  }

  if (tipo == "repeticion_frase") {
    return "Escucha la frase y repítela";
  }

  if (tipo == "denominacion") {
    return "Observa la imagen y di su nombre";
  }

  if (tipo == "lectura") {
    return "Lee en voz alta la frase mostrada";
  }

  if (tipo == "completar_frase") {
    return "Completa la frase con la palabra que falta";
  }

  return "";
}

function editarEjercicio(idEjercicio) {
  cargarDatosEjercicioEditar(idEjercicio);
}

function irPantallaPacientes() {
  mostrarPantalla("pantallaInicio");
  mostrarVistaPrincipal("pacientes");
}

function irBibliotecaEjercicios() {
  mostrarPantalla("pantallaInicio");
  mostrarVistaPrincipal("ejercicios");
}

function irCrearEjercicio() {
  limpiarFormularioEjercicio();
  mostrarPantalla("pantallaCrearEjercicio");
}

function irPapeleraEjercicios() {
  resetearFiltroPapeleraEjercicios();

  let ejerciciosInactivos = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 0;
  });

  pintarTablaPapeleraEjercicios(ejerciciosInactivos);
  mostrarPantalla("pantallaPapeleraEjercicios");
}

function irEditarPaciente() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarDatosPacienteEditar(pacienteSeleccionado.id_paciente);
}

function irProgresoPaciente() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarPantallaProgresoPaciente(pacienteSeleccionado.id_paciente);
}

function irSesionesPaciente() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
}

function irCrearSesion() {
  prepararPantallaCrearSesion();
  mostrarPantalla("pantallaCrearSesion");
}

function irEditarPerfil() {
  document.getElementById("menuPerfil").classList.add("oculto");
  cargarDatosEditarProfesional();
  mostrarPantalla("pantallaEditarProfesional");
}

function irAccesibilidad() {
  let menuPerfil = document.getElementById("menuPerfil");
  if (menuPerfil) {
    menuPerfil.classList.add("oculto");
  }

  prepararPantallaAccesibilidad();
  mostrarPantalla("pantallaAccesibilidad");
}

function volverDesdePapeleraEjercicios() {
  resetearFiltroPapeleraEjercicios();
  irBibliotecaEjercicios();
}

function volverAlMenuLogopeda() {
  irPantallaPacientes();
}

function volverAlMenuPaciente() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarDatosMenuPaciente(pacienteSeleccionado.id_paciente);
}

function volverDesdeSesionesPaciente() {
  resetearFiltroSesionesPaciente();
  volverAlMenuPaciente();
}

function volverDesdeResultadosSesion() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
}

function volverDesdeProgresoPaciente() {
  resetearFiltroGraficaProgreso();
  volverAlMenuPaciente();
}

function volverDesdeCrearSesion() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
}

function volverDesdeEditarSesion() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
}

function volverDesdeAccesibilidad() {
  irPantallaPacientes();
}

function rellenarFormularioEditarEjercicio(ejercicio) {
  document.getElementById("edit_ej_nombre").value = ejercicio.nombre || "";
  document.getElementById("edit_ej_texto_estimulo").value = ejercicio.texto_estimulo || "";
  document.getElementById("edit_ej_respuesta_esperada").value = ejercicio.respuesta_esperada || ejercicio.texto_estimulo || "";
  document.getElementById("edit_ej_duracion").value = ejercicio.duracion_maxima_seg || "";
  document.getElementById("edit_ej_tipo").value = ejercicio.tipo_ejercicio || "";
  document.getElementById("edit_ej_dificultad").value = ejercicio.nivel_dificultad || "";
  document.getElementById("edit_ej_descripcion").value = ejercicio.descripcion || "";

  controlarImagenDenominacionEditar();

  let preview = document.getElementById("previewImagenDenominacion");

  if (ejercicio.imagen_denominacion) {
    preview.innerHTML = `
    <p>Imagen actual:</p>
    <img src="${ejercicio.imagen_denominacion}" alt="Imagen del ejercicio de denominación" style="max-width:180px; border-radius:10px;">
  `;
  }
  else {
    preview.innerHTML = "";
  }
}

function rellenarMenuPaciente(paciente) {
  document.getElementById("menuPacienteNombre").textContent =
    (paciente.nombre || "") + " " + (paciente.apellidos || "");

  let sexoMostrado = "";

  if (paciente.sexo == "M") {
    sexoMostrado = "Masculino";
  }
  else if (paciente.sexo == "F") {
    sexoMostrado = "Femenino";
  }

  document.getElementById("menuPacienteSexo").textContent = sexoMostrado;

  document.getElementById("menuPacienteFechaNacimiento").textContent =
    formatearFecha(paciente.fecha_nacimiento);

  document.getElementById("menuPacienteDiagnostico").textContent =
    paciente.diagnostico_principal || "";

  document.getElementById("menuPacienteNivelAfasia").textContent =
    paciente.nivel_afasia || "";

  document.getElementById("menuPacienteFechaInicio").textContent =
    formatearFecha(paciente.fecha_inicio_tratamiento);

  document.getElementById("menuPacienteObservaciones").textContent =
    paciente.observaciones || "";
}

function rellenarFormularioEditarPaciente(paciente) {
  document.getElementById("edit_username_paciente").value = paciente.username || "";

  document.getElementById("edit_password_paciente").value = "";

  document.getElementById("edit_nombre_paciente").value = paciente.nombre || "";
  document.getElementById("edit_apellidos_paciente").value = paciente.apellidos || "";
  document.getElementById("edit_fecha_nacimiento_paciente").value = formatearFechaInput(paciente.fecha_nacimiento);
  document.getElementById("edit_sexo_paciente").value = paciente.sexo || "";
  document.getElementById("edit_diagnostico_paciente").value = paciente.diagnostico_principal || "";
  document.getElementById("edit_nivel_afasia_paciente").value = paciente.nivel_afasia || "";
  document.getElementById("edit_fecha_inicio_paciente").value = formatearFechaInput(paciente.fecha_inicio_tratamiento);
  document.getElementById("edit_observaciones_paciente").value = paciente.observaciones || "";
}

function rellenarMetricasGlobalesPaciente() {
  if (!metricasPaciente) {
    return;
  }

  document.getElementById("metricaPrecision").textContent =
    (metricasPaciente.precision_media || 0).toFixed(2);

  document.getElementById("metricaWer").textContent =
    (metricasPaciente.wer_medio || 0).toFixed(2);

  document.getElementById("metricaExito").textContent =
    Math.round(metricasPaciente.tasa_exito || 0);

  document.getElementById("metricaTiempoRespuesta").textContent =
    Math.round(metricasPaciente.tiempo_respuesta_medio || 0);

  document.getElementById("metricaDuracionHabla").textContent =
    Math.round(metricasPaciente.duracion_habla_media || 0);

  document.getElementById("metricaIntentos").textContent =
    (metricasPaciente.intentos_medios || 0).toFixed(2);


  let porcentajeMejora = calcularPorcentajeMejoraGlobal();
  document.getElementById("textoProgresoGlobal").textContent =
    porcentajeMejora.toFixed(2) + "% mejorado";

  document.getElementById("barraProgresoGlobal").style.width =
    Math.max(0, Math.min(100, porcentajeMejora)) + "%";
}

function rellenarPantallaEditarSesion() {
  let listaSesion = document.getElementById("listaEditarEjerciciosSesion");
  let listaBiblioteca = document.getElementById("listaEditarBibliotecaEjercicios");

  listaSesion.innerHTML = "";
  listaBiblioteca.innerHTML = "";

  document.getElementById("observacionesEditarSesion").value = sesionEditando.observaciones || "";

  let idsEnSesion = ejerciciosOriginalesSesion.map(function (e) {
    return e.id_ejercicio;
  });

  ejerciciosOriginalesSesion.forEach(function (ejercicioSesion) {
    let item = document.createElement("li");
    item.setAttribute("data-id-ejercicio", ejercicioSesion.id_ejercicio);
    item.setAttribute("data-id-sesion-ejercicio", ejercicioSesion.id_sesion_ejercicio);
    item.setAttribute("data-tipo-ejercicio", ejercicioSesion.tipo_ejercicio);
    item.style.border = "1px solid #ccc";
    item.style.padding = "6px";
    item.style.marginBottom = "5px";
    item.style.backgroundColor = "#fff";
    item.style.borderRadius = "8px";
    item.style.fontSize = "14px";

    item.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
      <span style="font-weight:600;">${ejercicioSesion.nombre}</span>
      <label style="margin:0; font-size:13px; white-space:nowrap;">
        Intentos:
        <input type="number" class="input-max-intentos" value="${ejercicioSesion.max_intentos || 1}" min="1" style="width:50px; padding:3px; margin:0; font-size:13px;">
      </label>
    </div>
  `;

    listaSesion.appendChild(item);
  });

  let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 1;
  });

  ejerciciosActivos.forEach(function (ejercicio) {
    if (!idsEnSesion.includes(ejercicio.id_ejercicio)) {
      let item = document.createElement("li");
      item.setAttribute("data-id-ejercicio", ejercicio.id_ejercicio);
      item.setAttribute("data-tipo-ejercicio", ejercicio.tipo_ejercicio);
      item.style.border = "1px solid #ccc";
      item.style.padding = "6px";
      item.style.marginBottom = "5px";
      item.style.backgroundColor = "#fff";
      item.style.borderRadius = "8px";
      item.style.fontSize = "14px";

      item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
        <span style="font-weight:600;">${ejercicio.nombre}</span>
        <label style="margin:0; font-size:13px; white-space:nowrap;">
          Intentos:
          <input type="number" class="input-max-intentos" value="1" min="1" style="width:50px; padding:3px; margin:0; font-size:13px;">
        </label>
      </div>
    `;

      listaBiblioteca.appendChild(item);
    }
  });

  activarSortableEditarSesion();
}

function cargarDatosMenuPaciente(idPaciente) {
  rest.get("/api/pacientes/" + idPaciente, function (estado, datos) {
    if (estado == 200) {
      pacienteSeleccionado = datos;
      rellenarMenuPaciente(pacienteSeleccionado);
      mostrarPantalla("pantallaMenuPaciente");
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar los datos del paciente", "danger");
    }
  });
}

function cargarResultadosSesion(idSesion) {
  rest.get("/api/resultados/sesion/" + idSesion, function (estado, datos) {
    if (estado == 200) {
      resultadosSesion = datos;
      pintarResumenSesion(resultadosSesion);
      pintarTablaResultadosSesion(resultadosSesion);
      mostrarPantalla("pantallaResultadosSesion");
    }
    else {
      mostrarAvisoBootstrap("Error", "Error al cargar los resultados de la sesión", "danger");
    }
  });
}

function cargarDatosEditarProfesional() {
  if (usuarioLogueado == null) {
    mostrarAvisoBootstrap("Aviso", "No has iniciado sesión", "warning");
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("edit_prof_username").value = usuarioLogueado.username || "";
  document.getElementById("edit_prof_password").value = "";
  document.getElementById("edit_prof_nombre").value = usuarioLogueado.nombre || "";
  document.getElementById("edit_prof_apellidos").value = usuarioLogueado.apellidos || "";
  document.getElementById("edit_prof_telefono").value = usuarioLogueado.telefono || "";
  document.getElementById("edit_prof_centro").value = usuarioLogueado.centro_trabajo || "";

  document.getElementById("edit_prof_foto_preview").src =
    usuarioLogueado.foto_perfil || "/media/fotosPerfil/default.png";
}

function volverDesdeEditarProfesional() {
  mostrarPantalla("pantallaInicio");
}

function restablecerEditarProfesional() {
  cargarDatosEditarProfesional();
}

function editarSesion(idSesion) {
  cargarPantallaEditarSesion(idSesion);
}

function revisarSesion(idSesion) {

  let sesion = sesionesPaciente.find(function (s) {
    return s.id_sesion == idSesion;
  });

  if (!sesion) {
    mostrarAvisoBootstrap("Aviso", "No se ha encontrado la sesión", "warning");
    return;
  }

  sesionRevisando = sesion;

  if (sesion.estado == "realizada") {
    rest.put("/api/sesiones/" + idSesion + "/revisar", {}, function (estado, respuesta) {
      if (estado != 200) {
        mostrarAvisoBootstrap("Error", "Error al marcar la sesión como revisada", "danger");
        return;
      }

      sesionRevisando.estado = "revisada";

      cargarResultadosSesion(idSesion);
    });
  }
  else {
    cargarResultadosSesion(idSesion);
  }
}

function recargarSesionesPaciente() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
}

function agruparResultadosPorEjercicio(listaResultados) {
  let grupos = {};

  listaResultados.forEach(function (resultado) {
    let clave = resultado.id_sesion_ejercicio;

    if (!grupos[clave]) {
      grupos[clave] = {
        orden: resultado.orden,
        nombre_ejercicio: resultado.nombre_ejercicio,
        tipo_ejercicio: resultado.tipo_ejercicio,
        intentos: 0,
        suma_wer: 0,
        suma_precision: 0,
        suma_tiempo_respuesta: 0,
        suma_duracion_habla: 0,
        suma_exito: 0,
        ruta_audio: resultado.ruta_audio || null
      };
    }

    grupos[clave].intentos += 1;
    grupos[clave].suma_wer += parseFloat(resultado.wer || 0);
    grupos[clave].suma_precision += parseFloat(resultado.precision_porcentaje || 0);
    grupos[clave].suma_tiempo_respuesta += parseFloat(resultado.tiempo_respuesta_ms || 0);
    grupos[clave].suma_duracion_habla += parseFloat(resultado.duracion_habla_ms || 0);
    grupos[clave].suma_exito += parseInt(resultado.exito || 0);

    if (resultado.ruta_audio) {
      grupos[clave].ruta_audio = resultado.ruta_audio;
    }
  });

  let agrupados = Object.values(grupos);

  agrupados.sort(function (a, b) {
    return a.orden - b.orden;
  });

  return agrupados;
}

function calcularResumenSesion(listaResultados) {
  if (!listaResultados || listaResultados.length == 0) {
    return null;
  }

  let resultadosAgrupados = agruparResultadosPorEjercicio(listaResultados);

  let sumaPrecision = 0;
  let sumaWer = 0;
  let sumaTiempo = 0;
  let sumaDuracion = 0;
  let sumaExito = 0;
  let intentosTotales = 0;

  resultadosAgrupados.forEach(function (resultado) {
    let precisionMediaEjercicio = resultado.suma_precision / resultado.intentos;
    let werMedioEjercicio = resultado.suma_wer / resultado.intentos;
    let tiempoMedioEjercicio = resultado.suma_tiempo_respuesta / resultado.intentos;
    let duracionMediaEjercicio = resultado.suma_duracion_habla / resultado.intentos;
    let exitoMedioEjercicio = resultado.suma_exito / resultado.intentos;

    sumaPrecision += precisionMediaEjercicio;
    sumaWer += werMedioEjercicio;
    sumaTiempo += tiempoMedioEjercicio;
    sumaDuracion += duracionMediaEjercicio;
    sumaExito += exitoMedioEjercicio;

    intentosTotales += resultado.intentos;
  });

  let numeroEjercicios = resultadosAgrupados.length;

  return {
    precision_media: sumaPrecision / numeroEjercicios,
    wer_medio: sumaWer / numeroEjercicios,
    tiempo_respuesta_medio: sumaTiempo / numeroEjercicios,
    duracion_habla_media: sumaDuracion / numeroEjercicios,
    tasa_exito: (sumaExito / numeroEjercicios) * 100,
    intentos_totales: intentosTotales,
    intentos_medios: intentosTotales / numeroEjercicios,
    numero_ejercicios: numeroEjercicios
  };
}

function pintarResumenSesion(listaResultados) {
  let resumen = calcularResumenSesion(listaResultados);

  if (!resumen) {
    return;
  }

  document.getElementById("resumenPrecisionSesion").textContent =
    resumen.precision_media.toFixed(2) + " %";

  document.getElementById("resumenExitoSesion").textContent =
    Math.round(resumen.tasa_exito) + " %";

  document.getElementById("resumenIntentosSesion").textContent =
    resumen.intentos_totales;

  document.getElementById("resumenIntentosMediosSesion").textContent =
    resumen.intentos_medios.toFixed(2);

  document.getElementById("resumenWerSesion").textContent =
    resumen.wer_medio.toFixed(2);

  document.getElementById("resumenTiempoSesion").textContent =
    Math.round(resumen.tiempo_respuesta_medio) + " ms";

  document.getElementById("resumenDuracionSesion").textContent =
    Math.round(resumen.duracion_habla_media) + " ms";
}

function generarInformeSesion() {
  if (sesionRevisando == null || pacienteSeleccionado == null || usuarioLogueado == null) {
    mostrarAvisoBootstrap("Aviso", "No hay datos suficientes para generar el informe", "warning");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Informe de la sesión", 105, y, { align: "center" });

  y += 6;
  doc.setDrawColor(80, 80, 80);
  doc.line(14, y, 196, y);

  y += 12;

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Datos generales", 14, y);

  y += 8;
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);

  doc.text("Fecha de generación: " + formatearFecha(new Date()), 14, y);
  y += 7;

  doc.text("Paciente: " + pacienteSeleccionado.nombre + " " + pacienteSeleccionado.apellidos, 14, y);
  y += 7;

  doc.text("Profesional: " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos, 14, y);
  y += 7;

  doc.text("Sesión: " + sesionRevisando.id_sesion, 14, y);
  doc.text("Estado: " + sesionRevisando.estado, 110, y);
  y += 7;

  doc.text("Fecha de creación: " + formatearFecha(sesionRevisando.fecha_hora_inicio), 14, y);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);

  y += 10;

  let resumenSesion = calcularResumenSesion(resultadosSesion);

  if (resumenSesion) {
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Resumen de la sesión", 14, y);

    y += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    doc.text("Coincidencia media: " + resumenSesion.precision_media.toFixed(2) + " %", 14, y);
    doc.text("Tasa de éxito: " + Math.round(resumenSesion.tasa_exito) + " %", 110, y);
    y += 7;

    doc.text("Intentos totales: " + resumenSesion.intentos_totales, 14, y);
    doc.text("Intentos medios por ejercicio: " + resumenSesion.intentos_medios.toFixed(2), 110, y);
    y += 7;

    doc.text("WER medio: " + resumenSesion.wer_medio.toFixed(2), 14, y);
    doc.text("Tiempo medio de resolución: " + Math.round(resumenSesion.tiempo_respuesta_medio) + " ms", 110, y);
    y += 7;

    doc.text("Duración media habla: " + Math.round(resumenSesion.duracion_habla_media) + " ms", 14, y);
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);

    y += 10;
  }


  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Detalle por ejercicio", 14, y);

  y += 8;
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  let resultadosAgrupados = agruparResultadosPorEjercicio(resultadosSesion);

  resultadosAgrupados.forEach(function (resultado) {
    let werMedio = (resultado.suma_wer / resultado.intentos).toFixed(2);
    let precisionMedia = (resultado.suma_precision / resultado.intentos).toFixed(2);
    let tiempoRespuestaMedio = (resultado.suma_tiempo_respuesta / resultado.intentos).toFixed(2);
    let duracionHablaMedia = (resultado.suma_duracion_habla / resultado.intentos).toFixed(2);
    let tasaExito = ((resultado.suma_exito / resultado.intentos) * 100).toFixed(2);

    if (y > 260) {
      doc.addPage();
      y = 20;

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Detalle por ejercicio", 14, y);

      y += 10;
      doc.setFont(undefined, "normal");
    }

    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text(resultado.orden + ". " + resultado.nombre_ejercicio, 14, y);
    y += 6;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    doc.text("Tipo: " + formatearTipoEjercicio(resultado.tipo_ejercicio), 18, y);
    doc.text("Intentos: " + resultado.intentos, 115, y);
    y += 6;

    doc.text("WER medio: " + werMedio, 18, y);
    doc.text("Coincidencia media: " + precisionMedia + "%", 115, y);
    y += 6;

    doc.text("Tiempo medio de resolución: " + tiempoRespuestaMedio + " ms", 18, y);
    doc.text("Duración habla media: " + duracionHablaMedia + " ms", 115, y);
    y += 6;

    doc.text("Tasa de éxito: " + tasaExito + "%", 18, y);
    y += 6;

    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, 196, y);
    y += 8;
  });


  let totalPaginas = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("SpeakMe Rehab · TFG · Jose Mario Cepeda Bustos", 14, 290);
    doc.text("Página " + i + " de " + totalPaginas, 196, 290, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  doc.save("informe_sesion_" + sesionRevisando.id_sesion + ".pdf");
}

function actualizarGraficaProgreso() {
  let canvas = document.getElementById("graficaProgresoPaciente");

  if (!canvas) {
    return;
  }

  let filtro = document.getElementById("filtroGraficaProgreso").value;

  let etiquetas = evolucionPaciente.map(function (sesion, indice) {
    return "Sesión " + (indice + 1);
  });

  let datasets = [];

  if (filtro == "todas" || filtro == "wer") {
    datasets.push({
      label: "WER",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.wer_medio || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (filtro == "todas" || filtro == "exito") {
    datasets.push({
      label: "Éxito",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.tasa_exito || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (filtro == "todas" || filtro == "intentos") {
    datasets.push({
      label: "Intentos medios",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.intentos_medios || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (filtro == "todas" || filtro == "precision") {
    datasets.push({
      label: "Coincidencia",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.precision_media || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (filtro == "todas" || filtro == "tiempo_respuesta") {
    datasets.push({
      label: "Tiempo resolución",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.tiempo_respuesta_medio || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (filtro == "todas" || filtro == "duracion_habla") {
    datasets.push({
      label: "Duración habla",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.duracion_habla_media || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (graficaProgreso != null) {
    graficaProgreso.destroy();
  }

  graficaProgreso = new Chart(canvas, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: datasets
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function actualizarImagenDemoAccesibilidad(estilo) {
  let imagen = document.getElementById("imagenDemoAccesibilidad");

  if (!imagen) {
    return;
  }

  if (estilo == "alto-contraste") {
    imagen.src = "/media/previsualizacionEstilos/modo_alto_contraste.png";
  }
  else if (estilo == "letra-grande") {
    imagen.src = "/media/previsualizacionEstilos/modo_letras_grandes.png";
  }
  else if (estilo == "modo-noche") {
    imagen.src = "/media/previsualizacionEstilos/modo_noche.png";
  }
  else {
    imagen.src = "/media/previsualizacionEstilos/modo_normal.png";
  }
}

function calcularPorcentajeMejoraGlobal() {
  if (!metricasPaciente) {
    return 0;
  }

  let precision = parseFloat(metricasPaciente.precision_media || 0);
  let exito = parseFloat(metricasPaciente.tasa_exito || 0);

  let progreso = (0.5 * precision) + (0.5 * exito);

  if (progreso < 0) {
    progreso = 0;
  }

  if (progreso > 100) {
    progreso = 100;
  }

  return progreso;
}

function exportarDatosPacienteCSV() {
  if (!resultadosHistoricosPaciente || resultadosHistoricosPaciente.length == 0) {
    mostrarAvisoBootstrap("Aviso", "No hay datos para exportar", "warning");
    return;
  }

  let lineas = [];
  lineas.push("fecha_sesion,id_sesion,nombre_ejercicio,tipo_ejercicio,intento,wer,coincidencia,tiempo_resolucion,duracion_habla,exito");

  resultadosHistoricosPaciente.forEach(function (r) {
    let fechaSesion = r.fecha_registro ? formatearFecha(r.fecha_registro) : "";
    let linea = [
      fechaSesion,
      r.id_sesion || "",
      '"' + (r.nombre_ejercicio || "") + '"',
      '"' + (r.tipo_ejercicio || "") + '"',
      r.numero_intento || "",
      r.wer || "",
      r.precision_porcentaje || "",
      r.tiempo_respuesta_ms || "",
      r.duracion_habla_ms || "",
      r.exito || ""
    ].join(",");

    lineas.push(linea);
  });

  let contenido = lineas.join("\n");
  let blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);

  let enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "progreso_paciente.csv";
  enlace.click();

  URL.revokeObjectURL(url);
}

function generarInformeProgresoPaciente() {
  if (!pacienteSeleccionado || !usuarioLogueado || !metricasPaciente) {
    mostrarAvisoBootstrap("Aviso", "No hay datos suficientes para generar el informe", "warning");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Informe de progreso del paciente", 105, y, { align: "center" });

  y += 6;
  doc.setDrawColor(80, 80, 80);
  doc.line(14, y, 196, y);

  y += 12;

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Datos generales", 14, y);

  y += 8;
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);

  doc.text("Fecha de generación: " + formatearFecha(new Date()), 14, y);
  y += 7;

  doc.text("Paciente: " + pacienteSeleccionado.nombre + " " + pacienteSeleccionado.apellidos, 14, y);
  y += 8;

  doc.text("Profesional: " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos, 14, y);
  y += 8;

  doc.text("Progreso global: " + Math.round(calcularPorcentajeMejoraGlobal()) + "%", 14, y);
  y += 12;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);

  y += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Métricas globales", 14, y);

  y += 8;
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);

  doc.text("Coincidencia media: " + (metricasPaciente.precision_media || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("WER: " + (metricasPaciente.wer_medio || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("Tasa de éxito: " + Math.round(metricasPaciente.tasa_exito || 0), 14, y);
  y += 8;
  doc.text("Intentos medios por ejercicio: " + (metricasPaciente.intentos_medios || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("Tiempo medio de resolución: " + Math.round(metricasPaciente.tiempo_respuesta_medio || 0), 14, y);
  y += 8;
  doc.text("Duración del habla media: " + Math.round(metricasPaciente.duracion_habla_media || 0), 14, y);
  y += 12;

  if (graficaProgreso != null) {
    let canvas = document.getElementById("graficaProgresoPaciente");
    let imagenGrafica = canvas.toDataURL("image/png");

    if (y > 160) {
      doc.addPage();
      y = 20;
    }

    doc.text("Gráfica global de progreso:", 14, y);
    y += 6;
    doc.addImage(imagenGrafica, "PNG", 14, y, 180, 90);
    y += 100;
  }

  function generarGraficaTemporal(label, campo) {
    let canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 400;

    let ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: evolucionPaciente.map(function (sesion, indice) {
          return "Sesión " + (indice + 1);
        }),
        datasets: [{
          label: label,
          data: evolucionPaciente.map(function (s) {
            return parseFloat(s[campo] || 0);
          }),
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        responsive: false,
        animation: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return canvas.toDataURL("image/png");
  }

  let graficas = [
    { titulo: "Coincidencia", campo: "precision_media" },
    { titulo: "WER", campo: "wer_medio" },
    { titulo: "Éxito", campo: "tasa_exito" },
    { titulo: "Intentos medios", campo: "intentos_medios" },
    { titulo: "Tiempo de resolución", campo: "tiempo_respuesta_medio" },
    { titulo: "Duración del habla", campo: "duracion_habla_media" }
  ];

  graficas.forEach(function (grafica) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text(grafica.titulo, 14, 20);

    let imagen = generarGraficaTemporal(grafica.titulo, grafica.campo);
    doc.addImage(imagen, "PNG", 14, 30, 180, 90);

    let yTabla = 135;

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Valores medios por sesión", 14, yTabla);
    yTabla += 8;

    let xTabla = 14;
    let anchoTabla = 180;
    let altoFila = 8;

    let anchoSesion = 50;
    let anchoFecha = 65;
    let anchoValor = 65;

    doc.setFillColor(230, 236, 245);
    doc.setDrawColor(180, 190, 205);
    doc.rect(xTabla, yTabla, anchoTabla, altoFila, "FD");

    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(20, 45, 90);

    doc.text("Sesión", xTabla + 5, yTabla + 5.5);
    doc.text("Fecha", xTabla + anchoSesion + 5, yTabla + 5.5);
    doc.text("Valor", xTabla + anchoSesion + anchoFecha + 5, yTabla + 5.5);

    yTabla += altoFila;

    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);

    evolucionPaciente.forEach(function (sesion, indice) {
      let valor = parseFloat(sesion[grafica.campo] || 0);

      if (
        grafica.campo == "tasa_exito" ||
        grafica.campo == "tiempo_respuesta_medio" ||
        grafica.campo == "duracion_habla_media"
      ) {
        valor = Math.round(valor);
      }
      else {
        valor = valor.toFixed(2);
      }

      let fechaSesion = formatearFecha(sesion.fecha_hora_inicio);

      if (yTabla > 275) {
        doc.addPage();

        yTabla = 25;

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(grafica.titulo + " - continuación", 14, yTabla);
        yTabla += 10;

        doc.setFillColor(230, 236, 245);
        doc.setDrawColor(180, 190, 205);
        doc.rect(xTabla, yTabla, anchoTabla, altoFila, "FD");

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20, 45, 90);

        doc.text("Sesión", xTabla + 5, yTabla + 5.5);
        doc.text("Fecha", xTabla + anchoSesion + 5, yTabla + 5.5);
        doc.text("Valor", xTabla + anchoSesion + anchoFecha + 5, yTabla + 5.5);

        yTabla += altoFila;

        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
      }

      if (indice % 2 == 0) {
        doc.setFillColor(248, 249, 252);
      }
      else {
        doc.setFillColor(255, 255, 255);
      }

      doc.setDrawColor(220, 220, 220);
      doc.rect(xTabla, yTabla, anchoTabla, altoFila, "FD");

      doc.setFontSize(10);
      doc.text("Sesión " + (indice + 1), xTabla + 5, yTabla + 5.5);
      doc.text(fechaSesion, xTabla + anchoSesion + 5, yTabla + 5.5);
      doc.text(String(valor), xTabla + anchoSesion + anchoFecha + 5, yTabla + 5.5);

      yTabla += altoFila;
    });

    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
  });

  let totalPaginas = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("SpeakMe Rehab · TFG · Jose Mario Cepeda Bustos", 14, 290);
    doc.text("Página " + i + " de " + totalPaginas, 196, 290, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  let nombreArchivo = "Informe de progreso global de " + pacienteSeleccionado.nombre + " " + pacienteSeleccionado.apellidos + ".pdf";
  doc.save(nombreArchivo);
}

function prepararPantallaCrearSesion() {
  document.getElementById("observacionesCrearSesion").value = "";

  let listaSesion = document.getElementById("listaEjerciciosSesion");
  let listaBiblioteca = document.getElementById("listaBibliotecaEjercicios");

  listaSesion.innerHTML = "";
  listaBiblioteca.innerHTML = "";

  ejerciciosDisponiblesSesion = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 1;
  });

  ejerciciosDisponiblesSesion.forEach(function (ejercicio) {
    let item = document.createElement("li");
    item.setAttribute("data-id-ejercicio", ejercicio.id_ejercicio);
    item.setAttribute("data-tipo-ejercicio", ejercicio.tipo_ejercicio);
    item.style.border = "1px solid #ccc";
    item.style.padding = "6px";
    item.style.marginBottom = "5px";
    item.style.backgroundColor = "#fff";
    item.style.borderRadius = "8px";
    item.style.fontSize = "14px";

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
        <span style="font-weight:600;">${ejercicio.nombre}</span>
        <label style="margin:0; font-size:13px; white-space:nowrap;">
          Intentos:
          <input type="number" class="input-max-intentos" value="1" min="1" style="width:50px; padding:3px; margin:0; font-size:13px;">
        </label>
      </div>
    `;

    listaBiblioteca.appendChild(item);
  });

  activarSortableEjercicios();
}

function prepararPantallaAccesibilidad() {
  let estiloGuardado = localStorage.getItem("estiloAccesibilidad");

  if (!estiloGuardado) {
    estiloGuardado = "normal";
  }

  document.getElementById("selectorAccesibilidad").value = estiloGuardado;
  actualizarImagenDemoAccesibilidad(estiloGuardado);
}

function prepararEventosEditarProfesional() {
  var formEditarProfesional = document.getElementById("formEditarProfesional");

  if (formEditarProfesional) {
    formEditarProfesional.addEventListener("submit", function (evento) {
      evento.preventDefault();
      guardarDatosProfesional();
    });
  }

  var inputFoto = document.getElementById("edit_prof_foto");

  if (inputFoto) {
    inputFoto.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        guardarFotoPerfilProfesional(this.files[0]);
      }
    });
  }
}

function activarSortableEjercicios() {
  let listaSesion = $("#listaEjerciciosSesion");
  let listaBiblioteca = $("#listaBibliotecaEjercicios");

  if (listaSesion.hasClass("ui-sortable")) {
    listaSesion.sortable("destroy");
  }

  if (listaBiblioteca.hasClass("ui-sortable")) {
    listaBiblioteca.sortable("destroy");
  }

  $("#listaEjerciciosSesion, #listaBibliotecaEjercicios").sortable({
    connectWith: "#listaEjerciciosSesion, #listaBibliotecaEjercicios",
    placeholder: "ui-state-highlight"
  }).disableSelection();
}

function activarSortableEditarSesion() {
  let listaSesion = $("#listaEditarEjerciciosSesion");
  let listaBiblioteca = $("#listaEditarBibliotecaEjercicios");

  if (listaSesion.hasClass("ui-sortable")) {
    listaSesion.sortable("destroy");
  }

  if (listaBiblioteca.hasClass("ui-sortable")) {
    listaBiblioteca.sortable("destroy");
  }

  $("#listaEditarEjerciciosSesion, #listaEditarBibliotecaEjercicios").sortable({
    connectWith: "#listaEditarEjerciciosSesion, #listaEditarBibliotecaEjercicios",
    placeholder: "ui-state-highlight"
  }).disableSelection();
}

function guardarNuevaSesion() {
  if (!pacienteSeleccionado) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  let idPaciente = pacienteSeleccionado.id_paciente;
  if (!idPaciente) {
    mostrarAvisoBootstrap("Aviso", "No se ha seleccionado ningún paciente", "warning");
    return;
  }

  let itemsSesion = document.querySelectorAll("#listaEjerciciosSesion li");

  if (itemsSesion.length == 0) {
    mostrarAvisoBootstrap("Aviso", "Debe añadir al menos un ejercicio a la sesión", "warning");
    return;
  }

  let observaciones = document.getElementById("observacionesCrearSesion").value.trim();

  let bodySesion = {
    id_paciente: parseInt(idPaciente),
    id_profesional: idProfesional,
    fecha_hora_inicio: new Date().toISOString().slice(0, 19).replace("T", " "),
    fecha_hora_fin: null,
    estado: "pendiente",
    observaciones: observaciones || null
  };

  rest.post("/api/sesiones", bodySesion, function (estadoSesion, respuestaSesion) {
    if (estadoSesion != 201) {
      mostrarAvisoBootstrap("Error", "Error al crear la sesión", "danger");
      return;
    }

    let idSesionCreada = respuestaSesion.insertId;
    let total = itemsSesion.length;
    let completadas = 0;
    let error = false;

    itemsSesion.forEach(function (item, index) {
      let idEjercicio = parseInt(item.getAttribute("data-id-ejercicio"));
      let maxIntentos = parseInt(item.querySelector(".input-max-intentos").value);

      let bodySesionEjercicio = {
        id_ejercicio: idEjercicio,
        orden: index + 1,
        max_intentos: maxIntentos,
        completado: 0
      };

      rest.post("/api/sesiones/" + idSesionCreada + "/ejercicios", bodySesionEjercicio, function (estadoEjercicio, respuestaEjercicio) {
        if (error) {
          return;
        }

        if (estadoEjercicio != 201) {
          error = true;
          mostrarAvisoBootstrap("Error", "Error al asociar ejercicios a la sesión", "danger");
          return;
        }

        completadas++;

        if (completadas == total) {
          mostrarAvisoBootstrap("Correcto", "Sesión creada correctamente", "success");
          prepararPantallaCrearSesion();
          cargarSesionesPaciente(idPaciente);
        }
      });
    });
  });
}

function guardarEdicionSesion() {
  if (sesionEditando == null) {
    mostrarAvisoBootstrap("Aviso", "No se ha cargado ninguna sesión", "warning");
    return;
  }

  let itemsSesion = document.querySelectorAll("#listaEditarEjerciciosSesion li");

  if (itemsSesion.length == 0) {
    mostrarAvisoBootstrap("Aviso", "La sesión debe tener al menos un ejercicio", "warning");
    return;
  }

  let observaciones = document.getElementById("observacionesEditarSesion").value.trim();

  let bodySesion = {
    id_paciente: sesionEditando.id_paciente,
    id_profesional: sesionEditando.id_profesional,
    fecha_hora_inicio: sesionEditando.fecha_hora_inicio,
    fecha_hora_fin: sesionEditando.fecha_hora_fin,
    estado: sesionEditando.estado,
    observaciones: observaciones || null
  };

  rest.put("/api/sesiones/" + sesionEditando.id_sesion, bodySesion, function (estadoSesion, respuestaSesion) {
    if (estadoSesion != 200) {
      mostrarAvisoBootstrap("Error", "Error al actualizar la sesión", "danger");
      return;
    }

    let antiguas = ejerciciosOriginalesSesion;
    let eliminadas = 0;
    let totalEliminadas = antiguas.length;
    let error = false;

    if (totalEliminadas == 0) {
      insertarEjerciciosEditados();
      return;
    }

    antiguas.forEach(function (ejercicioAntiguo) {
      rest.delete("/api/sesion-ejercicios/" + ejercicioAntiguo.id_sesion_ejercicio, function (estadoDelete, respuestaDelete) {
        if (error) {
          return;
        }

        if (estadoDelete != 200) {
          error = true;
          mostrarAvisoBootstrap("Error", "Error al eliminar los ejercicios antiguos de la sesión", "danger");
          return;
        }

        eliminadas++;

        if (eliminadas == totalEliminadas) {
          insertarEjerciciosEditados();
        }
      });
    });

    function insertarEjerciciosEditados() {
      let total = itemsSesion.length;
      let insertadas = 0;
      let errorInsert = false;

      itemsSesion.forEach(function (item, index) {
        let idEjercicio = parseInt(item.getAttribute("data-id-ejercicio"));
        let maxIntentos = parseInt(item.querySelector(".input-max-intentos").value);

        let bodySesionEjercicio = {
          id_ejercicio: idEjercicio,
          orden: index + 1,
          max_intentos: maxIntentos,
          completado: 0
        };

        rest.post("/api/sesiones/" + sesionEditando.id_sesion + "/ejercicios", bodySesionEjercicio, function (estadoInsert, respuestaInsert) {
          if (errorInsert) {
            return;
          }

          if (estadoInsert != 201) {
            errorInsert = true;
            mostrarAvisoBootstrap("Error", "Error al guardar los ejercicios editados", "danger");
            return;
          }

          insertadas++;

          if (insertadas == total) {
            mostrarAvisoBootstrap("Correcto", "Sesión actualizada correctamente", "success");
            if (pacienteSeleccionado) {
              cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
            }
          }
        });
      });
    }
  });
}

function guardarDatosProfesional() {
  if (!usuarioLogueado || !usuarioLogueado.id_profesional) {
    mostrarAvisoBootstrap("Aviso", "No se ha encontrado el profesional que ha iniciado sesión", "warning");
    return;
  }

  var datos = {
    username: document.getElementById("edit_prof_username").value.trim(),
    password: document.getElementById("edit_prof_password").value.trim(),
    nombre: document.getElementById("edit_prof_nombre").value.trim(),
    apellidos: document.getElementById("edit_prof_apellidos").value.trim(),
    telefono: document.getElementById("edit_prof_telefono").value.trim(),
    centro_trabajo: document.getElementById("edit_prof_centro").value.trim(),
    foto_perfil: usuarioLogueado.foto_perfil || "/media/fotosPerfil/default.png"
  };

  if (!datos.username || !datos.nombre || !datos.apellidos) {
    mostrarAvisoBootstrap("Aviso", "Usuario, nombre y apellidos son obligatorios", "warning");
    return;
  }

  rest.put(
    "/api/profesionales/" + usuarioLogueado.id_profesional,
    datos,
    function (estado, respuesta) {
      if (estado != 200) {
        mostrarAvisoBootstrap("Error", "No se han podido guardar los datos del profesional", "danger");
        return;
      }

      usuarioLogueado.username = datos.username;
      usuarioLogueado.nombre = datos.nombre;
      usuarioLogueado.apellidos = datos.apellidos;
      usuarioLogueado.telefono = datos.telefono;
      usuarioLogueado.centro_trabajo = datos.centro_trabajo;

      if (respuesta && respuesta.foto_perfil) {
        usuarioLogueado.foto_perfil = respuesta.foto_perfil;
      }
      else if (!usuarioLogueado.foto_perfil) {
        usuarioLogueado.foto_perfil = "/media/fotosPerfil/default.png";
      }

      sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioLogueado));

      cargarDatosLogopeda();

      mostrarAvisoBootstrap("Correcto", "Perfil actualizado correctamente", "success");
      mostrarPantalla("pantallaInicio");
    }
  );
}

function toggleMenuPerfil() {
  let menu = document.getElementById("menuPerfil");
  menu.classList.toggle("oculto");
}

function mostrarVistaPrincipal(vista) {
  let bloquePacientes = document.getElementById("bloquePacientes");
  let bloqueEjercicios = document.getElementById("bloqueEjercicios");

  let tabPacientes = document.getElementById("tabPacientes");
  let tabEjercicios = document.getElementById("tabEjercicios");

  if (vista == "pacientes") {
    bloquePacientes.classList.remove("oculto");
    bloqueEjercicios.classList.add("oculto");

    tabPacientes.classList.add("tab-activa");
    tabEjercicios.classList.remove("tab-activa");

    resetearFiltroPacientes();
    pintarTablaPacientes(pacientes);
  }
  else if (vista == "ejercicios") {
    bloqueEjercicios.classList.remove("oculto");
    bloquePacientes.classList.add("oculto");

    tabEjercicios.classList.add("tab-activa");
    tabPacientes.classList.remove("tab-activa");

    resetearFiltroEjercicios();

    let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
      return ejercicio.activo == 1;
    });

    pintarTablaEjercicios(ejerciciosActivos);
  }
}

function aplicarEstiloAccesibilidad() {
  let estilo = document.getElementById("selectorAccesibilidad").value;

  localStorage.setItem("estiloAccesibilidad", estilo);

  document.body.classList.remove("accesibilidad-normal");
  document.body.classList.remove("accesibilidad-alto-contraste");
  document.body.classList.remove("accesibilidad-letra-grande");
  document.body.classList.remove("accesibilidad-modo-noche");

  if (estilo == "alto-contraste") {
    document.body.classList.add("accesibilidad-alto-contraste");
  }
  else if (estilo == "letra-grande") {
    document.body.classList.add("accesibilidad-letra-grande");
  }
  else if (estilo == "modo-noche") {
    document.body.classList.add("accesibilidad-modo-noche");
  }
  else {
    document.body.classList.add("accesibilidad-normal");
  }

  actualizarImagenDemoAccesibilidad(estilo);
}

function aplicarEstiloGuardado() {
  let estiloGuardado = localStorage.getItem("estiloAccesibilidad");

  if (!estiloGuardado) {
    estiloGuardado = "normal";
  }

  document.body.classList.remove("accesibilidad-normal");
  document.body.classList.remove("accesibilidad-alto-contraste");
  document.body.classList.remove("accesibilidad-letra-grande");
  document.body.classList.remove("accesibilidad-modo-noche");

  if (estiloGuardado == "alto-contraste") {
    document.body.classList.add("accesibilidad-alto-contraste");
  }
  else if (estiloGuardado == "letra-grande") {
    document.body.classList.add("accesibilidad-letra-grande");
  }
  else if (estiloGuardado == "modo-noche") {
    document.body.classList.add("accesibilidad-modo-noche");
  }
  else {
    document.body.classList.add("accesibilidad-normal");
  }
}

function cancelarSesionEditando() {
  if (sesionEditando == null) {
    mostrarAvisoBootstrap("Aviso", "No se ha cargado ninguna sesión", "warning");
    return;
  }

  if (sesionEditando.estado == "cancelada") {
    mostrarAvisoBootstrap("Aviso", "La sesión ya está cancelada", "warning");
    return;
  }

  mostrarConfirmacionBootstrap(
    "Cancelar sesión",
    "¿Seguro que quieres cancelar esta sesión? No se tendrá en cuenta para las métricas.",
    function () {
      rest.put("/api/sesiones/" + sesionEditando.id_sesion + "/cancelar", {}, function (estado, respuesta) {
        if (estado != 200) {
          mostrarAvisoBootstrap("Error", "Error al cancelar la sesión", "danger");
          return;
        }

        mostrarAvisoBootstrap("Correcto", "Sesión cancelada correctamente", "success");

        if (pacienteSeleccionado) {
          cargarSesionesPaciente(pacienteSeleccionado.id_paciente);
        }
      });
    }
  );
}

function seleccionarNuevaFotoPerfil() {
  document.getElementById("edit_prof_foto").click();
}

function guardarFotoPerfilProfesional(archivo) {
  if (!usuarioLogueado || !usuarioLogueado.id_profesional) {
    mostrarAvisoBootstrap("Aviso", "No se ha encontrado el profesional que ha iniciado sesión", "warning");
    return;
  }

  var formData = new FormData();
  formData.append("foto_perfil", archivo);

  rest.postForm(
    "/api/profesionales/" + usuarioLogueado.id_profesional + "/foto-perfil",
    formData,
    function (estado, respuesta) {
      if (estado != 200) {
        mostrarAvisoBootstrap("Error", "No se ha podido subir la foto de perfil", "danger");
        return;
      }

      usuarioLogueado.foto_perfil = respuesta.foto_perfil;
      sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioLogueado));

      document.getElementById("edit_prof_foto_preview").src = respuesta.foto_perfil;

      var fotoHeader = document.getElementById("fotoPerfilHeader");

      if (fotoHeader) {
        fotoHeader.src = respuesta.foto_perfil;
      }

      mostrarAvisoBootstrap("Correcto", "Foto de perfil actualizada correctamente", "success");
    }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  limpiarFormularioPaciente();

  document.getElementById("btnLimpiarPaciente").addEventListener("click", function () {
    limpiarFormularioPaciente();
  });

  document.getElementById("btnCancelarPaciente").addEventListener("click", function () {
    limpiarFormularioPaciente();
    irPantallaPacientes();
  });

  document.getElementById("formAltaPaciente").addEventListener("submit", function (event) {
    event.preventDefault();

    var nombre = document.getElementById("nombre").value.trim();
    var apellidos = document.getElementById("apellidos").value.trim();
    var fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    var sexo = document.getElementById("sexo").value;
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value.trim();
    var diagnostico_principal = document.getElementById("diagnostico_principal").value.trim();
    var nivel_afasia = document.getElementById("nivel_afasia").value;
    var fecha_inicio_tratamiento = document.getElementById("fecha_inicio_tratamiento").value;
    var observaciones = document.getElementById("observaciones").value.trim();

    var id_profesional_referencia = idProfesional;

    if (!nombre || !apellidos || !sexo || !username || !password || !nivel_afasia || !id_profesional_referencia) {
      mostrarAvisoBootstrap("Aviso", "Faltan datos obligatorios", "warning");
      return;
    }

    var bodyUsuario = {
      nombre: nombre,
      apellidos: apellidos,
      username: username,
      password: password,
      rol: "paciente",
      activo: 1
    };

    rest.post("/api/usuarios", bodyUsuario, function (estado, respuestaUsuario) {
      if (estado != 201) {
        mostrarAvisoBootstrap("Error", "Error al crear el usuario", "danger");
        return;
      }

      var bodyPaciente = {
        id_usuario: respuestaUsuario.id_usuario,
        id_profesional_referencia: parseInt(id_profesional_referencia),
        fecha_nacimiento: fecha_nacimiento || null,
        sexo: sexo,
        diagnostico_principal: diagnostico_principal || null,
        nivel_afasia: nivel_afasia,
        fecha_inicio_tratamiento: fecha_inicio_tratamiento || null,
        observaciones: observaciones || null,
        activo: 1
      };

      rest.post("/api/pacientes", bodyPaciente, function (estado, respuestaPaciente) {
        if (estado != 201) {
          mostrarAvisoBootstrap("Error", "Error al crear el paciente", "danger");
          return;
        }

        mostrarAvisoBootstrap("Correcto", "Paciente dado de alta correctamente", "success");
        limpiarFormularioPaciente();
        cargarPacientes();
        irPantallaPacientes();
      });
    });
  });

  document.getElementById("btnVaciarEjercicio").addEventListener("click", function () {
    limpiarFormularioEjercicio();
  });

  document.getElementById("btnVolverCrearEjercicio").addEventListener("click", function () {
    limpiarFormularioEjercicio();
    irBibliotecaEjercicios();
  });

  document.getElementById("formCrearEjercicio").addEventListener("submit", function (event) {
    -
      event.preventDefault();

    var nombre = document.getElementById("ej_nombre").value.trim();
    var texto_estimulo = document.getElementById("ej_texto_estimulo").value.trim();
    var respuesta_esperada = document.getElementById("ej_respuesta_esperada").value.trim();
    var duracion_maxima_seg = parseInt(document.getElementById("ej_duracion").value);
    var tipo_ejercicio = document.getElementById("ej_tipo").value;
    var nivel_dificultad = document.getElementById("ej_dificultad").value;
    var descripcion = document.getElementById("ej_descripcion").value.trim();

    if (!nombre || !texto_estimulo || !respuesta_esperada || !duracion_maxima_seg || !tipo_ejercicio || !nivel_dificultad) {
      mostrarAvisoBootstrap("Aviso", "Faltan datos obligatorios", "warning");
      return;
    }

    var instruccion = obtenerInstruccionSegunTipo(tipo_ejercicio);

    var formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion || "");
    formData.append("tipo_ejercicio", tipo_ejercicio);
    formData.append("nivel_dificultad", nivel_dificultad);
    formData.append("texto_estimulo", texto_estimulo);
    formData.append("respuesta_esperada", respuesta_esperada);
    formData.append("instruccion", instruccion);
    formData.append("duracion_maxima_seg", duracion_maxima_seg);
    formData.append("activo", 1);

    let imagen = document.getElementById("ej_imagen_denominacion").files[0];

    if (tipo_ejercicio == "denominacion" && imagen) {
      formData.append("imagen_denominacion", imagen);
    }

    rest.postForm("/api/ejercicios", formData, function (estado, respuesta) {
      if (estado != 201) {
        mostrarAvisoBootstrap("Error", "Error al crear el ejercicio", "danger");
        return;
      }

      mostrarAvisoBootstrap("Correcto", "Ejercicio creado correctamente", "success");
      limpiarFormularioEjercicio();
      cargarEjercicios();
      irBibliotecaEjercicios();
    });
  });

  document.getElementById("btnRestablecerEjercicio").addEventListener("click", function () {
    restablecerFormularioEditarEjercicio();
  });

  document.getElementById("btnVolverEditarEjercicio").addEventListener("click", function () {
    irBibliotecaEjercicios();
  });

  document.getElementById("formEditarEjercicio").addEventListener("submit", function (event) {
    event.preventDefault();

    if (ejercicioEditando == null) {
      mostrarAvisoBootstrap("Aviso", "No se ha cargado ningún ejercicio", "warning");
      return;
    }

    var idEjercicio = ejercicioEditando.id_ejercicio;


    var nombre = document.getElementById("edit_ej_nombre").value.trim();
    var texto_estimulo = document.getElementById("edit_ej_texto_estimulo").value.trim();
    var respuesta_esperada = document.getElementById("edit_ej_respuesta_esperada").value.trim();
    var duracion_maxima_seg = parseInt(document.getElementById("edit_ej_duracion").value);
    var tipo_ejercicio = document.getElementById("edit_ej_tipo").value;
    var nivel_dificultad = document.getElementById("edit_ej_dificultad").value;
    var descripcion = document.getElementById("edit_ej_descripcion").value.trim();

    if (!idEjercicio || !nombre || !texto_estimulo || !respuesta_esperada || !duracion_maxima_seg || !tipo_ejercicio || !nivel_dificultad) {
      mostrarAvisoBootstrap("Aviso", "Faltan datos obligatorios", "warning");
      return;
    }

    var instruccion = obtenerInstruccionSegunTipo(tipo_ejercicio);

    var formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion || "");
    formData.append("tipo_ejercicio", tipo_ejercicio);
    formData.append("nivel_dificultad", nivel_dificultad);
    formData.append("texto_estimulo", texto_estimulo);
    formData.append("respuesta_esperada", respuesta_esperada);
    formData.append("instruccion", instruccion);
    formData.append("duracion_maxima_seg", duracion_maxima_seg);
    formData.append("activo", 1);

    if (ejercicioEditando.imagen_denominacion) {
      formData.append("imagen_denominacion", ejercicioEditando.imagen_denominacion);
    }

    let nuevaImagen = document.getElementById("edit_ej_imagen_denominacion").files[0];

    if (tipo_ejercicio == "denominacion" && nuevaImagen) {
      formData.append("imagen_denominacion", nuevaImagen);
    }

    rest.putForm("/api/ejercicios/" + idEjercicio, formData, function (estado, respuesta) {
      if (estado != 200) {
        mostrarAvisoBootstrap("Error", "Error al actualizar el ejercicio", "danger");
        return;
      }

      mostrarAvisoBootstrap("Correcto", "Ejercicio actualizado correctamente", "success");
      cargarEjercicios();
      irBibliotecaEjercicios();
    });
  });

  document.getElementById("btnRestaurarPaciente").addEventListener("click", function () {
    restaurarFormularioEditarPaciente();
  });

  document.getElementById("btnVolverEditarPaciente").addEventListener("click", function () {
    volverAlMenuPaciente();
  });

  document.getElementById("formEditarPaciente").addEventListener("submit", function (event) {
    event.preventDefault();

    if (pacienteEditando == null) {
      mostrarAvisoBootstrap("Aviso", "No se ha cargado ningún paciente para editar", "warning");
      return;
    }

    var username = document.getElementById("edit_username_paciente").value.trim();
    var password = document.getElementById("edit_password_paciente").value.trim();
    var nombre = document.getElementById("edit_nombre_paciente").value.trim();
    var apellidos = document.getElementById("edit_apellidos_paciente").value.trim();
    var fecha_nacimiento = document.getElementById("edit_fecha_nacimiento_paciente").value;
    var sexo = document.getElementById("edit_sexo_paciente").value;
    var diagnostico_principal = document.getElementById("edit_diagnostico_paciente").value.trim();
    var nivel_afasia = document.getElementById("edit_nivel_afasia_paciente").value;
    var fecha_inicio_tratamiento = document.getElementById("edit_fecha_inicio_paciente").value;
    var observaciones = document.getElementById("edit_observaciones_paciente").value.trim();

    if (!username || !nombre || !apellidos || !sexo || !nivel_afasia) {
      mostrarAvisoBootstrap("Aviso", "Faltan datos obligatorios", "warning");
      return;
    }

    var bodyUsuario = {
      username: username,
      password: password,
      nombre: nombre,
      apellidos: apellidos,
      rol: "paciente",
      activo: pacienteEditando.activo
    };

    rest.put("/api/usuarios/" + pacienteEditando.id_usuario, bodyUsuario, function (estadoUsuario, respuestaUsuario) {
      if (estadoUsuario != 200) {
        mostrarAvisoBootstrap("Error", "Error al actualizar los datos de acceso del paciente", "danger");
        return;
      }

      var bodyPaciente = {
        id_usuario: pacienteEditando.id_usuario,
        id_profesional_referencia: pacienteEditando.id_profesional_referencia,
        fecha_nacimiento: fecha_nacimiento || null,
        sexo: sexo,
        diagnostico_principal: diagnostico_principal || null,
        nivel_afasia: nivel_afasia,
        fecha_inicio_tratamiento: fecha_inicio_tratamiento || null,
        observaciones: observaciones || null,
        activo: pacienteEditando.activo
      };

      rest.put("/api/pacientes/" + pacienteEditando.id_paciente, bodyPaciente, function (estadoPaciente, respuestaPaciente) {
        if (estadoPaciente != 200) {
          mostrarAvisoBootstrap("Error", "Error al actualizar los datos clínicos del paciente", "danger");
          return;
        }

        mostrarAvisoBootstrap("Correcto", "Paciente actualizado correctamente", "success");
        cargarPacientes();
        volverAlMenuPaciente();
      });
    });
  });
});
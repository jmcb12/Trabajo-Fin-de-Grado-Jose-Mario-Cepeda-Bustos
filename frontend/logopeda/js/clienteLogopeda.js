let pacientes = [];
let ejercicios = [];
let sesionesPaciente = [];
let resultadosSesion = [];
let evolucionPaciente = [];
let resultadosHistoricosPaciente = [];
let ejerciciosDisponiblesSesion = [];
let ejerciciosOriginalesSesion = [];

let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

let idProfesional = null;
let ejercicioEditando = null;
let pacienteSeleccionado = null;
let pacienteEditando = null;
let sesionRevisando = null;
let graficaProgreso = null;
let metricasPaciente = null;
let sesionEditando = null;



if (usuarioLogueado != null) {
  idProfesional = usuarioLogueado.id_profesional;
}


window.onload = function () {
  aplicarEstiloGuardado();
  cargarDatosLogopeda();
  cargarPacientes();
  cargarEjercicios();
  mostrarVistaPrincipal("pacientes");
};


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
    alert("No has iniciado sesión");
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("tituloBienvenida").textContent =
    "Bienvenido, " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos;
}

function cargarDatosEjercicioEditar(idEjercicio) {
  rest.get("/api/ejercicios/" + idEjercicio, function (estado, datos) {
    if (estado == 200) {
      ejercicioEditando = datos;
      rellenarFormularioEditarEjercicio(ejercicioEditando);
      mostrarPantalla("pantallaEditarEjercicio");
    }
    else {
      alert("Error al cargar los datos del ejercicio");
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
      alert("Error al cargar los datos del paciente");
    }
  });
}

function cargarPacientes() {
  if (idProfesional == null) {
    alert("No se ha encontrado el profesional que ha iniciado sesión");
    return;
  }

  rest.get("/api/profesionales/" + idProfesional + "/pacientes", function (estado, datos) {
    if (estado == 200) {
      pacientes = datos;
      pintarTablaPacientes(pacientes);
    }
    else {
      alert("Error al cargar los pacientes");
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
      alert("Error al cargar los ejercicios");
    }
  });
}

function cargarPacientesConFiltro() {
  if (idProfesional == null) {
    alert("No se ha encontrado el profesional que ha iniciado sesión");
    return;
  }

  rest.get("/api/profesionales/" + idProfesional + "/pacientes", function (estado, datos) {
    if (estado == 200) {
      pacientes = datos;
      filtrarPacientes();
    }
    else {
      alert("Error al recargar los pacientes");
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
      alert("Error al cargar las sesiones del paciente");
    }
  });
}

function cargarPantallaProgresoPaciente(idPaciente) {
  rest.get("/api/metricas/paciente/" + idPaciente, function (estadoMetricas, datosMetricas) {
    if (estadoMetricas != 200) {
      alert("Error al cargar las métricas globales del paciente");
      return;
    }

    metricasPaciente = datosMetricas;

    rest.get("/api/metricas/evolucion/" + idPaciente, function (estadoEvolucion, datosEvolucion) {
      if (estadoEvolucion != 200) {
        alert("Error al cargar la evolución del paciente");
        return;
      }

      evolucionPaciente = datosEvolucion;

      rest.get("/api/resultados/paciente/" + idPaciente, function (estadoResultados, datosResultados) {
        if (estadoResultados != 200) {
          alert("Error al cargar los resultados históricos del paciente");
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
      alert("Error al cargar la sesión");
      return;
    }

    sesionEditando = datosSesion;

    rest.get("/api/sesiones/" + idSesion + "/ejercicios", function (estadoEjercicios, datosEjercicios) {
      if (estadoEjercicios != 200) {
        alert("Error al cargar los ejercicios de la sesión");
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
  let confirmar = confirm("¿Seguro que quieres eliminar este ejercicio?");

  if (!confirmar) {
    return;
  }

  rest.delete("/api/ejercicios/" + idEjercicio, function (estado, respuesta) {
    if (estado == 200) {
      cargarEjercicios();
    }
    else {
      alert("Error al eliminar el ejercicio");
    }
  });
}

function reactivarEjercicio(idEjercicio) {
  rest.put("/api/ejercicios/" + idEjercicio + "/reactivar", {}, function (estado, respuesta) {
    if (estado == 200) {
      cargarEjercicios();
      filtrarPapeleraEjercicios();
    }
    else {
      alert("Error al reactivar el ejercicio");
    }
  });
}

function cambiarEstadoPaciente(idPaciente, activo) {
  let nuevoEstado;

  if (activo == 1) {
    let confirmar = confirm("¿Seguro que quieres desactivar este paciente?");

    if (!confirmar) {
      return;
    }

    nuevoEstado = 0;
  }
  else {
    nuevoEstado = 1;
  }

  rest.put("/api/pacientes/" + idPaciente + "/estado", {
    activo: nuevoEstado
  }, function (estado, respuesta) {
    if (estado == 200) {
      cargarPacientesConFiltro();
    }
    else {
      alert("Error al cambiar el estado del paciente");
    }
  });
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
  localStorage.setItem("idPacienteSeleccionado", idPaciente);
  cargarDatosMenuPaciente(idPaciente);
}

function cerrarSesion() {
  localStorage.clear();

  window.location.href = "../index.html";
}

function limpiarFormularioPaciente() {
  document.getElementById("formAltaPaciente").reset();
}

function limpiarFormularioEjercicio() {
  document.getElementById("formCrearEjercicio").reset();
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

  if (tipo == "articulacion_guiada") {
    return "Repite lentamente la secuencia";
  }

  return "";
}

function editarEjercicio(idEjercicio) {
  localStorage.setItem("idEjercicioSeleccionado", idEjercicio);
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
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  cargarDatosPacienteEditar(idPaciente);
}

function irProgresoPaciente() {
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  cargarPantallaProgresoPaciente(idPaciente);
}

function irSesionesPaciente() {
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  cargarSesionesPaciente(idPaciente);
}

function irCrearSesion() {
  prepararPantallaCrearSesion();
  mostrarPantalla("pantallaCrearSesion");
}

function irEditarPerfil() {
  document.getElementById("menuPerfil").classList.add("oculto");
  alert("Más adelante aquí se abrirá la pantalla de editar perfil");
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
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  cargarDatosMenuPaciente(idPaciente);
}

function volverDesdeSesionesPaciente() {
  resetearFiltroSesionesPaciente();
  volverAlMenuPaciente();
}

function volverDesdeResultadosSesion() {
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  cargarSesionesPaciente(idPaciente);
}

function volverDesdeProgresoPaciente() {
  resetearFiltroGraficaProgreso();
  volverAlMenuPaciente();
}

function volverDesdeCrearSesion() {
  prepararPantallaCrearSesion();
  volverDesdeSesionesPaciente();
}

function volverDesdeEditarSesion() {
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  cargarSesionesPaciente(idPaciente);
}

function volverDesdeAccesibilidad() {
  irPantallaPacientes();
}

function rellenarFormularioEditarEjercicio(ejercicio) {
  document.getElementById("edit_ej_nombre").value = ejercicio.nombre || "";
  document.getElementById("edit_ej_texto_estimulo").value = ejercicio.texto_estimulo || "";
  document.getElementById("edit_ej_duracion").value = ejercicio.duracion_maxima_seg || "";
  document.getElementById("edit_ej_tipo").value = ejercicio.tipo_ejercicio || "";
  document.getElementById("edit_ej_dificultad").value = ejercicio.nivel_dificultad || "";
  document.getElementById("edit_ej_descripcion").value = ejercicio.descripcion || "";
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
  document.getElementById("edit_password_paciente").value = paciente.password || "";
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
    (metricasPaciente.numero_intentos || 0);

  document.getElementById("metricaTiempoRespuesta").textContent =
    (metricasPaciente.tiempo_respuesta_medio || 0);

  document.getElementById("metricaDuracionHabla").textContent =
    (metricasPaciente.duracion_habla_media || 0);

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
    item.style.padding = "10px";
    item.style.marginBottom = "10px";
    item.style.backgroundColor = "#fff";

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <span>${ejercicioSesion.nombre}</span>
        <label>
          Intentos:
          <input type="number" class="input-max-intentos" value="${ejercicioSesion.max_intentos || 1}" min="1" style="width:60px;">
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
      item.style.border = "1px solid #ccc";
      item.style.padding = "10px";
      item.style.marginBottom = "10px";
      item.style.backgroundColor = "#fff";

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <span>${ejercicio.nombre}</span>
          <label>
            Intentos:
            <input type="number" class="input-max-intentos" value="1" min="1" style="width:60px;">
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
      alert("Error al cargar los datos del paciente");
    }
  });
}

function cargarResultadosSesion(idSesion) {
  rest.get("/api/resultados/sesion/" + idSesion, function (estado, datos) {
    if (estado == 200) {
      resultadosSesion = datos;
      pintarTablaResultadosSesion(resultadosSesion);
      mostrarPantalla("pantallaResultadosSesion");
    }
    else {
      alert("Error al cargar los resultados de la sesión");
    }
  });
}

function editarSesion(idSesion) {
  localStorage.setItem("idSesionSeleccionada", idSesion);
  cargarPantallaEditarSesion(idSesion);
}

function revisarSesion(idSesion) {
  localStorage.setItem("idSesionSeleccionada", idSesion);

  let sesion = sesionesPaciente.find(function (s) {
    return s.id_sesion == idSesion;
  });

  if (!sesion) {
    alert("No se ha encontrado la sesión");
    return;
  }

  sesionRevisando = sesion;

  if (sesion.estado == "realizada") {
    rest.put("/api/sesiones/" + idSesion + "/revisar", {}, function (estado, respuesta) {
      if (estado != 200) {
        alert("Error al marcar la sesión como revisada");
        return;
      }

      sesionRevisando.estado = "revisada";
      cargarResultadosSesion(idSesion);
      cargarSesionesPaciente(sesion.id_paciente);
    });
  }
  else {
    cargarResultadosSesion(idSesion);
  }
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
        suma_exito: 0
      };
    }

    grupos[clave].intentos += 1;
    grupos[clave].suma_wer += parseFloat(resultado.wer || 0);
    grupos[clave].suma_precision += parseFloat(resultado.precision_porcentaje || 0);
    grupos[clave].suma_tiempo_respuesta += parseFloat(resultado.tiempo_respuesta_ms || 0);
    grupos[clave].suma_duracion_habla += parseFloat(resultado.duracion_habla_ms || 0);
    grupos[clave].suma_exito += parseInt(resultado.exito || 0);
  });

  let agrupados = Object.values(grupos);

  agrupados.sort(function (a, b) {
    return a.orden - b.orden;
  });

  return agrupados;
}

function generarInformeSesion() {
  if (sesionRevisando == null || pacienteSeleccionado == null || usuarioLogueado == null) {
    alert("No hay datos suficientes para generar el informe");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("Informe de la sesión", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Fecha de generación: " + formatearFecha(new Date()), 14, y);
  y += 10;

  doc.text("Paciente: " + pacienteSeleccionado.nombre + " " + pacienteSeleccionado.apellidos, 14, y);
  y += 8;

  doc.text("Profesional: " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos, 14, y);
  y += 8;

  doc.text("Sesión: " + sesionRevisando.id_sesion, 14, y);
  y += 8;

  doc.text("Fecha de creación: " + formatearFecha(sesionRevisando.fecha_hora_inicio), 14, y);
  y += 8;

  doc.text("Estado: " + sesionRevisando.estado, 14, y);
  y += 12;

  doc.setFontSize(11);
  doc.text("Resultados:", 14, y);
  y += 8;

  let resultadosAgrupados = agruparResultadosPorEjercicio(resultadosSesion);

  resultadosAgrupados.forEach(function (resultado) {
    let werMedio = (resultado.suma_wer / resultado.intentos).toFixed(2);
    let precisionMedia = (resultado.suma_precision / resultado.intentos).toFixed(2);
    let tiempoRespuestaMedio = (resultado.suma_tiempo_respuesta / resultado.intentos).toFixed(2);
    let duracionHablaMedia = (resultado.suma_duracion_habla / resultado.intentos).toFixed(2);
    let tasaExito = ((resultado.suma_exito / resultado.intentos) * 100).toFixed(2);

    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(
      resultado.orden + ". " +
      resultado.nombre_ejercicio +
      " | Tipo: " + formatearTipoEjercicio(resultado.tipo_ejercicio) +
      " | Intentos: " + resultado.intentos +
      " | WER: " + werMedio +
      " | Precisión: " + precisionMedia +
      " | Tiempo respuesta: " + tiempoRespuestaMedio +
      " | Duración habla: " + duracionHablaMedia +
      " | Tasa éxito: " + tasaExito + "%",
      14,
      y,
      { maxWidth: 180 }
    );

    y += 14;
  });

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

  if (filtro == "todas" || filtro == "precision") {
    datasets.push({
      label: "Precisión",
      data: evolucionPaciente.map(function (s) { return parseFloat(s.precision_media || 0); }),
      borderWidth: 2,
      fill: false
    });
  }

  if (filtro == "todas" || filtro == "tiempo_respuesta") {
    datasets.push({
      label: "Tiempo respuesta",
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
    imagen.src = "img/accesibilidad-demo-contraste.png";
  }
  else if (estilo == "letra-grande") {
    imagen.src = "img/accesibilidad-demo-letra-grande.png";
  }
  else {
    imagen.src = "img/accesibilidad-demo-normal.png";
  }
}

function calcularPorcentajeMejoraGlobal() {
  if (!evolucionPaciente || evolucionPaciente.length < 2) {
    return 0;
  }

  let primera = parseFloat(evolucionPaciente[0].precision_media || 0);
  let ultima = parseFloat(evolucionPaciente[evolucionPaciente.length - 1].precision_media || 0);

  if (primera <= 0) {
    return ultima;
  }

  return ((ultima - primera) / primera) * 100;
}

function exportarDatosPacienteCSV() {
  if (!resultadosHistoricosPaciente || resultadosHistoricosPaciente.length == 0) {
    alert("No hay datos para exportar");
    return;
  }

  let lineas = [];
  lineas.push("fecha_sesion,id_sesion,nombre_ejercicio,tipo_ejercicio,intento,wer,precision,tiempo_respuesta,duracion_habla,exito");

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
    alert("No hay datos suficientes para generar el informe");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("Informe de progreso del paciente", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Fecha de generación: " + formatearFecha(new Date()), 14, y);
  y += 8;

  doc.text("Paciente: " + pacienteSeleccionado.nombre + " " + pacienteSeleccionado.apellidos, 14, y);
  y += 8;

  doc.text("Profesional: " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos, 14, y);
  y += 8;

  doc.text("Porcentaje de mejora: " + calcularPorcentajeMejoraGlobal().toFixed(2) + "%", 14, y);
  y += 12;

  doc.text("Métricas globales:", 14, y);
  y += 8;

  doc.text("Precisión: " + (metricasPaciente.precision_media || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("WER: " + (metricasPaciente.wer_medio || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("Tasa de éxito: " + (metricasPaciente.tasa_exito || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("Número de intentos: " + (metricasPaciente.numero_intentos || 0), 14, y);
  y += 8;
  doc.text("Tiempo de respuesta medio: " + (metricasPaciente.tiempo_respuesta_medio || 0).toFixed(2), 14, y);
  y += 8;
  doc.text("Duración del habla media: " + (metricasPaciente.duracion_habla_media || 0).toFixed(2), 14, y);
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
    { titulo: "Precisión", campo: "precision_media" },
    { titulo: "WER", campo: "wer_medio" },
    { titulo: "Éxito", campo: "tasa_exito" },
    { titulo: "Tiempo de respuesta", campo: "tiempo_respuesta_medio" },
    { titulo: "Duración del habla", campo: "duracion_habla_media" }
  ];

  graficas.forEach(function (grafica) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text(grafica.titulo, 14, 20);

    let imagen = generarGraficaTemporal(grafica.titulo, grafica.campo);
    doc.addImage(imagen, "PNG", 14, 30, 180, 90);
  });

  doc.save("informe_progreso_paciente.pdf");
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
    item.style.padding = "10px";
    item.style.marginBottom = "10px";
    item.style.backgroundColor = "#fff";

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <span>${ejercicio.nombre}</span>
        <label>
          Intentos:
          <input type="number" class="input-max-intentos" value="1" min="1" style="width:60px;">
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
  let idPaciente = localStorage.getItem("idPacienteSeleccionado");

  if (!idPaciente) {
    alert("No se ha seleccionado ningún paciente");
    return;
  }

  let itemsSesion = document.querySelectorAll("#listaEjerciciosSesion li");

  if (itemsSesion.length == 0) {
    alert("Debe añadir al menos un ejercicio a la sesión");
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
      alert("Error al crear la sesión");
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
          alert("Error al asociar ejercicios a la sesión");
          return;
        }

        completadas++;

        if (completadas == total) {
          alert("Sesión creada correctamente");
          prepararPantallaCrearSesion();
          cargarSesionesPaciente(idPaciente);
        }
      });
    });
  });
}

function guardarEdicionSesion() {
  if (sesionEditando == null) {
    alert("No se ha cargado ninguna sesión");
    return;
  }

  let itemsSesion = document.querySelectorAll("#listaEditarEjerciciosSesion li");

  if (itemsSesion.length == 0) {
    alert("La sesión debe tener al menos un ejercicio");
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
      alert("Error al actualizar la sesión");
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
          alert("Error al eliminar los ejercicios antiguos de la sesión");
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
            alert("Error al guardar los ejercicios editados");
            return;
          }

          insertadas++;

          if (insertadas == total) {
            alert("Sesión actualizada correctamente");
            let idPaciente = localStorage.getItem("idPacienteSeleccionado");
            if (idPaciente) {
              cargarSesionesPaciente(idPaciente);
            }
          }
        });
      });
    }
  });
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

  if (estilo == "alto-contraste") {
    document.body.classList.add("accesibilidad-alto-contraste");
  }
  else if (estilo == "letra-grande") {
    document.body.classList.add("accesibilidad-letra-grande");
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

  if (estiloGuardado == "alto-contraste") {
    document.body.classList.add("accesibilidad-alto-contraste");
  }
  else if (estiloGuardado == "letra-grande") {
    document.body.classList.add("accesibilidad-letra-grande");
  }
  else {
    document.body.classList.add("accesibilidad-normal");
  }
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
      alert("Faltan datos obligatorios");
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
        alert("Error al crear el usuario");
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
          alert("Error al crear el paciente");
          return;
        }

        alert("Paciente dado de alta correctamente");
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
    event.preventDefault();

    var nombre = document.getElementById("ej_nombre").value.trim();
    var texto_estimulo = document.getElementById("ej_texto_estimulo").value.trim();
    var duracion_maxima_seg = parseInt(document.getElementById("ej_duracion").value);
    var tipo_ejercicio = document.getElementById("ej_tipo").value;
    var nivel_dificultad = document.getElementById("ej_dificultad").value;
    var descripcion = document.getElementById("ej_descripcion").value.trim();

    if (!nombre || !texto_estimulo || !duracion_maxima_seg || !tipo_ejercicio || !nivel_dificultad) {
      alert("Faltan datos obligatorios");
      return;
    }

    var instruccion = obtenerInstruccionSegunTipo(tipo_ejercicio);

    var bodyEjercicio = {
      nombre: nombre,
      descripcion: descripcion || null,
      tipo_ejercicio: tipo_ejercicio,
      nivel_dificultad: nivel_dificultad,
      texto_estimulo: texto_estimulo,
      instruccion: instruccion,
      duracion_maxima_seg: duracion_maxima_seg,
      activo: 1
    };

    rest.post("/api/ejercicios", bodyEjercicio, function (estado, respuesta) {
      if (estado != 201) {
        alert("Error al crear el ejercicio");
        return;
      }

      alert("Ejercicio creado correctamente");
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

    var idEjercicio = localStorage.getItem("idEjercicioSeleccionado");

    var nombre = document.getElementById("edit_ej_nombre").value.trim();
    var texto_estimulo = document.getElementById("edit_ej_texto_estimulo").value.trim();
    var duracion_maxima_seg = parseInt(document.getElementById("edit_ej_duracion").value);
    var tipo_ejercicio = document.getElementById("edit_ej_tipo").value;
    var nivel_dificultad = document.getElementById("edit_ej_dificultad").value;
    var descripcion = document.getElementById("edit_ej_descripcion").value.trim();

    if (!idEjercicio || !nombre || !texto_estimulo || !duracion_maxima_seg || !tipo_ejercicio || !nivel_dificultad) {
      alert("Faltan datos obligatorios");
      return;
    }

    var instruccion = obtenerInstruccionSegunTipo(tipo_ejercicio);

    var bodyEjercicio = {
      nombre: nombre,
      descripcion: descripcion || null,
      tipo_ejercicio: tipo_ejercicio,
      nivel_dificultad: nivel_dificultad,
      texto_estimulo: texto_estimulo,
      instruccion: instruccion,
      duracion_maxima_seg: duracion_maxima_seg,
      activo: 1
    };

    rest.put("/api/ejercicios/" + idEjercicio, bodyEjercicio, function (estado, respuesta) {
      if (estado != 200) {
        alert("Error al actualizar el ejercicio");
        return;
      }

      alert("Ejercicio actualizado correctamente");
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
      alert("No se ha cargado ningún paciente para editar");
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

    if (!username || !password || !nombre || !apellidos || !sexo || !nivel_afasia) {
      alert("Faltan datos obligatorios");
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
        alert("Error al actualizar los datos de acceso del paciente");
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
          alert("Error al actualizar los datos clínicos del paciente");
          return;
        }

        alert("Paciente actualizado correctamente");
        cargarPacientes();
        volverAlMenuPaciente();
      });
    });
  });
});
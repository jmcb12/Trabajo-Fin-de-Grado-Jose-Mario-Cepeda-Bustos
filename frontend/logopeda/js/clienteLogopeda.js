let pacientes = [];
let ejercicios = [];

let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

let idProfesional = null;
let ejercicioEditando = null;

if (usuarioLogueado != null) {
  idProfesional = usuarioLogueado.id_profesional;
}


window.onload = function () {
  cargarDatosLogopeda();
  cargarPacientes();
  cargarEjercicios();
};


function mostrarPantalla(idPantalla) {
  let pantallas = document.querySelectorAll(".pantalla");

  pantallas.forEach(function (pantalla) {
    pantalla.classList.add("oculto");
  });

  document.getElementById(idPantalla).classList.remove("oculto");
}

function cargarDatosLogopeda() {
  if (usuarioLogueado == null) {
    alert("No has iniciado sesión");
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("tituloBienvenida").textContent =
    "Bienvenido, doctor " + usuarioLogueado.nombre + " " + usuarioLogueado.apellidos;
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
            <td>${paciente.diagnostico_principal}</td>
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
      <td>${ejercicio.tipo_ejercicio}</td>
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
      <td>${ejercicio.tipo_ejercicio}</td>
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

function seleccionarPaciente(idPaciente) {
  localStorage.setItem("idPacienteSeleccionado", idPaciente);

  mostrarPantalla("pantallaInicio");
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
  resetearFiltroPacientes();
  pintarTablaPacientes(pacientes);
  mostrarPantalla("pantallaInicio");
}

function irBibliotecaEjercicios() {
  resetearFiltroEjercicios();

  let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 1;
  });

  pintarTablaEjercicios(ejerciciosActivos);
  mostrarPantalla("pantallaEjercicios");
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

function volverDesdePapeleraEjercicios() {
  resetearFiltroPapeleraEjercicios();
  resetearFiltroEjercicios();

  let ejerciciosActivos = ejercicios.filter(function (ejercicio) {
    return ejercicio.activo == 1;
  });

  pintarTablaEjercicios(ejerciciosActivos);
  mostrarPantalla("pantallaEjercicios");
}

function rellenarFormularioEditarEjercicio(ejercicio) {
  document.getElementById("edit_ej_nombre").value = ejercicio.nombre || "";
  document.getElementById("edit_ej_texto_estimulo").value = ejercicio.texto_estimulo || "";
  document.getElementById("edit_ej_duracion").value = ejercicio.duracion_maxima_seg || "";
  document.getElementById("edit_ej_tipo").value = ejercicio.tipo_ejercicio || "";
  document.getElementById("edit_ej_dificultad").value = ejercicio.nivel_dificultad || "";
  document.getElementById("edit_ej_descripcion").value = ejercicio.descripcion || "";
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
        irPantallaPacientes();
        cargarPacientes();
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
});
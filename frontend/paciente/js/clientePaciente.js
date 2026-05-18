let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioPaciente"));

let idPaciente = null;
let sesionesPaciente = [];
let sesionPendiente = null;
let ejerciciosSesion = [];

let ejercicioActual = 0;
let intentoActual = 1;

let respuestaObtenida = "";
let tiempoInicioEjercicio = null;
let tiempoInicioGrabacion = null;
let temporizadorGrabacion = null;
let reconocimientoVoz = null;
let grabadorAudio = null;
let fragmentosAudio = [];
let audioDefinitivo = null;

let ejerciciosRealizados = 0;
let intentosRealizados = 0;
let fechaInicioSesion = null;


if (usuarioLogueado != null) {
  idPaciente = usuarioLogueado.id_paciente;
}


window.onload = function () {
  aplicarEstiloPacienteGuardado();
  prepararCierreSesionOculto();

  usuarioLogueado = JSON.parse(localStorage.getItem("usuarioPaciente"));

  if (usuarioLogueado == null) {
    mostrarPantalla("pantalla-login-paciente");
  }
  else {
    idPaciente = usuarioLogueado.id_paciente;
    cargarDatosPaciente();
  }
};


function iniciarSesionPaciente(event) {
  event.preventDefault();

  let username = document.getElementById("loginUsuarioPaciente").value.trim();
  let password = document.getElementById("loginPasswordPaciente").value.trim();

  if (username == "" || password == "") {
    mostrarAvisoPaciente("Aviso", "Introduce usuario y contraseña", "warning");
    return;
  }

  rest.post("/api/auth/login", {
    username: username,
    password: password
  }, function (estado, datos) {

    if (estado != 200) {
      if (estado == 403) {
        mostrarAvisoPaciente("Error", "Usuario desactivado. Contacte con su logopeda.", "danger");
      }
      else if (estado == 401) {
        mostrarAvisoPaciente("Error", "Usuario o contraseña incorrectos", "danger");
      }
      else if (estado == 400) {
        mostrarAvisoPaciente("Aviso", "Introduce usuario y contraseña", "warning");
      }
      else {
        mostrarAvisoPaciente("Error", "Ha ocurrido un error con el servidor", "danger");
      }

      return;
    }

    if (!datos || !datos.usuario || !datos.token) {
      mostrarAvisoPaciente("Error", "Respuesta de login incorrecta", "danger");
      return;
    }

    let usuario = datos.usuario;

    let rolUsuario = "";

    if (usuario.rol) {
      rolUsuario = usuario.rol.trim().toLowerCase();
    }

    if (rolUsuario != "paciente") {
      mostrarAvisoPaciente("Aviso", "Este acceso es solo para pacientes", "warning");
      return;
    }

    usuarioLogueado = usuario;
    idPaciente = usuario.id_paciente;

    localStorage.setItem("usuarioPaciente", JSON.stringify(usuarioLogueado));
    localStorage.setItem("tokenJWTPaciente", datos.token);

    cargarDatosPaciente();
  });
}


function mostrarPantalla(idPantalla) {
  let pantallas = document.querySelectorAll(".pantalla");

  pantallas.forEach(function (pantalla) {
    pantalla.classList.add("oculto");
  });

  let pantallaActiva = document.getElementById(idPantalla);

  if (pantallaActiva) {
    pantallaActiva.classList.remove("oculto");

    let titulo = pantallaActiva.querySelector("h1, h2, h3");

    if (titulo) {
      titulo.setAttribute("tabindex", "-1");
      titulo.focus();
    }
  }
}

function aplicarEstiloPaciente(estilo) {
  localStorage.setItem("estiloAccesibilidadPaciente", estilo);

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
}


function aplicarEstiloPacienteGuardado() {
  let estiloGuardado = localStorage.getItem("estiloAccesibilidadPaciente");

  if (!estiloGuardado) {
    estiloGuardado = "normal";
  }

  aplicarEstiloPaciente(estiloGuardado);
}


function mostrarAvisoPaciente(titulo, mensaje, tipo) {
  let modalTitulo = document.getElementById("modalAvisoPacienteTitulo");
  let modalTexto = document.getElementById("modalAvisoPacienteTexto");
  let modalHeader = document.getElementById("modalAvisoPacienteHeader");

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

  let modal = new bootstrap.Modal(document.getElementById("modalAvisoPaciente"));
  modal.show();
}


function cargarDatosPaciente() {
  if (usuarioLogueado == null) {
    mostrarPantalla("pantalla-login-paciente");
    return;
  }

  if (usuarioLogueado.rol != "paciente") {
    mostrarAvisoPaciente("Aviso", "El usuario no es un paciente", "warning");
    localStorage.removeItem("usuarioPaciente");
    mostrarPantalla("pantalla-login-paciente");
    return;
  }

  if (idPaciente == null) {
    mostrarAvisoPaciente("Error", "No se ha encontrado el paciente asociado al usuario", "danger");
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("saludoPaciente").textContent = "Hola " + usuarioLogueado.nombre;

  cargarSesionesPaciente();
}


function cargarSesionesPaciente() {
  rest.get("/api/sesiones/paciente/" + idPaciente, function (estado, datos) {
    if (estado == 200) {
      sesionesPaciente = datos;
    }
    else {
      sesionesPaciente = [];
    }

    buscarSesionPendiente();
    pintarMenuPrincipal();
  });
}


function buscarSesionPendiente() {
  sesionPendiente = null;

  for (let i = 0; i < sesionesPaciente.length; i++) {
    if (sesionesPaciente[i].estado == "pendiente") {
      sesionPendiente = sesionesPaciente[i];
      return;
    }
  }
}


function pintarMenuPrincipal() {
  let textoSesionPendiente = document.getElementById("textoSesionPendiente");
  let btnEmpezarSesion = document.getElementById("btnEmpezarSesion");

  if (sesionPendiente != null) {
    textoSesionPendiente.textContent = "Hoy tienes una sesión pendiente";
    btnEmpezarSesion.classList.remove("oculto");
  }
  else {
    textoSesionPendiente.innerHTML =
      "Ahora mismo no tienes ninguna sesión pendiente.<br><br>Tu logopeda te avisará cuando tengas una nueva.";

    btnEmpezarSesion.classList.add("oculto");
  }

  mostrarPantalla("pantalla-menu");
}


function volverMenuPrincipal() {
  sesionPendiente = null;
  ejerciciosSesion = [];
  ejercicioActual = 0;
  intentoActual = 1;
  respuestaObtenida = "";

  cargarSesionesPaciente();
  mostrarPantalla("pantalla-menu");
}


function abrirMenuSesion() {
  if (sesionPendiente == null) {
    mostrarAvisoPaciente("Aviso", "No tienes ninguna sesión pendiente", "warning");
    return;
  }

  rest.get("/api/sesiones/" + sesionPendiente.id_sesion + "/ejercicios", function (estado, datos) {
    if (estado == 200) {
      ejerciciosSesion = datos;

      document.getElementById("numeroEjerciciosSesion").textContent =
        ejerciciosSesion.length + " EJERCICIOS";

      mostrarPantalla("pantalla-menu-sesion");
    }
    else {
      mostrarAvisoPaciente("Error", "Error al cargar los ejercicios de la sesión", "danger");
    }
  });
}


function comenzarSesion() {
  ejercicioActual = 0;
  intentoActual = 1;
  respuestaObtenida = "";

  ejerciciosRealizados = 0;
  intentosRealizados = 0;
  fechaInicioSesion = new Date();

  pintarEjercicioActual();
}


function obtenerEjercicioActual() {
  return ejerciciosSesion[ejercicioActual];
}

function actualizarBarraProgresoEjercicio() {
  let barra = document.getElementById("barraProgresoEjercicio");
  let contenedorBarra = document.querySelector(".barra-progreso-ejercicio");

  if (!barra || !contenedorBarra || !ejerciciosSesion || ejerciciosSesion.length == 0) {
    return;
  }

  let numeroEjercicioActual = ejercicioActual + 1;
  let totalEjercicios = ejerciciosSesion.length;

  let porcentaje = (numeroEjercicioActual / totalEjercicios) * 100;

  barra.style.width = porcentaje + "%";
  contenedorBarra.setAttribute("aria-valuenow", Math.round(porcentaje));
}

function pintarEjercicioActual() {
  if (ejercicioActual >= ejerciciosSesion.length) {
    finalizarSesion();
    return;
  }

  let ejercicio = obtenerEjercicioActual();

  respuestaObtenida = "";
  tiempoInicioEjercicio = new Date();

  document.getElementById("contadorEjercicio").textContent =
    "Ejercicio " + (ejercicioActual + 1) + "/" + ejerciciosSesion.length;

  actualizarBarraProgresoEjercicio();

  document.getElementById("contadorIntento").textContent =
    "Intento " + intentoActual + "/" + ejercicio.max_intentos;

  document.getElementById("instruccionEjercicio").textContent =
    ejercicio.instruccion;

  pintarContenidoEjercicio("contenidoEjercicio", ejercicio);

  if (debeMostrarBotonEscuchar(ejercicio)) {
    document.getElementById("btnEscucharOtraVez").classList.remove("oculto");
  }
  else {
    document.getElementById("btnEscucharOtraVez").classList.add("oculto");
  }

  mostrarPantalla("pantalla-ejercicio");

  leerInstruccionEjercicio(ejercicio);
}

function pintarContenidoEjercicio(idContenedor, ejercicio) {
  let contenedor = document.getElementById(idContenedor);

  if (ejercicio.tipo_ejercicio == "denominacion") {
    if (ejercicio.imagen_denominacion) {
      contenedor.innerHTML = `
        <img 
          src="${ejercicio.imagen_denominacion}" 
          alt="Imagen del ejercicio de denominación"
          style="max-width:100%; max-height:260px; border-radius:12px;">
      `;
    }
    else {
      contenedor.innerHTML = "<p>[ Imagen asociada al ejercicio ]</p>";
    }
  }
  else {
    contenedor.innerHTML = "<h2>\"" + ejercicio.texto_estimulo + "\"</h2>";
  }
}

function debeMostrarBotonEscuchar(ejercicio) {
  if (ejercicio.tipo_ejercicio == "repeticion_palabra") {
    return true;
  }

  if (ejercicio.tipo_ejercicio == "repeticion_frase") {
    return true;
  }

  return false;
}

function leerTextoPaciente(texto, callback) {
  if (!texto) {
    if (callback) {
      callback();
    }
    return;
  }

  if ("speechSynthesis" in window) {
    let mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = "es-ES";
    mensaje.rate = 0.7;

    mensaje.onend = function () {
      if (callback) {
        callback();
      }
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(mensaje);
  }
  else {
    if (callback) {
      callback();
    }
  }
}

function escucharEstimulo() {
  let ejercicio = obtenerEjercicioActual();

  if (ejercicio == null || ejercicio.texto_estimulo == null) {
    return;
  }

  leerTextoPaciente(ejercicio.texto_estimulo, null);
}

function leerInstruccionEjercicio(ejercicio) {
  if (ejercicio == null) {
    return;
  }

  leerTextoPaciente(ejercicio.instruccion, function () {
    if (debeMostrarBotonEscuchar(ejercicio)) {
      escucharEstimulo();
    }
  });
}

function iniciarGrabacion() {
  let ejercicio = obtenerEjercicioActual();

  respuestaObtenida = "";
  tiempoInicioGrabacion = new Date();

  pintarContenidoEjercicio("contenidoGrabacion", ejercicio);

  mostrarPantalla("pantalla-grabacion");

  iniciarReconocimientoVoz();

  iniciarGrabacionAudio();

  let tiempoMaximo = ejercicio.duracion_maxima_seg;

  if (tiempoMaximo == null || tiempoMaximo == "") {
    tiempoMaximo = 10;
  }

  let tiempoRestante = tiempoMaximo;

  document.getElementById("tiempoRestante").textContent =
    "Tiempo restante: " + tiempoRestante + " s";

  temporizadorGrabacion = setInterval(function () {
    tiempoRestante--;

    document.getElementById("tiempoRestante").textContent =
      "Tiempo restante: " + tiempoRestante + " s";

    if (tiempoRestante <= 0) {
      terminarGrabacion();
    }
  }, 1000);
}


function iniciarReconocimientoVoz() {
  let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    respuestaObtenida = "";
    return;
  }

  reconocimientoVoz = new SpeechRecognition();
  reconocimientoVoz.lang = "es-ES";
  reconocimientoVoz.continuous = false;
  reconocimientoVoz.interimResults = false;

  reconocimientoVoz.onresult = function (event) {
    respuestaObtenida = event.results[0][0].transcript;
  };

  reconocimientoVoz.onerror = function () {
    respuestaObtenida = "";
  };

  try {
    reconocimientoVoz.start();
  }
  catch (error) {
    respuestaObtenida = "";
  }
}


function iniciarGrabacionAudio() {
  audioDefinitivo = null;
  fragmentosAudio = [];

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      grabadorAudio = new MediaRecorder(stream);

      grabadorAudio.ondataavailable = function (event) {
        if (event.data && event.data.size > 0) {
          fragmentosAudio.push(event.data);
        }
      };

      grabadorAudio.onstop = function () {
        audioDefinitivo = new Blob(fragmentosAudio, { type: "audio/webm" });

        stream.getTracks().forEach(function (track) {
          track.stop();
        });
      };

      grabadorAudio.start();
    })
    .catch(function () {
      audioDefinitivo = null;
    });
}


function pararGrabacionAudio() {
  if (grabadorAudio != null && grabadorAudio.state != "inactive") {
    grabadorAudio.stop();
  }
}


function terminarGrabacion() {
  if (temporizadorGrabacion != null) {
    clearInterval(temporizadorGrabacion);
    temporizadorGrabacion = null;
  }

  if (reconocimientoVoz != null) {
    try {
      reconocimientoVoz.stop();
    }
    catch (error) {
      console.log("No se pudo parar el reconocimiento");
    }
  }

  pararGrabacionAudio();

  setTimeout(function () {
    mostrarResultadoEjercicio();
  }, 500);
}


function mostrarResultadoEjercicio() {
  let ejercicio = obtenerEjercicioActual();
  let respuesta = respuestaObtenida.trim();

  if (respuesta == "") {
    document.getElementById("intentosRestantesNoDetectado").textContent =
      "Intentos restantes: " + (ejercicio.max_intentos - intentoActual + 1);

    mostrarPantalla("pantalla-resultado-no-detectado");
    return;
  }

  let intentosRestantes = ejercicio.max_intentos - intentoActual;

  document.getElementById("respuestaDetectada").textContent = "\"" + respuesta + "\"";

  document.getElementById("intentosRestantesDetectado").textContent =
    "Intentos restantes: " + intentosRestantes;

  if (intentosRestantes > 0) {
    document.getElementById("btnRepetirDetectado").classList.remove("oculto");
  }
  else {
    document.getElementById("btnRepetirDetectado").classList.add("oculto");
  }

  mostrarPantalla("pantalla-resultado-detectado");
}


function repetirEjercicioSinRespuesta() {
  audioDefinitivo = null;
  fragmentosAudio = [];
  pintarEjercicioActual();
}


function repetirEjercicioConRespuesta() {
  let ejercicio = obtenerEjercicioActual();

  if (intentoActual < ejercicio.max_intentos) {
    audioDefinitivo = null;
    fragmentosAudio = [];

    intentoActual++;
    intentosRealizados++;
    pintarEjercicioActual();
  }
  else {
    continuarEjercicio();
  }
}


function continuarEjercicio() {
  let ejercicio = obtenerEjercicioActual();

  intentosRealizados++;

  guardarResultadoEjercicio(ejercicio);
}


function saltarEjercicio() {
  let ejercicio = obtenerEjercicioActual();

  respuestaObtenida = "";
  intentosRealizados++;

  guardarResultadoEjercicio(ejercicio);
}


function siguienteEjercicio() {
  ejercicioActual++;
  intentoActual = 1;

  if (ejercicioActual >= ejerciciosSesion.length) {
    finalizarSesion();
  }
  else {
    pintarEjercicioActual();
  }
}


function guardarResultadoEjercicio(ejercicio) {
  let respuestaEsperada = ejercicio.respuesta_esperada || ejercicio.texto_estimulo;
  let precision = calcularPrecision(respuestaEsperada, respuestaObtenida);
  let wer = calcularWER(respuestaEsperada, respuestaObtenida);

  let tiempoRespuestaMs = new Date() - tiempoInicioEjercicio;
  let duracionHablaMs = new Date() - tiempoInicioGrabacion;

  let exito = 0;

  if (precision >= 60) {
    exito = 1;
  }

  let formData = new FormData();

  formData.append("id_sesion_ejercicio", ejercicio.id_sesion_ejercicio);
  formData.append("numero_intento", intentoActual);
  formData.append("respuesta_esperada", respuestaEsperada || "");
  formData.append("respuesta_obtenida", respuestaObtenida || "");
  formData.append("precision_porcentaje", precision);
  formData.append("wer", wer);
  formData.append("tiempo_respuesta_ms", tiempoRespuestaMs);
  formData.append("duracion_habla_ms", duracionHablaMs);
  formData.append("exito", exito);
  formData.append("observaciones", "Resultado registrado desde la aplicación del paciente");

  if (audioDefinitivo != null) {
    let nombreAudio =
      "audio_sesion_" + sesionPendiente.id_sesion +
      "_ejercicio_" + ejercicio.id_ejercicio +
      "_intento_" + intentoActual +
      ".webm";

    formData.append("audio_paciente", audioDefinitivo, nombreAudio);
  }

  rest.postForm("/api/resultados", formData, function (estado, datos) {
    if (estado == 201 || estado == 200) {
      audioDefinitivo = null;
      fragmentosAudio = [];
      marcarEjercicioCompletado(ejercicio);
    }
    else {
      mostrarAvisoPaciente("Error", "Error al guardar el resultado del ejercicio", "danger");
    }
  });
}


function marcarEjercicioCompletado(ejercicio) {
  let datosSesionEjercicio = {
    orden: ejercicio.orden,
    max_intentos: ejercicio.max_intentos,
    completado: 1
  };

  rest.put("/api/sesion-ejercicios/" + ejercicio.id_sesion_ejercicio, datosSesionEjercicio, function (estado, datos) {
    if (estado == 200) {
      ejerciciosRealizados++;

      document.getElementById("textoFeedbackEjercicio").textContent =
        "Ejercicio " + (ejercicioActual + 1) + " de " + ejerciciosSesion.length + " terminado";

      mostrarPantalla("pantalla-feedback");
    }
    else {
      mostrarAvisoPaciente("Error", "Error al marcar el ejercicio como completado", "danger");
    }
  });
}


function normalizarTexto(texto) {
  if (texto == null) {
    return "";
  }

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:¿?¡!"]/g, "")
    .trim();
}


function calcularPrecision(esperada, obtenida) {
  let textoEsperado = normalizarTexto(esperada);
  let textoObtenido = normalizarTexto(obtenida);

  let palabrasEsperadas = textoEsperado.split(" ");
  let palabrasObtenidas = textoObtenido.split(" ");

  if (textoEsperado == "") {
    return 0;
  }

  let correctas = 0;

  for (let i = 0; i < palabrasEsperadas.length; i++) {
    if (palabrasObtenidas.includes(palabrasEsperadas[i])) {
      correctas++;
    }
  }

  return Number(((correctas / palabrasEsperadas.length) * 100).toFixed(2));
}


function calcularWER(esperada, obtenida) {
  let textoEsperado = normalizarTexto(esperada);
  let textoObtenido = normalizarTexto(obtenida);

  let palabrasEsperadas = textoEsperado.split(" ");
  let palabrasObtenidas = textoObtenido.split(" ");

  if (textoEsperado == "") {
    return 1;
  }

  let distancia = calcularDistanciaLevenshtein(palabrasEsperadas, palabrasObtenidas);

  return Number((distancia / palabrasEsperadas.length).toFixed(3));
}


function calcularDistanciaLevenshtein(a, b) {
  let matriz = [];

  for (let i = 0; i <= a.length; i++) {
    matriz[i] = [];
    matriz[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matriz[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] == b[j - 1]) {
        matriz[i][j] = matriz[i - 1][j - 1];
      }
      else {
        matriz[i][j] = Math.min(
          matriz[i - 1][j - 1] + 1,
          matriz[i][j - 1] + 1,
          matriz[i - 1][j] + 1
        );
      }
    }
  }

  return matriz[a.length][b.length];
}


function finalizarSesion() {
  if (sesionPendiente == null) {
    mostrarPantalla("pantalla-fin-sesion");
    return;
  }

  rest.put("/api/sesiones/" + sesionPendiente.id_sesion + "/finalizar", {}, function (estado, datos) {
    if (estado == 200) {
      mostrarPantalla("pantalla-fin-sesion");
    }
    else {
      mostrarAvisoPaciente("Error", "Error al finalizar la sesión", "danger");
      mostrarPantalla("pantalla-fin-sesion");
    }
  });
}


function mostrarResumenSesion() {
  let duracionMinutos = 0;

  if (fechaInicioSesion != null) {
    duracionMinutos = Math.ceil((new Date() - fechaInicioSesion) / 60000);
  }

  document.getElementById("resumenEjerciciosRealizados").textContent =
    "Ejercicios realizados: " + ejerciciosRealizados + "/" + ejerciciosSesion.length;

  document.getElementById("resumenIntentosRealizados").textContent =
    "Intentos realizados: " + intentosRealizados;

  document.getElementById("resumenDuracionSesion").textContent =
    "Duración de la sesión: " + duracionMinutos + " min";

  mostrarPantalla("pantalla-resumen");
}


function abrirProgreso() {
  let sesionesRealizadas = 0;
  let ultimaSesion = null;

  for (let i = 0; i < sesionesPaciente.length; i++) {
    if (sesionesPaciente[i].estado == "realizada" || sesionesPaciente[i].estado == "revisada") {
      sesionesRealizadas++;
      ultimaSesion = sesionesPaciente[i].fecha_hora_inicio;
    }
  }

  document.getElementById("progresoSesionesRealizadas").textContent =
    "Sesiones realizadas: " + sesionesRealizadas;

  document.getElementById("progresoUltimaSesion").textContent =
    "Última sesión: " + formatearFecha(ultimaSesion);

  rest.get("/api/metricas/paciente/" + idPaciente, function (estado, datos) {
    let progreso = 0;

    if (estado == 200 && datos) {
      let precision = parseFloat(datos.precision_media || 0);
      let exito = parseFloat(datos.tasa_exito || 0);

      progreso = Math.round((0.5 * precision) + (0.5 * exito));
    }

    document.getElementById("barraProgresoPaciente").value = progreso;

    document.getElementById("textoProgresoGlobal").textContent =
      progreso + "% de progreso global";

    mostrarPantalla("pantalla-progreso");
  });
}


function formatearFecha(fecha) {
  if (!fecha) {
    return "-";
  }

  let fechaObj = new Date(fecha);

  if (isNaN(fechaObj.getTime())) {
    return fecha;
  }

  let dia = String(fechaObj.getDate()).padStart(2, "0");
  let mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  let anio = fechaObj.getFullYear();

  return dia + "/" + mes + "/" + anio;
}


function prepararCierreSesionOculto() {
  let logo = document.getElementById("logoPaciente");
  let temporizadorCerrarSesion = null;

  logo.addEventListener("touchstart", function () {
    temporizadorCerrarSesion = setTimeout(function () {
      mostrarPantalla("pantalla-cerrar-sesion");
    }, 3000);
  });

  logo.addEventListener("touchend", function () {
    clearTimeout(temporizadorCerrarSesion);
  });

  logo.addEventListener("mousedown", function () {
    temporizadorCerrarSesion = setTimeout(function () {
      mostrarPantalla("pantalla-cerrar-sesion");
    }, 3000);
  });

  logo.addEventListener("mouseup", function () {
    clearTimeout(temporizadorCerrarSesion);
  });
}


function cerrarSesionPaciente() {
  localStorage.removeItem("usuarioPaciente");

  usuarioLogueado = null;
  idPaciente = null;
  sesionesPaciente = [];
  sesionPendiente = null;
  ejerciciosSesion = [];

  localStorage.removeItem("tokenJWTPaciente");

  mostrarPantalla("pantalla-login-paciente");
}
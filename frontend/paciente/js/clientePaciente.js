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

let ejerciciosRealizados = 0;
let intentosRealizados = 0;
let fechaInicioSesion = null;


if (usuarioLogueado != null) {
  idPaciente = usuarioLogueado.id_paciente;
}


window.onload = function () {
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
    alert("Introduce usuario y contraseña");
    return;
  }

  rest.post("/api/auth/login", {
    username: username,
    password: password
  }, function (estado, datos) {

    if (estado != 200) {
      alert("Usuario o contraseña incorrectos");
      return;
    }

    if (datos.rol != "paciente") {
      alert("Este acceso es solo para pacientes");
      return;
    }

    usuarioLogueado = datos;
    idPaciente = datos.id_paciente;

    localStorage.setItem("usuarioPaciente", JSON.stringify(datos));

    cargarDatosPaciente();
  });
}


function mostrarPantalla(idPantalla) {
  let pantallas = document.querySelectorAll(".pantalla");

  pantallas.forEach(function (pantalla) {
    pantalla.classList.add("oculto");
  });

  document.getElementById(idPantalla).classList.remove("oculto");
}


function cargarDatosPaciente() {
  if (usuarioLogueado == null) {
    mostrarPantalla("pantalla-login-paciente");
    return;
  }

  if (usuarioLogueado.rol != "paciente") {
    alert("El usuario no es un paciente");
    localStorage.removeItem("usuarioPaciente");
    mostrarPantalla("pantalla-login-paciente");
    return;
  }

  if (idPaciente == null) {
    alert("No se ha encontrado el paciente asociado al usuario");
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
  cargarSesionesPaciente();
  mostrarPantalla("pantalla-menu");
}


function abrirMenuSesion() {
  if (sesionPendiente == null) {
    alert("No tienes ninguna sesión pendiente");
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
      alert("Error al cargar los ejercicios de la sesión");
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

  document.getElementById("contadorIntento").textContent =
    "Intento " + intentoActual + "/" + ejercicio.max_intentos;

  document.getElementById("instruccionEjercicio").textContent =
    ejercicio.instruccion;

  pintarContenidoEjercicio("contenidoEjercicio", ejercicio);

  if (debeMostrarBotonEscuchar(ejercicio)) {
    document.getElementById("btnEscucharOtraVez").classList.remove("oculto");

    setTimeout(function () {
      escucharEstimulo();
    }, 2000);
  }
  else {
    document.getElementById("btnEscucharOtraVez").classList.add("oculto");
  }

  mostrarPantalla("pantalla-ejercicio");
}


function pintarContenidoEjercicio(idContenedor, ejercicio) {
  let contenedor = document.getElementById(idContenedor);

  if (ejercicio.tipo_ejercicio == "denominacion") {
    contenedor.innerHTML = "<p>[ Imagen asociada al ejercicio ]</p>";
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

  if (ejercicio.tipo_ejercicio == "articulacion_guiada") {
    return true;
  }

  return false;
}


function escucharEstimulo() {
  let ejercicio = obtenerEjercicioActual();

  if (ejercicio == null || ejercicio.texto_estimulo == null) {
    return;
  }

  if ("speechSynthesis" in window) {
    let mensaje = new SpeechSynthesisUtterance(ejercicio.texto_estimulo);
    mensaje.lang = "es-ES";
    mensaje.rate = 0.8;

    speechSynthesis.cancel();
    speechSynthesis.speak(mensaje);
  }
}


function iniciarGrabacion() {
  let ejercicio = obtenerEjercicioActual();

  respuestaObtenida = "";
  tiempoInicioGrabacion = new Date();

  pintarContenidoEjercicio("contenidoGrabacion", ejercicio);

  mostrarPantalla("pantalla-grabacion");

  iniciarReconocimientoVoz();

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
  pintarEjercicioActual();
}


function repetirEjercicioConRespuesta() {
  let ejercicio = obtenerEjercicioActual();

  if (intentoActual < ejercicio.max_intentos) {
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
  ejercicioActual++;
  intentoActual = 1;

  if (ejercicioActual >= ejerciciosSesion.length) {
    finalizarSesion();
  }
  else {
    pintarEjercicioActual();
  }
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
  let respuestaEsperada = ejercicio.texto_estimulo;
  let precision = calcularPrecision(respuestaEsperada, respuestaObtenida);
  let wer = calcularWER(respuestaEsperada, respuestaObtenida);

  let tiempoRespuestaMs = new Date() - tiempoInicioEjercicio;
  let duracionHablaMs = new Date() - tiempoInicioGrabacion;

  let exito = 0;

  if (precision >= 60) {
    exito = 1;
  }

  let datosResultado = {
    id_sesion_ejercicio: ejercicio.id_sesion_ejercicio,
    numero_intento: intentoActual,
    respuesta_esperada: respuestaEsperada,
    respuesta_obtenida: respuestaObtenida,
    precision_porcentaje: precision,
    wer: wer,
    tiempo_respuesta_ms: tiempoRespuestaMs,
    duracion_habla_ms: duracionHablaMs,
    exito: exito,
    observaciones: "Resultado registrado desde la aplicación del paciente"
  };

  rest.post("/api/resultados", datosResultado, function (estado, datos) {
    if (estado == 201 || estado == 200) {
      marcarEjercicioCompletado(ejercicio);
    }
    else {
      alert("Error al guardar el resultado del ejercicio");
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
      alert("Error al marcar el ejercicio como completado");
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
      alert("Error al finalizar la sesión");
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

    if (estado == 200 && datos.precision_media != null) {
      progreso = Math.round(datos.precision_media);
    }

    document.getElementById("barraProgresoPaciente").value = progreso;

    document.getElementById("textoProgresoGlobal").textContent =
      progreso + "% mejorado";

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

  mostrarPantalla("pantalla-login-paciente");
}
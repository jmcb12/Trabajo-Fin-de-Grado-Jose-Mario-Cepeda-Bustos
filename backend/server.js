var express = require("express");
var path = require("path");
var app = express();

const http = require("http");
const https = require("https");
const fs = require("fs");
const config = require("./config/env");

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/media", express.static(path.join(__dirname, "../media")));

var conexion = require("./database/conexion");

var authRoutes = require("./routes/auth.routes");
var usuariosRoutes = require("./routes/usuarios.routes");
var profesionalesRoutes = require("./routes/profesionales.routes");
var pacientesRoutes = require("./routes/pacientes.routes");
var ejerciciosRoutes = require("./routes/ejercicios.routes");
var sesionesRoutes = require("./routes/sesiones.routes");
var sesionEjerciciosRoutes = require("./routes/sesionEjercicios.routes");
var resultadosRoutes = require("./routes/resultados.routes");
var metricasRoutes = require("./routes/metricas.routes");

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/ejercicios", ejerciciosRoutes);
app.use("/api/sesiones", sesionesRoutes);
app.use("/api/sesion-ejercicios", sesionEjerciciosRoutes);
app.use("/api/resultados", resultadosRoutes);
app.use("/api/metricas", metricasRoutes);

console.log("Conectando el servidor con la base de datos...");
conexion.connect(function (err) {
    if (err) {
        console.log("Se ha producido un error al conectar a la base de datos", err);
        process.exit();
    } else {
        console.log("Base de datos conectada correctamente");

        if (config.httpsActivo) {
            var opcionesHTTPS = {
                key: fs.readFileSync(config.rutaClaveHTTPS),
                cert: fs.readFileSync(config.rutaCertificadoHTTPS)
            };

            https.createServer(opcionesHTTPS, app).listen(config.puerto, "0.0.0.0", function () {
                console.log("Servidor HTTPS iniciado en https://0.0.0.0:" + config.puerto);
            });
        }
        else {
            http.createServer(app).listen(config.puerto, "0.0.0.0", function () {
                console.log("Servidor HTTP iniciado en http://0.0.0.0:" + config.puerto);
            });
        }
    }
});
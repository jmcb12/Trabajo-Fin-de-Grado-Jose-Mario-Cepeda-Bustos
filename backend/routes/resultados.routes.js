var express = require("express");
var router = express.Router();
var controller = require("../controllers/resultados.controller");
var multer = require("multer");
var path = require("path");
var fs = require("fs");

const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

var carpetaAudiosPacientes = path.join(__dirname, "../../media/audiosPacientes");

if (!fs.existsSync(carpetaAudiosPacientes)) {
    fs.mkdirSync(carpetaAudiosPacientes, { recursive: true });
}

var almacenamientoAudiosPacientes = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaAudiosPacientes);
    },
    filename: function (req, file, cb) {
        var extension = path.extname(file.originalname);

        if (!extension) {
            extension = ".webm";
        }

        var nombreArchivo = "audio_" + Date.now() + extension;
        cb(null, nombreArchivo);
    }
});

var subirAudioPaciente = multer({
    storage: almacenamientoAudiosPacientes
});

router.get("/sesion/:idSesion", authJWT, requireRole("logopeda", "profesional"), controller.obtenerResultadosPorSesion);
router.get("/paciente/:idPaciente", authJWT, requireRole("logopeda", "profesional"), controller.obtenerResultadosPorPaciente);

router.post("/", authJWT, requireRole("paciente"), subirAudioPaciente.single("audio_paciente"), controller.crearResultado);

module.exports = router;
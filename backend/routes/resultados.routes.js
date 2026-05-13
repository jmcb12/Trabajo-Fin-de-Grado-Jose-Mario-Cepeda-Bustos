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

router.get("/", controller.obtenerResultados);
router.get("/sesion/:idSesion", controller.obtenerResultadosPorSesion);
router.get("/paciente/:idPaciente", controller.obtenerResultadosPorPaciente);
router.get("/ejercicio/:idEjercicio", controller.obtenerResultadosPorEjercicio);
router.get("/:id", controller.obtenerResultadoPorId);

router.post("/", subirAudioPaciente.single("audio_paciente"), controller.crearResultado);

router.put("/:id", controller.actualizarResultado);

router.delete("/:id", controller.eliminarResultado);

module.exports = router;
var express = require("express");
var router = express.Router();
var controller = require("../controllers/ejercicios.controller");
var multer = require("multer");
var path = require("path");

const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

var almacenamientoImagenesDenominacion = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../media/imagenesDenominacion"));
    },
    filename: function (req, file, cb) {
        var extension = path.extname(file.originalname);
        cb(null, "denominacion_" + Date.now() + extension);
    }
});

var subirImagenDenominacion = multer({
    storage: almacenamientoImagenesDenominacion
});

router.get("/", authJWT, requireRole("logopeda", "profesional"), controller.obtenerEjercicios);

router.get("/tipo/:tipo", authJWT, requireRole("logopeda", "profesional"), controller.obtenerEjerciciosPorTipo);

router.get("/dificultad/:nivel", authJWT, requireRole("logopeda", "profesional"), controller.obtenerEjerciciosPorDificultad);

router.get("/:id", authJWT, requireRole("logopeda", "profesional"), controller.obtenerEjercicioPorId);

router.post("/", authJWT, requireRole("logopeda", "profesional"), subirImagenDenominacion.single("imagen_denominacion"), controller.crearEjercicio);

router.put("/:id", authJWT, requireRole("logopeda", "profesional"), subirImagenDenominacion.single("imagen_denominacion"), controller.actualizarEjercicio);

router.put("/:id/reactivar", authJWT, requireRole("logopeda", "profesional"), controller.reactivarEjercicio);

router.delete("/:id", authJWT, requireRole("logopeda", "profesional"), controller.eliminarEjercicio);

module.exports = router;
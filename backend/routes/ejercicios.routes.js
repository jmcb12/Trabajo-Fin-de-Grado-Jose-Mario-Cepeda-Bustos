var express = require("express");
var router = express.Router();
var controller = require("../controllers/ejercicios.controller");
var multer = require("multer");
var path = require("path");

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

router.get("/", controller.obtenerEjercicios);
router.get("/tipo/:tipo", controller.obtenerEjerciciosPorTipo);
router.get("/dificultad/:nivel", controller.obtenerEjerciciosPorDificultad);
router.get("/:id", controller.obtenerEjercicioPorId);

router.post("/", subirImagenDenominacion.single("imagen_denominacion"), controller.crearEjercicio);

router.put("/:id", subirImagenDenominacion.single("imagen_denominacion"), controller.actualizarEjercicio);
router.put("/:id/reactivar", controller.reactivarEjercicio);

router.delete("/:id", controller.eliminarEjercicio);

module.exports = router;
var express = require("express");
var router = express.Router();
var controller = require("../controllers/ejercicios.controller");

router.get("/", controller.obtenerEjercicios);
router.get("/tipo/:tipo", controller.obtenerEjerciciosPorTipo);
router.get("/dificultad/:nivel", controller.obtenerEjerciciosPorDificultad);
router.get("/:id", controller.obtenerEjercicioPorId);

router.post("/", controller.crearEjercicio);

router.put("/:id", controller.actualizarEjercicio);

router.delete("/:id", controller.eliminarEjercicio);

module.exports = router;
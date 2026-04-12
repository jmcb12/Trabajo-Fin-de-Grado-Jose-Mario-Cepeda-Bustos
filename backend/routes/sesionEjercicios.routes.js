var express = require("express");
var router = express.Router();
var controller = require("../controllers/sesionEjercicios.controller");

router.get("/:id", controller.obtenerSesionEjercicioPorId);

router.put("/:id", controller.actualizarSesionEjercicio);

router.delete("/:id", controller.eliminarSesionEjercicio);

module.exports = router;
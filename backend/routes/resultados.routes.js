var express = require("express");
var router = express.Router();
var controller = require("../controllers/resultados.controller");

router.get("/", controller.obtenerResultados);
router.get("/sesion/:idSesion", controller.obtenerResultadosPorSesion);
router.get("/paciente/:idPaciente", controller.obtenerResultadosPorPaciente);
router.get("/ejercicio/:idEjercicio", controller.obtenerResultadosPorEjercicio);
router.get("/:id", controller.obtenerResultadoPorId);

router.post("/", controller.crearResultado);

router.put("/:id", controller.actualizarResultado);

router.delete("/:id", controller.eliminarResultado);

module.exports = router;
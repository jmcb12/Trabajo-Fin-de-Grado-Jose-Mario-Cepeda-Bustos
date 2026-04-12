var express = require("express");
var router = express.Router();
var controller = require("../controllers/metricas.controller");

router.get("/paciente/:idPaciente", controller.obtenerMetricasPorPaciente);
router.get("/sesion/:idSesion", controller.obtenerMetricasPorSesion);
router.get("/evolucion/:idPaciente", controller.obtenerEvolucionPaciente);

module.exports = router;
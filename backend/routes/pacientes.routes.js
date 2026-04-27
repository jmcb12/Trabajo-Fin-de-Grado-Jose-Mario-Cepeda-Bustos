var express = require("express");
var router = express.Router();
var controller = require("../controllers/pacientes.controller");

router.get("/", controller.obtenerPacientes);
router.get("/:id/sesiones", controller.obtenerSesionesDePaciente);
router.get("/:id/resultados", controller.obtenerResultadosDePaciente);
router.get("/:id/metricas", controller.obtenerMetricasDePaciente);
router.get("/:id", controller.obtenerPacientePorId);

router.post("/", controller.crearPaciente);

router.put("/:id/estado", controller.cambiarEstadoPaciente);

router.put("/:id", controller.actualizarPaciente);

module.exports = router;
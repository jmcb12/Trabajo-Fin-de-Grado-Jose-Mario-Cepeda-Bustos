var express = require("express");
var router = express.Router();
var controller = require("../controllers/metricas.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.get("/paciente/:idPaciente", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerMetricasPorPaciente);
router.get("/evolucion/:idPaciente", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerEvolucionPaciente);

module.exports = router;
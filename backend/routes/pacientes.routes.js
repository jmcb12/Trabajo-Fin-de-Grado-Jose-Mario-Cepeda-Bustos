var express = require("express");
var router = express.Router();
var controller = require("../controllers/pacientes.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.get("/:id/sesiones", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerSesionesDePaciente);
router.get("/:id", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerPacientePorId);

router.post("/", authJWT, requireRole("logopeda", "profesional"), controller.crearPaciente);

router.put("/:id/estado", authJWT, requireRole("logopeda", "profesional"), controller.cambiarEstadoPaciente);
router.put("/:id", authJWT, requireRole("logopeda", "profesional"), controller.actualizarPaciente);

module.exports = router;
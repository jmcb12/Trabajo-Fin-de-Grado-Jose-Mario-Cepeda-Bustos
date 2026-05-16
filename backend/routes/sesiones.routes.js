var express = require("express");
var router = express.Router();
var controller = require("../controllers/sesiones.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.get("/paciente/:idPaciente", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerSesionesPorPaciente);
router.get("/:id/ejercicios", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerEjerciciosDeSesion);
router.get("/:id", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.obtenerSesionPorId);

router.post("/", authJWT, requireRole("logopeda", "profesional"), controller.crearSesion);
router.post("/:id/ejercicios", authJWT, requireRole("logopeda", "profesional"), controller.asociarEjercicioASesion);

router.put("/:id", authJWT, requireRole("logopeda", "profesional"), controller.actualizarSesion);
router.put("/:id/finalizar", authJWT, requireRole("paciente"), controller.finalizarSesion);
router.put("/:id/cancelar", authJWT, requireRole("logopeda", "profesional"), controller.cancelarSesion);
router.put("/:id/revisar", authJWT, requireRole("logopeda", "profesional"), controller.marcarSesionRevisada);

module.exports = router;
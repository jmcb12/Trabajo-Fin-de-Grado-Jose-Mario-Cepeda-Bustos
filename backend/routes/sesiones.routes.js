var express = require("express");
var router = express.Router();
var controller = require("../controllers/sesiones.controller");

router.get("/", controller.obtenerSesiones);
router.get("/paciente/:idPaciente", controller.obtenerSesionesPorPaciente);
router.get("/profesional/:idProfesional", controller.obtenerSesionesPorProfesional);
router.get("/:id/ejercicios", controller.obtenerEjerciciosDeSesion);
router.get("/:id", controller.obtenerSesionPorId);

router.post("/", controller.crearSesion);
router.post("/:id/ejercicios", controller.asociarEjercicioASesion);

router.put("/:id", controller.actualizarSesion);
router.put("/:id/finalizar", controller.finalizarSesion);
router.put("/:id/cancelar", controller.cancelarSesion);
router.put("/:id/revisar", controller.marcarSesionRevisada);

module.exports = router;
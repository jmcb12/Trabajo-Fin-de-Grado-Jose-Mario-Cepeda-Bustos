var express = require("express");
var router = express.Router();
var controller = require("../controllers/profesionales.controller");

router.get("/", controller.obtenerProfesionales);
router.get("/:id/pacientes", controller.obtenerPacientesDeProfesional);
router.get("/:id", controller.obtenerProfesionalPorId);

router.post("/", controller.crearProfesional);

router.put("/:id", controller.actualizarProfesional);

router.delete("/:id", controller.eliminarProfesional);

module.exports = router;
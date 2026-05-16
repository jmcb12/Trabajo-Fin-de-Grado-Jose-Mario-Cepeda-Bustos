var express = require("express");
var router = express.Router();
var controller = require("../controllers/profesionales.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.get("/:id/pacientes", authJWT, requireRole("logopeda", "profesional"), controller.obtenerPacientesDeProfesional);

router.post("/:id/foto-perfil", authJWT, requireRole("logopeda", "profesional"), controller.subirFotoPerfil, controller.guardarFotoPerfilProfesional);

router.put("/:id", authJWT, requireRole("logopeda", "profesional"), controller.actualizarProfesional);


module.exports = router;
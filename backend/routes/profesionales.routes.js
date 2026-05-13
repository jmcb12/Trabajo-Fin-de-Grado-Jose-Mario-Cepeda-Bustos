var express = require("express");
var router = express.Router();
var controller = require("../controllers/profesionales.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.get("/", authJWT, requireRole("logopeda", "profesional"), controller.obtenerProfesionales);
router.get("/:id/pacientes", authJWT, requireRole("logopeda", "profesional"), controller.obtenerPacientesDeProfesional);
router.get("/:id", authJWT, requireRole("logopeda", "profesional"), controller.obtenerProfesionalPorId);

router.post("/", authJWT, requireRole("logopeda", "profesional"), controller.crearProfesional);
router.post("/:id/foto-perfil", authJWT, requireRole("logopeda", "profesional"), controller.subirFotoPerfil, controller.guardarFotoPerfilProfesional);

router.put("/:id", authJWT, requireRole("logopeda", "profesional"), controller.actualizarProfesional);

router.delete("/:id", authJWT, requireRole("logopeda", "profesional"), controller.eliminarProfesional);

module.exports = router;
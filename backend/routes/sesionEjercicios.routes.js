var express = require("express");
var router = express.Router();
var controller = require("../controllers/sesionEjercicios.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");


router.put("/:id", authJWT, requireRole("logopeda", "profesional", "paciente"), controller.actualizarSesionEjercicio);

router.delete("/:id", authJWT, requireRole("logopeda", "profesional"), controller.eliminarSesionEjercicio);

module.exports = router;
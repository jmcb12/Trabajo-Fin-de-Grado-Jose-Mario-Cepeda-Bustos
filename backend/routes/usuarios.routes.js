var express = require("express");
var router = express.Router();
var controller = require("../controllers/usuarios.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.post("/", authJWT, requireRole("logopeda", "profesional"), controller.crearUsuario);

router.put("/:id", authJWT, requireRole("logopeda", "profesional"), controller.actualizarUsuario);

module.exports = router;
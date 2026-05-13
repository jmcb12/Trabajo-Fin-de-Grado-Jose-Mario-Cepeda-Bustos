var express = require("express");
var router = express.Router();
var controller = require("../controllers/usuarios.controller");
const authJWT = require("../middleware/authJWT");
const requireRole = require("../middleware/requireRole");

router.get("/", authJWT, requireRole("logopeda", "profesional"), controller.obtenerUsuarios);
router.get("/:id", authJWT, requireRole("logopeda", "profesional"), controller.obtenerUsuarioPorId);

router.post("/", authJWT, requireRole("logopeda", "profesional"), controller.crearUsuario);

router.put("/:id", authJWT, requireRole("logopeda", "profesional"), controller.actualizarUsuario);

router.delete("/:id", authJWT, requireRole("logopeda", "profesional"), controller.eliminarUsuario);

module.exports = router;
var express = require("express");
var router = express.Router();
var controller = require("../controllers/usuarios.controller");

router.get("/", controller.obtenerUsuarios);
router.get("/:id", controller.obtenerUsuarioPorId);

router.post("/", controller.crearUsuario);

router.put("/:id", controller.actualizarUsuario);

router.delete("/:id", controller.eliminarUsuario);

module.exports = router;
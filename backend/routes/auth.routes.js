var express = require("express");
var router = express.Router();
var controller = require("../controllers/auth.controller");

router.post("/login", controller.iniciarSesion);

module.exports = router;
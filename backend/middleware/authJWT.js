const jwtSeguro = require("../security/jwt");
const jwt = require("jsonwebtoken");

function authJWT(req, resp, next) {
    const cabecera = req.headers["authorization"];

    if (!cabecera) {
        return resp.status(401).json({ mensaje: "No se ha enviado token de autenticación" });
    }

    const partes = cabecera.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return resp.status(401).json({ mensaje: "Formato de token no válido" });
    }

    const token = partes[1];

    try {
        const usuarioToken = jwtSeguro.verificarToken(token);
        req.usuario = usuarioToken;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log("Token caducado", error.message);
            return resp.status(401).json({ mensaje: "Token caducado" });
        }
        console.log("Token no válido", error.message);
        return resp.status(401).json({ mensaje: "Token no válido" });
    }
}

module.exports = authJWT;
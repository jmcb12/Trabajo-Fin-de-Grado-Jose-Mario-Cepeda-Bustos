const jwtSeguro = require("../security/jwt");

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
        console.log("Token no válido", error.message);
        return resp.status(401).json({ mensaje: "Token no válido o caducado" });
    }
}

module.exports = authJWT;
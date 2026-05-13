const jwt = require("jsonwebtoken");
const config = require("../config/env");

function generarToken(usuario) {
    const datosToken = {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        rol: usuario.rol,
        id_profesional: usuario.id_profesional || null,
        id_paciente: usuario.id_paciente || null
    };

    return jwt.sign(datosToken, config.claveJWT, {
        expiresIn: config.caducidadJWT
    });
}

function verificarToken(token) {
    return jwt.verify(token, config.claveJWT);
}

module.exports = {
    generarToken,
    verificarToken
};
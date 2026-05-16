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

    let caducidadToken;

    if (usuario.rol == "paciente") {
        caducidadToken = config.caducidadJWTPaciente;
    }
    else {
        caducidadToken = config.caducidadJWTLogopeda;
    }

    return jwt.sign(datosToken, config.claveJWT, {
        expiresIn: caducidadToken
    });
}

function verificarToken(token) {
    return jwt.verify(token, config.claveJWT);
}

module.exports = {
    generarToken,
    verificarToken
};
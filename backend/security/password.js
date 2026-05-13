const crypto = require("crypto");
const config = require("../config/env");

function generarSalt() {
    return crypto.randomBytes(config.bytesSaltPassword).toString("hex");
}

function generarHashPassword(password, salt) {
    return crypto.pbkdf2Sync(
        password,
        salt,
        config.iteracionesPassword,
        config.longitudHashPassword,
        "sha256"
    ).toString("hex");
}

function crearPasswordSeguro(password) {
    const salt = generarSalt();
    const hash = generarHashPassword(password, salt);

    return {
        hash: hash,
        salt: salt
    };
}

function compararPassword(passwordIntroducida, hashGuardado, saltGuardado) {
    const hashCalculado = generarHashPassword(passwordIntroducida, saltGuardado);

    const bufferHashGuardado = Buffer.from(hashGuardado, "hex");
    const bufferHashCalculado = Buffer.from(hashCalculado, "hex");

    if (bufferHashGuardado.length !== bufferHashCalculado.length) {
        return false;
    }

    return crypto.timingSafeEqual(bufferHashGuardado, bufferHashCalculado);
}

module.exports = {
    crearPasswordSeguro,
    compararPassword
};
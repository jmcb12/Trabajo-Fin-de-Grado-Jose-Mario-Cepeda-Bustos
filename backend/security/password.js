const crypto = require("crypto");
const config = require("../config/env");

const ALGORITMO = "pbkdf2_sha256";

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

    return ALGORITMO + "$" + config.iteracionesPassword + "$" + salt + "$" + hash;
}

function compararPassword(passwordIntroducida, passwordGuardada) {
    if (!passwordGuardada) {
        return false;
    }

    const partes = passwordGuardada.split("$");

    if (partes.length !== 4) {
        return false;
    }

    const algoritmo = partes[0];
    const iteraciones = parseInt(partes[1]);
    const salt = partes[2];
    const hashGuardado = partes[3];

    if (algoritmo !== ALGORITMO) {
        return false;
    }

    const hashCalculado = crypto.pbkdf2Sync(
        passwordIntroducida,
        salt,
        iteraciones,
        config.longitudHashPassword,
        "sha256"
    ).toString("hex");

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
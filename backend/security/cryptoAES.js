const crypto = require("crypto");
const config = require("../config/env");

function obtenerClaveMaestra() {
    if (!config.claveMaestraAES) {
        throw new Error("No se ha configurado CLAVE_MAESTRA_AES en el archivo .env");
    }

    return crypto
        .createHash("sha256")
        .update(config.claveMaestraAES)
        .digest();
}

function cifrarTexto(texto) {
    if (texto === null || texto === undefined || texto === "") {
        return texto;
    }

    const clave = obtenerClaveMaestra();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", clave, iv);

    let cifrado = cipher.update(String(texto), "utf8", "base64");
    cifrado += cipher.final("base64");

    const tag = cipher.getAuthTag();

    return iv.toString("base64") + ":" + tag.toString("base64") + ":" + cifrado;
}

function descifrarTexto(textoCifrado) {
    if (textoCifrado === null || textoCifrado === undefined || textoCifrado === "") {
        return textoCifrado;
    }

    const partes = String(textoCifrado).split(":");

    if (partes.length !== 3) {
        return textoCifrado;
    }

    try {
        const clave = obtenerClaveMaestra();

        const iv = Buffer.from(partes[0], "base64");
        const tag = Buffer.from(partes[1], "base64");
        const cifrado = partes[2];

        const decipher = crypto.createDecipheriv("aes-256-gcm", clave, iv);
        decipher.setAuthTag(tag);

        let texto = decipher.update(cifrado, "base64", "utf8");
        texto += decipher.final("utf8");

        return texto;
    }
    catch (error) {
        console.log("Error al descifrar texto", error.message);
        return textoCifrado;
    }
}

module.exports = {
    cifrarTexto,
    descifrarTexto
};
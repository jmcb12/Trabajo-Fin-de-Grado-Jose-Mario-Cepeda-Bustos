require("dotenv").config();

module.exports = {
    puerto: process.env.PUERTO || 3000,

    claveJWT: process.env.CLAVE_JWT || "clave_temporal_desarrollo",
    caducidadJWTLogopeda: process.env.CADUCIDAD_JWT_LOGOPEDA || "12h",
    caducidadJWTPaciente: process.env.CADUCIDAD_JWT_PACIENTE || "30d",

    claveMaestraAES: process.env.CLAVE_MAESTRA_AES || "",

    iteracionesPassword: parseInt(process.env.ITERACIONES_PASSWORD || "120000"),
    bytesSaltPassword: parseInt(process.env.BYTES_SALT_PASSWORD || "16"),
    longitudHashPassword: parseInt(process.env.LONGITUD_HASH_PASSWORD || "32"),

    httpsActivo: process.env.HTTPS_ACTIVO === "true",
    rutaClaveHTTPS: process.env.RUTA_CLAVE_HTTPS || "certs/localhost-key.pem",
    rutaCertificadoHTTPS: process.env.RUTA_CERTIFICADO_HTTPS || "certs/localhost-cert.pem"
};
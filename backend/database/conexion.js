var mysql = require("mysql");

var database = {
    host: "localhost",
    user: "mario_tfg",
    password: "wzPd[KTi)pOkm3[X",
    database: "tfg_rehabilitacion",
    port: 3306
};

var conexion = mysql.createConnection(database);

module.exports = conexion;
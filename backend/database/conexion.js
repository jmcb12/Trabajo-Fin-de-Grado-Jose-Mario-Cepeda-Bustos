var mysql = require("mysql");

var database = {
    host: "localhost",
    user: "root",
    password: "",
    database: "tfg_rehabilitacion",
    port: 3306
};

var conexion = mysql.createConnection(database);

module.exports = conexion;
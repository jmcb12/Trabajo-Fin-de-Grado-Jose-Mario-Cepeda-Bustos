var conexion = require("../database/conexion");

exports.obtenerSesionEjercicioPorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador no válido");
        return resp.status(400).json("Identificador no válido");
    }

    var sql = "SELECT * FROM sesion_ejercicios WHERE id_sesion_ejercicio = ?";

    conexion.query(sql, [id], function (err, sesion_ejercicio) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (sesion_ejercicio.length != 0) {
                resp.status(200).json(sesion_ejercicio[0]);
            }
            else {
                console.log("No se han encontrado relaciones con ese id");
                resp.status(404).json("No se han encontrado relaciones con ese id");
            }
        }
    });
};

exports.actualizarSesionEjercicio = function (req, resp) {
    var id_sesion_ejercicio = parseInt(req.params.id);
    var orden = parseInt(req.body.orden);
    var completado = req.body.completado;

    if (isNaN(id_sesion_ejercicio)) {
        console.log("Identificador no válido");
        return resp.status(400).json("Identificador no válido");
    }

    if (!isNaN(orden) && completado !== undefined) {
        var sql = `
            UPDATE sesion_ejercicios
            SET orden = ?, completado = ?
            WHERE id_sesion_ejercicio = ?
        `;

        conexion.query(sql, [orden, completado, id_sesion_ejercicio], function (err, resultado) {
            if (err) {
                console.log("Ha ocurrido un error con el servidor", err);
                resp.status(500).json("Ha ocurrido un error con el servidor");
            }
            else {
                if (resultado.affectedRows != 0) {
                    resp.status(200).json(resultado);
                }
                else {
                    console.log("No se ha encontrado ninguna relación con ese id");
                    resp.status(404).json("No se ha encontrado ninguna relación con ese id");
                }
            }
        });
    }
    else {
        console.log("Formato de los datos erróneo");
        resp.status(400).json("Formato de los datos erróneo");
    }
};

exports.eliminarSesionEjercicio = function (req, resp) {
    var id_sesion_ejercicio = parseInt(req.params.id);

    if (isNaN(id_sesion_ejercicio)) {
        console.log("Identificador no válido");
        return resp.status(400).json("Identificador no válido");
    }

    var sql = "DELETE FROM sesion_ejercicios WHERE id_sesion_ejercicio = ?";

    conexion.query(sql, [id_sesion_ejercicio], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json("Ejercicio eliminado de la sesión correctamente");
            }
            else {
                console.log("No se ha encontrado ningún ejercicio asociado a una sesión con ese id");
                resp.status(404).json("No se ha encontrado ningún ejercicio asociado a una sesión con ese id");
            }
        }
    });
};
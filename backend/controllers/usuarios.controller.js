var conexion = require("../database/conexion");

const passwordSeguro = require("../security/password");

exports.crearUsuario = function (req, resp) {
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var username = req.body.username;
    var password = req.body.password;
    var rol = req.body.rol;
    var activo = req.body.activo;

    if (nombre && apellidos && username && password && rol && activo !== undefined) {

        var passwordHash = passwordSeguro.crearPasswordSeguro(password);

        var sql = `
            INSERT INTO usuarios
            (nombre, apellidos, username, password_hash, rol, activo)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conexion.query(sql, [nombre, apellidos, username, passwordHash, rol, activo], function (err, resultado) {
            if (err) {
                console.log("Error en la inserción de datos en la BDD", err);
                resp.status(500).json("Ha ocurrido un error a la hora de insertar los datos");
            }
            else {
                resp.status(201).json({
                    mensaje: "Usuario creado correctamente",
                    id_usuario: resultado.insertId
                });
            }
        });
    }
    else {
        console.log("Faltan datos para la creación del nuevo usuario");
        resp.status(400).json("Faltan datos para la creación del nuevo usuario");
    }
};

exports.actualizarUsuario = function (req, resp) {
    var id = parseInt(req.params.id);
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var username = req.body.username;
    var password = req.body.password;
    var rol = req.body.rol;
    var activo = req.body.activo;

    if (isNaN(id)) {
        console.log("Identificador de usuario no válido");
        return resp.status(400).json("Identificador de usuario no válido");
    }

    if (nombre && apellidos && username && rol && activo !== undefined) {

        var sql;
        var parametros;

        if (password && password.trim() !== "") {
            var passwordHash = passwordSeguro.crearPasswordSeguro(password);

            sql = `
                UPDATE usuarios
                SET nombre = ?,
                    apellidos = ?,
                    username = ?,
                    password_hash = ?,
                    rol = ?,
                    activo = ?
                WHERE id_usuario = ?
            `;

            parametros = [nombre, apellidos, username, passwordHash, rol, activo, id];
        }
        else {
            sql = `
                UPDATE usuarios
                SET nombre = ?,
                    apellidos = ?,
                    username = ?,
                    rol = ?,
                    activo = ?
                WHERE id_usuario = ?
            `;

            parametros = [nombre, apellidos, username, rol, activo, id];
        }

        conexion.query(sql, parametros, function (err, resultado) {
            if (err) {
                console.log("Ha ocurrido un error con el servidor", err);
                resp.status(500).json("Ha ocurrido un error con el servidor");
            }
            else {
                if (resultado.affectedRows != 0) {
                    resp.status(200).json(resultado);
                } else {
                    console.log("No se ha encontrado ningún usuario con ese identificador");
                    resp.status(404).json("No se ha encontrado ningún usuario con ese identificador");
                }
            }
        });
    }
    else {
        console.log("Faltan datos para actualizar el usuario");
        resp.status(400).json("Faltan datos para actualizar el usuario");
    }
};


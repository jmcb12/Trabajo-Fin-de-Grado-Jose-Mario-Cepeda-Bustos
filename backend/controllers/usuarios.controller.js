var conexion = require("../database/conexion");

exports.obtenerUsuarios = function (req, resp) {
    var sql = `
        SELECT nombre, apellidos, username, rol, activo, fecha_creacion, ultima_conexion
        FROM usuarios
    `;

    conexion.query(sql, function (err, usuarios) {
        if (err) {
            console.log("Error al obtener los usuarios", err);
            resp.status(500).json("Error al realizar la consulta en el servidor");
        }
        else {
            resp.status(200).json(usuarios);
        }
    });
};

exports.obtenerUsuarioPorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de usuario no válido");
        return resp.status(400).json("Identificador de usuario no válido");
    }

    var sql = `
        SELECT id_usuario, nombre, apellidos, username, rol, activo, fecha_creacion, ultima_conexion
        FROM usuarios
        WHERE id_usuario = ?
    `;

    conexion.query(sql, [id], function (err, usuario) {
        if (err) {
            console.log("Error al realizar la consulta en el servidor", err);
            resp.status(500).json("Error al realizar la consulta en el servidor");
        }
        else {
            if (usuario.length != 0) {
                resp.status(200).json(usuario[0]);
            }
            else {
                console.log("Usuario no encontrado");
                resp.status(404).json("No se ha encontrado ningún usuario con ese identificador");
            }
        }
    });
};

exports.crearUsuario = function (req, resp) {
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var username = req.body.username;
    var password = req.body.password;
    var rol = req.body.rol;
    var activo = req.body.activo;

    if (nombre && apellidos && username && password && rol && activo !== undefined) {
        var sql = `
            INSERT INTO usuarios
            (nombre, apellidos, username, password, rol, activo, fecha_creacion, ultima_conexion)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL)
        `;

        conexion.query(sql, [nombre, apellidos, username, password, rol, activo], function (err, resultado) {
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

    if (nombre && apellidos && username && password && rol && activo !== undefined) {
        var sql = `
            UPDATE usuarios
            SET nombre = ?,
                apellidos = ?,
                username = ?,
                password = ?,
                rol = ?,
                activo = ?
            WHERE id_usuario = ?
        `;

        conexion.query(sql, [nombre, apellidos, username, password, rol, activo, id], function (err, resultado) {
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

exports.eliminarUsuario = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de usuario no válido");
        return resp.status(400).json("Identificador de usuario no válido");
    }

    var sql = "UPDATE usuarios SET activo = 0 WHERE id_usuario = ?";

    conexion.query(sql, [id], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
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
};
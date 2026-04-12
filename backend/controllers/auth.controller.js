var conexion = require("../database/conexion");

exports.iniciarSesion = function (req, resp) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        console.log("Faltan credenciales");
        return resp.status(400).json({ mensaje: "Faltan credenciales" });
    }

    var sql = `
        SELECT id_usuario, nombre, apellidos, email, username, rol, activo, fecha_creacion, ultima_conexion
        FROM usuarios
        WHERE username = ? AND password = ?
    `;

    conexion.query(sql, [username, password], function (err, usuario) {
        if (err) {
            console.log("Error al realizar el login", err);
            return resp.status(500).json({ mensaje: "Error al realizar el login" });
        }

        if (usuario.length === 0) {
            console.log("Los datos no son correctos");
            return resp.status(401).json({ mensaje: "Usuario o contraseña inválido" });
        }

        var sql2 = `
            UPDATE usuarios 
            SET ultima_conexion = NOW() 
            WHERE id_usuario = ?
        `;

        conexion.query(sql2, [usuario[0].id_usuario], function (err2) {
            if (err2) {
                console.log("Error en el servidor", err2);
                return resp.status(500).json({ mensaje: "Error en el servidor" });
            }

            var usuarioRespuesta = {
                nombre: usuario[0].nombre,
                apellidos: usuario[0].apellidos,
                email: usuario[0].email,
                username: usuario[0].username,
                rol: usuario[0].rol,
                activo: usuario[0].activo,
                fecha_creacion: usuario[0].fecha_creacion,
                ultima_conexion: usuario[0].ultima_conexion
            };

            return resp.status(200).json(usuarioRespuesta);
        });
    });
};
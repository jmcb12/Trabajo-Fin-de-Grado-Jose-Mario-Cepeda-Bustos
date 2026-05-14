var conexion = require("../database/conexion");
const passwordSeguro = require("../security/password");
const jwtSeguro = require("../security/jwt");

exports.iniciarSesion = function (req, resp) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        console.log("Faltan credenciales");
        return resp.status(400).json({ mensaje: "Faltan credenciales" });
    }

    var sql = `
        SELECT 
            u.id_usuario,
            u.nombre,
            u.apellidos,
            u.username,
            u.password_hash,
            u.rol,
            u.activo,
            u.fecha_creacion,
            u.ultima_conexion,
            pr.id_profesional,
            pr.centro_trabajo,
            pr.telefono,
            pr.foto_perfil,
            pa.id_paciente
        FROM usuarios u
        LEFT JOIN profesionales pr ON u.id_usuario = pr.id_usuario
        LEFT JOIN pacientes pa ON u.id_usuario = pa.id_usuario
        WHERE u.username = ?
    `;

    conexion.query(sql, [username], function (err, usuario) {
        if (err) {
            console.log("Error al realizar el login", err);
            return resp.status(500).json({ mensaje: "Error al realizar el login" });
        }

        if (usuario.length === 0) {
            console.log("Los datos no son correctos");
            return resp.status(401).json({ mensaje: "Usuario o contraseña inválido" });
        }

        var usuarioEncontrado = usuario[0];

        if (usuarioEncontrado.activo != 1) {
            console.log("Usuario desactivado");
            return resp.status(403).json({ mensaje: "Usuario desactivado" });
        }

        var passwordCorrecta = passwordSeguro.compararPassword(
            password,
            usuarioEncontrado.password_hash
        );

        if (!passwordCorrecta) {
            console.log("Los datos no son correctos");
            return resp.status(401).json({ mensaje: "Usuario o contraseña inválido" });
        }

        var sql2 = `
            UPDATE usuarios 
            SET ultima_conexion = NOW() 
            WHERE id_usuario = ?
        `;

        conexion.query(sql2, [usuarioEncontrado.id_usuario], function (err2) {
            if (err2) {
                console.log("Error en el servidor", err2);
                return resp.status(500).json({ mensaje: "Error en el servidor" });
            }

            var usuarioRespuesta = {
                id_usuario: usuarioEncontrado.id_usuario,
                id_profesional: usuarioEncontrado.id_profesional,
                id_paciente: usuarioEncontrado.id_paciente,
                centro_trabajo: usuarioEncontrado.centro_trabajo,
                telefono: usuarioEncontrado.telefono,
                foto_perfil: usuarioEncontrado.foto_perfil,
                nombre: usuarioEncontrado.nombre,
                apellidos: usuarioEncontrado.apellidos,
                username: usuarioEncontrado.username,
                rol: usuarioEncontrado.rol,
                activo: usuarioEncontrado.activo,
                fecha_creacion: usuarioEncontrado.fecha_creacion,
                ultima_conexion: usuarioEncontrado.ultima_conexion
            };

            var token = jwtSeguro.generarToken(usuarioRespuesta);

            return resp.status(200).json({
                token: token,
                usuario: usuarioRespuesta
            });
        });
    });
};
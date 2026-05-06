var conexion = require("../database/conexion");

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
    WHERE u.username = ? AND u.password = ?
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
                id_usuario: usuario[0].id_usuario,
                id_profesional: usuario[0].id_profesional,
                id_paciente: usuario[0].id_paciente,
                centro_trabajo: usuario[0].centro_trabajo,
                telefono: usuario[0].telefono,
                foto_perfil: usuario[0].foto_perfil,
                nombre: usuario[0].nombre,
                apellidos: usuario[0].apellidos,
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
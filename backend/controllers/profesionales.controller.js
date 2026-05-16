var path = require("path");
var fs = require("fs");
var multer = require("multer");
var conexion = require("../database/conexion");
const passwordSeguro = require("../security/password");
const cryptoAES = require("../security/cryptoAES");

var carpetaFotosPerfil = path.join(__dirname, "../../media/fotosPerfil");

if (!fs.existsSync(carpetaFotosPerfil)) {
    fs.mkdirSync(carpetaFotosPerfil, { recursive: true });
}

var almacenamientoFotosPerfil = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaFotosPerfil);
    },
    filename: function (req, file, cb) {
        var extension = path.extname(file.originalname);
        var nombreArchivo = "profesional_" + req.params.id + "_" + Date.now() + extension;
        cb(null, nombreArchivo);
    }
});

var filtroFotosPerfil = function (req, file, cb) {
    if (
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/png" ||
        file.mimetype == "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
    }
};

exports.subirFotoPerfil = multer({
    storage: almacenamientoFotosPerfil,
    fileFilter: filtroFotosPerfil
}).single("foto_perfil");

var conexion = require("../database/conexion");



exports.actualizarProfesional = function (req, resp) {
    var id = parseInt(req.params.id);

    var username = req.body.username;
    var password = req.body.password;
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;

    var centro_trabajo = req.body.centro_trabajo;
    var telefono = req.body.telefono || null;
    var foto_perfil = req.body.foto_perfil || null;

    if (isNaN(id)) {
        console.log("Identificador de profesional no válido");
        return resp.status(400).json("Identificador de profesional no válido");
    }

    if (!username || !nombre || !apellidos || !centro_trabajo) {
        console.log("Error en los datos");
        return resp.status(400).json("Error en los datos");
    }

    var sqlBuscarUsuario = `
        SELECT id_usuario
        FROM profesionales
        WHERE id_profesional = ?
    `;

    conexion.query(sqlBuscarUsuario, [id], function (errBuscar, resultadoBuscar) {
        if (errBuscar) {
            console.log("Ha ocurrido un error con el servidor", errBuscar);
            return resp.status(500).json("Ha ocurrido un error con el servidor");
        }

        if (resultadoBuscar.length == 0) {
            console.log("No se ha encontrado ningún profesional con ese identificador");
            return resp.status(404).json("No se ha encontrado ningún profesional con ese identificador");
        }

        var id_usuario = resultadoBuscar[0].id_usuario;

        var sqlProfesional = `
            UPDATE profesionales
            SET centro_trabajo = ?, telefono = ?, foto_perfil = ?
            WHERE id_profesional = ?
        `;

        conexion.query(sqlProfesional, [centro_trabajo, telefono, foto_perfil, id], function (errProfesional, resultadoProfesional) {
            if (errProfesional) {
                console.log("Ha ocurrido un error con el servidor", errProfesional);
                return resp.status(500).json("Ha ocurrido un error con el servidor");
            }

            var sqlUsuario;
            var parametrosUsuario;

            if (password && password.trim() !== "") {
                var passwordHash = passwordSeguro.crearPasswordSeguro(password);

                sqlUsuario = `
                    UPDATE usuarios
                    SET username = ?,
                        password_hash = ?,
                        nombre = ?,
                        apellidos = ?
                    WHERE id_usuario = ?
                `;

                parametrosUsuario = [
                    username,
                    passwordHash,
                    nombre,
                    apellidos,
                    id_usuario
                ];
            }
            else {
                sqlUsuario = `
                    UPDATE usuarios
                    SET username = ?,
                        nombre = ?,
                        apellidos = ?
                    WHERE id_usuario = ?
                `;

                parametrosUsuario = [
                    username,
                    nombre,
                    apellidos,
                    id_usuario
                ];
            }

            conexion.query(sqlUsuario, parametrosUsuario, function (errUsuario, resultadoUsuario) {
                if (errUsuario) {
                    console.log("Ha ocurrido un error al actualizar el usuario del profesional", errUsuario);
                    return resp.status(500).json("Ha ocurrido un error al actualizar el usuario del profesional");
                }

                resp.status(200).json({
                    mensaje: "Profesional actualizado correctamente",
                    foto_perfil: foto_perfil
                });
            });
        });
    });
};

exports.obtenerPacientesDeProfesional = function (req, resp) {
    var id_profesional = parseInt(req.params.id);

    if (!id_profesional) {
        console.log("Identificador de profesional no válido");
        return resp.status(400).json("Identificador de profesional no válido");
    }

    var sql = `
        SELECT 
            p.id_paciente,
            p.diagnostico_principal,
            p.activo,
            u.nombre,
            u.apellidos,
            u.ultima_conexion
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_profesional_referencia = ?
    `;

    conexion.query(sql, [id_profesional], function (err, pacientes) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            pacientes.forEach(function (paciente) {
                paciente.diagnostico_principal = cryptoAES.descifrarTexto(paciente.diagnostico_principal);
            });

            resp.status(200).json(pacientes);
        }
    });
};

exports.guardarFotoPerfilProfesional = function (req, resp) {
    var id_profesional = parseInt(req.params.id);

    if (isNaN(id_profesional)) {
        return resp.status(400).json("Identificador de profesional no válido");
    }

    if (!req.file) {
        return resp.status(400).json("No se ha recibido ninguna imagen");
    }

    var rutaFoto = "/media/fotosPerfil/" + req.file.filename;

    var sql = `
        UPDATE profesionales
        SET foto_perfil = ?
        WHERE id_profesional = ?
    `;

    conexion.query(sql, [rutaFoto, id_profesional], function (err, resultado) {
        if (err) {
            console.log("Error al guardar la foto de perfil", err);
            return resp.status(500).json("Error al guardar la foto de perfil");
        }

        if (resultado.affectedRows == 0) {
            return resp.status(404).json("No se ha encontrado el profesional");
        }

        resp.status(200).json({
            foto_perfil: rutaFoto
        });
    });
};
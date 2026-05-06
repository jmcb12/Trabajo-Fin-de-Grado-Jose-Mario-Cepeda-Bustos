var path = require("path");
var fs = require("fs");
var multer = require("multer");

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

exports.obtenerProfesionales = function (req, resp) {
    var sql = `
        SELECT 
            pr.id_profesional,
            pr.id_usuario,
            u.nombre,
            u.apellidos,
            u.username,
            pr.centro_trabajo,
            pr.telefono,
            pr.foto_perfil,
            u.activo
        FROM profesionales pr
        JOIN usuarios u ON pr.id_usuario = u.id_usuario
    `;

    conexion.query(sql, function (err, profesionales) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            resp.status(200).json(profesionales);
        }
    });
};

exports.obtenerProfesionalPorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de profesional no válido");
        return resp.status(400).json("Identificador de profesional no válido");
    }

    var sql = `
        SELECT 
            pr.id_profesional,
            pr.id_usuario,
            u.nombre,
            u.apellidos,
            u.username,
            pr.centro_trabajo,
            pr.telefono,
            pr.foto_perfil,
            u.activo
        FROM profesionales pr
        JOIN usuarios u ON pr.id_usuario = u.id_usuario
        WHERE pr.id_profesional = ?
    `;
    
    conexion.query(sql, [id], function (err, profesional) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (profesional.length != 0) {
                resp.status(200).json(profesional[0]);
            }
            else {
                console.log("No se ha encontrado ningún profesional con el identificador");
                resp.status(404).json("No se ha encontrado ningún profesional con el identificador");
            }
        }
    });
};

exports.crearProfesional = function (req, resp) {
    var id_usuario = req.body.id_usuario;
    var centro_trabajo = req.body.centro_trabajo;
    var telefono = req.body.telefono || null;
    var foto_perfil = req.body.foto_perfil || null;

    if (!isNaN(parseInt(id_usuario)) && centro_trabajo) {
        var sql = `
            INSERT INTO profesionales 
            (id_usuario, centro_trabajo, telefono, foto_perfil)
            VALUES (?, ?, ?, ?)
        `;

        conexion.query(sql, [id_usuario, centro_trabajo, telefono, foto_perfil], function (err, resultado) {
            if (err) {
                console.log("Ha ocurrido un error con el servidor", err);
                resp.status(500).json("Ha ocurrido un error con el servidor");
            }
            else {
                resp.status(201).json(resultado);
            }
        });
    }
    else {
        console.log("Formato de los datos erróneo");
        resp.status(400).json("Formato de los datos erróneo");
    }
};

exports.actualizarProfesional = function (req, resp) {
    var id = parseInt(req.params.id);
    var centro_trabajo = req.body.centro_trabajo;
    var telefono = req.body.telefono || null;
    var foto_perfil = req.body.foto_perfil || null;

    if (isNaN(id)) {
        console.log("Identificador de profesional no válido");
        return resp.status(400).json("Identificador de profesional no válido");
    }

    if (centro_trabajo) {
        var sql = `
            UPDATE profesionales
            SET centro_trabajo = ?, telefono = ?, foto_perfil = ?
            WHERE id_profesional = ?
        `;

        conexion.query(sql, [centro_trabajo, telefono, foto_perfil, id], function (err, resultado) {
            if (err) {
                console.log("Ha ocurrido un error con el servidor", err);
                resp.status(500).json("Ha ocurrido un error con el servidor");
            }
            else {
                if (resultado.affectedRows != 0) {
                    resp.status(200).json(resultado);
                }
                else {
                    console.log("No se ha encontrado ningún profesional con ese identificador");
                    resp.status(404).json("No se ha encontrado ningún profesional con ese identificador");
                }
            }
        });
    }
    else {
        console.log("Error en los datos");
        resp.status(400).json("Error en los datos");
    }
};

exports.eliminarProfesional = function (req, resp) {
    var id_profesional = parseInt(req.params.id);

    if (isNaN(id_profesional)) {
        console.log("Identificador de profesional no válido");
        return resp.status(400).json("Identificador de profesional no válido");
    }

    var consulta_1 = "SELECT id_usuario FROM profesionales WHERE id_profesional = ?";

    conexion.query(consulta_1, [id_profesional], function (err1, resultado1) {
        if (err1) {
            console.log("Ha ocurrido un error con el servidor en la primera consulta", err1);
            resp.status(500).json("Ha ocurrido un error con el servidor en la primera consulta");
        }
        else {
            if (resultado1.length == 0) {
                console.log("No se ha encontrado ningún profesional con ese identificador");
                return resp.status(404).json("No se ha encontrado ningún profesional con ese identificador");
            }

            var id_usuario = resultado1[0].id_usuario;
            var consulta_2 = "UPDATE usuarios SET activo = 0 WHERE id_usuario = ?";

            conexion.query(consulta_2, [id_usuario], function (err2, resultado2) {
                if (err2) {
                    console.log("Ha ocurrido un error con el servidor en la segunda consulta", err2);
                    resp.status(500).json("Ha ocurrido un error con el servidor en la segunda consulta");
                }
                else {
                    resp.status(200).json(resultado2);
                }
            });
        }
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
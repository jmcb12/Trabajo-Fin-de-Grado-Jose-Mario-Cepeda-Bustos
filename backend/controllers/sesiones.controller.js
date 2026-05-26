var conexion = require("../database/conexion");
const cryptoAES = require("../security/cryptoAES");


exports.obtenerSesionPorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = "SELECT * FROM sesiones WHERE id_sesion = ?";

    conexion.query(sql, [id], function (err, sesion) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (sesion.length != 0) {
                sesion[0].observaciones = cryptoAES.descifrarTexto(sesion[0].observaciones);

                resp.status(200).json(sesion[0]);
            }
            else {
                console.log("No se ha encontrado la sesión con ese identificador");
                resp.status(404).json("No se ha encontrado la sesión con ese identificador");
            }
        }
    });
};

exports.crearSesion = function (req, resp) {
    var id_paciente = req.body.id_paciente;
    var id_profesional = req.body.id_profesional;
    var fecha_hora_inicio = req.body.fecha_hora_inicio;
    var fecha_hora_fin = req.body.fecha_hora_fin;
    var estado = req.body.estado;
    var observaciones = req.body.observaciones;

    var estados_validos = ["pendiente", "realizada", "revisada", "cancelada"];

    if (
        !isNaN(parseInt(id_paciente)) &&
        (id_profesional === null || !isNaN(parseInt(id_profesional))) &&
        fecha_hora_inicio &&
        estado &&
        observaciones !== undefined &&
        estados_validos.includes(estado)
    ) {
        var observacionesCifradas = cryptoAES.cifrarTexto(observaciones || null);

        var sql = `
            INSERT INTO sesiones
            (id_paciente, id_profesional, fecha_hora_inicio, fecha_hora_fin, estado, observaciones)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sql,
            [id_paciente, id_profesional, fecha_hora_inicio, fecha_hora_fin || null, estado, observacionesCifradas],
            function (err, resultado) {
                if (err) {
                    console.log("Ha ocurrido un error con el servidor", err);
                    resp.status(500).json("Ha ocurrido un error con el servidor");
                }
                else {
                    resp.status(201).json(resultado);
                }
            }
        );
    }
    else {
        console.log("Error en el formato de los datos");
        resp.status(400).json("Error en el formato de los datos");
    }
};

exports.actualizarSesion = function (req, resp) {
    var id_sesion = parseInt(req.params.id);
    var id_paciente = req.body.id_paciente;
    var id_profesional = req.body.id_profesional;
    var fecha_hora_inicio = req.body.fecha_hora_inicio;
    var fecha_hora_fin = req.body.fecha_hora_fin;
    var estado = req.body.estado;
    var observaciones = req.body.observaciones;

    var estados_validos = ["pendiente", "realizada", "revisada", "cancelada"];

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    if (
        !isNaN(parseInt(id_paciente)) &&
        (id_profesional === null || !isNaN(parseInt(id_profesional))) &&
        fecha_hora_inicio &&
        estado &&
        observaciones !== undefined &&
        estados_validos.includes(estado)
    ) {

        var observacionesCifradas = cryptoAES.cifrarTexto(observaciones || null);

        var sql = `
            UPDATE sesiones SET
                id_paciente = ?,
                id_profesional = ?,
                fecha_hora_inicio = ?,
                fecha_hora_fin = ?,
                estado = ?,
                observaciones = ?
            WHERE id_sesion = ?
        `;

        conexion.query(
            sql,
            [id_paciente, id_profesional, fecha_hora_inicio, fecha_hora_fin || null, estado, observacionesCifradas, id_sesion],
            function (err, resultado) {
                if (err) {
                    console.log("Ha ocurrido un error con el servidor", err);
                    resp.status(500).json("Ha ocurrido un error con el servidor");
                }
                else {
                    if (resultado.affectedRows != 0) {
                        resp.status(200).json(resultado);
                    }
                    else {
                        console.log("No se ha encontrado ninguna sesión con ese identificador");
                        resp.status(404).json("No se ha encontrado ninguna sesión con ese identificador");
                    }
                }
            }
        );
    }
    else {
        console.log("Error en el formato de los datos");
        resp.status(400).json("Error en el formato de los datos");
    }
};

exports.finalizarSesion = function (req, resp) {
    var id_sesion = parseInt(req.params.id);

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = 'UPDATE sesiones SET estado = "realizada", fecha_hora_fin = NOW() WHERE id_sesion = ?';

    conexion.query(sql, [id_sesion], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json(resultado);
            }
            else {
                console.log("No se ha encontrado ninguna sesión con ese identificador");
                resp.status(404).json("No se ha encontrado ninguna sesión con ese identificador");
            }
        }
    });
};

exports.cancelarSesion = function (req, resp) {
    var id_sesion = parseInt(req.params.id);

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = 'UPDATE sesiones SET estado = "cancelada" WHERE id_sesion = ?';

    conexion.query(sql, [id_sesion], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json(resultado);
            }
            else {
                console.log("No se ha encontrado ninguna sesión con ese identificador");
                resp.status(404).json("No se ha encontrado ninguna sesión con ese identificador");
            }
        }
    });
};

exports.obtenerSesionesPorPaciente = function (req, resp) {
    var idPaciente = parseInt(req.params.idPaciente);

    if (isNaN(idPaciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = "SELECT * FROM sesiones WHERE id_paciente = ?";

    conexion.query(sql, [idPaciente], function (err, sesiones) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (sesiones.length != 0) {
                sesiones.forEach(function (sesion) {
                    sesion.observaciones = cryptoAES.descifrarTexto(sesion.observaciones);
                });

                resp.status(200).json(sesiones);
            }
            else {
                resp.status(200).json([]);
            }
        }
    });
};

exports.obtenerEjerciciosDeSesion = function (req, resp) {
    var id_sesion = parseInt(req.params.id);

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = `
        SELECT
            se.id_sesion_ejercicio,
            e.id_ejercicio,
            e.nombre,
            e.descripcion,
            e.tipo_ejercicio,
            e.nivel_dificultad,
            e.texto_estimulo,
            e.respuesta_esperada,
            e.instruccion,
            e.duracion_maxima_seg,
            e.imagen_denominacion,
            se.orden,
            se.max_intentos,
            se.completado
        FROM sesion_ejercicios se
        JOIN ejercicios e ON se.id_ejercicio = e.id_ejercicio
        WHERE se.id_sesion = ?
        ORDER BY se.orden ASC
    `;

    conexion.query(sql, [id_sesion], function (err, ejercicios) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (ejercicios.length != 0) {
                resp.status(200).json(ejercicios);
            }
            else {
                console.log("No se han encontrado ejercicios asociados a esa sesión");
                resp.status(404).json("No se han encontrado ejercicios asociados a esa sesión");
            }
        }
    });
};

exports.asociarEjercicioASesion = function (req, resp) {
    var id_sesion = parseInt(req.params.id);
    var id_ejercicio = parseInt(req.body.id_ejercicio);
    var orden = parseInt(req.body.orden);
    var max_intentos = parseInt(req.body.max_intentos);
    var completado = req.body.completado;

    if (isNaN(id_sesion) || isNaN(id_ejercicio) || isNaN(orden) || isNaN(max_intentos) || completado === undefined) {
        console.log("Los datos introducidos no son válidos");
        return resp.status(400).json("Los datos introducidos no son válidos");
    }

    var sql = `
        INSERT INTO sesion_ejercicios (id_sesion, id_ejercicio, orden, max_intentos, completado)
        VALUES (?, ?, ?, ?, ?)
    `;

    conexion.query(sql, [id_sesion, id_ejercicio, orden, max_intentos, completado], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(201).json(resultado);
            }
            else {
                console.log("No se ha podido asociar el ejercicio a la sesión: recurso no encontrado");
                resp.status(404).json("No se ha podido asociar el ejercicio a la sesión");
            }
        }
    });
};

exports.marcarSesionRevisada = function (req, resp) {
    var id_sesion = parseInt(req.params.id);

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = 'UPDATE sesiones SET estado = "revisada" WHERE id_sesion = ?';

    conexion.query(sql, [id_sesion], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json(resultado);
            }
            else {
                console.log("No se ha encontrado ninguna sesión con ese identificador");
                resp.status(404).json("No se ha encontrado ninguna sesión con ese identificador");
            }
        }
    });
};
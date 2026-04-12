var conexion = require("../database/conexion");

exports.obtenerPacientes = function (req, resp) {
    var sql = "SELECT * FROM pacientes";

    conexion.query(sql, function (err, pacientes) {
        if (err) {
            console.log("Error en el servidor al realizar la consulta", err);
            resp.status(500).json("Error en el servidor al realizar la consulta");
        }
        else {
            resp.status(200).json(pacientes);
        }
    });
};

exports.obtenerPacientePorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = "SELECT * FROM pacientes WHERE id_paciente = ?";

    conexion.query(sql, [id], function (err, paciente) {
        if (err) {
            console.log("Error en el servidor al realizar la consulta", err);
            resp.status(500).json("Error en el servidor al realizar la consulta");
        }
        else {
            if (paciente.length != 0) {
                resp.status(200).json(paciente[0]);
            }
            else {
                console.log("No se ha encontrado el elemento solicitado");
                resp.status(404).json("El elemento solicitado no existe");
            }
        }
    });
};

exports.crearPaciente = function (req, resp) {
    var id_usuario = req.body.id_usuario;
    var id_profesional_referencia = req.body.id_profesional_referencia;
    var codigo_paciente = req.body.codigo_paciente;
    var fecha_nacimiento = req.body.fecha_nacimiento;
    var sexo = req.body.sexo;
    var diagnostico_principal = req.body.diagnostico_principal;
    var nivel_afasia = req.body.nivel_afasia;
    var fecha_inicio_tratamiento = req.body.fecha_inicio_tratamiento;
    var observaciones = req.body.observaciones;
    var activo = req.body.activo;

    if (
        (id_usuario === null || !isNaN(parseInt(id_usuario))) &&
        !isNaN(parseInt(id_profesional_referencia)) &&
        codigo_paciente &&
        sexo &&
        activo !== undefined
    ) {
        var sql = `
            INSERT INTO pacientes
            (id_usuario, id_profesional_referencia, codigo_paciente, fecha_nacimiento, sexo, diagnostico_principal, nivel_afasia, fecha_inicio_tratamiento, observaciones, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sql,
            [
                id_usuario,
                id_profesional_referencia,
                codigo_paciente,
                fecha_nacimiento || null,
                sexo,
                diagnostico_principal || null,
                nivel_afasia || null,
                fecha_inicio_tratamiento || null,
                observaciones || null,
                activo
            ],
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
        console.log("Formato de los datos erróneo");
        resp.status(400).json("Formato de los datos erróneo");
    }
};

exports.actualizarPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);
    var codigo_paciente = req.body.codigo_paciente;
    var fecha_nacimiento = req.body.fecha_nacimiento;
    var sexo = req.body.sexo;
    var diagnostico_principal = req.body.diagnostico_principal;
    var nivel_afasia = req.body.nivel_afasia;
    var fecha_inicio_tratamiento = req.body.fecha_inicio_tratamiento;
    var observaciones = req.body.observaciones;
    var activo = req.body.activo;

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    if (codigo_paciente && sexo && activo !== undefined) {
        var sql = `
            UPDATE pacientes SET
                codigo_paciente = ?,
                fecha_nacimiento = ?,
                sexo = ?,
                diagnostico_principal = ?,
                nivel_afasia = ?,
                fecha_inicio_tratamiento = ?,
                observaciones = ?,
                activo = ?
            WHERE id_paciente = ?
        `;

        conexion.query(
            sql,
            [
                codigo_paciente,
                fecha_nacimiento || null,
                sexo,
                diagnostico_principal || null,
                nivel_afasia || null,
                fecha_inicio_tratamiento || null,
                observaciones || null,
                activo,
                id_paciente
            ],
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
                        console.log("No se ha encontrado ningún paciente con ese identificador");
                        resp.status(404).json("No se ha encontrado ningún paciente con ese identificador");
                    }
                }
            }
        );
    }
    else {
        console.log("Formato de los datos erróneo");
        resp.status(400).json("Formato de los datos erróneo");
    }
};

exports.eliminarPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var consulta_1 = "SELECT id_usuario FROM pacientes WHERE id_paciente = ?";

    conexion.query(consulta_1, [id_paciente], function (err1, resultado1) {
        if (err1) {
            console.log("Ha ocurrido un error con el servidor en la primera consulta", err1);
            resp.status(500).json("Ha ocurrido un error con el servidor en la primera consulta");
        }
        else {
            if (resultado1.length == 0) {
                console.log("No se ha encontrado ningún paciente con ese identificador");
                return resp.status(404).json("No se ha encontrado ningún paciente con ese identificador");
            }

            if (resultado1[0].id_usuario === null) {
                var consulta_2 = "UPDATE pacientes SET activo = 0 WHERE id_paciente = ?";

                conexion.query(consulta_2, [id_paciente], function (err2, resultado2) {
                    if (err2) {
                        console.log("Ha ocurrido un error con el servidor en la segunda consulta", err2);
                        resp.status(500).json("Ha ocurrido un error con el servidor en la segunda consulta");
                    }
                    else {
                        resp.status(200).json(resultado2);
                    }
                });
            }
            else {
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
        }
    });
};

exports.obtenerSesionesDePaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = "SELECT * FROM sesiones WHERE id_paciente = ?";

    conexion.query(sql, [id_paciente], function (err, sesiones) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (sesiones.length != 0) {
                resp.status(200).json(sesiones);
            }
            else {
                console.log("No se han encontrado sesiones asociadas a ese paciente");
                resp.status(404).json("No se han encontrado sesiones asociadas a ese paciente");
            }
        }
    });
};

exports.obtenerResultadosDePaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT
            re.id_resultado,
            s.id_sesion,
            e.nombre AS nombre_ejercicio,
            re.numero_intento,
            re.respuesta_esperada,
            re.respuesta_obtenida,
            re.precision_porcentaje,
            re.wer,
            re.tiempo_respuesta_ms,
            re.duracion_habla_ms,
            re.exito,
            re.fecha_registro
        FROM sesiones s
        JOIN sesion_ejercicios se ON s.id_sesion = se.id_sesion
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        JOIN ejercicios e ON se.id_ejercicio = e.id_ejercicio
        WHERE s.id_paciente = ?
        ORDER BY re.fecha_registro DESC
    `;

    conexion.query(sql, [id_paciente], function (err, resultados) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultados.length != 0) {
                resp.status(200).json(resultados);
            }
            else {
                console.log("No se han encontrado resultados asociados a ese paciente");
                resp.status(404).json("No se han encontrado resultados asociados a ese paciente");
            }
        }
    });
};

exports.obtenerMetricasDePaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT
            AVG(re.precision_porcentaje) AS precision_media,
            AVG(re.wer) AS wer_medio,
            AVG(re.tiempo_respuesta_ms) AS tiempo_respuesta_medio,
            AVG(re.duracion_habla_ms) AS duracion_habla_media,
            AVG(re.exito) * 100 AS tasa_exito
        FROM sesiones s
        JOIN sesion_ejercicios se ON s.id_sesion = se.id_sesion
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        WHERE s.id_paciente = ?
    `;

    conexion.query(sql, [id_paciente], function (err, metricas) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (metricas.length != 0 && metricas[0].precision_media != null) {
                resp.status(200).json(metricas[0]);
            }
            else {
                console.log("No se han encontrado métricas asociadas a ese paciente");
                resp.status(404).json("No se han encontrado métricas asociadas a ese paciente");
            }
        }
    });
};
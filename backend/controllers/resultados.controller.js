var conexion = require("../database/conexion");

exports.obtenerResultados = function (req, resp) {
    var sql = "SELECT * FROM resultados_ejercicio";

    conexion.query(sql, function (err, resultados) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            resp.status(200).json(resultados);
        }
    });
};

exports.obtenerResultadoPorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de resultado no válido");
        return resp.status(400).json("Identificador de resultado no válido");
    }

    var sql = "SELECT * FROM resultados_ejercicio WHERE id_resultado = ?";

    conexion.query(sql, [id], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (resultado.length != 0) {
                resp.status(200).json(resultado[0]);
            }
            else {
                console.log("No se ha encontrado el resultado con ese identificador");
                resp.status(404).json("No se ha encontrado el resultado con ese identificador");
            }
        }
    });
};

exports.crearResultado = function (req, resp) {
    var id_sesion_ejercicio = parseInt(req.body.id_sesion_ejercicio);
    var numero_intento = parseInt(req.body.numero_intento);
    var respuesta_esperada = req.body.respuesta_esperada;
    var respuesta_obtenida = req.body.respuesta_obtenida;
    var precision_porcentaje = parseFloat(req.body.precision_porcentaje);
    var wer = parseFloat(req.body.wer);
    var tiempo_respuesta_ms = parseInt(req.body.tiempo_respuesta_ms);
    var duracion_habla_ms = parseInt(req.body.duracion_habla_ms);
    var exito = req.body.exito;
    var observaciones = req.body.observaciones;

    if (
        isNaN(id_sesion_ejercicio) ||
        isNaN(numero_intento) ||
        !respuesta_esperada ||
        !respuesta_obtenida ||
        isNaN(precision_porcentaje) ||
        isNaN(wer) ||
        isNaN(tiempo_respuesta_ms) ||
        isNaN(duracion_habla_ms) ||
        exito === undefined
    ) {
        console.log("Los datos introducidos no son válidos");
        return resp.status(400).json("Los datos introducidos no son válidos");
    }

    var sql = `
        INSERT INTO resultados_ejercicio
        (id_sesion_ejercicio, numero_intento, respuesta_esperada, respuesta_obtenida, precision_porcentaje, wer, tiempo_respuesta_ms, duracion_habla_ms, exito, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [id_sesion_ejercicio, numero_intento, respuesta_esperada, respuesta_obtenida, precision_porcentaje, wer, tiempo_respuesta_ms, duracion_habla_ms, exito, observaciones || null],
        function (err, resultado) {
            if (err) {
                console.log("Ha ocurrido un error con el servidor", err);
                resp.status(500).json("Ha ocurrido un error con el servidor");
            }
            else {
                if (resultado.affectedRows != 0) {
                    resp.status(201).json("Resultado registrado correctamente");
                }
                else {
                    console.log("No se ha podido registrar el resultado");
                    resp.status(500).json("No se ha podido registrar el resultado");
                }
            }
        }
    );
};

exports.actualizarResultado = function (req, resp) {
    var id_resultado = parseInt(req.params.id);
    var respuesta_esperada = req.body.respuesta_esperada;
    var respuesta_obtenida = req.body.respuesta_obtenida;
    var precision_porcentaje = parseFloat(req.body.precision_porcentaje);
    var wer = parseFloat(req.body.wer);
    var tiempo_respuesta_ms = parseInt(req.body.tiempo_respuesta_ms);
    var duracion_habla_ms = parseInt(req.body.duracion_habla_ms);
    var exito = req.body.exito;
    var observaciones = req.body.observaciones;

    if (
        isNaN(id_resultado) ||
        !respuesta_esperada ||
        !respuesta_obtenida ||
        isNaN(precision_porcentaje) ||
        isNaN(wer) ||
        isNaN(tiempo_respuesta_ms) ||
        isNaN(duracion_habla_ms) ||
        exito === undefined
    ) {
        console.log("Los datos introducidos no son válidos");
        return resp.status(400).json("Los datos introducidos no son válidos");
    }

    var sql = `
        UPDATE resultados_ejercicio
        SET respuesta_esperada = ?,
            respuesta_obtenida = ?,
            precision_porcentaje = ?,
            wer = ?,
            tiempo_respuesta_ms = ?,
            duracion_habla_ms = ?,
            exito = ?,
            observaciones = ?
        WHERE id_resultado = ?
    `;

    conexion.query(
        sql,
        [respuesta_esperada, respuesta_obtenida, precision_porcentaje, wer, tiempo_respuesta_ms, duracion_habla_ms, exito, observaciones || null, id_resultado],
        function (err, resultado) {
            if (err) {
                console.log("Ha ocurrido un error con el servidor", err);
                resp.status(500).json("Ha ocurrido un error con el servidor");
            }
            else {
                if (resultado.affectedRows != 0) {
                    resp.status(200).json("Resultado actualizado correctamente");
                }
                else {
                    console.log("No se ha encontrado ningún resultado con ese id");
                    resp.status(404).json("No se ha encontrado ningún resultado con ese id");
                }
            }
        }
    );
};

exports.eliminarResultado = function (req, resp) {
    var id_resultado = parseInt(req.params.id);

    if (isNaN(id_resultado)) {
        console.log("Identificador de resultado no válido");
        return resp.status(400).json("Identificador de resultado no válido");
    }

    var sql = "DELETE FROM resultados_ejercicio WHERE id_resultado = ?";

    conexion.query(sql, [id_resultado], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json("Resultado eliminado correctamente");
            }
            else {
                console.log("No se ha encontrado ningún resultado con ese id");
                resp.status(404).json("No se ha encontrado ningún resultado con ese id");
            }
        }
    });
};

exports.obtenerResultadosPorSesion = function (req, resp) {
    var id_sesion = parseInt(req.params.idSesion);

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = `
        SELECT
            re.id_resultado,
            se.id_sesion_ejercicio,
            e.id_ejercicio,
            e.nombre AS nombre_ejercicio,
            e.tipo_ejercicio,
            se.orden,
            re.numero_intento,
            re.respuesta_esperada,
            re.respuesta_obtenida,
            re.precision_porcentaje,
            re.wer,
            re.tiempo_respuesta_ms,
            re.duracion_habla_ms,
            re.exito,
            re.fecha_registro,
            re.observaciones
        FROM sesion_ejercicios se
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        JOIN ejercicios e ON se.id_ejercicio = e.id_ejercicio
        WHERE se.id_sesion = ?
        ORDER BY se.orden ASC, re.numero_intento ASC
    `;

    conexion.query(sql, [id_sesion], function (err, resultados) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultados.length != 0) {
                resp.status(200).json(resultados);
            }
            else {
                console.log("No se han encontrado resultados asociados a esa sesión");
                resp.status(404).json("No se han encontrado resultados asociados a esa sesión");
            }
        }
    });
};

exports.obtenerResultadosPorPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.idPaciente);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT
            re.id_resultado,
            s.id_sesion,
            se.id_sesion_ejercicio,
            e.id_ejercicio,
            e.nombre AS nombre_ejercicio,
            se.orden,
            re.numero_intento,
            re.respuesta_esperada,
            re.respuesta_obtenida,
            re.precision_porcentaje,
            re.wer,
            re.tiempo_respuesta_ms,
            re.duracion_habla_ms,
            re.exito,
            re.fecha_registro,
            re.observaciones
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

exports.obtenerResultadosPorEjercicio = function (req, resp) {
    var id_ejercicio = parseInt(req.params.idEjercicio);

    if (isNaN(id_ejercicio)) {
        console.log("Identificador de ejercicio no válido");
        return resp.status(400).json("Identificador de ejercicio no válido");
    }

    var sql = `
        SELECT
            re.id_resultado,
            s.id_sesion,
            s.id_paciente,
            se.id_sesion_ejercicio,
            e.id_ejercicio,
            e.nombre AS nombre_ejercicio,
            se.orden,
            re.numero_intento,
            re.respuesta_esperada,
            re.respuesta_obtenida,
            re.precision_porcentaje,
            re.wer,
            re.tiempo_respuesta_ms,
            re.duracion_habla_ms,
            re.exito,
            re.fecha_registro,
            re.observaciones
        FROM sesion_ejercicios se
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        JOIN ejercicios e ON se.id_ejercicio = e.id_ejercicio
        JOIN sesiones s ON se.id_sesion = s.id_sesion
        WHERE e.id_ejercicio = ?
        ORDER BY re.fecha_registro DESC
    `;

    conexion.query(sql, [id_ejercicio], function (err, resultados) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultados.length != 0) {
                resp.status(200).json(resultados);
            }
            else {
                console.log("No se han encontrado resultados asociados a ese ejercicio");
                resp.status(404).json("No se han encontrado resultados asociados a ese ejercicio");
            }
        }
    });
};
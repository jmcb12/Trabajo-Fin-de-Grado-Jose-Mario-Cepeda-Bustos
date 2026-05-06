var conexion = require("../database/conexion");

exports.obtenerMetricasPorPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.idPaciente);

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
            COUNT(re.id_resultado) AS numero_intentos,
            AVG(re.exito) * 100 AS tasa_exito
        FROM sesiones s
        JOIN sesion_ejercicios se ON s.id_sesion = se.id_sesion
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        WHERE s.id_paciente = ?
        AND s.estado <> 'cancelada'
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

exports.obtenerMetricasPorSesion = function (req, resp) {
    var id_sesion = parseInt(req.params.idSesion);

    if (isNaN(id_sesion)) {
        console.log("Identificador de sesión no válido");
        return resp.status(400).json("Identificador de sesión no válido");
    }

    var sql = `
        SELECT
            AVG(re.precision_porcentaje) AS precision_media,
            AVG(re.wer) AS wer_medio,
            AVG(re.tiempo_respuesta_ms) AS tiempo_respuesta_medio,
            AVG(re.duracion_habla_ms) AS duracion_habla_media,
            COUNT(re.id_resultado) AS numero_intentos,
            AVG(re.exito) * 100 AS tasa_exito
        FROM sesion_ejercicios se
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        WHERE se.id_sesion = ?
        AND s.estado <> 'cancelada'
    `;

    conexion.query(sql, [id_sesion], function (err, metricas) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (metricas.length != 0 && metricas[0].precision_media != null) {
                resp.status(200).json(metricas[0]);
            }
            else {
                console.log("No se han encontrado métricas asociadas a esa sesión");
                resp.status(404).json("No se han encontrado métricas asociadas a esa sesión");
            }
        }
    });
};

exports.obtenerEvolucionPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.idPaciente);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT
            s.id_sesion,
            s.fecha_hora_inicio,
            AVG(re.precision_porcentaje) AS precision_media,
            AVG(re.wer) AS wer_medio,
            AVG(re.tiempo_respuesta_ms) AS tiempo_respuesta_medio,
            AVG(re.duracion_habla_ms) AS duracion_habla_media,
            COUNT(re.id_resultado) AS numero_intentos,
            AVG(re.exito) * 100 AS tasa_exito
        FROM sesiones s
        JOIN sesion_ejercicios se ON s.id_sesion = se.id_sesion
        JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
        WHERE s.id_paciente = ?
        AND s.estado <> 'cancelada'
        GROUP BY s.id_sesion, s.fecha_hora_inicio
        ORDER BY s.fecha_hora_inicio ASC
    `;

    conexion.query(sql, [id_paciente], function (err, metricas) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (metricas.length != 0) {
                resp.status(200).json(metricas);
            }
            else {
                console.log("No se han encontrado métricas de evolución asociadas a ese paciente");
                resp.status(404).json("No se han encontrado métricas de evolución asociadas a ese paciente");
            }
        }
    });
};
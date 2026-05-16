var conexion = require("../database/conexion");

exports.obtenerMetricasPorPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.idPaciente);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT
            AVG(m.precision_sesion) AS precision_media,
            AVG(m.wer_sesion) AS wer_medio,
            AVG(m.tiempo_respuesta_sesion) AS tiempo_respuesta_medio,
            AVG(m.duracion_habla_sesion) AS duracion_habla_media,
            AVG(m.tasa_exito_sesion) AS tasa_exito,
            SUM(m.numero_intentos_sesion) AS numero_intentos,
            AVG(m.intentos_medios_sesion) AS intentos_medios,
            COUNT(m.id_sesion) AS numero_sesiones
        FROM (
            SELECT
                s.id_sesion,
                AVG(re.precision_porcentaje) AS precision_sesion,
                AVG(re.wer) AS wer_sesion,
                AVG(re.tiempo_respuesta_ms) AS tiempo_respuesta_sesion,
                AVG(re.duracion_habla_ms) AS duracion_habla_sesion,
                AVG(re.exito) * 100 AS tasa_exito_sesion,
                COUNT(re.id_resultado) AS numero_intentos_sesion,
                COUNT(DISTINCT se.id_sesion_ejercicio) AS numero_ejercicios_sesion,
                COUNT(re.id_resultado) / COUNT(DISTINCT se.id_sesion_ejercicio) AS intentos_medios_sesion
            FROM sesiones s
            JOIN sesion_ejercicios se ON s.id_sesion = se.id_sesion
            JOIN resultados_ejercicio re ON se.id_sesion_ejercicio = re.id_sesion_ejercicio
            WHERE s.id_paciente = ?
            AND s.estado <> 'cancelada'
            GROUP BY s.id_sesion
        ) m
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
            COUNT(DISTINCT se.id_sesion_ejercicio) AS numero_ejercicios,
            COUNT(re.id_resultado) / COUNT(DISTINCT se.id_sesion_ejercicio) AS intentos_medios,
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
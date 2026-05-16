var conexion = require("../database/conexion");


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
    var ruta_audio = null;

    if (req.file) {
        ruta_audio = "/media/audiosPacientes/" + req.file.filename;
    }

    if (
        isNaN(id_sesion_ejercicio) ||
        isNaN(numero_intento) ||
        !respuesta_esperada ||
        respuesta_obtenida === undefined ||
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
        (id_sesion_ejercicio, numero_intento, respuesta_esperada, respuesta_obtenida, precision_porcentaje, wer, tiempo_respuesta_ms, duracion_habla_ms, exito, ruta_audio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [id_sesion_ejercicio, numero_intento, respuesta_esperada, respuesta_obtenida || "", precision_porcentaje, wer, tiempo_respuesta_ms, duracion_habla_ms, exito, ruta_audio],
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
            re.ruta_audio
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
            re.ruta_audio
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

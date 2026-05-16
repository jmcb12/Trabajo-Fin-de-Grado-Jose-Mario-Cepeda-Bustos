var conexion = require("../database/conexion");
const cryptoAES = require("../security/cryptoAES");


exports.obtenerPacientePorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT 
            p.id_paciente,
            p.id_usuario,
            p.id_profesional_referencia,
            p.fecha_nacimiento,
            p.sexo,
            p.diagnostico_principal,
            p.nivel_afasia,
            p.fecha_inicio_tratamiento,
            p.observaciones,
            p.activo,
            u.username,
            u.nombre,
            u.apellidos
        FROM pacientes p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_paciente = ?
    `;

    conexion.query(sql, [id], function (err, paciente) {
        if (err) {
            console.log("Error en el servidor al realizar la consulta", err);
            resp.status(500).json("Error en el servidor al realizar la consulta");
        }
        else {
            if (paciente.length != 0) {
                paciente[0].diagnostico_principal = cryptoAES.descifrarTexto(paciente[0].diagnostico_principal);
                paciente[0].observaciones = cryptoAES.descifrarTexto(paciente[0].observaciones);

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
        sexo &&
        nivel_afasia &&
        activo !== undefined
    ) {

        var diagnosticoCifrado = cryptoAES.cifrarTexto(diagnostico_principal || null);
        var observacionesCifradas = cryptoAES.cifrarTexto(observaciones || null);

        var sql = `
            INSERT INTO pacientes
            (id_usuario, id_profesional_referencia, fecha_nacimiento, sexo, diagnostico_principal, nivel_afasia, fecha_inicio_tratamiento, observaciones, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sql,
            [
                id_usuario,
                id_profesional_referencia,
                fecha_nacimiento || null,
                sexo,
                diagnosticoCifrado,
                nivel_afasia,
                fecha_inicio_tratamiento || null,
                observacionesCifradas,
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

    if (nivel_afasia && sexo && activo !== undefined) {

        var diagnosticoCifrado = cryptoAES.cifrarTexto(diagnostico_principal || null);
        var observacionesCifradas = cryptoAES.cifrarTexto(observaciones || null);

        var sql = `
            UPDATE pacientes SET
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
                fecha_nacimiento || null,
                sexo,
                diagnosticoCifrado,
                nivel_afasia,
                fecha_inicio_tratamiento || null,
                observacionesCifradas,
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


exports.obtenerSesionesDePaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    var sql = `
        SELECT 
            s.id_sesion,
            s.id_paciente,
            s.id_profesional,
            s.fecha_hora_inicio,
            s.fecha_hora_fin,
            s.estado,
            s.observaciones,
            COUNT(se.id_sesion_ejercicio) AS numero_ejercicios
        FROM sesiones s
        LEFT JOIN sesion_ejercicios se ON s.id_sesion = se.id_sesion
        WHERE s.id_paciente = ?
        GROUP BY 
            s.id_sesion,
            s.id_paciente,
            s.id_profesional,
            s.fecha_hora_inicio,
            s.fecha_hora_fin,
            s.estado,
            s.observaciones
        ORDER BY s.fecha_hora_inicio DESC
    `;

    conexion.query(sql, [id_paciente], function (err, sesiones) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
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


exports.cambiarEstadoPaciente = function (req, resp) {
    var id_paciente = parseInt(req.params.id);
    var activo = req.body.activo;

    if (isNaN(id_paciente)) {
        console.log("Identificador de paciente no válido");
        return resp.status(400).json("Identificador de paciente no válido");
    }

    if (activo === undefined) {
        console.log("Falta el estado del paciente");
        return resp.status(400).json("Falta el estado del paciente");
    }

    var consulta = "UPDATE pacientes SET activo = ? WHERE id_paciente = ?";

    conexion.query(consulta, [activo, id_paciente], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultado.affectedRows == 0) {
                console.log("No se ha encontrado ningún paciente con ese identificador");
                resp.status(404).json("No se ha encontrado ningún paciente con ese identificador");
            }
            else {
                resp.status(200).json("Estado del paciente actualizado correctamente");
            }
        }
    });
};
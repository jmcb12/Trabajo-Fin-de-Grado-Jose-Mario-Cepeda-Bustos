var conexion = require("../database/conexion");

exports.obtenerEjercicios = function (req, resp) {
    var sql = "SELECT * FROM ejercicios";

    conexion.query(sql, function (err, ejercicios) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            resp.status(200).json(ejercicios);
        }
    });
};

exports.obtenerEjercicioPorId = function (req, resp) {
    var id = parseInt(req.params.id);

    if (isNaN(id)) {
        console.log("Identificador de ejercicio no válido");
        return resp.status(400).json("Identificador de ejercicio no válido");
    }

    var sql = "SELECT * FROM ejercicios WHERE id_ejercicio = ?";

    conexion.query(sql, [id], function (err, ejercicio) {
        if (err) {
            console.log("Ha ocurrido un error en el servidor", err);
            resp.status(500).json("Ha ocurrido un error en el servidor");
        }
        else {
            if (ejercicio.length != 0) {
                resp.status(200).json(ejercicio[0]);
            }
            else {
                console.log("No se ha encontrado el ejercicio con ese id asociado");
                resp.status(404).json("No se ha encontrado el ejercicio con ese id asociado");
            }
        }
    });
};

exports.crearEjercicio = function (req, resp) {
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var tipo_ejercicio = req.body.tipo_ejercicio;
    var nivel_dificultad = req.body.nivel_dificultad;
    var texto_estimulo = req.body.texto_estimulo;
    var respuesta_esperada = req.body.respuesta_esperada;
    var instruccion = req.body.instruccion;
    var duracion_maxima_seg = req.body.duracion_maxima_seg;
    var activo = req.body.activo;
    var imagen_denominacion = null;

    if (req.file) {
        imagen_denominacion = "/media/imagenesDenominacion/" + req.file.filename;
    }

    if (nombre && descripcion && tipo_ejercicio && nivel_dificultad && texto_estimulo && respuesta_esperada && instruccion && duracion_maxima_seg && activo !== undefined) {
        var sql = `
            INSERT INTO ejercicios
            (nombre, descripcion, tipo_ejercicio, nivel_dificultad, texto_estimulo, respuesta_esperada, instruccion, duracion_maxima_seg, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sql,
            [nombre, descripcion, tipo_ejercicio, nivel_dificultad, texto_estimulo, respuesta_esperada, instruccion, duracion_maxima_seg, activo],
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
        console.log("Los datos no son correctos");
        resp.status(400).json("Los datos no son correctos");
    }
};

exports.actualizarEjercicio = function (req, resp) {
    var id_ejercicio = parseInt(req.params.id);
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var tipo_ejercicio = req.body.tipo_ejercicio;
    var nivel_dificultad = req.body.nivel_dificultad;
    var texto_estimulo = req.body.texto_estimulo;
    var respuesta_esperada = req.body.respuesta_esperada;
    var instruccion = req.body.instruccion;
    var duracion_maxima_seg = req.body.duracion_maxima_seg;
    var activo = req.body.activo;
    var imagen_denominacion = req.body.imagen_denominacion || null;

    if (req.file) {
        imagen_denominacion = "/media/imagenesDenominacion/" + req.file.filename;
    }

    if (isNaN(id_ejercicio)) {
        console.log("Identificador de ejercicio no válido");
        return resp.status(400).json("Identificador de ejercicio no válido");
    }

    if (nombre && descripcion && tipo_ejercicio && nivel_dificultad && texto_estimulo && respuesta_esperada && instruccion && duracion_maxima_seg && activo !== undefined) {
        var sql = `
            UPDATE ejercicios SET
                nombre = ?,
                descripcion = ?,
                tipo_ejercicio = ?,
                nivel_dificultad = ?,
                texto_estimulo = ?,
                respuesta_esperada = ?,
                instruccion = ?,
                duracion_maxima_seg = ?,
                activo = ?
            WHERE id_ejercicio = ?
        `;

        conexion.query(
            sql,
            [nombre, descripcion, tipo_ejercicio, nivel_dificultad, texto_estimulo, respuesta_esperada, instruccion, duracion_maxima_seg, activo, id_ejercicio],
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
                        console.log("No se ha encontrado ningún ejercicio con ese identificador");
                        resp.status(404).json("No se ha encontrado ningún ejercicio con ese identificador");
                    }
                }
            }
        );
    }
    else {
        console.log("Los datos no son correctos");
        resp.status(400).json("Los datos no son correctos");
    }
};

exports.eliminarEjercicio = function (req, resp) {
    var id_ejercicio = parseInt(req.params.id);

    if (isNaN(id_ejercicio)) {
        console.log("Identificador de ejercicio no válido");
        return resp.status(400).json("Identificador de ejercicio no válido");
    }

    var sql = "UPDATE ejercicios SET activo = 0 WHERE id_ejercicio = ?";

    conexion.query(sql, [id_ejercicio], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json(resultado);
            }
            else {
                console.log("No se ha encontrado ningún ejercicio con ese identificador");
                resp.status(404).json("No se ha encontrado ningún ejercicio con ese identificador");
            }
        }
    });
};

exports.reactivarEjercicio = function (req, resp) {
    var id_ejercicio = parseInt(req.params.id);

    if (isNaN(id_ejercicio)) {
        console.log("Identificador de ejercicio no válido");
        return resp.status(400).json("Identificador de ejercicio no válido");
    }

    var sql = "UPDATE ejercicios SET activo = 1 WHERE id_ejercicio = ?";

    conexion.query(sql, [id_ejercicio], function (err, resultado) {
        if (err) {
            console.log("Ha ocurrido un error con el servidor", err);
            resp.status(500).json("Ha ocurrido un error con el servidor");
        }
        else {
            if (resultado.affectedRows != 0) {
                resp.status(200).json(resultado);
            }
            else {
                console.log("No se ha encontrado ningún ejercicio con ese identificador");
                resp.status(404).json("No se ha encontrado ningún ejercicio con ese identificador");
            }
        }
    });
};
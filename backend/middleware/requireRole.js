function requireRole() {
    const rolesPermitidos = Array.from(arguments);

    return function (req, resp, next) {
        if (!req.usuario) {
            return resp.status(401).json({ mensaje: "Usuario no autenticado" });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return resp.status(403).json({ mensaje: "No tienes permisos para acceder a este recurso" });
        }

        next();
    };
}

module.exports = requireRole;
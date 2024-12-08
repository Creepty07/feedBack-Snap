const jwt = require("jsonwebtoken");

// Middleware para autenticar el token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extrae el token después de "Bearer"

  if (!token) {
    return res.status(403).send({ error: "Token requerido para acceder." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Error al verificar el token:", err.message);
      return res.status(401).send({ error: "Token inválido o expirado." });
    }
    req.user = user; // Agrega la información del usuario al objeto `req`
    next(); // Continua con la siguiente función middleware o controlador
  });
}

// Middleware opcional para verificar roles (autorización)
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).send({ error: "No tienes permiso para acceder a este recurso." });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
};
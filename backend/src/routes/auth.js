// backend/src/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).send({ error: "Todos los campos son obligatorios." });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña
  
      db.run(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            console.error("Error al registrar usuario:", err.message);
            return res.status(500).send({ error: "Error al registrar usuario." });
          }
          res.status(201).send({ message: "Usuario registrado con éxito." });
        }
      );
    } catch (error) {
      console.error("Error al encriptar contraseña:", error.message);
      res.status(500).send({ error: "Error interno del servidor." });
    }
  });

// Inicio de sesión
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Busca al usuario en la base de datos
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("Error al buscar el usuario:", err.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Verificar la contraseña
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Generar el token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });


    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Duración corta para el token de acceso
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // Duración más larga para el token de actualización
    );
    
    // Enviar ambos tokens al cliente
    res.json({ 
      message: "Inicio de sesión exitoso", 
      accessToken, 
      refreshToken 
    });
    
    db.run(
      `INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)`,
      [user.id, refreshToken],
      (err) => {
        if (err) {
          console.error("Error al guardar el refresh token:", err.message);
        }
      }
    );    

    // Aquí es donde envías el JSON con `message` y `token`
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token: token,
    });
  });
});
  
  const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("El nombre de usuario es obligatorio."),
    body("email").isEmail().withMessage("Correo inválido."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Lógica de registro (igual que antes)
  }
);

router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generar un nuevo access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Error al verificar el refresh token:", err.message);
    res.status(401).json({ error: "Refresh token inválido o expirado." });
  }
});



module.exports = router;

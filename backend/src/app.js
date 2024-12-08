require("dotenv").config({ path: __dirname + "/../.env"}); // Asegúrate de que esta línea está presente al inicio del archivo
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes"); // Importa el archivo de rutas
const adminRoutes = require("./routes/admin");
const statsRoutes = require("./routes/stats");
const authRoutes = require("./routes/auth");
const userPollsRoutes = require("./routes/userPolls");



const app = express();

// cors
app.use(
    cors({
      origin: "http://127.0.0.1:5500", // Cambia a tu dominio de frontend
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use("/api", routes); // Todas las rutas en `routes/index.js` estarán bajo `/api`
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user-polls", userPollsRoutes);

module.exports = app;

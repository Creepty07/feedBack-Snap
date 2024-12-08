const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

// Obtener encuestas del usuario autenticado
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all("SELECT * FROM polls WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      console.error("Error al obtener las encuestas:", err.message);
      return res.status(500).json({ status: "error", message: "Error al obtener las encuestas." });
    }

    res.status(200).json({ status: "success", data: rows, message: "Encuestas obtenidas con éxito." });
  });
});

// Crear una encuesta asociada a un usuario
router.post("/create", authenticateToken, (req, res) => {
  const { question, options } = req.body;
  const userId = req.user.id;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ status: "error", message: "Pregunta y al menos dos opciones son requeridas." });
  }

  const optionsJSON = JSON.stringify(options);
  const votesJSON = JSON.stringify(Array(options.length).fill(0));

  db.run(
    "INSERT INTO polls (question, options, votes, user_id) VALUES (?, ?, ?, ?)",
    [question, optionsJSON, votesJSON, userId],
    function (err) {
      if (err) {
        console.error("Error al crear la encuesta:", err.message);
        return res.status(500).json({ status: "error", message: "Error al crear la encuesta." });
      }

      res.status(201).json({ status: "success", id: this.lastID, message: "Encuesta creada con éxito." });
    }
  );
});

// Eliminar una encuesta del usuario
router.delete("/delete/:id", authenticateToken, (req, res) => {
  const pollId = req.params.id;
  const userId = req.user.id;

  db.run("DELETE FROM polls WHERE id = ? AND user_id = ?", [pollId, userId], function (err) {
    if (err) {
      console.error("Error al eliminar la encuesta:", err.message);
      return res.status(500).json({ status: "error", message: "Error al eliminar la encuesta." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ status: "error", message: "Encuesta no encontrada o no pertenece al usuario." });
    }

    res.status(200).json({ status: "success", message: "Encuesta eliminada con éxito." });
  });
});

// Editar una encuesta existente
router.put("/edit/:id", authenticateToken, (req, res) => {
  const pollId = req.params.id;
  const { question, options } = req.body;
  const userId = req.user.id;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ status: "error", message: "Pregunta y al menos dos opciones son requeridas." });
  }

  const optionsJSON = JSON.stringify(options);

  db.run(
    `UPDATE polls SET question = ?, options = ? WHERE id = ? AND user_id = ?`,
    [question, optionsJSON, pollId, userId],
    function (err) {
      if (err) {
        console.error("Error al editar la encuesta:", err.message);
        return res.status(500).json({ status: "error", message: "Error al editar la encuesta." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ status: "error", message: "Encuesta no encontrada o no pertenece al usuario." });
      }

      res.status(200).json({ status: "success", message: "Encuesta editada con éxito." });
    }
  );
});

module.exports = router;

// backend/src/routes/admin.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Ruta para obtener todas las encuestas
router.get("/all-polls", (req, res) => {
  db.all("SELECT * FROM polls", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener las encuestas:", err.message);
      return res.status(500).send({ error: "Error al obtener las encuestas." });
    }
    res.status(200).send(rows);
  });
});

// Ruta para eliminar una encuesta por ID
router.delete("/delete-poll/:id", (req, res) => {
  const pollId = req.params.id;
  db.run("DELETE FROM polls WHERE id = ?", [pollId], function (err) {
    if (err) {
      console.error("Error al eliminar la encuesta:", err.message);
      return res.status(500).send({ error: "Error al eliminar la encuesta." });
    }
    res.status(200).send({ message: "Encuesta eliminada con éxito." });
  });
});

module.exports = router;

// backend/src/routes/stats.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Ruta para obtener estadísticas de una encuesta
router.get("/poll-stats/:id", (req, res) => {
  const pollId = req.params.id;

  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, row) => {
    if (err) {
      console.error("Error al obtener la encuesta:", err.message);
      return res.status(500).send({ error: "Error al obtener la encuesta." });
    }

    if (!row) {
      return res.status(404).send({ error: "Encuesta no encontrada." });
    }

    // Analítica básica
    const options = JSON.parse(row.options);
    const votes = JSON.parse(row.votes);
    const totalVotes = votes.reduce((sum, vote) => sum + vote, 0);

    const percentages = votes.map((vote) =>
      totalVotes > 0 ? ((vote / totalVotes) * 100).toFixed(2) : "0.00"
    );

    const mostVotedIndex = votes.indexOf(Math.max(...votes));
    const mostVotedOption = options[mostVotedIndex] || "N/A";

    res.status(200).send({
      question: row.question,
      totalVotes,
      percentages,
      mostVotedOption,
    });
  });
});

module.exports = router;

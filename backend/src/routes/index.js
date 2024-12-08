const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Asegúrate de que este archivo esté configurado para manejar la base de datos
const fs = require("fs");

// Ruta para crear una nueva encuesta
router.post("/create-poll", (req, res) => {
  const { question, options } = req.body;

  console.log("Datos recibidos:", { question, options });

  // Validar que se envíen los datos requeridos
  if (!question || !options || options.length < 2) {
    return res.status(400).send({ error: "Pregunta y al menos dos opciones son requeridas." });
  }

  // Prepara los datos para la base de datos
  const votes = Array(options.length).fill(0);
  const optionsJSON = JSON.stringify(options);
  const votesJSON = JSON.stringify(votes);

  // Inserta la encuesta en la base de datos
  db.run(
    "INSERT INTO polls (question, options, votes) VALUES (?, ?, ?)",
    [question, optionsJSON, votesJSON],
    function (err) {
      if (err) {
        console.error("Error al crear la encuesta:", err.message);
        return res.status(500).send({ error: "Error al crear la encuesta." });
      }

      res.status(201).send({ id: this.lastID, message: "Encuesta creada con éxito." });
    }
  );
});

router.get("/poll", (req, res) => {
    db.all("SELECT id, question FROM polls", [], (err, rows) => {
      if (err) {
        console.error("Error al obtener las encuestas:", err.message);
        return res.status(500).send({ error: "Error al obtener las encuestas." });
      }
      res.json(rows); // Enviar las encuestas como JSON
    });
  });
  
  router.get("/poll/:id", (req, res) => {
    const pollId = req.params.id; // Obtén el ID de la encuesta desde la URL
  
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, row) => {
      if (err) {
        console.error("Error al obtener la encuesta:", err.message);
        return res.status(500).send({ error: "Error al obtener la encuesta." });
      }
      if (!row) {
        return res.status(404).send({ error: "Encuesta no encontrada." });
      }
  
      // Enviar la encuesta como JSON
      res.json({
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        votes: JSON.parse(row.votes),
      });
    });
  });
  
  router.post("/poll/:id/vote", (req, res) => {
    const pollId = req.params.id; // ID de la encuesta desde la URL
    const { optionIndex } = req.body; // Índice de la opción desde el cuerpo de la solicitud
  
    if (optionIndex === undefined || optionIndex < 0) {
      return res.status(400).send({ error: "Índice de opción inválido." });
    }
  
    // Obtén la encuesta desde la base de datos
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, row) => {
      if (err) {
        console.error("Error al obtener la encuesta:", err.message);
        return res.status(500).send({ error: "Error al obtener la encuesta." });
      }
  
      if (!row) {
        return res.status(404).send({ error: "Encuesta no encontrada." });
      }
  
      // Actualiza los votos
      const votes = JSON.parse(row.votes);
      if (optionIndex >= votes.length) {
        return res.status(400).send({ error: "Índice de opción fuera de rango." });
      }
  
      votes[optionIndex] += 1;
  
      db.run(
        "UPDATE polls SET votes = ? WHERE id = ?",
        [JSON.stringify(votes), pollId],
        function (err) {
          if (err) {
            console.error("Error al registrar el voto:", err.message);
            return res.status(500).send({ error: "Error al registrar el voto." });
          }
  
          res.send({ message: "Voto registrado con éxito.", votes });
        }
      );
    });
  });
  
  router.get("/poll/:id/results", (req, res) => {
  const pollId = req.params.id;

  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, row) => {
    if (err) {
      console.error("Error al obtener los resultados:", err.message);
      return res.status(500).send({ error: "Error al obtener los resultados." });
    }
    if (!row) {
      return res.status(404).send({ error: "Encuesta no encontrada." });
    }

    res.json({
      id: row.id,
      question: row.question,
      options: JSON.parse(row.options),
      votes: JSON.parse(row.votes),
    });
  });
});

router.get("/poll/:id/results", (req, res) => {
    const pollId = req.params.id;
  
    db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, row) => {
      if (err) {
        console.error("Error al obtener los resultados:", err.message);
        return res.status(500).send({ error: "Error al obtener los resultados." });
      }
      if (!row) {
        return res.status(404).send({ error: "Encuesta no encontrada." });
      }
  
      res.json({
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        votes: JSON.parse(row.votes),
      });
    });
  });
  
  router.post("/save-results", (req, res) => {
    const { filename, content } = req.body;
  
    // Decodificar contenido si es Base64 (para PDFs)
    const isBase64 = content.startsWith("data:application/pdf;base64,");
    const buffer = isBase64
      ? Buffer.from(content.split(",")[1], "base64")
      : Buffer.from(content, "utf-8");
  
    // Ruta para guardar el archivo
    const filePath = `./results/${filename}`;
  
    // Guardar el archivo en el servidor
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error("Error al guardar el archivo:", err);
        return res.status(500).send({ error: "Error al guardar el archivo." });
      }
      res.send({ message: "Archivo guardado exitosamente.", filePath });
    });
  });
  

module.exports = router;

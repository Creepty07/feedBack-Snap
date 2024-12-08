const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./feedback_snap.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
    process.exit(1); // Detiene el servidor si falla la conexión
  } else {
    console.log("Conexión exitosa con SQLite.");
  }
});

// Crear tablas si no existen
db.serialize(() => {
  // Crear tabla `polls`
  db.run(`
    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      votes TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("Error al crear la tabla 'polls':", err.message);
    } else {
      console.log("Tabla 'polls' verificada o creada correctamente.");
    }
  });

  // Verificar y agregar la columna `user_id` si no existe
  db.all(`PRAGMA table_info(polls)`, (err, columns) => {
    if (err) {
      console.error("Error al verificar columnas en la tabla 'polls':", err.message);
      return;
    }

    const userIdExists = columns.some((column) => column.name === "user_id");
    if (!userIdExists) {
      db.run(`ALTER TABLE polls ADD COLUMN user_id INTEGER`, (err) => {
        if (err) {
          console.error("Error al agregar la columna 'user_id' en la tabla 'polls':", err.message);
        } else {
          console.log("Columna 'user_id' agregada correctamente a la tabla 'polls'.");
        }
      });
    } else {
      console.log("La columna 'user_id' ya existe en la tabla 'polls'.");
    }
  });

  // Crear tabla `users`
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("Error al crear la tabla 'users':", err.message);
    } else {
      console.log("Tabla 'users' verificada o creada correctamente.");
    }
  });
});

module.exports = db;

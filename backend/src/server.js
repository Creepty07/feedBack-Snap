const app = require("./app"); // Cambia esto si el archivo `app.js` está en la misma carpeta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

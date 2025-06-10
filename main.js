const fs = require("fs");
const path = require("path");

// Este es un ejemplo simple para generar el JSON
const finalItems = [
  {
    "Título": "Matrix",
    "Año": "1999",
    "Géneros": "Acción · Ciencia ficción",
    "Synopsis": "Neo descubre la verdad sobre la Matrix...",
    "Carteles": [{ "external": { "url": "https://via.placeholder.com/300x450" }}],
    "Ver Película": "https://tusitio.com/ver/matrix"
  }
];

fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "public", "data.json"),
  JSON.stringify(finalItems, null, 2),
  "utf-8"
);

console.log("✅ Datos guardados en public/data.json");

import fs from "fs";
import { Client } from "@notionhq/client";
import { config } from "dotenv";

config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function getDatabaseItems() {
  const pages = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });

    pages.push(...response.results);

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return pages;
}

function extractDataFromPage(page) {
  const p = page.properties;

  // Helper para obtener texto de rich_text o title
  const getText = (prop) => {
    if (!prop) return "";
    if (prop.type === "title" && prop.title.length > 0) return prop.title[0].plain_text;
    if (prop.type === "rich_text" && prop.rich_text.length > 0) return prop.rich_text[0].plain_text;
    return "";
  };

  // Helper para obtener URL del primer archivo
  const getFirstFileUrl = (prop) => {
    if (!prop || !prop.files || prop.files.length === 0) return "";
    const file = prop.files[0];
    return file.type === "file" ? file.file.url : (file.type === "external" ? file.external.url : "");
  };

  // Helper para extraer multi_select nombres concatenados
  const getMultiSelect = (prop) => {
    if (!prop || !prop.multi_select) return "";
    return prop.multi_select.map(tag => tag.name).join(" · ");
  };

  // Helper para extraer select nombre
  const getSelect = (prop) => {
    if (!prop || !prop.select) return "";
    return prop.select.name || "";
  };

  return {
    "Título": getText(p["Título"]),
    "ID TMDB": getText(p["ID TMDB"]),
    "TMDB": getText(p["ID TMDB"]) ? `https://www.themoviedb.org/movie/${getText(p["ID TMDB"])}` : "",
    "Synopsis": getText(p["Synopsis"]),
    "Carteles": getFirstFileUrl(p["Carteles"]),
    "Portada": getFirstFileUrl(p["Portada"]),
    "Géneros": getMultiSelect(p["Géneros"]),
    "Año": p["Año"]?.number || "",
    "Duración": p["Duración"]?.number || "",
    "Puntuación 1-10": p["Puntuación"]?.number || "",
    "Trailer": p["Trailer"]?.url || "",
    "Ver Película": p["Ver Película"]?.url || "",
    "Audios": getMultiSelect(p["Audios"]),
    "Subtítulos": getMultiSelect(p["Subtítulos"]),
    "Título original": getText(p["Título original"]),
    "Productora(s)": getMultiSelect(p["Productora(s)"]),
    "Idioma(s) original(es)": getMultiSelect(p["Idioma(s) original(es)"]),
    "País(es)": getMultiSelect(p["País(es)"]),
    "Escritor(es)": getMultiSelect(p["Escritor(es)"]),
    "Reparto principal": getMultiSelect(p["Reparto principal"]),
    "Categoría": getSelect(p["Categoría"])
  };
}

async function main() {
  const pages = await getDatabaseItems();
  const data = pages.map(extractDataFromPage);
  fs.writeFileSync("public/data.json", JSON.stringify(data, null, 2));
  console.log("✅ Archivo data.json actualizado correctamente.");
}

main();

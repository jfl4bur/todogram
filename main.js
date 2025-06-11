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
  const props = page.properties || {};
  return {
    "Título": props["Título"]?.title?.[0]?.plain_text || "",
    "ID TMDB": props["ID TMDB"]?.rich_text?.[0]?.plain_text || "",
    "TMDB": props["ID TMDB"]?.rich_text?.[0]?.plain_text
      ? `https://www.themoviedb.org/movie/${props["ID TMDB"]?.rich_text?.[0]?.plain_text}`
      : "",
    "Synopsis": props["Synopsis"]?.rich_text?.[0]?.plain_text || "",
    "Carteles": props["Carteles"]?.files?.[0]?.file?.url || "",
    "Portada": props["Portada"]?.files?.[0]?.file?.url || "",
    "Géneros": props["Géneros"]?.multi_select?.map(tag => tag.name).join(" · ") || "",
    "Año": props["Año"]?.number || "",
    "Duración": props["Duración"]?.number || "",
    "Puntuación 1-10": props["Puntuación"]?.number || "",
    "Trailer": props["Trailer"]?.url || "",
    "Ver Película": props["Ver Película"]?.url || "",
    "Audios": props["Audios"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Subtítulos": props["Subtítulos"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Título original": props["Título original"]?.rich_text?.[0]?.plain_text || "",
    "Productora(s)": props["Productora(s)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Idioma(s) original(es)": props["Idioma(s) original(es)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "País(es)": props["País(es)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Escritor(es)": props["Escritor(es)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Reparto principal": props["Reparto principal"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Categoría": props["Categoría"]?.select?.name || ""
  };
}

async function main() {
  try {
    const pages = await getDatabaseItems();
    const data = pages.map(extractDataFromPage);
    fs.writeFileSync("./public/data.json", JSON.stringify(data, null, 2));
    console.log("✅ Archivo data.json actualizado correctamente.");
  } catch (error) {
    console.error("❌ Error en main.js:", error);
    process.exit(1);
  }
}

main();

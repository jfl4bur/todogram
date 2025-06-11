import fs from "fs";
import { Client } from "@notionhq/client";
import { config } from "dotenv";

config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
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
  return {
    "Título": page.properties["Título"]?.title?.[0]?.plain_text || "",
    "ID TMDB": page.properties["ID TMDB"]?.rich_text?.[0]?.plain_text || "",
    "TMDB": page.properties["ID TMDB"]?.rich_text?.[0]?.plain_text
      ? `https://www.themoviedb.org/movie/${page.properties["ID TMDB"]?.rich_text?.[0]?.plain_text}`
      : "",
    "Synopsis": page.properties["Synopsis"]?.rich_text?.[0]?.plain_text || "",
    "Carteles": page.properties["Carteles"]?.files?.[0]?.file?.url || "",
    "Portada": page.properties["Portada"]?.files?.[0]?.file?.url || "",
    "Géneros": page.properties["Géneros"]?.multi_select?.map(tag => tag.name).join(" · ") || "",
    "Año": page.properties["Año"]?.number || "",
    "Duración": page.properties["Duración"]?.number || "",
    "Puntuación 1-10": page.properties["Puntuación"]?.number || "",
    "Trailer": page.properties["Trailer"]?.url || "",
    "Ver Película": page.properties["Ver Película"]?.url || "",
    "Audios": page.properties["Audios"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Subtítulos": page.properties["Subtítulos"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Título original": page.properties["Título original"]?.rich_text?.[0]?.plain_text || "",
    "Productora(s)": page.properties["Productora(s)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Idioma(s) original(es)": page.properties["Idioma(s) original(es)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "País(es)": page.properties["País(es)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Escritor(es)": page.properties["Escritor(es)"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Reparto principal": page.properties["Reparto principal"]?.multi_select?.map(tag => tag.name).join(", ") || "",
    "Categoría": page.properties["Categoría"]?.select?.name || ""
  };
}

async function main() {
  const pages = await getDatabaseItems();
  const data = pages.map(extractDataFromPage);
  fs.writeFileSync("public/data.json", JSON.stringify(data, null, 2));
  console.log("✅ Archivo data.json actualizado correctamente.");
}

main();

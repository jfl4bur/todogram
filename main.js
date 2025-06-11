import axios from "axios";
import * as dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

async function fetchNotionData() {
  const pages = [];
  let hasMore = true;
  let nextCursor = null;

  while (hasMore) {
    try {
      const res = await axios.post(
        `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
        { start_cursor: nextCursor },
        { headers }
      );
      pages.push(...res.data.results);
      hasMore = res.data.has_more;
      nextCursor = res.data.next_cursor;
    } catch (err) {
      console.error("❌ Error fetching Notion data:", err.message);
      break;
    }
  }

  return pages;
}

function extractText(property) {
  if (!property) return "";
  if (property.type === "rich_text" || property.type === "title") {
    return property[property.type].map(rt => rt.plain_text).join("");
  }
  if (property.type === "select") {
    return property.select?.id || "";
  }
  if (property.type === "multi_select") {
    return property.multi_select.map(option => option.id).join(",");
  }
  if (property.type === "url") {
    return property.url || "";
  }
  if (property.type === "number") {
    return property.number;
  }
  if (property.type === "files") {
    const file = property.files[0];
    return file?.external?.url || file?.file?.url || "";
  }
  return "";
}

function extractTMDBId(notionId, tmdbUrl) {
  if (notionId && notionId.trim()) return notionId.trim();
  const match = tmdbUrl?.match(/\/(movie|tv)\/(\d+)/);
  return match ? match[2] : null;
}

async function fetchTMDBData(id) {
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=credits`
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching TMDB data:", err.message);
    return null;
  }
}

function fillMissingFields(item, tmdbData) {
  const getIfEmpty = (value, fallback) => value?.toString().trim() ? value : fallback;

  return {
    ...item,
    "Productora(s)": getIfEmpty(item["Productora(s)"], tmdbData.production_companies?.map(p => p.name).join(", ") || ""),
    "Idioma(s) original(es)": getIfEmpty(item["Idioma(s) original(es)"], tmdbData.original_language || ""),
    "País(es)": getIfEmpty(item["País(es)"], tmdbData.production_countries?.map(c => c.name).join(", ") || ""),
    "Director(es)": getIfEmpty(item["Director(es)"], tmdbData.credits?.crew?.filter(p => p.job === "Director").map(p => p.name).join(", ") || ""),
    "Escritor(es)": getIfEmpty(item["Escritor(es)"], tmdbData.credits?.crew?.filter(p => p.department === "Writing").map(p => p.name).join(", ") || ""),
    "Reparto principal": getIfEmpty(item["Reparto principal"], tmdbData.credits?.cast?.slice(0, 5).map(a => a.name).join(", ") || ""),
  };
}

async function main() {
  const notionPages = await fetchNotionData();
  const data = [];

  for (const page of notionPages) {
    const props = page.properties;

    const item = {
      "Título": extractText(props["Título"]),
      "ID TMDB": extractText(props["ID TMDB"]),
      "TMDB": extractText(props["TMDB"]),
      "Synopsis": extractText(props["Synopsis"]),
      "Carteles": extractText(props["Carteles"]),
      "Portada": extractText(props["Portada"]),
      "Géneros": extractText(props["Géneros"]),
      "Año": extractText(props["Año"]),
      "Duración": extractText(props["Duración"]),
      "Puntuación 1-10": extractText(props["Puntuación"]),
      "Trailer": extractText(props["Trailer"]),
      "Ver Película": extractText(props["Ver Película"]),
      "Audios": extractText(props["Audios"]),
      "Subtítulos": extractText(props["Subtítulos"]),
      "Título original": extractText(props["Título original"]),
      "Productora(s)": extractText(props["Productora(s)"]),
      "Idioma(s) original(es)": extractText(props["Idioma(s) original(es)"]),
      "País(es)": extractText(props["País(es)"]),
      "Director(es)": extractText(props["Director(es)"]),
      "Escritor(es)": extractText(props["Escritor(es)"]),
      "Reparto principal": extractText(props["Reparto principal"]),
      "Categoría": extractText(props["Categoría"]),
      "Video iframe": extractText(props["Video iframe"]),
      "Video iframe 1": extractText(props["Video iframe 1"]),
    };

    const tmdbId = extractTMDBId(item["ID TMDB"], item["TMDB"]);

    if (tmdbId) {
      const tmdbData = await fetchTMDBData(tmdbId);
      if (tmdbData) {
        Object.assign(item, fillMissingFields(item, tmdbData));
      }
    }

    data.push(item);
  }

  await fs.writeFile("public/data.json", JSON.stringify(data, null, 2), "utf-8");
  console.log("✅ Archivo data.json actualizado con datos de Notion + TMDB.");
}

main();

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
      const body = nextCursor ? { start_cursor: nextCursor } : {};
      const res = await axios.post(
        `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
        body,
        { headers }
      );
      pages.push(...res.data.results);
      hasMore = res.data.has_more;
      nextCursor = res.data.next_cursor;
    } catch (err) {
      console.error("❌ Error fetching Notion data:", err.response?.data || err.message);
      process.exit(1);
    }
  }

  return pages;
}

function extractText(property) {
  if (!property) return "";
  switch (property.type) {
    case "title":
    case "rich_text":
      return property[property.type].map(rt => rt.plain_text).join("");
    case "select":
      return property.select?.id || "";
    case "multi_select":
      return property.multi_select.map(opt => opt.id).join(", ");
    case "url":
      return property.url || "";
    case "number":
      return property.number?.toString() || "";
    case "files":
      const file = property.files[0];
      return file?.external?.url || file?.file?.url || "";
    default:
      return "";
  }
}

function extractTMDBId(notionId, tmdbUrl) {
  if (notionId) return notionId.trim();
  const m = tmdbUrl?.match(/\/(movie|tv)\/(\d+)/);
  return m ? m[2] : null;
}

async function fetchTMDBData(id) {
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=credits`
    );
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching TMDB data:", err.response?.data || err.message);
    return null;
  }
}

function fillMissingFields(item, tmdb) {
  const get = (k, fallback) => item[k] || fallback;
  return {
    ...item,
    "Productora(s)": get("Productora(s)", tmdb?.production_companies?.map(p => p.name).join(", ") || ""),
    "Idioma(s) original(es)": get("Idioma(s) original(es)", tmdb?.original_language || ""),
    "País(es)": get("País(es)", tmdb?.production_countries?.map(c => c.name).join(", ") || ""),
    "Director(es)": get("Director(es)", tmdb?.credits?.crew?.filter(c => c.job === "Director").map(c => c.name).join(", ") || ""),
    "Escritor(es)": get("Escritor(es)", tmdb?.credits?.crew?.filter(c => c.department === "Writing").map(c => c.name).join(", ") || ""),
    "Reparto principal": get("Reparto principal", tmdb?.credits?.cast?.slice(0, 5).map(c => c.name).join(", ") || "")
  };
}

async function main() {
  const pages = await fetchNotionData();
  console.log(`✅ ${pages.length} página(s) obtenidas de Notion.`);

  if (pages.length === 0) {
    console.error("❌ No hay páginas en Notion. Deteniendo.");
    process.exit(1);
  }

  await fs.mkdir("public", { recursive: true });

  const data = [];
  for (const page of pages) {
    const p = page.properties;
    const item = {
      "Título": extractText(p["Título"]),
      "ID TMDB": extractText(p["ID TMDB"]),
      "TMDB": extractText(p["TMDB"]),
      "Synopsis": extractText(p["Synopsis"]),
      "Carteles": extractText(p["Carteles"]),
      "Portada": extractText(p["Portada"]),
      "Géneros": extractText(p["Géneros"]),
      "Año": extractText(p["Año"]),
      "Duración": extractText(p["Duración"]),
      "Puntuación 1-10": extractText(p["Puntuación 1-10"]),
      "Trailer": extractText(p["Trailer"]),
      "Ver Película": extractText(p["Ver Película"]),
      "Audios": extractText(p["Audios"]),
      "Subtítulos": extractText(p["Subtítulos"]),
      "Título original": extractText(p["Título original"]),
      "Productora(s)": extractText(p["Productora(s)"]),
      "Idioma(s) original(es)": extractText(p["Idioma(s) original(es)"]),
      "País(es)": extractText(p["País(es)"]),
      "Director(es)": extractText(p["Director(es)"]),
      "Escritor(es)": extractText(p["Escritor(es)"]),
      "Reparto principal": extractText(p["Reparto principal"]),
      "Categoría": extractText(p["Categoría"]),
      "Video iframe": extractText(p["Video iframe"]),
      "Video iframe 1": extractText(p["Video iframe 1"]),
    };

    const tmdbId = extractTMDBId(item["ID TMDB"], item["TMDB"]);
    if (tmdbId) {
      const tmdbData = await fetchTMDBData(tmdbId);
      if (tmdbData) Object.assign(item, fillMissingFields(item, tmdbData));
    }

    data.push(item);
  }

  await fs.writeFile("public/data.json", JSON.stringify(data, null, 2), "utf-8");
  console.log("✅ public/data.json actualizado con Notion + TMDB.");
}

main();

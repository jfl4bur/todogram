import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import { createSpinner } from "nanospinner";
import cliProgress from "cli-progress";
import colors from "ansi-colors";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const headers = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
};

const limit = pLimit(20); // Mayor concurrencia para rendimiento

<<<<<<< HEAD
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
=======
// Utilidad para extraer texto plano de propiedades
const extractText = (property) => {
  if (!property) return "";
  switch (property.type) {
    case "title":
      return property.title.map((t) => t.plain_text).join("");
    case "rich_text":
      return property.rich_text.map((t) => t.plain_text).join("");
    case "select":
      return property.select?.name || "";
    case "multi_select":
      return property.multi_select.map((t) => t.name).join(", ");
    case "url":
      return property.url || "";
    case "files":
      const file = property.files[0];
      return file?.external?.url || file?.file?.url || "";
    case "number":
      return property.number?.toString() || "";
    default:
      return "";
  }
};

const getAllPages = async () => {
  let results = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    results = results.concat(res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return results;
};
>>>>>>> 9d394c6 (✅ Añadir progreso y soporte GitHub Actions)

const getRelationNames = async (ids, label, bar, step, total) => {
  const names = [];
  for (const [i, id] of ids.entries()) {
    try {
      const res = await axios.get(`https://api.notion.com/v1/pages/${id}`, { headers });
      const props = res.data.properties;
      const titleProp = Object.values(props).find(p => p.type === "title");
      const name = titleProp?.title?.map(t => t.plain_text).join("") || "";
      if (name) names.push(name);
    } catch {
      console.warn(`⚠️ No se pudo obtener la relación con ID ${id}`);
    }
    bar.update(step, {
      progress: step + i / total,
      message: `Sincronizando: ${label} (${i + 1}/${total})`,
    });
  }
  return names.join(", ");
};

const extractTMDBid = (url) => {
  const match = url?.match(/themoviedb\.org\/(?:movie|tv)\/(\d+)/);
  return match ? match[1] : "";
};

const fetchTMDBData = async (title, fallbackType = "movie") => {
  try {
<<<<<<< HEAD
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
=======
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    const searchResponse = await axios.get(searchUrl);

    const result = searchResponse.data.results?.[0];
    if (!result) return {};

    const type = result.media_type || fallbackType;
    const id = result.id;

    const detailsUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=credits`;
    const detailsResponse = await axios.get(detailsUrl);

    const videoUrl = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${TMDB_API_KEY}&language=es-ES`;
    const videoResponse = await axios.get(videoUrl);

    const trailer = videoResponse.data.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

    return {
      tmdbId: id,
      tmdbUrl: `https://www.themoviedb.org/${type}/${id}`,
      synopsis: detailsResponse.data.overview,
      year: (detailsResponse.data.release_date || detailsResponse.data.first_air_date || "").slice(0, 4),
      duration: detailsResponse.data.runtime
        ? `${Math.floor(detailsResponse.data.runtime / 60)}h ${detailsResponse.data.runtime % 60}m`
        : "",
      score: detailsResponse.data.vote_average?.toFixed(1) || "",
      trailer: trailer ? `https://youtu.be/${trailer.key}` : "",
      originalTitle: detailsResponse.data.original_title || detailsResponse.data.original_name || "",
      production: detailsResponse.data.production_companies?.map(c => c.name).join(", "),
      languages: detailsResponse.data.original_language || "",
      countries: detailsResponse.data.production_countries?.map(c => c.name).join(", "),
      directors: detailsResponse.data.credits?.crew?.filter(p => p.job === "Director").map(p => p.name).join(", "),
      writers: detailsResponse.data.credits?.crew?.filter(p => ["Writer", "Screenplay", "Story"].includes(p.job)).map(p => p.name).join(", "),
      cast: detailsResponse.data.credits?.cast?.slice(0, 5).map(p => p.name).join(", "),
    };
  } catch (err) {
    console.warn(`⚠️ Error TMDB "${title}": ${err.message}`);
    return {};
  }
};

const processItem = async (page, bar, index, total) => {
  const p = page.properties;

  const titulo = extractText(p["Título"]);
  const urlTMDB = extractText(p["TMDB"]);
  const idTmdb = extractTMDBid(urlTMDB);
  const datosTmdb = !idTmdb ? await fetchTMDBData(titulo) : await fetchTMDBData(titulo);
  const tmdbId = idTmdb || datosTmdb.tmdbId;

  const getIds = (rel) => rel?.relation?.map(r => r.id) || [];

  bar.update(index, {
    message: `Sincronizando: Géneros... (${index + 1}/${total})`
  });
  const generos = await getRelationNames(getIds(p["Géneros"]), "Géneros", bar, index, total);

  const audios = await getRelationNames(getIds(p["Audios"]), "Audios", bar, index, total);
  const subs = await getRelationNames(getIds(p["Subtítulos"]), "Subtítulos", bar, index, total);
  const categoria = await getRelationNames(getIds(p["Categoría"]), "Categoría", bar, index, total);

  bar.update(index, {
    progress: index + 1,
    message: `Procesado (${index + 1}/${total})`
  });

  return {
    "Título": titulo,
    "ID TMDB": tmdbId || "",
    "TMDB": datosTmdb.tmdbUrl || urlTMDB || "",
    "Synopsis": extractText(p["Synopsis"]) || datosTmdb.synopsis || "",
    "Carteles": extractText(p["Carteles"]),
    "Portada": extractText(p["Portada"]),
    "Géneros": generos,
    "Año": extractText(p["Año"]) || datosTmdb.year || "",
    "Duración": extractText(p["Duración"]) || datosTmdb.duration || "",
    "Puntuación 1-10": extractText(p["Puntuación 1-10"]) || datosTmdb.score || "",
    "Trailer": extractText(p["Trailer"]) || datosTmdb.trailer || "",
    "Ver Película": extractText(p["Ver Película"]),
    "Audios": audios,
    "Subtítulos": subs,
    "Título original": extractText(p["Título original"]) || datosTmdb.originalTitle || "",
    "Productora(s)": extractText(p["Productora(s)"]) || datosTmdb.production || "",
    "Idioma(s) original(es)": extractText(p["Idioma(s) original(es)"]) || datosTmdb.languages || "",
    "País(es)": extractText(p["País(es)"]) || datosTmdb.countries || "",
    "Director(es)": extractText(p["Director(es)"]) || datosTmdb.directors || "",
    "Escritor(es)": extractText(p["Escritor(es)"]) || datosTmdb.writers || "",
    "Reparto principal": extractText(p["Reparto principal"]) || datosTmdb.cast || "",
    "Categoría": categoria,
    "Video iframe": extractText(p["Video iframe"]),
    "Video iframe 1": extractText(p["Video iframe 1"]),
>>>>>>> 9d394c6 (✅ Añadir progreso y soporte GitHub Actions)
  };
};

<<<<<<< HEAD
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
=======
const main = async () => {
  const spinner = createSpinner("🔁 Obteniendo páginas de Notion...").start();
  const pages = await getAllPages();
  spinner.success({ text: `✅ ${pages.length} página(s) obtenidas de Notion.` });

  const bar = new cliProgress.SingleBar({
    format: colors.red("|{bar}| {percentage}% ") + "{message}",
    barCompleteChar: "█",
    barIncompleteChar: " ",
    hideCursor: true,
  });

  bar.start(pages.length, 0, { message: "Iniciando..." });

  const items = await Promise.all(
    pages.map((page, index) =>
      limit(() => processItem(page, bar, index, pages.length))
    )
  );

  bar.stop();

  const outputDir = path.join(process.cwd(), "public");
  const outputFile = path.join(outputDir, "data.json");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  fs.writeFileSync(outputFile, JSON.stringify(items, null, 2), "utf-8");

  console.log("✅ Archivo 'public/data.json' actualizado con éxito.");
};

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
>>>>>>> 9d394c6 (✅ Añadir progreso y soporte GitHub Actions)

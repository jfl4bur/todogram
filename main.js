import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs/promises";
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
const limit = pLimit(20); // concurrencia

const extractText = (property) => {
  if (!property) return "";
  switch (property.type) {
    case "title":
      return property.title.map(t => t.plain_text).join("");
    case "rich_text":
      return property.rich_text.map(t => t.plain_text).join("");
    case "select":
      return property.select?.name || "";
    case "multi_select":
      return property.multi_select.map(t => t.name).join(", ");
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
      console.warn(`⚠️ No se pudo obtener relación con ID ${id}`);
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

  const generos = await getRelationNames(getIds(p["Géneros"]), "Géneros", bar, index, total);
  const audios = await getRelationNames(getIds(p["Audios"]), "Audios", bar, index, total);
  const subs = await getRelationNames(getIds(p["Subtítulos"]), "Subtítulos", bar, index, total);
  const categoria = await getRelationNames(getIds(p["Categoría"]), "Categoría", bar, index, total);

  bar.update(index, {
    progress: index + 1,
    message: `Procesado (${index + 1}/${total})`,
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
  };
};

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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

  let previousData = [];
  try {
    const existing = await fs.readFile(outputFile, "utf-8");
    previousData = JSON.parse(existing);
  } catch {
    console.log("📁 No se encontró archivo anterior. Se generará uno nuevo.");
  }

  const changes = [];
  const previousMap = new Map(previousData.map(item => [item["Título"], item]));

  for (const item of items) {
    const existing = previousMap.get(item["Título"]);
    if (!existing) {
      changes.push(`🆕 Nuevo: ${item["Título"]}`);
    } else if (!deepEqual(item, existing)) {
      changes.push(`✏️ Actualizado: ${item["Título"]}`);
    }
  }

  const removed = previousData
    .filter(prev => !items.find(i => i["Título"] === prev["Título"]))
    .map(r => `🗑️ Eliminado: ${r["Título"]}`);

  changes.push(...removed);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(items, null, 2), "utf-8");

  console.log("✅ Archivo actualizado: public/data.json");

  if (changes.length === 0) {
    console.log("🔍 No se detectaron cambios respecto al archivo anterior.");
  } else {
    console.log("📝 Cambios detectados:");
    changes.forEach(c => console.log(" -", c));
  }
};

main();
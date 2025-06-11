import fs from "fs";
import fetch from "node-fetch";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function queryNotionDatabase() {
  const url = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 100 }),
  });
  if (!res.ok) {
    throw new Error(`Error Notion API: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.results;
}

function extractNotionData(page) {
  const props = page.properties;

  const title = props.Título?.title?.[0]?.plain_text || "Sin título";
  const tmdb_id = props["ID TMDB"]?.number || null;

  return { title, tmdb_id };
}

async function fetchTmdbDetails(tmdb_id) {
  if (!tmdb_id) return null;

  const url = `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=es-ES`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`TMDB error para id ${tmdb_id}: ${res.statusText}`);
    return null;
  }
  return await res.json();
}

async function main() {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID || !TMDB_API_KEY) {
    console.error("Variables de entorno NO configuradas correctamente.");
    process.exit(1);
  }

  console.log("Consultando Notion...");
  const notionPages = await queryNotionDatabase();

  const results = [];

  for (const page of notionPages) {
    const { title, tmdb_id } = extractNotionData(page);

    console.log(`Procesando: ${title} (TMDB ID: ${tmdb_id})`);

    const tmdbData = await fetchTmdbDetails(tmdb_id);

    results.push({
      title,
      tmdb_id,
      overview: tmdbData?.overview || "",
      genres: tmdbData?.genres?.map(g => g.name) || [],
      release_date: tmdbData?.release_date || "",
      poster_path: tmdbData?.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
        : "",
      vote_average: tmdbData?.vote_average || 0,
      runtime: tmdbData?.runtime || 0,
    });
  }

  if (!fs.existsSync("public")) fs.mkdirSync("public");
  fs.writeFileSync("public/data.json", JSON.stringify(results, null, 2));

  console.log("Archivo public/data.json generado.");
}

main().catch(e => {
  console.error("Error general:", e);
  process.exit(1);
});

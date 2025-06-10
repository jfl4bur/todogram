import dotenv from "dotenv";
dotenv.config();
import { Client } from "@notionhq/client";
import axios from "axios";

// Inicialización
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const tmdbApiKey = process.env.TMDB_API_KEY;

async function fetchTMDB(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}&language=es-ES`;
  const res = await axios.get(url);
  return res.data;
}

async function updateNotionPage(pageId, tmdb) {
  const synopsis = tmdb.overview || "Sin sinopsis.";
  const year = tmdb.release_date?.split("-")[0] || null;
  const genres = tmdb.genres.map(g => g.name).join(" · ");
  const poster = `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Synopsis": { rich_text: [{ text: { content: synopsis.substring(0, 2000) } }] },
      "Géneros": { rich_text: [{ text: { content: genres } }] },
      "Año": { number: year ? parseInt(year) : null },
      "Carteles": { files: [{ name: "Poster", external: { url: poster } }] }
    }
  });
}

async function main() {
  const pages = await notion.databases.query({ database_id: databaseId, page_size: 100 });

  for (const page of pages.results) {
    const pid = page.id;
    const props = page.properties;
    const tmdbId = props["ID TMDB"]?.rich_text?.[0]?.plain_text;
    if (!tmdbId) continue;

    const hasSynopsis = props["Synopsis"]?.rich_text?.length > 0;
    const hasGenres = props["Géneros"]?.rich_text?.length > 0;

    if (hasSynopsis && hasGenres) continue;

    try {
      const tmdbData = await fetchTMDB(tmdbId);
      await updateNotionPage(pid, tmdbData);
      console.log(`✅ Actualizado: ${tmdbData.title}`);
    } catch (e) {
      console.error(`❌ Error [TMDB ${tmdbId}]:`, e.message);
    }
  }
}

main();

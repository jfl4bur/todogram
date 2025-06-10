import fs from "fs";
import { Client } from "@notionhq/client";
import fetch from "node-fetch";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const tmdbApiKey = process.env.TMDB_API_KEY;

async function fetchTMDBDetails(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&language=es-ES`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error fetching TMDB data");
  }
  return res.json();
}

async function getNotionData() {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

async function buildData() {
  const results = await getNotionData();
  const data = [];

  for (const page of results) {
    const properties = page.properties;
    const tmdbId = properties["ID TMDB"]?.number || null;

    let details = {};
    if (tmdbId) {
      details = await fetchTMDBDetails(tmdbId);
    }

    data.push({
      id: page.id,
      title: properties.Título?.title[0]?.plain_text || "Sin título",
      synopsis: properties.Synopsis?.rich_text[0]?.plain_text || "",
      genres: properties.Géneros?.multi_select.map(g => g.name).join(", ") || "",
      year: properties.Año?.number || "",
      tmdbDetails: details
    });
  }

  return data;
}

async function main() {
  try {
    const data = await buildData();
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }
    fs.writeFileSync("public/data.json", JSON.stringify(data, null, 2), "utf-8");
    console.log("data.json creado en /public");
  } catch (error) {
    console.error(error);
  }
}

main();
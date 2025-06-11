// main.js

import fs from 'fs';
import axios from 'axios';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const tmdbApiKey = process.env.TMDB_API_KEY;

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

function extractProperty(properties, name) {
  const prop = properties[name];
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return prop.title.map(t => t.plain_text).join('');
    case 'rich_text':
      return prop.rich_text.map(t => t.plain_text).join('');
    case 'url':
      return prop.url || '';
    case 'select':
      return prop.select?.name || '';
    case 'multi_select':
      return prop.multi_select.map(s => s.name).join(', ');
    case 'number':
      return prop.number || '';
    case 'relation':
      return prop.relation.map(r => r.id).join(',');
    case 'files':
      return prop.files[0]?.file?.url || prop.files[0]?.external?.url || '';
    default:
      return '';
  }
}

async function fetchFromTMDB(id) {
  if (!id) return {};
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: {
        api_key: tmdbApiKey,
        append_to_response: 'credits'
      }
    });
    const d = res.data;
    return {
      "Synopsis": d.overview,
      "Carteles": d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '',
      "Portada": d.backdrop_path ? `https://image.tmdb.org/t/p/w780${d.backdrop_path}` : '',
      "Géneros": d.genres?.map(g => g.name).join(', '),
      "Año": d.release_date?.split('-')[0] || '',
      "Duración": d.runtime ? `${d.runtime} min` : '',
      "Puntuación 1-10": d.vote_average?.toFixed(1),
      "Título original": d.original_title,
      "Idioma(s) original(es)": d.original_language,
      "Productora(s)": d.production_companies?.map(p => p.name).join(', '),
      "País(es)": d.production_countries?.map(p => p.name).join(', '),
      "Director(es)": d.credits.crew?.filter(p => p.job === 'Director').map(p => p.name).join(', '),
      "Escritor(es)": d.credits.crew?.filter(p => p.job === 'Writer' || p.department === 'Writing').map(p => p.name).join(', '),
      "Reparto principal": d.credits.cast?.slice(0, 5).map(p => p.name).join(', ')
    };
  } catch (err) {
    console.warn(`⚠️ Error obteniendo datos de TMDB para ID ${id}`);
    return {};
  }
}

async function main() {
  const items = await getDatabaseItems();

  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  const data = [];
  for (const page of items) {
    const p = page.properties;
    const idTMDB = extractProperty(p, 'ID TMDB');
    const tmdb = await fetchFromTMDB(idTMDB);

    const item = {
      "Título": extractProperty(p, 'Título'),
      "ID TMDB": idTMDB,
      "TMDB": extractProperty(p, 'TMDB'),
      "Synopsis": extractProperty(p, 'Synopsis') || tmdb.Synopsis || '',
      "Carteles": extractProperty(p, 'Carteles') || tmdb.Carteles || '',
      "Portada": extractProperty(p, 'Portada') || tmdb.Portada || '',
      "Géneros": extractProperty(p, 'Géneros') || tmdb.Géneros || '',
      "Año": extractProperty(p, 'Año') || tmdb.Año || '',
      "Duración": extractProperty(p, 'Duración') || tmdb.Duración || '',
      "Puntuación 1-10": extractProperty(p, 'Puntuación 1-10') || tmdb["Puntuación 1-10"] || '',
      "Trailer": extractProperty(p, 'Trailer'),
      "Ver Película": extractProperty(p, 'Ver Película'),
      "Audios": extractProperty(p, 'Audios'),
      "Subtítulos": extractProperty(p, 'Subtítulos'),
      "Título original": extractProperty(p, 'Título original') || tmdb["Título original"] || '',
      "Productora(s)": extractProperty(p, 'Productora(s)') || tmdb["Productora(s)"] || '',
      "Idioma(s) original(es)": extractProperty(p, 'Idioma(s) original(es)') || tmdb["Idioma(s) original(es)"] || '',
      "País(es)": extractProperty(p, 'País(es)') || tmdb["País(es)"] || '',
      "Director(es)": extractProperty(p, 'Director(es)') || tmdb["Director(es)"] || '',
      "Escritor(es)": extractProperty(p, 'Escritor(es)') || tmdb["Escritor(es)"] || '',
      "Reparto principal": extractProperty(p, 'Reparto principal') || tmdb["Reparto principal"] || '',
      "Categoría": extractProperty(p, 'Categoría'),
      "Video iframe": extractProperty(p, 'Video iframe'),
      "Video iframe 1": extractProperty(p, 'Video iframe 1'),
    };

    data.push(item);
  }

  fs.writeFileSync('public/data.json', JSON.stringify(data, null, 2));
  console.log('✅ Archivo public/data.json generado correctamente.');
}

main().catch((error) => {
  console.error('❌ Error ejecutando el script:', error);
});

// main.js

import fs from 'fs';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

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

function extractProperty(properties, name) {
  const prop = properties[name];
  if (!prop) {
    console.warn(`⚠️ Propiedad no encontrada: "${name}"`);
    return '';
  }
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
    case 'formula':
      console.warn(`⚠️ Tipo no manejado para "${name}": formula`);
      return '';
    case 'files':
      return prop.files[0]?.file?.url || prop.files[0]?.external?.url || '';
    default:
      console.warn(`⚠️ Tipo no manejado para "${name}":`, prop.type);
      return '';
  }
}

async function main() {
  const items = await getDatabaseItems();

  // Asegurarse de que la carpeta 'public/' existe
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  const data = items.map((page) => {
    const properties = page.properties;

    // Logs para depuración
    console.log('➡️ Procesando:', extractProperty(properties, 'Título'));
    console.log('Video iframe:', extractProperty(properties, 'Video iframe'));
    console.log('Video iframe 1:', extractProperty(properties, 'Video iframe 1'));

    return {
      "Título": titulo,
      "ID TMDB": extractProperty(properties, 'ID TMDB'),
      "TMDB": extractProperty(properties, 'TMDB'),
      "Synopsis": extractProperty(properties, 'Synopsis'),
      "Carteles": extractProperty(properties, 'Carteles'),
      "Portada": extractProperty(properties, 'Portada'),
      "Géneros": extractProperty(properties, 'Géneros'),
      "Año": extractProperty(properties, 'Año'),
      "Duración": extractProperty(properties, 'Duración'),
      "Puntuación 1-10": extractProperty(properties, 'Puntuación 1-10'),
      "Trailer": extractProperty(properties, 'Trailer'),
      "Ver Película": extractProperty(properties, 'Ver Película'),
      "Audios": extractProperty(properties, 'Audios'),
      "Subtítulos": extractProperty(properties, 'Subtítulos'),
      "Título original": extractProperty(properties, 'Título original'),
      "Productora(s)": extractProperty(properties, 'Productora(s)'),
      "Idioma(s) original(es)": extractProperty(properties, 'Idioma(s) original(es)'),
      "País(es)": extractProperty(properties, 'País(es)'),
      "Escritor(es)": extractProperty(properties, 'Escritor(es)'),
      "Reparto principal": extractProperty(properties, 'Reparto principal'),
      "Categoría": extractProperty(properties, 'Categoría'),
      "Video iframe": extractProperty(properties, 'Video iframe'),
      "Video iframe 1": extractProperty(properties, 'Video iframe 1'),
    };
  });

  fs.writeFileSync('public/data.json', JSON.stringify(data, null, 2));
  console.log('✅ Archivo public/data.json generado correctamente.');
}

main().catch((error) => {
  console.error('❌ Error ejecutando el script:', error);
});

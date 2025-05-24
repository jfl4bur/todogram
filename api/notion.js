const { default: fetch } = require('node-fetch');
const cors = require('cors')();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

module.exports = async (req, res) => {
  // Habilitar CORS
  await new Promise(resolve => cors(req, res, resolve));
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        sorts: [{ property: 'Categoria', direction: 'ascending' }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filtrar y transformar los datos para Softr
    const filteredData = data.results.map(page => {
      const properties = page.properties;
      return {
        id: page.id,
        title: properties['Título']?.title[0]?.plain_text || '',
        tmdbId: properties['ID TMDB']?.number || null,
        posterUrl: properties['Portada']?.files[0]?.file?.url || '',
        backdropUrl: properties['Carteles']?.files[0]?.file?.url || '',
        year: properties['Año']?.number || null,
        duration: properties['Duración']?.number || null,
        rating: properties['Puntuación']?.number || null,
        category: properties['Categoria']?.select?.name || 'Otros',
        // Añade más campos según necesites
      };
    });
    
    res.status(200).json(filteredData);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
};

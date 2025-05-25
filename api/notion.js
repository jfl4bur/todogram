import fetch from 'node-fetch';
import cors from 'cors';

const corsMiddleware = cors();

export default async (req, res) => {
  await new Promise(resolve => corsMiddleware(req, res, resolve));
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        sorts: [{ property: 'Categoria', direction: 'ascending' }]
      })
    });

    if (!response.ok) throw new Error(`Notion API error: ${response.status}`);

    const data = await response.json();
    const results = data.results.map(page => ({
      id: page.id,
      title: page.properties['Título']?.title[0]?.plain_text || '',
      posterUrl: page.properties['Portada']?.files[0]?.file?.url || '',
      // Añade más campos según necesites
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

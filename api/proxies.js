// api/proxy.js para Vercel
import fetch from 'node-fetch';

export default async (req, res) => {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
  
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
    
    const data = await response.json();
    res.status(200).json(data.results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

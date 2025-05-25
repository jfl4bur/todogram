import fetch from 'node-fetch';

export default async (req, res) => {
  // Configuración explícita de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      }
    });

    const data = await response.json();
    res.status(200).send(JSON.stringify(data));
    
  } catch (error) {
    res.status(500).send(JSON.stringify({
      error: error.message
    }));
  }
};

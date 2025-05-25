export default async (req, res) => {
  // Configuración explícita de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({ 
    status: 'ok',
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
};

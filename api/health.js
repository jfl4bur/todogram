export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    status: 'ok',
    message: 'API funcionando correctamente'
  });
};

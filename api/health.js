export default async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ 
    status: 'ok',
    message: 'API funcionando'
  }));
};

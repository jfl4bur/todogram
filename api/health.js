// Middleware de autenticación básica
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Permitir acceso sin autenticación en desarrollo
  if (process.env.NODE_ENV === 'development') return next();
  
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  next();
};

export default async (req, res) => {
  // Configuración explícita de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Usar el middleware
  authenticate(req, res, () => {
    return res.status(200).json({ 
      status: 'ok',
      message: 'API funcionando',
      timestamp: new Date().toISOString()
    });
  });
};

import cors from 'cors';
const corsMiddleware = cors();

export default async (req, res) => {
  await new Promise(resolve => corsMiddleware(req, res, resolve));
  res.status(200).json({ status: 'ok', version: '1.0.0' });
};

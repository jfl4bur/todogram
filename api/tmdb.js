const { default: fetch } = require('node-fetch');
const cors = require('cors')();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

module.exports = async (req, res) => {
  // Habilitar CORS
  await new Promise(resolve => cors(req, res, resolve));
  
  const { tmdbId } = req.query;
  
  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId parameter is required' });
  }
  
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extraer solo los datos necesarios
    const enrichedData = {
      synopsis: data.overview,
      originalTitle: data.original_title,
      duration: data.runtime,
      rating: data.vote_average,
      genres: data.genres.map(g => g.name),
      trailer: data.videos?.results?.find(v => v.type === 'Trailer')?.key || null,
      directors: data.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name),
      cast: data.credits?.cast?.slice(0, 10).map(c => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
      }))
    };
    
    res.status(200).json(enrichedData);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
};

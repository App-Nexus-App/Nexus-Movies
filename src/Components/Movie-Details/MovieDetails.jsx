import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../MovieContext';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const { setQuery, query } = useGlobalContext();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);

  const API_KEY = '5017776348012e3d35b87f7c927200a4';

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        if (!movieResponse.ok) throw new Error("Failed to fetch movie details");
        const movieData = await movieResponse.json();
        setMovie(movieData);

        const trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
        const trailerData = await trailerResponse.json();
        const officialTrailer = trailerData.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (officialTrailer) {
          setTrailer(`https://www.youtube.com/embed/${officialTrailer.key}`);
        }

        const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`);
        const creditsData = await creditsResponse.json();
        const topActors = creditsData.cast.slice(0, 3);

        let actorMoviesData = [];
        for (const actor of topActors) {
          const actorMoviesResponse = await fetch(
            `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${API_KEY}`
          );
          const actorMovies = await actorMoviesResponse.json();
          actorMoviesData = [...actorMoviesData, ...actorMovies.cast];
        }

        const uniqueMovies = Array.from(new Map(actorMoviesData.map(movie => [movie.id, movie])).values());
        setActorMovies(uniqueMovies.filter(m => m.id !== Number(id)).slice(0, 6));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) return <p>Loading movie details...</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div className="movie-details">
      <div className="buttons">
        {query && (
          <button onClick={() => navigate(`/search/${query}`)} className="back-button">
            ⬅ Back to Search Results
          </button>
        )}
        <button onClick={() => navigate('/')} className="home-button">
          🏠 Back to Home
        </button>
      </div>

      {trailer && (
        <div className="trailer">
          <h3>🎬 Watch Trailer</h3>
          <iframe width="560" height="315" src={trailer} title="Trailer" frameBorder="0" allowFullScreen></iframe>
        </div>
      )}

      <div className="movie-container">
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        <div className="movie-content">
          <h2>{movie.title}</h2>
          <p><strong>Description:</strong> {movie.overview}</p>
          <p className="rating"><strong>IMDb Ratings⭐:</strong> {movie.vote_average.toFixed(1)}/10</p>
          <p className="release-date"><strong>Release Date📅:</strong> {movie.release_date}</p>
        </div>
      </div>

      {actorMovies.length > 0 && (
        <div className="suggested-movies">
          <h3>You may also like</h3>
          <div className="movies-grid">
            {actorMovies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                <h4>{movie.title}</h4>
                <p>⭐ {movie.vote_average.toFixed(1)}/10</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;

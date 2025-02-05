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
  const [actorMovies, setActorMovies] = useState([]); // Suggested movies by actors

  const API_KEY = '5017776348012e3d35b87f7c927200a4';

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        // Fetch movie details
        const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        if (!movieResponse.ok) throw new Error("Failed to fetch movie details");
        const movieData = await movieResponse.json();
        setMovie(movieData);

        // Fetch trailer
        const trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
        const trailerData = await trailerResponse.json();
        const officialTrailer = trailerData.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (officialTrailer) {
          setTrailer(`https://www.youtube.com/embed/${officialTrailer.key}`);
        }

        // Fetch movies with the same actors
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`);
        const creditsData = await creditsResponse.json();
        const topActors = creditsData.cast.slice(0, 3); // Pick top 3 actors

        let actorMoviesData = [];
        for (const actor of topActors) {
          const actorMoviesResponse = await fetch(
            `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${API_KEY}`
          );
          const actorMovies = await actorMoviesResponse.json();
          actorMoviesData = [...actorMoviesData, ...actorMovies.cast];
        }

        // Remove duplicates and filter out the current movie
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
          <button onClick={handleBackToSearchResults} className="back-button">
            ⬅ Back to Search Results
          </button>
        )}
        <button onClick={handleBackToHome} className="home-button">
          🏠 Back to Home
        </button>
      </div>

      {/* YouTube Trailer */}
      {trailer ? (
        <div className="trailer">
          <h3>🎬 Watch Trailer</h3>
          <iframe
            width="560"
            height="315"
            src={trailer}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <p>No trailer available.</p>
      )}

      {/* Main Content (Image & Details) */}
      <div className="movie-container">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="movie-content">
          <h2>{movie.title}</h2>
          <p><strong>Description: </strong>{movie.overview}</p>
          <p className="rating"><strong>IMDb Ratings⭐ :</strong>  {movie.vote_average.toFixed(1)}/10</p>
          <p className="release-date"> <strong>Release Date📅 :</strong>  {movie.release_date}</p>
        </div>
      </div>

      
    </div>
  );
};

export default MovieDetails;

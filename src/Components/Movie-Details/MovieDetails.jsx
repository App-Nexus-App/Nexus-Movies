import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useGlobalContext } from '../../MovieContext';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const { setQuery, query } = useGlobalContext();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("query");
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (searchQuery) {
        setQuery(searchQuery);
      }
      try {
        // Fetch Movie Details
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=5017776348012e3d35b87f7c927200a4`
        );

        if (!response.ok) throw new Error("Failed to fetch movie details");

        const data = await response.json();
        setMovie(data);

        // Fetch Trailer
        const trailerResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=5017776348012e3d35b87f7c927200a4`
        );

        if (!trailerResponse.ok) throw new Error("Failed to fetch trailer");

        const trailerData = await trailerResponse.json();
        const officialTrailer = trailerData.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        if (officialTrailer) {
          setTrailer(`https://www.youtube.com/embed/${officialTrailer.key}`);
        }

        // Fetch Actors and Their Movies
        fetchActorMovies(id);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };

    const fetchActorMovies = async (movieId) => {
      try {
        // Fetch Movie Credits (Actors)
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=5017776348012e3d35b87f7c927200a4`
        );
        const creditsData = await creditsResponse.json();

        // Get the first lead actor
        const firstActor = creditsData.cast?.[0];

        if (firstActor) {
          // Fetch Movies of the first actor
          const actorMoviesResponse = await fetch(
            `https://api.themoviedb.org/3/person/${firstActor.id}/movie_credits?api_key=5017776348012e3d35b87f7c927200a4`
          );
          const actorMoviesData = await actorMoviesResponse.json();

          // Set movies excluding the current one
          setActorMovies(actorMoviesData.cast.filter(m => m.id !== Number(id)).slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching actor movies:", error);
      }
    };

    fetchMovieDetails();
  }, [id, searchQuery, setQuery]);

  const handleBackToSearchResults = () => {
    if (query) {
      navigate(`/search/${query}`);
    } else {
      navigate('/');
    }
  };

  const handleBackToHome = () => {
    setQuery("");
    navigate('/');
  };

  if (loading) {
    return <p>Loading movie details...</p>;
  }

  if (!movie) {
    return <p>Movie not found.</p>;
  }

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

      
      {/* Suggested Movies by Same Actors */}
      {actorMovies.length > 0 && (
        <div className="suggested-movies">
          <h3>You may also: {actorMovies[0]?.name}</h3>
          <div className="movies-grid">
            {actorMovies.map((actorMovie) => (
              <Link 
                to={`/movie/${actorMovie.id}`} 
                key={actorMovie.id} 
                className="movie-card"
                onClick={() => window.scrollTo(0, 0)} // Scroll to top when clicking
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${actorMovie.poster_path}`}
                  alt={actorMovie.title}
                />
                <h4>{actorMovie.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;

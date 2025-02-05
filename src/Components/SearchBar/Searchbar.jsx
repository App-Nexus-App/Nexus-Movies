import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchBar.css';
import { useGlobalContext } from '../../MovieContext';

const SearchBar = () => {
  const { setQuery, isError } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=5017776348012e3d35b87f7c927200a4');
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=5017776348012e3d35b87f7c927200a4&query=${searchTerm}`);
        const data = await response.json();
        if (data.results) {
          setSuggestions(data.results.slice(0, 5)); // Show top 5 suggestions
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching movie suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  useEffect(() => {
    if(selectedGenre) {
      navigate(`/search/${selectedGenre}`);
      setTimeout(() => setSelectedGenre (''), 200);
    };
  }, [selectedGenre, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedGenre) {
      navigate(`/search/${selectedGenre}`);
    } else if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
    }
    setSuggestions([]);
  };

  const handleSuggestionClick = (movie) => {
    navigate(`/movie/${movie.id}`);
    setSearchTerm('');
    setSuggestions([]);
  };

  return (
    <section className="search-section">
      <form onSubmit={handleSearch} className="search-form netflix-style">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search for movies..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button type="submit" className="search-button">🔍</button>
            {suggestions.length > 0 && (
              <ul className="autocomplete-list">
                {suggestions.map(movie => (
                  <li key={movie.id} onClick={() => handleSuggestionClick(movie)}>
                    {movie.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <select 
            className="genre-dropdown" 
            value={selectedGenre} 
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      </form>
      {isError.show && <p className="card-error">{isError.msg}</p>}
    </section>
  );
};

export default SearchBar;
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchBar.css';
import { useGlobalContext } from '../../MovieContext';

const SearchBar = () => {
  const { setQuery, isError } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedGenre) {
      navigate(`/search/${selectedGenre || searchTerm}`);
    } else if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
    }
  };

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
    if (location.pathname === '/') {
      setSearchTerm('');
      setSelectedGenre('');
    }
  }, [location]);

  useEffect(() => {
    if(selectedGenre) {
      navigate(`/search/${selectedGenre}`);
      setTimeout(() => setSelectedGenre (''), 200);
    };
  }, [selectedGenre, navigate]);

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

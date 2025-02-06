import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SearchBar from './Components/SearchBar/Searchbar';
import MovieGrid from './Components/Movie-Grid/Movie-grid';
import MovieDetails from './Components/Movie-Details/MovieDetails';
import SearchResults from './Components/SearchBar/SearchResults';
import { MovieProvider } from './MovieContext';
import { ThemeProvider, useTheme } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <MovieProvider>
        <Router>
          <div className="app">
            <Header />
            <SearchBar />
            <Routes>
              <Route path="/" element={<MovieGrid />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/search/:query" element={<SearchResults />} />
              <Route path="/search/genre/:genreId" element={<SearchResults />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </MovieProvider>
    </ThemeProvider>
  );
}

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <h1>Nexus Movies</h1>
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
      </button>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Nexus Movies. All rights reserved.</p>
    </footer>
  );
};

export default App;

import { useState } from 'react';

function SearchBar({ onLocationFound }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data.length === 0) {
        setError('Location not found. Try a different search.');
        setLoading(false);
        return;
      }

      const { lat, lon, display_name } = data[0];
      onLocationFound({
        position: [parseFloat(lat), parseFloat(lon)],
        label: display_name,
      });
    } catch (err) {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Google Maps clone..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? '...' : '🔍'}
        </button>
      </form>
      {error && <div className="search-error">{error}</div>}
    </div>
  );
}

export default SearchBar;
import { useState, useEffect, useRef } from 'react';

function SearchBar({ onLocationFound }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError('');

    // Clear any previous debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the fetch request by 500ms to prevent rapid rate-limit trigger
    debounceTimeoutRef.current = setTimeout(async () => {
      // 1. Check sessionStorage cache first
      const cacheKey = `geocode_cache_${trimmedQuery.toLowerCase()}`;
      try {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const cachedResult = JSON.parse(cachedData);
          const { lat, lon, display_name } = cachedResult;
          onLocationFound({
            position: [parseFloat(lat), parseFloat(lon)],
            label: display_name,
          });
          setLoading(false);
          return;
        }
      } catch (cacheErr) {
        console.warn('[SearchBar]: Cache read failed', cacheErr);
      }

      // 2. Setup AbortController for the fetch to resolve race conditions
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmedQuery)}&limit=1`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (data.length === 0) {
          setError('Location not found. Try a different search.');
          setLoading(false);
          return;
        }

        const firstResult = data[0];
        const { lat, lon, display_name } = firstResult;

        // 3. Cache the result in sessionStorage
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(firstResult));
        } catch (cacheErr) {
          console.warn('[SearchBar]: Cache write failed', cacheErr);
        }

        onLocationFound({
          position: [parseFloat(lat), parseFloat(lon)],
          label: display_name,
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          // Expected cancellation, do not update UI error state
          return;
        }
        setError('Search failed. Check your connection.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search For a Place, Address or City..."
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

import { useState } from 'react';
import { useMap } from 'react-leaflet';

function LocateButton({ onLocate }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const position = [latitude, longitude];
        map.flyTo(position, 15, { duration: 1.5 });
        if (onLocate) onLocate(position);
        setLoading(false);
      },
      (err) => {
        setError('Could not get your location. Check permissions.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="locate-button-container">
      <button
        className="locate-button"
        onClick={handleLocate}
        disabled={loading}
        title="Show my location"
      >
        {loading ? '...' : '📍'}
      </button>
      {error && <div className="locate-error">{error}</div>}
    </div>
  );
}

export default LocateButton;
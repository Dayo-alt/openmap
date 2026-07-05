import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchBar from './SearchBar';
import LocateButton from './LocateButton';
import AuthButton from './AuthButton';
import Sidebar from './Sidebar';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [6.5244, 3.3792];
const DEFAULT_ZOOM = 13;

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

function App() {
  const [markers, setMarkers] = useState([
    { id: 1, position: DEFAULT_CENTER, label: 'Default location' },
  ]);
  const [flyToPosition, setFlyToPosition] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [user, setUser] = useState(null);

  const handleLocationFound = ({ position, label }) => {
    const newMarker = { id: Date.now(), position, label };
    setMarkers((prev) => [...prev, newMarker]);
    setFlyToPosition(position);
    setCurrentLocation(position);
  };

  const handlePlaceSelected = (position) => {
    setFlyToPosition(position);
    setCurrentLocation(position);
  };

  return (
    <div className="app-container">
      <SearchBar onLocationFound={handleLocationFound} />
      <AuthButton onAuthChange={setUser} />
      <Sidebar
        user={user}
        currentLocation={currentLocation}
        onPlaceSelected={handlePlaceSelected}
      />

      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => (
          <Marker key={m.id} position={m.position}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}

        <FlyToLocation position={flyToPosition} />
        <LocateButton
          onLocate={(position) => {
            const newMarker = { id: Date.now(), position, label: 'You are here' };
            setMarkers((prev) => [...prev, newMarker]);
            setCurrentLocation(position);
          }}
        />
      </MapContainer>
    </div>
  );
}

export default App;
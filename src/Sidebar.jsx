import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function Sidebar({ user, currentLocation, onPlaceSelected }) {
  const [places, setPlaces] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('menu'); // 'menu' | 'saved'
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlaces();
    } else {
      setPlaces([]);
    }
  }, [user]);

  const fetchPlaces = async () => {
    const { data, error } = await supabase
      .from('saved_places')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPlaces(data);
  };

  const handleSavePlace = async () => {
    if (!placeName.trim() || !currentLocation) return;
    setLoading(true);
    const { error } = await supabase.from('saved_places').insert({
      user_id: user.id,
      name: placeName,
      lat: currentLocation[0],
      lng: currentLocation[1],
    });
    setLoading(false);
    if (!error) {
      setPlaceName('');
      setSaveModalOpen(false);
      fetchPlaces();
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('saved_places').delete().eq('id', id);
    fetchPlaces();
  };

  return (
    <>
      {/* Toggle button — always visible */}
      <button className="sidebar-toggle" onClick={() => setIsOpen((o) => !o)}>
        ☰
      </button>

      {/* Sidebar panel — slides in/out based on isOpen */}
      <div className={`sidebar-docked ${isOpen ? 'sidebar-docked-open' : ''}`}>
        {view === 'menu' && (
          <>
            <button className="sidebar-row" onClick={() => setView('saved')}>
              <span className="sidebar-row-icon">🔖</span>
              <span>Saved</span>
            </button>
            <button className="sidebar-row sidebar-row-disabled" disabled>
              <span className="sidebar-row-icon">🕑</span>
              <span>Recents</span>
            </button>
          </>
        )}

        {view === 'saved' && (
          <div className="sidebar-saved-view">
            <button className="sidebar-back" onClick={() => setView('menu')}>
              ← Saved places
            </button>

            {!user && <p className="sidebar-empty">Sign in to save places.</p>}

            {user && (
              <>
                <button
                  className="sidebar-save-btn"
                  onClick={() => setSaveModalOpen(true)}
                  disabled={!currentLocation}
                >
                  + Save current location
                </button>

                {places.length === 0 && (
                  <p className="sidebar-empty">No saved places yet.</p>
                )}

                <ul className="sidebar-list">
                  {places.map((place) => (
                    <li key={place.id} className="sidebar-item">
                      <button
                        className="sidebar-item-name"
                        onClick={() => onPlaceSelected([place.lat, place.lng])}
                      >
                        📍 {place.name}
                      </button>
                      <button
                        className="sidebar-item-delete"
                        onClick={() => handleDelete(place.id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="sidebar-footer">
          <span className="sidebar-row-icon">⬚</span>
          <span>Layers</span>
        </div>
      </div>

      {saveModalOpen && (
        <div className="modal-overlay" onClick={() => setSaveModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Name this place</h3>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Home, Office, Mum's house"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setSaveModalOpen(false)}>Cancel</button>
              <button onClick={handleSavePlace} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
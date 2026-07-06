import { useState, useEffect } from 'react';
import { usePlacesStore } from './store';

function Sidebar({ user, currentLocation, onPlaceSelected }) {
  const places = usePlacesStore((state) => state.places);
  const errorMsg = usePlacesStore((state) => state.error);
  const fetchPlaces = usePlacesStore((state) => state.fetchPlaces);
  const savePlace = usePlacesStore((state) => state.savePlace);
  const deletePlace = usePlacesStore((state) => state.deletePlace);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('menu'); // 'menu' | 'saved'
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlaces(user);
    }
  }, [user, fetchPlaces]);

  const handleSavePlace = async () => {
    if (!placeName.trim() || !currentLocation) return;
    setLoading(true);
    try {
      await savePlace(user, placeName.trim(), currentLocation);
      setPlaceName('');
      setSaveModalOpen(false);
    } catch (err) {
      console.error('[Sidebar]: Save failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlace(user, id);
    } catch (err) {
      console.error('[Sidebar]: Delete failed', err);
    }
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
            {errorMsg && (
              <div className="modal-error" style={{ color: '#ea4335', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'left' }}>
                {errorMsg}
              </div>
            )}
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
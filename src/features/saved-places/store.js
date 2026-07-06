import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { supabase } from '../../services/supabaseClient';
import { savedPlaceSchema } from './schema';

// Configure localForage
localforage.config({
  name: 'openmaps',
  storeName: 'saved_places_store',
});

// Custom storage provider for Zustand persist using localforage
const localforageStorage = createJSONStorage(() => ({
  getItem: (name) => localforage.getItem(name),
  setItem: (name, value) => localforage.setItem(name, value),
  removeItem: (name) => localforage.removeItem(name),
}));

export const usePlacesStore = create(
  persist(
    (set, get) => ({
      places: [],
      pending_sync: [],
      isLoading: false,
      error: null,
      isFlushing: false,

      fetchPlaces: async (user) => {
        if (!user) {
          set({ places: [], error: null });
          return;
        }

        // If offline, we just rely on the persisted local state
        if (!navigator.onLine) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('saved_places')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Merge local pending additions and filter out pending deletions
          const pendingSync = get().pending_sync;
          
          let mergedPlaces = [...data];

          // Apply pending deletes
          const deletedIds = new Set(
            pendingSync.filter((op) => op.type === 'delete').map((op) => op.id)
          );
          mergedPlaces = mergedPlaces.filter((p) => !deletedIds.has(p.id));

          // Apply pending inserts
          const pendingInserts = pendingSync
            .filter((op) => op.type === 'insert')
            .map((op) => op.payload);
          
          mergedPlaces = [...pendingInserts, ...mergedPlaces];

          set({ places: mergedPlaces, isLoading: false });
        } catch (err) {
          console.error('[PlacesStore]: Fetch Failed', err);
          set({ error: err.message, isLoading: false });
        }
      },

      savePlace: async (user, name, currentLocation) => {
        if (!user || !currentLocation) return;

        const [lat, lng] = currentLocation;

        // 1. Zod parse validation before writing or queueing
        try {
          savedPlaceSchema.parse({ name, lat, lng });
        } catch (validationError) {
          console.error('[PlacesStore]: Validation Failed', validationError);
          set({ error: validationError.errors[0]?.message || 'Validation failed' });
          throw validationError;
        }

        const newPlace = {
          id: crypto.randomUUID(),
          user_id: user.id,
          name,
          lat,
          lng,
          created_at: new Date().toISOString(),
        };

        // 2. Optimistic update of UI state
        set((state) => ({
          places: [newPlace, ...state.places],
          error: null,
        }));

        // 3. Push mutation
        if (!navigator.onLine) {
          // Offline: Queue it
          set((state) => ({
            pending_sync: [...state.pending_sync, { id: newPlace.id, type: 'insert', payload: newPlace }],
          }));
        } else {
          // Online: Write immediately
          try {
            const { error } = await supabase.from('saved_places').insert({
              id: newPlace.id,
              user_id: newPlace.user_id,
              name: newPlace.name,
              lat: newPlace.lat,
              lng: newPlace.lng,
            });

            if (error) {
              // If it's a network issue, queue it. Otherwise raise error and revert.
              if (error.code && error.code.startsWith('23')) {
                // DB constraint error (e.g. key constraint, check constraint)
                throw error;
              }
              // Assume connection issue: queue it
              set((state) => ({
                pending_sync: [...state.pending_sync, { id: newPlace.id, type: 'insert', payload: newPlace }],
              }));
            }
          } catch (err) {
            console.error('[PlacesStore]: Save Online Failed, queueing...', err);
            // Check if it's a validation/database check failure rather than network
            const isDbConstraint = err.code && (err.code.startsWith('23') || err.code === '42501');
            if (isDbConstraint) {
              // Revert optimistic update
              set((state) => ({
                places: state.places.filter((p) => p.id !== newPlace.id),
                error: err.message || 'Database error occurred',
              }));
            } else {
              // Network/unknown: Queue it
              set((state) => ({
                pending_sync: [...state.pending_sync, { id: newPlace.id, type: 'insert', payload: newPlace }],
              }));
            }
          }
        }
      },

      deletePlace: async (user, id) => {
        if (!user) return;

        // 1. Optimistic update of UI state
        set((state) => ({
          places: state.places.filter((p) => p.id !== id),
          error: null,
        }));

        // 2. Optimization: if there's a pending insert for this ID, just remove it from queue
        const pendingSync = get().pending_sync;
        const hasPendingInsert = pendingSync.some((op) => op.type === 'insert' && op.id === id);
        
        if (hasPendingInsert) {
          set({
            pending_sync: pendingSync.filter((op) => op.id !== id),
          });
          return;
        }

        // 3. Push mutation
        if (!navigator.onLine) {
          // Offline: Queue it
          set((state) => ({
            pending_sync: [...state.pending_sync, { id, type: 'delete' }],
          }));
        } else {
          // Online: Write immediately
          try {
            const { error } = await supabase.from('saved_places').delete().eq('id', id);

            if (error) {
              set((state) => ({
                pending_sync: [...state.pending_sync, { id, type: 'delete' }],
              }));
            }
          } catch (err) {
            console.error('[PlacesStore]: Delete Online Failed, queueing...', err);
            set((state) => ({
              pending_sync: [...state.pending_sync, { id, type: 'delete' }],
            }));
          }
        }
      },

      flushQueue: async () => {
        if (get().isFlushing || get().pending_sync.length === 0 || !navigator.onLine) {
          return;
        }

        set({ isFlushing: true });
        console.log('[PlacesStore]: Flushing sync queue...');

        let currentQueue = [...get().pending_sync];
        const successfulIds = [];

        for (const op of currentQueue) {
          try {
            if (op.type === 'insert') {
              const { error } = await supabase.from('saved_places').insert({
                id: op.payload.id,
                user_id: op.payload.user_id,
                name: op.payload.name,
                lat: op.payload.lat,
                lng: op.payload.lng,
              });

              // Check if code 23505 (Unique violation) is returned: it means duplicate submission was already processed
              if (!error || error.code === '23505') {
                successfulIds.push(op.id);
              } else {
                console.error('[PlacesStore]: Queue Insert error for', op.id, error);
                // Stop flushes if it is a network error, otherwise skip it if it is a permanent error
                const isNetworkError = !error.code; 
                if (isNetworkError) break;
                successfulIds.push(op.id); // discard permanent failures to avoid locking queue
              }
            } else if (op.type === 'delete') {
              const { error } = await supabase.from('saved_places').delete().eq('id', op.id);

              if (!error) {
                successfulIds.push(op.id);
              } else {
                console.error('[PlacesStore]: Queue Delete error for', op.id, error);
                const isNetworkError = !error.code;
                if (isNetworkError) break;
                successfulIds.push(op.id); // discard permanent failures to avoid locking queue
              }
            }
          } catch (err) {
            console.error('[PlacesStore]: Queue Sync execution crashed', err);
            break; // Network or connection error, retry later
          }
        }

        // Filter out successfully synced operations
        set((state) => ({
          pending_sync: state.pending_sync.filter((op) => !successfulIds.includes(op.id)),
          isFlushing: false,
        }));

        console.log('[PlacesStore]: Sync flush complete.');
      },
    }),
    {
      name: 'openmaps-places-storage',
      storage: localforageStorage,
      // Only persist places and pending_sync queue
      partialize: (state) => ({
        places: state.places,
        pending_sync: state.pending_sync,
      }),
    }
  )
);

// Register window online event handler
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    usePlacesStore.getState().flushQueue();
  });
}

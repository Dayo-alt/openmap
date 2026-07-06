# Technical Architecture

This document details the system design, geocoding request lifecycles, and synchronization patterns of the OpenMaps application.

---

## Directory Structure

OpenMaps uses a domain-driven, feature-based directory tree in `src/features/` to modularize logic, simplify testing, and prevent merge conflicts among team members:

```
src/
├── assets/                    # Shared image assets and icons
├── components/                # Shared generic UI components (Buttons, Inputs, Modals)
├── features/                  # Domain-specific feature modules
│   ├── auth/                  # Supabase session handlers & AuthButton
│   ├── map/                   # LocateButton & Leaflet Map Container configuration
│   ├── saved-places/          # Sidebar list, save modal, Zustand store, and schemas
│   └── search/                # SearchBar component, caching, and fetch hooks
├── services/                  # Global integrations (supabaseClient.js)
├── App.jsx                    # Root application component coordinating the layouts
├── App.css                    # Main style definitions
├── main.jsx                   # React application mounting point
└── index.css                  # Basic base styles
```

---

## Client-Side Data Flow

React components do not directly query the backend database or mutate storage states. All persistence interactions flow through a centralized Zustand state manager:

```
[React Component] ──(Actions: savePlace / deletePlace)──> [Zustand Store]
       ▲                                                       │
       │                                            (Mutates state / Writes cache)
       │                                                       ▼
[UI Rerender] ◄────────────────(Selects state)─────────── [localForage DB]
```

1. **State Selection:** Components utilize Zustand selectors (e.g., `usePlacesStore(state => state.places)`) to subscribe to specific segments of the state.
2. **Action Dispatch:** Interactive elements dispatch actions directly from the store (e.g., calling `savePlace(user, name, location)`).
3. **State Mutation:** Store actions handle local optimistic mutations, validation checks, local storage, and async network operations behind the scenes.

---

## The Offline-First Sync Engine

To remain operational when disconnected from the network, OpenMaps uses an offline-first persistence engine backed by **Zustand** and **localForage** (IndexedDB):

```
                        +----------------------+
                        |     Zustand Store    |
                        +----------------------+
                               /        \
                    (Online)  /          \  (Offline)
                             /            \
                            v              v
                  +------------+     +------------------+
                  |  Supabase  |     |   localForage    |
                  |  Postgres  |     |  (IndexedDB)     |
                  +------------+     +------------------+
                                              |
                                              | (network: 'online')
                                              v
                                     [Sync Queue Flush]
```

### 1. Persistent Storage
Zustand's state is serialized and persisted to IndexedDB using a custom asynchronous storage adapter built on `localForage`. This guarantees that user settings, bookmarks, and sync queues survive browser restarts.

### 2. Synchronization Queue (`pending_sync`)
When a database mutation is requested (insert/delete):
* **Optimistic Update:** The store updates the local state array immediately so the UI remains interactive and fast.
* **Network Status Check:**
  * **Offline:** The mutation is wrapped in an operation descriptor (`insert` or `delete`) and pushed into a persistent array called `pending_sync`.
  * **Online:** The store attempts to execute the Supabase operation. If a connection failure occurs, it degrades gracefully by placing the operation in the `pending_sync` queue.

### 3. Queue Synchronization
A global event listener on `window.addEventListener('online')` automatically catches network reconnection:
* It triggers `flushQueue()`, which reads the queued operations.
* Operations are pushed sequentially in order.
* If a duplicate key error occurs (e.g. Postgres unique violation code `23505` indicating a previous attempt succeeded), the record is discarded from the queue and marked as synchronized.
* Failed connection attempts block the remainder of the queue, preserving execution order until the next connection check.

---

## Geocoding Lifecycle Manager

Location queries hit the public OpenStreetMap Nominatim endpoint. To prevent rate-limit blocks and async race conditions, OpenMaps wraps queries inside a lifecycle manager:

### 1. Request Debouncing
Every search submission triggers a 500ms debounce timeout. If a user presses Enter or clicks Search repeatedly, the timer resets, preventing multiple API requests from firing in rapid succession.

### 2. Fetch Aborting (`AbortController`)
To prevent out-of-order response race conditions (e.g. searching for location A, then location B, where the response for A returns *after* B and overwrites it):
* The store maintains an active `AbortController` reference in a `useRef`.
* Before launching a new geocoding query, `abortController.current.abort()` is executed to cancel any unresolved network fetches.
* Cancellation errors (`AbortError`) are caught silently without updating UI error banners.

### 3. SessionStorage Caching
To eliminate redundant API requests, successful queries are cached in `sessionStorage` under geocoding keys (e.g., `geocode_cache_london`). Subsequent searches for the same term resolve instantly from the cache without hitting the Nominatim network.

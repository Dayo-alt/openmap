# OpenMaps

An offline-first, rate-limit resilient mapping Single Page Application (SPA) built on OpenStreetMap data, providing location search and favorite location persistence without commercial API keys or usage limits.

## The Problem & The Solution

* **The Problem:** Modern maps applications rely on expensive proprietary APIs (like Google Maps or Mapbox) that require active credit cards, impose strict request caps, or collect user tracking telemetry. Open-source alternatives exist but often fail under load due to geocoding rate-limits or break completely when connection is lost.
* **The Solution:** OpenMaps integrates public geocoding services with client-side query lifecycles (debouncing and abort tokens) and an offline-first state engine. This architecture respects public usage guidelines (e.g. Nominatim's strict 1 req/sec policy), prevents state race conditions, and operates entirely offline, storing data in IndexedDB and syncing with Supabase once network availability is recovered.

## Tech Stack

* **Frontend Framework:** React + Vite (Fast, modern SPA rendering)
* **Map Renderer:** Leaflet.js / React-Leaflet (Lightweight open-source vector mapping)
* **Map Tiles:** OpenStreetMap (Free, crowd-sourced world map data)
* **State Management:** Zustand (Simplified atomic store pattern)
* **Offline Caching:** localForage (Asynchronous wrapper for IndexedDB storage)
* **Backend Database & Auth:** Supabase (PostgreSQL database with Row Level Security)
* **Input Validation:** Zod (Strict TypeScript-first schema validation)

## Live Branch

Currently reviewing the upgraded architecture on this branch:
[https://github.com/Dayo-alt/openmap/tree/infra/ci-cd-pipeline](https://github.com/Dayo-alt/openmap/tree/infra/ci-cd-pipeline)

## Quick Start

Follow these steps to run the application in your local development environment.

### Prerequisites
* Node.js 18 or higher
* A free Supabase account

### Installation & Run

1. **Clone the repository and checkout the pipeline branch:**
   ```bash
   git clone -b infra/ci-cd-pipeline https://github.com/Dayo-alt/openmap.git
   cd openmap
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory of the project:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

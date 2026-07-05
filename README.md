MapClone

A free, open-source web maps application built on OpenStreetMap — 
no API keys required, no usage limits.

Features
- 🔍 Search any place worldwide
- 📍 Locate yourself on the map
- 🔖 Save and name favourite locations (requires sign-in)
- 🔐 Google Sign-In via Supabase Auth
- 🆓 100% free stack — OpenStreetMap, Nominatim, Leaflet.js

Live Demo
[Your Vercel URL here]

Tech Stack
- React + Vite
- Leaflet.js + OpenStreetMap
- Supabase (auth + database)
- Nominatim (geocoding)

Getting Started

1. Clone the repo
   git clone https://github.com/your-username/mapclone.git

2. Install dependencies
   npm install

3. Add your environment variables
   Create a .env file with:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Run the app
   npm run dev

License
MIT — see LICENSE file

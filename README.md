# OpenMaps

A free, open-source web maps application built on OpenStreetMap.  
No API keys required. No usage limits. No billing surprises.

## Live Demo
[https://openmap-seven.vercel.app]

## Features
- Search any place worldwide (powered by Nominatim)
- Locate yourself on the map (browser geolocation)
- Save and name favourite locations
- Google Sign-In (via Supabase Auth)
- Entirely free and open-source stack

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | React + Vite | Fast, modern UI |
| Map Engine | Leaflet.js | Free, open-source map rendering |
| Map Data | OpenStreetMap | Free, crowdsourced map data |
| Geocoding | Nominatim | Free place name → coordinates |
| Auth + DB | Supabase | Open-source Firebase alternative |
| Hosting | Vercel | Free frontend hosting |

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account (free)

### Installation

1. Clone the repository
   git clone https://github.com/YOUR_USERNAME/maps-clone.git
   cd maps-clone

2. Install dependencies
   npm install

3. Set up environment variables
   Create a .env file in the root directory:
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Set up the database
   Run this SQL in your Supabase SQL editor:

   create table saved_places (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users not null,
     name text not null,
     lat double precision not null,
     lng double precision not null,
     created_at timestamp with time zone default now()
   );

   alter table saved_places enable row level security;

   create policy "Users can view their own saved places"
     on saved_places for select using (auth.uid() = user_id);

   create policy "Users can insert their own saved places"
     on saved_places for insert with check (auth.uid() = user_id);

   create policy "Users can delete their own saved places"
     on saved_places for delete using (auth.uid() = user_id);

5. Run the app
   npm run dev

## License
This project is licensed under the MIT License — see the LICENSE file for details.

## Acknowledgements
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map data
- [Leaflet.js](https://leafletjs.com/) for the map rendering engine
- [Nominatim](https://nominatim.org/) for geocoding
- [Supabase](https://supabase.com/) for auth and database

# API & Database Schema Contracts

This document contains the structural definitions and data validation contracts for OpenMaps database tables, schemas, and external API responses.

---

## Supabase PostgreSQL Schema

The application stores favorite user locations in a single `saved_places` PostgreSQL table. The table is secured by Row Level Security (RLS) policies and validated by constraints.

### Table Definition
```sql
CREATE TABLE saved_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT null,
  name TEXT NOT null,
  lat DOUBLE PRECISION NOT null,
  lng DOUBLE PRECISION NOT null,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Coordinate bounds checks
  CONSTRAINT latitude_range CHECK (lat >= -90.0 AND lat <= 90.0),
  CONSTRAINT longitude_range CHECK (lng >= -180.0 AND lng <= 180.0),
  
  -- Name length check
  CONSTRAINT name_length CHECK (char_length(name) > 0 AND char_length(name) <= 100)
);

-- Optimize search and order queries by user
CREATE INDEX idx_saved_places_user_created ON saved_places(user_id, created_at DESC);
```

### Row Level Security (RLS) Policies
* **Select Policy:** Users can only view records that match their authenticated user ID.
  ```sql
  CREATE POLICY "Users can view their own saved places"
    ON saved_places FOR SELECT USING (auth.uid() = user_id);
  ```
* **Insert Policy:** Users can only insert records where the write payload's `user_id` matches their authenticated user ID.
  ```sql
  CREATE POLICY "Users can insert their own saved places"
    ON saved_places FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```
* **Delete Policy:** Users can only delete records where the record's `user_id` matches their authenticated user ID.
  ```sql
  CREATE POLICY "Users can delete their own saved places"
    ON saved_places FOR DELETE USING (auth.uid() = user_id);
  ```

---

## Client-Side Zod Validation

Before writing to the local Zustand store, queueing in IndexedDB, or sending updates to Supabase, the client validates parameters against a Zod schema contract in [schema.js](file:///c:/Users/user/Documents/GitHub/openmap/src/features/saved-places/schema.js):

```javascript
import { z } from 'zod';

export const savedPlaceSchema = z.object({
  name: z.string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  lat: z.number()
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" }),
  lng: z.number()
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" }),
});
```

---

## Nominatim External API Contract

We query the open OpenStreetMap Nominatim Search API:
`https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=1`

### Expected JSON Response Format
```json
[
  {
    "place_id": 282433095,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
    "osm_type": "relation",
    "osm_id": 65606,
    "boundingbox": ["51.2867602", "51.6918741", "-0.5103751", "0.3340155"],
    "lat": "51.5074456",
    "lon": "-0.1277653",
    "display_name": "London, Greater London, England, United Kingdom",
    "class": "boundary",
    "type": "administrative",
    "importance": 0.9680053155743402,
    "icon": "https://nominatim.openstreetmap.org/ui/mapicons/poi_boundary_administrative.p.20.png"
  }
]
```

### Safety & Coordinate Parsing Edge Case
The Nominatim API returns `lat` and `lon` fields as string values.
* **Vulnerability:** Under network distortion or service updates, coordinates could arrive missing, malformed, or as empty strings, which parses as `NaN` via `parseFloat()`. Passing `[NaN, NaN]` to Leaflet results in an application-wide crash.
* **Resiliency Mitigation:** OpenMaps guards against this by checking data arrays. If Nominatim returns an empty payload or fails numeric conversions, the geocoding manager rejects the promise with a human-readable warning ("Location not found. Try a different search.") and blocks state updating.

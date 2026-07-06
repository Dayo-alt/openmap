-- Add constraints to saved_places table to guarantee coordinates and naming limits
ALTER TABLE saved_places 
  ADD CONSTRAINT latitude_range CHECK (lat >= -90.0 AND lat <= 90.0),
  ADD CONSTRAINT longitude_range CHECK (lng >= -180.0 AND lng <= 180.0),
  ADD CONSTRAINT name_length CHECK (char_length(name) > 0 AND char_length(name) <= 100);

-- Create a composite index to optimize retrieving saved places by user ordered by creation time
CREATE INDEX idx_saved_places_user_created ON saved_places (user_id, created_at DESC);

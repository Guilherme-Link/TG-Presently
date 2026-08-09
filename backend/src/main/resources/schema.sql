CREATE EXTENSION IF NOT EXISTS postgis;

CREATE INDEX IF NOT EXISTS idx_ambients_area_gist
ON ambients
USING GIST (area);
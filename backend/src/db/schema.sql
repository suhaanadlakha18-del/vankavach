PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS locations (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, state TEXT NOT NULL, latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90), longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
 severity TEXT NOT NULL CHECK(severity IN ('minimal_seasonal','low','moderate','high','critical','insufficient_data')),
 disturbance_category TEXT NOT NULL, disturbance_description TEXT NOT NULL, estimated_affected_area_ha REAL NULL CHECK(estimated_affected_area_ha IS NULL OR estimated_affected_area_ha >= 0),
 ndvi_change REAL NULL, sentinel1_vv_change_db REAL NULL, sentinel1_vh_change_db REAL NULL,
 optical_available INTEGER NOT NULL CHECK(optical_available IN (0,1)), radar_available INTEGER NOT NULL CHECK(radar_available IN (0,1)), cloud_percentage REAL NULL CHECK(cloud_percentage IS NULL OR cloud_percentage BETWEEN 0 AND 100),
 persistence TEXT NOT NULL, data_quality TEXT NOT NULL CHECK(data_quality IN ('excellent','good','limited','radar_assisted','insufficient')),
 seasonal_filter_result TEXT NOT NULL, severity_explanation TEXT NOT NULL, observation_start TEXT NULL, observation_end TEXT NULL,
 is_demo INTEGER NOT NULL DEFAULT 1 CHECK(is_demo IN (0,1)), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS observations (
 id TEXT PRIMARY KEY, location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE, sensor TEXT NOT NULL, observation_date TEXT NOT NULL,
 cloud_percentage REAL NULL CHECK(cloud_percentage IS NULL OR cloud_percentage BETWEEN 0 AND 100), valid_pixel_percentage REAL NULL CHECK(valid_pixel_percentage IS NULL OR valid_pixel_percentage BETWEEN 0 AND 100),
 ndvi_value REAL NULL, vv_value_db REAL NULL, vh_value_db REAL NULL, provider TEXT NOT NULL, data_status TEXT NOT NULL, is_demo INTEGER NOT NULL CHECK(is_demo IN (0,1))
);
CREATE TABLE IF NOT EXISTS phenology (
 id INTEGER PRIMARY KEY AUTOINCREMENT, location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
 observation_month TEXT NOT NULL, historical_baseline REAL NULL, observed_ndvi REAL NULL, anomaly_status TEXT NOT NULL, data_source TEXT NOT NULL, is_demo INTEGER NOT NULL CHECK(is_demo IN (0,1)),
 UNIQUE(location_id, observation_month)
);
CREATE INDEX IF NOT EXISTS idx_locations_filters ON locations(severity,state,data_quality,seasonal_filter_result);
CREATE INDEX IF NOT EXISTS idx_observations_location ON observations(location_id,observation_date);
CREATE INDEX IF NOT EXISTS idx_phenology_location ON phenology(location_id,observation_month);

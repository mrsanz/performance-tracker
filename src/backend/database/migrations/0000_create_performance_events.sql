-- Create performance_events table
CREATE TABLE IF NOT EXISTS performance_events (
  id TEXT PRIMARY KEY NOT NULL,
  person_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (person_id) REFERENCES persons(id)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_performance_events_timestamp 
ON performance_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_events_type 
ON performance_events(type);

CREATE INDEX IF NOT EXISTS idx_performance_events_type_timestamp 
ON performance_events(type, timestamp);

-- Trigger to update updated_at on record modification
CREATE TRIGGER IF NOT EXISTS update_performance_events_updated_at
AFTER UPDATE ON performance_events
FOR EACH ROW
BEGIN
  UPDATE performance_events 
  SET updated_at = strftime('%s', 'now')
  WHERE id = NEW.id;
END;

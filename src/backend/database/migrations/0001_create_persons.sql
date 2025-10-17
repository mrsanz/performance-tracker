-- Create persons table
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  start_date INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index for email
CREATE INDEX IF NOT EXISTS idx_persons_email ON persons(email);

-- Trigger to update updated_at on record modification
CREATE TRIGGER IF NOT EXISTS update_persons_updated_at
AFTER UPDATE ON persons
FOR EACH ROW
BEGIN
  UPDATE persons 
  SET updated_at = strftime('%s', 'now')
  WHERE id = NEW.id;
END;

-- Drop trigger
DROP TRIGGER IF EXISTS update_persons_updated_at;

-- Drop index
DROP INDEX IF EXISTS idx_persons_email;

-- Drop table
DROP TABLE IF EXISTS persons;

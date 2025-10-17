-- Drop trigger
DROP TRIGGER IF EXISTS update_performance_events_updated_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_performance_events_type_timestamp;
DROP INDEX IF EXISTS idx_performance_events_type;
DROP INDEX IF EXISTS idx_performance_events_timestamp;

-- Drop table
DROP TABLE IF EXISTS performance_events;

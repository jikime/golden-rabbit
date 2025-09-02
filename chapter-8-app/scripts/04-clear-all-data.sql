-- Clear all existing data from gallery tables
-- This script will delete all data while preserving table structure

-- Start transaction to ensure atomicity
BEGIN;

-- Disable foreign key checks temporarily (if needed)
-- Note: PostgreSQL doesn't have a global way to disable FK checks,
-- so we delete in the correct order to respect foreign key constraints

-- Delete comments first (child table with foreign key to posts)
DELETE FROM comments;

-- Delete posts (parent table)
DELETE FROM posts;

-- Reset sequences if they exist (for auto-incrementing columns)
-- Note: Our tables use UUIDs, so no sequences to reset

-- Verify deletion
DO $$
DECLARE
    posts_count INTEGER;
    comments_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO posts_count FROM posts;
    SELECT COUNT(*) INTO comments_count FROM comments;
    
    RAISE NOTICE 'Data deletion completed:';
    RAISE NOTICE '- Posts remaining: %', posts_count;
    RAISE NOTICE '- Comments remaining: %', comments_count;
    
    IF posts_count = 0 AND comments_count = 0 THEN
        RAISE NOTICE 'All data successfully deleted!';
    ELSE
        RAISE WARNING 'Some data may not have been deleted properly';
    END IF;
END $$;

-- Commit the transaction
COMMIT;

-- Optional: Vacuum tables to reclaim space
VACUUM ANALYZE posts;
VACUUM ANALYZE comments;

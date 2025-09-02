-- Drop storage_bucket_info table
-- This script removes the storage_bucket_info table from the database

BEGIN;

-- Check if the table exists before dropping
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'storage_bucket_info') THEN
        
        RAISE NOTICE 'Dropping storage_bucket_info table...';
        DROP TABLE public.storage_bucket_info;
        RAISE NOTICE 'storage_bucket_info table dropped successfully.';
        
    ELSE
        RAISE NOTICE 'storage_bucket_info table does not exist.';
    END IF;
END $$;

-- Verify the table has been dropped
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'storage_bucket_info') 
        THEN 'ERROR: storage_bucket_info table still exists'
        ELSE 'SUCCESS: storage_bucket_info table has been dropped'
    END as result;

COMMIT;

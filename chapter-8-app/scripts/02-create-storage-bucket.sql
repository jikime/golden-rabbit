-- Added error handling and bucket existence check
-- Check if bucket already exists and create if not
DO $$
BEGIN
  -- Create storage bucket for gallery images if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'gallery-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'gallery-images',
      'gallery-images',
      true,
      52428800, -- 50MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    RAISE NOTICE 'Created gallery-images bucket successfully';
  ELSE
    RAISE NOTICE 'gallery-images bucket already exists';
  END IF;
END $$;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for gallery images" ON storage.objects;

-- Recreate policies with proper permissions
-- Create policy to allow public read access
CREATE POLICY "Public read access for gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');

-- Create policy to allow public upload
CREATE POLICY "Public upload access for gallery images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

-- Create policy to allow public update
CREATE POLICY "Public update access for gallery images" ON storage.objects
FOR UPDATE USING (bucket_id = 'gallery-images');

-- Create policy to allow public delete
CREATE POLICY "Public delete access for gallery images" ON storage.objects
FOR DELETE USING (bucket_id = 'gallery-images');

-- Verify bucket creation
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'gallery-images';

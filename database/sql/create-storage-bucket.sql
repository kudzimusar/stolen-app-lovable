-- Create Supabase Storage Bucket for Lost and Found Photos/Documents
-- Run this in Supabase SQL Editor

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-found-photos', 'lost-found-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'lost-found-photos' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lost-found-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lost-found-photos' 
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lost-found-photos' 
  AND auth.uid() = owner
);

-- Verify bucket was created
SELECT 
  id, 
  name, 
  public,
  created_at
FROM storage.buckets
WHERE id = 'lost-found-photos';

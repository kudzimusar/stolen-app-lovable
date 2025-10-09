-- Setup Supabase Storage Buckets for the Stolen App
-- This creates all necessary storage buckets with proper policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('lost-found-photos', 'lost-found-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('device-photos', 'device-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('documents', 'documents', true, 104857600, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('receipts', 'receipts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/tiff', 'application/pdf']),
  ('evidence', 'evidence', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf']),
  ('user-uploads', 'user-uploads', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']);

-- Create RLS policies for storage
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access for certain buckets
CREATE POLICY "Public read access for lost-found photos" ON storage.objects
FOR SELECT USING (bucket_id = 'lost-found-photos');

CREATE POLICY "Public read access for device photos" ON storage.objects
FOR SELECT USING (bucket_id = 'device-photos');

CREATE POLICY "Public read access for evidence" ON storage.objects
FOR SELECT USING (bucket_id = 'evidence');

-- Create storage folders structure
-- Note: Folders are created automatically when files are uploaded to them

-- Verify bucket creation
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('lost-found-photos', 'device-photos', 'documents', 'receipts', 'evidence', 'user-uploads');

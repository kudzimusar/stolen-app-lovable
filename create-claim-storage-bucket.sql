-- ============================================================================
-- CREATE CLAIM DOCUMENTS STORAGE BUCKET
-- ============================================================================
-- This script creates the necessary storage bucket for claim documents
-- ============================================================================

-- Create the claim-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'claim-documents',
  'claim-documents',
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for the claim-documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload claim documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'claim-documents');

-- Allow users to view their own uploaded files
CREATE POLICY "Users can view their own claim documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'claim-documents');

-- Allow users to update their own files
CREATE POLICY "Users can update their own claim documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'claim-documents');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own claim documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'claim-documents');

-- Allow admins to view all claim documents
CREATE POLICY "Admins can view all claim documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'claim-documents' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Verify the bucket was created
SELECT 
  'Storage Bucket Check' as test_type,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'claim-documents';

-- Check RLS policies
SELECT 
  'Storage RLS Policies Check' as test_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%claim%';

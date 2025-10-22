-- Admin File Operations Tracking System
-- Tracks all import/export/template operations by admin users
-- Provides analytics and audit trail for bulk data management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_file_operations table
CREATE TABLE IF NOT EXISTS public.admin_file_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('upload', 'export', 'template_download')),
  file_type TEXT NOT NULL CHECK (file_type IN ('devices', 'users', 'marketplace_listings', 'lost_reports', 'found_reports', 'stakeholders', 'transactions', 'security_logs', 'repair_logs', 'insurance_policies')),
  file_format TEXT CHECK (file_format IN ('csv', 'xlsx', 'json')),
  file_name TEXT,
  file_size BIGINT CHECK (file_size >= 0),
  rows_processed INTEGER DEFAULT 0 CHECK (rows_processed >= 0),
  rows_successful INTEGER DEFAULT 0 CHECK (rows_successful >= 0),
  rows_failed INTEGER DEFAULT 0 CHECK (rows_failed >= 0),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  storage_location TEXT CHECK (storage_location IN ('local', 'supabase', 'google_drive')),
  google_drive_file_id TEXT,
  google_drive_url TEXT,
  error_log JSONB DEFAULT '[]'::JSONB,
  success_log JSONB DEFAULT '{}'::JSONB,
  filters_applied JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_success_count CHECK (rows_successful <= rows_processed),
  CONSTRAINT valid_failed_count CHECK (rows_failed <= rows_processed)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_file_operations_user ON public.admin_file_operations(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_file_operations_type ON public.admin_file_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_admin_file_operations_file_type ON public.admin_file_operations(file_type);
CREATE INDEX IF NOT EXISTS idx_admin_file_operations_date ON public.admin_file_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_file_operations_user_date ON public.admin_file_operations(admin_user_id, created_at DESC);

-- Create composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_admin_file_operations_analytics 
ON public.admin_file_operations(operation_type, file_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_file_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can see their own operations
CREATE POLICY admin_file_operations_own_records ON public.admin_file_operations
  FOR SELECT
  USING (
    admin_user_id = auth.uid()
  );

-- RLS Policy: Super admins can see all operations
CREATE POLICY admin_file_operations_super_admin ON public.admin_file_operations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- RLS Policy: Admins can insert their own operations
CREATE POLICY admin_file_operations_insert ON public.admin_file_operations
  FOR INSERT
  WITH CHECK (
    admin_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'retailer', 'repair_shop', 'law_enforcement', 'insurance', 'ngo')
    )
  );

-- Function to log file operation
CREATE OR REPLACE FUNCTION log_file_operation(
  p_admin_user_id UUID,
  p_operation_type TEXT,
  p_file_type TEXT,
  p_file_format TEXT DEFAULT NULL,
  p_file_name TEXT DEFAULT NULL,
  p_file_size BIGINT DEFAULT NULL,
  p_rows_processed INTEGER DEFAULT 0,
  p_rows_successful INTEGER DEFAULT 0,
  p_rows_failed INTEGER DEFAULT 0,
  p_processing_time_ms INTEGER DEFAULT NULL,
  p_storage_location TEXT DEFAULT 'local',
  p_google_drive_file_id TEXT DEFAULT NULL,
  p_google_drive_url TEXT DEFAULT NULL,
  p_error_log JSONB DEFAULT '[]'::JSONB,
  p_success_log JSONB DEFAULT '{}'::JSONB,
  p_filters_applied JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_operation_id UUID;
BEGIN
  INSERT INTO public.admin_file_operations (
    admin_user_id,
    operation_type,
    file_type,
    file_format,
    file_name,
    file_size,
    rows_processed,
    rows_successful,
    rows_failed,
    processing_time_ms,
    storage_location,
    google_drive_file_id,
    google_drive_url,
    error_log,
    success_log,
    filters_applied
  ) VALUES (
    p_admin_user_id,
    p_operation_type,
    p_file_type,
    p_file_format,
    p_file_name,
    p_file_size,
    p_rows_processed,
    p_rows_successful,
    p_rows_failed,
    p_processing_time_ms,
    p_storage_location,
    p_google_drive_file_id,
    p_google_drive_url,
    p_error_log,
    p_success_log,
    p_filters_applied
  )
  RETURNING id INTO v_operation_id;
  
  RETURN v_operation_id;
END;
$$;

-- Function to get file operation statistics
CREATE OR REPLACE FUNCTION get_file_operation_stats(
  p_admin_user_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_operations BIGINT,
  total_uploads BIGINT,
  total_exports BIGINT,
  total_template_downloads BIGINT,
  total_rows_processed BIGINT,
  total_rows_successful BIGINT,
  total_rows_failed BIGINT,
  success_rate NUMERIC,
  avg_processing_time_ms NUMERIC,
  total_file_size BIGINT,
  operations_by_type JSONB,
  operations_by_file_type JSONB,
  recent_operations JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total_ops,
      SUM(CASE WHEN operation_type = 'upload' THEN 1 ELSE 0 END) as uploads,
      SUM(CASE WHEN operation_type = 'export' THEN 1 ELSE 0 END) as exports,
      SUM(CASE WHEN operation_type = 'template_download' THEN 1 ELSE 0 END) as templates,
      COALESCE(SUM(rows_processed), 0) as processed,
      COALESCE(SUM(rows_successful), 0) as successful,
      COALESCE(SUM(rows_failed), 0) as failed,
      COALESCE(AVG(processing_time_ms), 0) as avg_time,
      COALESCE(SUM(file_size), 0) as total_size
    FROM public.admin_file_operations
    WHERE created_at >= v_start_date
      AND (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
  ),
  by_type AS (
    SELECT jsonb_object_agg(
      operation_type,
      count::TEXT
    ) as type_counts
    FROM (
      SELECT operation_type, COUNT(*) as count
      FROM public.admin_file_operations
      WHERE created_at >= v_start_date
        AND (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
      GROUP BY operation_type
    ) t
  ),
  by_file_type AS (
    SELECT jsonb_object_agg(
      file_type,
      count::TEXT
    ) as file_type_counts
    FROM (
      SELECT file_type, COUNT(*) as count
      FROM public.admin_file_operations
      WHERE created_at >= v_start_date
        AND (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
      GROUP BY file_type
    ) ft
  ),
  recent AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'operation_type', operation_type,
        'file_type', file_type,
        'file_name', file_name,
        'rows_processed', rows_processed,
        'rows_successful', rows_successful,
        'rows_failed', rows_failed,
        'created_at', created_at
      )
      ORDER BY created_at DESC
    ) as recent_ops
    FROM (
      SELECT *
      FROM public.admin_file_operations
      WHERE created_at >= v_start_date
        AND (p_admin_user_id IS NULL OR admin_user_id = p_admin_user_id)
      ORDER BY created_at DESC
      LIMIT 10
    ) r
  )
  SELECT
    stats.total_ops,
    stats.uploads,
    stats.exports,
    stats.templates,
    stats.processed,
    stats.successful,
    stats.failed,
    CASE 
      WHEN stats.processed > 0 
      THEN ROUND((stats.successful::NUMERIC / stats.processed::NUMERIC) * 100, 2)
      ELSE 0
    END,
    ROUND(stats.avg_time::NUMERIC, 2),
    stats.total_size,
    COALESCE(by_type.type_counts, '{}'::JSONB),
    COALESCE(by_file_type.file_type_counts, '{}'::JSONB),
    COALESCE(recent.recent_ops, '[]'::JSONB)
  FROM stats
  CROSS JOIN by_type
  CROSS JOIN by_file_type
  CROSS JOIN recent;
END;
$$;

-- Function to cleanup old file operation logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_file_operations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_file_operations
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND operation_type != 'upload' -- Keep upload records longer for audit
  RETURNING COUNT(*) INTO v_deleted_count;
  
  RETURN COALESCE(v_deleted_count, 0);
END;
$$;

-- Create a view for easy querying of file operations with user details
CREATE OR REPLACE VIEW public.admin_file_operations_view AS
SELECT 
  afo.*,
  u.email as admin_email,
  u.display_name as admin_name,
  u.role as admin_role
FROM public.admin_file_operations afo
JOIN public.users u ON afo.admin_user_id = u.id;

-- Grant permissions
GRANT SELECT ON public.admin_file_operations_view TO authenticated;

-- Comment on table and columns
COMMENT ON TABLE public.admin_file_operations IS 'Tracks all file import/export/template operations by admin users';
COMMENT ON COLUMN public.admin_file_operations.operation_type IS 'Type of operation: upload, export, or template_download';
COMMENT ON COLUMN public.admin_file_operations.file_type IS 'Type of data being processed';
COMMENT ON COLUMN public.admin_file_operations.rows_processed IS 'Total number of rows processed in the operation';
COMMENT ON COLUMN public.admin_file_operations.rows_successful IS 'Number of rows successfully processed';
COMMENT ON COLUMN public.admin_file_operations.rows_failed IS 'Number of rows that failed validation/processing';
COMMENT ON COLUMN public.admin_file_operations.storage_location IS 'Where the file was stored: local download, Supabase storage, or Google Drive';
COMMENT ON COLUMN public.admin_file_operations.google_drive_file_id IS 'Google Drive file ID if stored on Google Drive';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin file operations tracking system created successfully';
  RAISE NOTICE '📊 Functions available: log_file_operation, get_file_operation_stats, cleanup_old_file_operations';
  RAISE NOTICE '👁️ View created: admin_file_operations_view';
END $$;


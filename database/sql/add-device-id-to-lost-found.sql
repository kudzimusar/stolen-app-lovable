-- Add device_id column to lost_found_reports table to connect with My Devices
-- This enables cross-feature integration between Lost & Found and My Devices

-- Add device_id foreign key column
ALTER TABLE public.lost_found_reports 
ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_device_id ON public.lost_found_reports(device_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN public.lost_found_reports.device_id IS 'References devices.id when report is for a registered device from My Devices feature';

-- Update existing reports to link with devices if serial numbers match
UPDATE public.lost_found_reports 
SET device_id = d.id
FROM public.devices d
WHERE lost_found_reports.serial_number = d.serial_number 
  AND lost_found_reports.device_id IS NULL
  AND d.status != 'stolen'; -- Don't link to already stolen devices

-- Show the connection results
SELECT 
  'Lost & Found Reports' as table_name,
  COUNT(*) as total_reports,
  COUNT(device_id) as linked_to_devices,
  COUNT(*) - COUNT(device_id) as unlinked_reports
FROM public.lost_found_reports
UNION ALL
SELECT 
  'My Devices' as table_name,
  COUNT(*) as total_devices,
  COUNT(lfr.device_id) as devices_in_reports,
  COUNT(*) - COUNT(lfr.device_id) as devices_not_reported
FROM public.devices d
LEFT JOIN public.lost_found_reports lfr ON d.id = lfr.device_id;

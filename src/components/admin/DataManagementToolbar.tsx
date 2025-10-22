/**
 * Data Management Toolbar
 * Reusable component for admin panels to handle bulk import/export
 * Provides template download, data import, and data export functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  FileJson,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TemplateType, downloadTemplate } from '@/lib/services/templateGenerator';
import { ExportDataType, quickExport } from '@/lib/services/dataExporter';

export interface DataManagementToolbarProps {
  /** Type of data being managed */
  dataType: TemplateType & ExportDataType;
  
  /** Data to export */
  data: any[];
  
  /** Callback when import is completed */
  onImportComplete?: (data: any[]) => void;
  
  /** User role for permission checking */
  userRole?: string;
  
  /** Show template download button */
  showTemplateDownload?: boolean;
  
  /** Show import button */
  showImport?: boolean;
  
  /** Show export button */
  showExport?: boolean;
  
  /** Custom label for the section */
  label?: string;
}

export default function DataManagementToolbar({
  dataType,
  data,
  onImportComplete,
  userRole = 'admin',
  showTemplateDownload = true,
  showImport = true,
  showExport = true,
  label,
}: DataManagementToolbarProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'importing' | 'success' | 'error'>('idle');
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  /**
   * Handle template download
   */
  const handleDownloadTemplate = (format: 'csv' | 'xlsx') => {
    try {
      downloadTemplate(dataType as TemplateType, format);
      toast.success(`Template downloaded as ${format.toUpperCase()}`);
      
      // Log the operation (will be implemented in Phase 5)
      // logFileOperation('template_download', dataType, format);
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  /**
   * Handle data export
   */
  const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      setIsExporting(true);
      await quickExport(data, dataType as ExportDataType, format as 'csv' | 'xlsx');
      toast.success(`Data exported as ${format.toUpperCase()}`);
      
      // Log the operation
      // logFileOperation('export', dataType, format, data.length);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle file selection for import
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx)$/i)) {
      toast.error('Invalid file type. Please upload CSV or Excel files.');
      return;
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 100MB.');
      return;
    }

    setIsImportDialogOpen(true);
    setImportStatus('validating');
    setImportProgress(10);

    try {
      // Import the file parser dynamically
      const { parseAndValidateFile } = await import('./FileUploadParser');
      
      setImportProgress(30);
      
      // Parse and validate the file
      const result = await parseAndValidateFile(file, dataType as TemplateType);
      
      setImportProgress(60);
      
      if (!result.isValid || result.validatedData.length === 0) {
        setImportStatus('error');
        setImportResults({
          total: result.totalRows,
          successful: 0,
          failed: result.totalRows,
          errors: result.errors.slice(0, 10).map(e => `Row ${e.row}: ${e.error}`)
        });
        return;
      }

      // If we have valid data, proceed with import
      setImportStatus('importing');
      setImportProgress(80);

      // Call the import callback
      if (onImportComplete) {
        await onImportComplete(result.validatedData);
      }

      setImportProgress(100);
      setImportStatus('success');
      setImportResults({
        total: result.totalRows,
        successful: result.validRows,
        failed: result.invalidRows,
        errors: result.errors.slice(0, 5).map(e => `Row ${e.row}: ${e.error}`)
      });

      toast.success(`Successfully imported ${result.validRows} records`);
      
      // Log the operation
      // logFileOperation('upload', dataType, file.name.endsWith('.csv') ? 'csv' : 'xlsx', result.totalRows, result.validRows, result.invalidRows);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportResults({
        total: 0,
        successful: 0,
        failed: 0,
        errors: ['Failed to process file. Please check the format and try again.']
      });
      toast.error('Failed to import file');
    }

    // Reset file input
    event.target.value = '';
  };

  /**
   * Check if user can perform bulk operations
   */
  const canBulkUpload = () => {
    const limits: Record<string, number> = {
      individual: 0,
      premium_individual: 10,
      retailer: 1000,
      repair_shop: 500,
      law_enforcement: 100,
      insurance: 1000,
      ngo: 200,
      admin: Infinity,
      super_admin: Infinity,
    };
    return limits[userRole] > 0;
  };

  const displayLabel = label || `${dataType.replace(/_/g, ' ')} Data Management`;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg border">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold capitalize">{displayLabel}</h3>
          <p className="text-xs text-muted-foreground">
            Bulk import/export tools for efficient data management
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Template Download */}
          {showTemplateDownload && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download Template</span>
                  <span className="sm:hidden">Template</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadTemplate('xlsx')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadTemplate('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Import Button */}
          {showImport && canBulkUpload() && (
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => document.getElementById(`file-input-${dataType}`)?.click()}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden">Import</span>
            </Button>
          )}
          
          <input
            id={`file-input-${dataType}`}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Export Button */}
          {showExport && data.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON (.json)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Import Progress Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importing Data</DialogTitle>
            <DialogDescription>
              Processing your file and validating data...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Progress Bar */}
            {importStatus !== 'idle' && importStatus !== 'success' && importStatus !== 'error' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {importStatus === 'validating' && 'Validating file...'}
                    {importStatus === 'importing' && 'Importing data...'}
                  </span>
                  <span className="font-medium">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}

            {/* Success State */}
            {importStatus === 'success' && importResults && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Import Successful!</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                    <div className="text-xs text-blue-600">Total Rows</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                    <div className="text-xs text-green-600">Successful</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 mb-2">Warnings:</div>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {importResults.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => setIsImportDialogOpen(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}

            {/* Error State */}
            {importStatus === 'error' && importResults && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Import Failed</span>
                </div>
                
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm font-medium text-red-800 mb-2">Errors:</div>
                  <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {importResults.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>

                <Button onClick={() => setIsImportDialogOpen(false)} variant="outline" className="w-full">
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Upsell for Non-Premium Users */}
      {showImport && !canBulkUpload() && (
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Upload className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900">Upgrade for Bulk Import</h4>
              <p className="text-xs text-purple-700 mt-1">
                Unlock bulk data import feature with a premium account. Save time by uploading hundreds of records at once.
              </p>
              <Button size="sm" variant="outline" className="mt-2 border-purple-300 text-purple-700 hover:bg-purple-100">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface CategoryData {
  id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  level: number;
  path: string;
  synonyms?: string[];
  metadata?: Record<string, any>;
  is_active?: boolean;
  sort_order?: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
  skipped: number;
  categories: CategoryData[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: CategoryData[];
}

export class TaxonomyImportService {
  private static instance: TaxonomyImportService;

  public static getInstance(): TaxonomyImportService {
    if (!TaxonomyImportService.instance) {
      TaxonomyImportService.instance = new TaxonomyImportService();
    }
    return TaxonomyImportService.instance;
  }

  // Parse CSV file
  async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalize header names
          return header.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w_]/g, '');
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // Parse Excel file
  async parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Use the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON with header normalization
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          });

          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          // Convert to objects with normalized headers
          const headers = (jsonData[0] as string[]).map(header => 
            header.toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^\w_]/g, '')
          );

          const rows = jsonData.slice(1) as any[][];
          const result = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Validate taxonomy data
  validateTaxonomyData(data: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validCategories: CategoryData[] = [];

    // Required fields mapping
    const fieldMappings = {
      name: ['name', 'category_name', 'title', 'product_name'],
      description: ['description', 'desc', 'details'],
      parent: ['parent', 'parent_id', 'parent_category', 'parent_name'],
      level: ['level', 'depth', 'tier'],
      path: ['path', 'hierarchy', 'breadcrumb'],
      synonyms: ['synonyms', 'aliases', 'keywords', 'tags']
    };

    data.forEach((row, index) => {
      const rowNum = index + 1;
      const category: Partial<CategoryData> = {};

      // Map name field (required)
      const nameField = fieldMappings.name.find(field => row[field] && row[field].trim());
      if (!nameField) {
        errors.push(`Row ${rowNum}: Missing required name field`);
        return;
      }
      category.name = row[nameField].trim();

      // Validate name
      if (category.name.length < 2) {
        errors.push(`Row ${rowNum}: Category name too short`);
        return;
      }

      if (category.name.length > 255) {
        warnings.push(`Row ${rowNum}: Category name too long, will be truncated`);
        category.name = category.name.substring(0, 255);
      }

      // Map optional fields
      const descField = fieldMappings.description.find(field => row[field]);
      if (descField) {
        category.description = row[descField].trim();
      }

      const parentField = fieldMappings.parent.find(field => row[field]);
      if (parentField) {
        category.parent_id = row[parentField].trim();
      }

      const levelField = fieldMappings.level.find(field => row[field]);
      if (levelField) {
        const level = parseInt(row[levelField]);
        if (!isNaN(level) && level >= 0) {
          category.level = level;
        } else {
          category.level = 0;
        }
      } else {
        category.level = 0;
      }

      const pathField = fieldMappings.path.find(field => row[field]);
      if (pathField) {
        category.path = row[pathField].trim();
      } else {
        category.path = category.name.toLowerCase().replace(/\s+/g, '-');
      }

      const synonymsField = fieldMappings.synonyms.find(field => row[field]);
      if (synonymsField) {
        const synonymsStr = row[synonymsField].trim();
        if (synonymsStr) {
          category.synonyms = synonymsStr.split(/[,;|]/).map(s => s.trim()).filter(s => s);
        }
      }

      // Additional metadata
      category.metadata = {};
      Object.keys(row).forEach(key => {
        if (!fieldMappings.name.includes(key) && 
            !fieldMappings.description.includes(key) &&
            !fieldMappings.parent.includes(key) &&
            !fieldMappings.level.includes(key) &&
            !fieldMappings.path.includes(key) &&
            !fieldMappings.synonyms.includes(key) &&
            row[key]) {
          category.metadata![key] = row[key];
        }
      });

      category.is_active = true;
      category.sort_order = index;

      validCategories.push(category as CategoryData);
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: validCategories
    };
  }

  // Build hierarchy from flat data
  buildHierarchy(categories: CategoryData[]): CategoryData[] {
    const categoryMap = new Map<string, CategoryData>();
    const rootCategories: CategoryData[] = [];

    // First pass: create map and identify roots
    categories.forEach(category => {
      categoryMap.set(category.name, category);
      if (!category.parent_id) {
        rootCategories.push(category);
      }
    });

    // Second pass: resolve parent references
    categories.forEach(category => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          category.parent_id = parent.id || parent.name;
          // Calculate level based on parent
          category.level = (parent.level || 0) + 1;
          // Build path
          const parentPath = parent.path || parent.name.toLowerCase().replace(/\s+/g, '-');
          const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
          category.path = `${parentPath}/${categorySlug}`;
        } else {
          // Parent not found, treat as root
          category.parent_id = undefined;
          category.level = 0;
        }
      }
    });

    return categories;
  }

  // Import categories to database
  async importCategories(categories: CategoryData[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [],
      warnings: [],
      skipped: 0,
      categories: []
    };

    try {
      // Build hierarchy
      const hierarchicalCategories = this.buildHierarchy(categories);

      // Import in batches to handle large datasets
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < hierarchicalCategories.length; i += batchSize) {
        batches.push(hierarchicalCategories.slice(i, i + batchSize));
      }

      // Import root categories first, then children
      const levelGroups = new Map<number, CategoryData[]>();
      hierarchicalCategories.forEach(category => {
        const level = category.level || 0;
        if (!levelGroups.has(level)) {
          levelGroups.set(level, []);
        }
        levelGroups.get(level)!.push(category);
      });

      // Import by level to ensure parents exist before children
      const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
      
      for (const level of sortedLevels) {
        const categoriesAtLevel = levelGroups.get(level)!;
        
        for (let i = 0; i < categoriesAtLevel.length; i += batchSize) {
          const batch = categoriesAtLevel.slice(i, i + batchSize);
          
          try {
            const { data, error } = await supabase
              .from('product_categories')
              .upsert(
                batch.map(category => ({
                  name: category.name,
                  description: category.description,
                  parent_id: category.parent_id,
                  level: category.level,
                  path: category.path,
                  synonyms: category.synonyms,
                  metadata: category.metadata,
                  is_active: category.is_active,
                  sort_order: category.sort_order
                })),
                { 
                  onConflict: 'name,parent_id',
                  ignoreDuplicates: false 
                }
              )
              .select();

            if (error) {
              result.errors.push(`Batch import error: ${error.message}`);
            } else {
              result.imported += data?.length || 0;
              result.categories.push(...(data || []));
            }
          } catch (error) {
            result.errors.push(`Batch import failed: ${error}`);
          }
        }
      }

      // Update search index
      await this.updateSearchIndex();

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Import failed: ${error}`);
      return result;
    }
  }

  // Update search index for categories
  private async updateSearchIndex(): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('update-taxonomy-search-index');
      if (error) {
        console.error('Failed to update search index:', error);
      }
    } catch (error) {
      console.error('Search index update error:', error);
    }
  }

  // Preview import without saving
  async previewImport(file: File): Promise<{
    preview: CategoryData[];
    validation: ValidationResult;
    stats: {
      total: number;
      byLevel: Record<number, number>;
      topCategories: string[];
    };
  }> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let rawData: any[];

      if (fileExtension === 'csv') {
        rawData = await this.parseCSV(file);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        rawData = await this.parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      const validation = this.validateTaxonomyData(rawData);
      const hierarchicalData = this.buildHierarchy(validation.data);

      // Generate stats
      const byLevel: Record<number, number> = {};
      const topCategories: string[] = [];

      hierarchicalData.forEach(category => {
        const level = category.level || 0;
        byLevel[level] = (byLevel[level] || 0) + 1;
        
        if (level === 0) {
          topCategories.push(category.name);
        }
      });

      return {
        preview: hierarchicalData.slice(0, 50), // Show first 50 for preview
        validation,
        stats: {
          total: hierarchicalData.length,
          byLevel,
          topCategories: topCategories.slice(0, 10)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Export current taxonomy
  async exportTaxonomy(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const { data: categories, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const exportData = categories?.map(category => ({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || '',
        level: category.level,
        path: category.path,
        synonyms: (category.synonyms || []).join(', '),
        is_active: category.is_active,
        created_at: category.created_at
      })) || [];

      if (format === 'csv') {
        const csv = Papa.unparse(exportData);
        return new Blob([csv], { type: 'text/csv' });
      } else {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Taxonomy');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }
    } catch (error) {
      throw error;
    }
  }

  // Clear all categories (for testing)
  async clearAllCategories(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except system categories

      return !error;
    } catch (error) {
      console.error('Failed to clear categories:', error);
      return false;
    }
  }

  // Get import template
  getImportTemplate(): string {
    const template = [
      'name,description,parent_id,level,synonyms',
      'Electronics,Electronic devices and gadgets,,0,"gadgets,tech,devices"',
      'Smartphones,Mobile phones and accessories,Electronics,1,"phones,mobile,cell phones"',
      'iPhone,Apple smartphones,Smartphones,2,"apple phone,iphone"',
      'Samsung Galaxy,Samsung smartphones,Smartphones,2,"samsung,galaxy"',
      'Laptops,Portable computers,Electronics,1,"notebooks,computers"',
      'MacBook,Apple laptops,Laptops,2,"apple laptop,macbook"',
      'Gaming,Gaming devices and accessories,,0,"games,gaming"',
      'Consoles,Gaming consoles,Gaming,1,"game console,gaming system"'
    ].join('\n');

    return template;
  }
}

// Export singleton instance
export const taxonomyImportService = TaxonomyImportService.getInstance();

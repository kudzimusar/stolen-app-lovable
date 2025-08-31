import { supabase } from '@/integrations/supabase/client';
import Fuse from 'fuse.js';

// Enhanced taxonomy interfaces
export interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  level: number;
  path: string[];
  childCount: number;
  productCount: number;
  featured: boolean;
  metadata: {
    searchKeywords: string[];
    attributes: TaxonomyAttribute[];
    filters: CategoryFilter[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxonomyAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CategoryFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'search';
  options: FilterOption[];
  defaultValue?: any;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  metadata?: any;
}

export interface TaxonomySearchResult {
  categories: TaxonomyCategory[];
  products: any[];
  totalCount: number;
  facets: {
    brands: { name: string; count: number }[];
    priceRanges: { label: string; min: number; max: number; count: number }[];
    conditions: { name: string; count: number }[];
    locations: { name: string; count: number }[];
  };
}

export class EnhancedTaxonomyService {
  private static instance: EnhancedTaxonomyService;
  private categoriesCache: TaxonomyCategory[] = [];
  private fuse: Fuse<TaxonomyCategory> | null = null;
  private lastCacheUpdate: Date | null = null;

  public static getInstance(): EnhancedTaxonomyService {
    if (!EnhancedTaxonomyService.instance) {
      EnhancedTaxonomyService.instance = new EnhancedTaxonomyService();
    }
    return EnhancedTaxonomyService.instance;
  }

  constructor() {
    this.initializeDefaultTaxonomy();
  }

  // Initialize comprehensive taxonomy structure
  private async initializeDefaultTaxonomy() {
    // Mock comprehensive taxonomy data (in real implementation, this would be loaded from CSV/database)
    const defaultCategories: Partial<TaxonomyCategory>[] = [
      // Electronics (Level 0)
      {
        id: 'electronics',
        name: 'Electronics',
        slug: 'electronics',
        description: 'All electronic devices and accessories',
        icon: '📱',
        level: 0,
        path: ['electronics'],
        featured: true,
        metadata: {
          searchKeywords: ['tech', 'device', 'gadget', 'electronic'],
          attributes: [
            { id: 'brand', name: 'Brand', type: 'select', required: true },
            { id: 'model', name: 'Model', type: 'text', required: true },
            { id: 'condition', name: 'Condition', type: 'select', required: true, options: ['new', 'like-new', 'excellent', 'good', 'fair'] },
            { id: 'warranty', name: 'Warranty (months)', type: 'number', required: false }
          ],
          filters: [
            {
              id: 'brand',
              name: 'Brand',
              type: 'checkbox',
              options: [
                { id: 'apple', label: 'Apple', value: 'apple' },
                { id: 'samsung', label: 'Samsung', value: 'samsung' },
                { id: 'google', label: 'Google', value: 'google' }
              ]
            }
          ]
        }
      },

      // Mobile Phones (Level 1)
      {
        id: 'mobile-phones',
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        description: 'Smartphones and feature phones',
        icon: '📱',
        parentId: 'electronics',
        level: 1,
        path: ['electronics', 'mobile-phones'],
        featured: true,
        metadata: {
          searchKeywords: ['phone', 'smartphone', 'mobile', 'cell', 'iphone', 'android'],
          attributes: [
            { id: 'storage', name: 'Storage (GB)', type: 'select', required: true, options: ['64', '128', '256', '512', '1024'] },
            { id: 'ram', name: 'RAM (GB)', type: 'select', required: false, options: ['4', '6', '8', '12', '16'] },
            { id: 'screenSize', name: 'Screen Size (inches)', type: 'number', required: false },
            { id: 'operatingSystem', name: 'Operating System', type: 'select', required: true, options: ['iOS', 'Android', 'Other'] }
          ],
          filters: [
            {
              id: 'storage',
              name: 'Storage',
              type: 'checkbox',
              options: [
                { id: '64gb', label: '64 GB', value: '64' },
                { id: '128gb', label: '128 GB', value: '128' },
                { id: '256gb', label: '256 GB', value: '256' },
                { id: '512gb', label: '512 GB', value: '512' }
              ]
            }
          ]
        }
      },

      // iPhone (Level 2)
      {
        id: 'iphones',
        name: 'iPhone',
        slug: 'iphones',
        description: 'Apple iPhone devices',
        icon: '📱',
        parentId: 'mobile-phones',
        level: 2,
        path: ['electronics', 'mobile-phones', 'iphones'],
        featured: true,
        metadata: {
          searchKeywords: ['iphone', 'apple', 'ios'],
          attributes: [
            { id: 'series', name: 'iPhone Series', type: 'select', required: true, options: ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'] },
            { id: 'color', name: 'Color', type: 'select', required: true, options: ['Black', 'White', 'Blue', 'Red', 'Purple', 'Yellow', 'Green'] }
          ],
          filters: [
            {
              id: 'series',
              name: 'iPhone Series',
              type: 'checkbox',
              options: [
                { id: 'iphone15', label: 'iPhone 15', value: 'iPhone 15' },
                { id: 'iphone14', label: 'iPhone 14', value: 'iPhone 14' },
                { id: 'iphone13', label: 'iPhone 13', value: 'iPhone 13' }
              ]
            }
          ]
        }
      },

      // Laptops (Level 1)
      {
        id: 'laptops',
        name: 'Laptops',
        slug: 'laptops',
        description: 'Portable computers and notebooks',
        icon: '💻',
        parentId: 'electronics',
        level: 1,
        path: ['electronics', 'laptops'],
        featured: true,
        metadata: {
          searchKeywords: ['laptop', 'notebook', 'computer', 'macbook', 'thinkpad'],
          attributes: [
            { id: 'processor', name: 'Processor', type: 'text', required: true },
            { id: 'ram', name: 'RAM (GB)', type: 'select', required: true, options: ['8', '16', '32', '64'] },
            { id: 'storage', name: 'Storage (GB)', type: 'select', required: true, options: ['256', '512', '1024', '2048'] },
            { id: 'screenSize', name: 'Screen Size (inches)', type: 'number', required: false },
            { id: 'graphics', name: 'Graphics Card', type: 'text', required: false }
          ],
          filters: [
            {
              id: 'brand',
              name: 'Brand',
              type: 'checkbox',
              options: [
                { id: 'apple', label: 'Apple', value: 'apple' },
                { id: 'dell', label: 'Dell', value: 'dell' },
                { id: 'hp', label: 'HP', value: 'hp' },
                { id: 'lenovo', label: 'Lenovo', value: 'lenovo' }
              ]
            }
          ]
        }
      },

      // Gaming (Level 1)
      {
        id: 'gaming',
        name: 'Gaming',
        slug: 'gaming',
        description: 'Gaming consoles, accessories, and equipment',
        icon: '🎮',
        parentId: 'electronics',
        level: 1,
        path: ['electronics', 'gaming'],
        featured: true,
        metadata: {
          searchKeywords: ['gaming', 'console', 'playstation', 'xbox', 'nintendo', 'pc gaming'],
          attributes: [
            { id: 'platform', name: 'Platform', type: 'select', required: true, options: ['PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox Series S', 'Nintendo Switch', 'PC'] },
            { id: 'storage', name: 'Storage (GB)', type: 'select', required: false, options: ['500', '1000', '2000'] }
          ],
          filters: [
            {
              id: 'platform',
              name: 'Platform',
              type: 'radio',
              options: [
                { id: 'ps5', label: 'PlayStation 5', value: 'PlayStation 5' },
                { id: 'xbox', label: 'Xbox Series X/S', value: 'Xbox Series' },
                { id: 'switch', label: 'Nintendo Switch', value: 'Nintendo Switch' }
              ]
            }
          ]
        }
      },

      // Add more categories here...
      // Tablets, Cameras, Audio, Smart Home, Wearables, etc.
    ];

    // Convert to full TaxonomyCategory objects
    this.categoriesCache = defaultCategories.map(cat => ({
      ...cat,
      childCount: 0,
      productCount: Math.floor(Math.random() * 100) + 10,
      createdAt: new Date(),
      updatedAt: new Date()
    } as TaxonomyCategory));

    // Update child counts
    this.updateChildCounts();

    // Initialize search index
    this.initializeFuseSearch();
    this.lastCacheUpdate = new Date();
  }

  private updateChildCounts() {
    this.categoriesCache.forEach(category => {
      category.childCount = this.categoriesCache.filter(c => c.parentId === category.id).length;
    });
  }

  private initializeFuseSearch() {
    const options = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.2 },
        { name: 'metadata.searchKeywords', weight: 0.3 },
        { name: 'slug', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true
    };

    this.fuse = new Fuse(this.categoriesCache, options);
  }

  // Public API methods

  // Get all root categories
  async getRootCategories(): Promise<TaxonomyCategory[]> {
    await this.ensureCacheUpdated();
    return this.categoriesCache.filter(cat => cat.level === 0);
  }

  // Get children of a category
  async getChildCategories(parentId: string): Promise<TaxonomyCategory[]> {
    await this.ensureCacheUpdated();
    return this.categoriesCache.filter(cat => cat.parentId === parentId);
  }

  // Get category by ID or slug
  async getCategory(identifier: string): Promise<TaxonomyCategory | null> {
    await this.ensureCacheUpdated();
    return this.categoriesCache.find(cat => cat.id === identifier || cat.slug === identifier) || null;
  }

  // Get category hierarchy path
  async getCategoryPath(categoryId: string): Promise<TaxonomyCategory[]> {
    const category = await this.getCategory(categoryId);
    if (!category) return [];

    const path: TaxonomyCategory[] = [category];
    let current = category;

    while (current.parentId) {
      const parent = await this.getCategory(current.parentId);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return path;
  }

  // Search categories
  async searchCategories(query: string, limit: number = 20): Promise<TaxonomyCategory[]> {
    await this.ensureCacheUpdated();
    
    if (!query.trim()) {
      return this.categoriesCache.slice(0, limit);
    }

    if (!this.fuse) return [];

    const results = this.fuse.search(query);
    return results.slice(0, limit).map(result => result.item);
  }

  // Get featured categories
  async getFeaturedCategories(): Promise<TaxonomyCategory[]> {
    await this.ensureCacheUpdated();
    return this.categoriesCache.filter(cat => cat.featured);
  }

  // Advanced search with filters
  async searchWithFilters(params: {
    query?: string;
    categoryId?: string;
    priceRange?: { min: number; max: number };
    brands?: string[];
    conditions?: string[];
    locations?: string[];
    attributes?: Record<string, any>;
    limit?: number;
    offset?: number;
  }): Promise<TaxonomySearchResult> {
    await this.ensureCacheUpdated();

    // Mock search results with facets
    const mockProducts = Array.from({ length: params.limit || 20 }, (_, i) => ({
      id: `product_${i}`,
      title: `Mock Product ${i + 1}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      brand: ['Apple', 'Samsung', 'Google', 'OnePlus'][Math.floor(Math.random() * 4)],
      condition: ['new', 'like-new', 'excellent', 'good'][Math.floor(Math.random() * 4)],
      location: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'][Math.floor(Math.random() * 3)]
    }));

    const categories = params.query 
      ? await this.searchCategories(params.query)
      : params.categoryId 
        ? await this.getChildCategories(params.categoryId)
        : [];

    return {
      categories,
      products: mockProducts,
      totalCount: mockProducts.length,
      facets: {
        brands: [
          { name: 'Apple', count: 45 },
          { name: 'Samsung', count: 38 },
          { name: 'Google', count: 22 },
          { name: 'OnePlus', count: 18 }
        ],
        priceRanges: [
          { label: 'Under R10,000', min: 0, max: 10000, count: 25 },
          { label: 'R10,000 - R20,000', min: 10000, max: 20000, count: 42 },
          { label: 'R20,000 - R50,000', min: 20000, max: 50000, count: 35 },
          { label: 'Over R50,000', min: 50000, max: 999999, count: 12 }
        ],
        conditions: [
          { name: 'New', count: 28 },
          { name: 'Like New', count: 35 },
          { name: 'Excellent', count: 42 },
          { name: 'Good', count: 15 }
        ],
        locations: [
          { name: 'Gauteng', count: 68 },
          { name: 'Western Cape', count: 32 },
          { name: 'KwaZulu-Natal', count: 24 }
        ]
      }
    };
  }

  // Import taxonomy from CSV (for bulk import)
  async importTaxonomyFromCSV(csvData: string): Promise<{ imported: number; errors: string[] }> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    let imported = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const categoryData: any = {};

        headers.forEach((header, index) => {
          categoryData[header] = values[index];
        });

        // Validate and create category
        if (categoryData.name && categoryData.slug) {
          const newCategory: TaxonomyCategory = {
            id: categoryData.id || `cat_${Date.now()}_${i}`,
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description || '',
            icon: categoryData.icon || '📦',
            parentId: categoryData.parentId || undefined,
            level: parseInt(categoryData.level) || 0,
            path: categoryData.path ? categoryData.path.split('/') : [categoryData.slug],
            childCount: 0,
            productCount: parseInt(categoryData.productCount) || 0,
            featured: categoryData.featured === 'true',
            metadata: {
              searchKeywords: categoryData.searchKeywords ? categoryData.searchKeywords.split(';') : [],
              attributes: [],
              filters: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };

          this.categoriesCache.push(newCategory);
          imported++;
        }
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error}`);
      }
    }

    // Update cache
    this.updateChildCounts();
    this.initializeFuseSearch();
    this.lastCacheUpdate = new Date();

    return { imported, errors };
  }

  // Export taxonomy to CSV
  async exportTaxonomyToCSV(): Promise<string> {
    await this.ensureCacheUpdated();

    const headers = [
      'id', 'name', 'slug', 'description', 'icon', 'parentId', 'level', 
      'path', 'childCount', 'productCount', 'featured', 'searchKeywords'
    ];

    const csvRows = [headers.join(',')];

    this.categoriesCache.forEach(category => {
      const row = [
        category.id,
        `"${category.name}"`,
        category.slug,
        `"${category.description || ''}"`,
        category.icon || '',
        category.parentId || '',
        category.level.toString(),
        `"${category.path.join('/')}"`,
        category.childCount.toString(),
        category.productCount.toString(),
        category.featured.toString(),
        `"${category.metadata.searchKeywords.join(';')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Get taxonomy statistics
  async getTaxonomyStats(): Promise<{
    totalCategories: number;
    totalProducts: number;
    maxDepth: number;
    topCategories: Array<{ name: string; productCount: number }>;
  }> {
    await this.ensureCacheUpdated();

    const totalCategories = this.categoriesCache.length;
    const totalProducts = this.categoriesCache.reduce((sum, cat) => sum + cat.productCount, 0);
    const maxDepth = Math.max(...this.categoriesCache.map(cat => cat.level));
    const topCategories = this.categoriesCache
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 10)
      .map(cat => ({ name: cat.name, productCount: cat.productCount }));

    return {
      totalCategories,
      totalProducts,
      maxDepth,
      topCategories
    };
  }

  private async ensureCacheUpdated() {
    if (!this.lastCacheUpdate || Date.now() - this.lastCacheUpdate.getTime() > 3600000) {
      // Refresh cache every hour
      await this.refreshFromDatabase();
    }
  }

  private async refreshFromDatabase() {
    try {
      // In real implementation, load from Supabase
      // const { data } = await supabase.from('taxonomy_categories').select('*');
      // Process and update cache
      this.lastCacheUpdate = new Date();
    } catch (error) {
      console.error('Failed to refresh taxonomy cache:', error);
    }
  }
}

export const enhancedTaxonomyService = EnhancedTaxonomyService.getInstance();

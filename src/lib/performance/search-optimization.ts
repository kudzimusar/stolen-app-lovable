import algoliasearch from 'algoliasearch';
import cacheManager from './redis';

// Initialize Algolia client
const searchClient = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID || 'your-app-id',
  process.env.VITE_ALGOLIA_SEARCH_KEY || 'your-search-key'
);

// Search indices
const indices = {
  devices: searchClient.initIndex('devices'),
  users: searchClient.initIndex('users'),
  transactions: searchClient.initIndex('transactions'),
  marketplace: searchClient.initIndex('marketplace'),
  insurance: searchClient.initIndex('insurance'),
  lawEnforcement: searchClient.initIndex('law-enforcement'),
} as const;

export interface SearchFilters {
  category?: string;
  status?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  userId?: string;
}

export interface SearchOptions {
  hitsPerPage?: number;
  page?: number;
  filters?: string;
  facets?: string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
}

export class SearchOptimizationService {
  private static instance: SearchOptimizationService;

  static getInstance(): SearchOptimizationService {
    if (!SearchOptimizationService.instance) {
      SearchOptimizationService.instance = new SearchOptimizationService();
    }
    return SearchOptimizationService.instance;
  }

  /**
   * Search devices with caching
   */
  async searchDevices(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) {
    const cacheKey = `search:devices:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const searchOptions = {
      hitsPerPage: options.hitsPerPage || 20,
      page: options.page || 0,
      filters: this.buildFilters(filters),
      facets: options.facets || ['category', 'status', 'location'],
      attributesToRetrieve: options.attributesToRetrieve || [
        'objectID',
        'name',
        'category',
        'status',
        'location',
        'description',
        'imageUrl',
        'userId',
        'createdAt'
      ],
      attributesToHighlight: options.attributesToHighlight || ['name', 'description'],
    };

    try {
      const results = await indices.devices.search(query, searchOptions);
      
      // Cache results for 5 minutes
      await cacheManager.set(cacheKey, results, 300);
      
      return results;
    } catch (error) {
      console.error('Device search error:', error);
      throw new Error('Failed to search devices');
    }
  }

  /**
   * Search users
   */
  async searchUsers(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) {
    const cacheKey = `search:users:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const searchOptions = {
      hitsPerPage: options.hitsPerPage || 20,
      page: options.page || 0,
      filters: this.buildFilters(filters),
      attributesToRetrieve: options.attributesToRetrieve || [
        'objectID',
        'name',
        'email',
        'phone',
        'location',
        'role',
        'avatarUrl'
      ],
      attributesToHighlight: options.attributesToHighlight || ['name', 'email'],
    };

    try {
      const results = await indices.users.search(query, searchOptions);
      await cacheManager.set(cacheKey, results, 300);
      return results;
    } catch (error) {
      console.error('User search error:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Search transactions
   */
  async searchTransactions(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) {
    const cacheKey = `search:transactions:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const searchOptions = {
      hitsPerPage: options.hitsPerPage || 20,
      page: options.page || 0,
      filters: this.buildFilters(filters),
      attributesToRetrieve: options.attributesToRetrieve || [
        'objectID',
        'type',
        'amount',
        'status',
        'description',
        'userId',
        'createdAt'
      ],
      attributesToHighlight: options.attributesToHighlight || ['description'],
    };

    try {
      const results = await indices.transactions.search(query, searchOptions);
      await cacheManager.set(cacheKey, results, 300);
      return results;
    } catch (error) {
      console.error('Transaction search error:', error);
      throw new Error('Failed to search transactions');
    }
  }

  /**
   * Search marketplace listings
   */
  async searchMarketplace(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) {
    const cacheKey = `search:marketplace:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const searchOptions = {
      hitsPerPage: options.hitsPerPage || 20,
      page: options.page || 0,
      filters: this.buildFilters(filters),
      facets: options.facets || ['category', 'condition', 'location', 'priceRange'],
      attributesToRetrieve: options.attributesToRetrieve || [
        'objectID',
        'title',
        'description',
        'price',
        'category',
        'condition',
        'location',
        'images',
        'sellerId',
        'createdAt'
      ],
      attributesToHighlight: options.attributesToHighlight || ['title', 'description'],
    };

    try {
      const results = await indices.marketplace.search(query, searchOptions);
      await cacheManager.set(cacheKey, results, 300);
      return results;
    } catch (error) {
      console.error('Marketplace search error:', error);
      throw new Error('Failed to search marketplace');
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, index: keyof typeof indices = 'devices') {
    const cacheKey = `suggestions:${index}:${query}`;
    
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results = await indices[index].search(query, {
        hitsPerPage: 5,
        attributesToRetrieve: ['name', 'title', 'description'],
      });

      const suggestions = results.hits.map((hit: any) => 
        hit.name || hit.title || hit.description
      ).filter(Boolean);

      await cacheManager.set(cacheKey, suggestions, 600); // Cache for 10 minutes
      return suggestions;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  /**
   * Build Algolia filters string
   */
  private buildFilters(filters: SearchFilters): string {
    const filterParts: string[] = [];

    if (filters.category) {
      filterParts.push(`category:${filters.category}`);
    }

    if (filters.status) {
      filterParts.push(`status:${filters.status}`);
    }

    if (filters.location) {
      filterParts.push(`location:${filters.location}`);
    }

    if (filters.userId) {
      filterParts.push(`userId:${filters.userId}`);
    }

    if (filters.priceRange) {
      filterParts.push(`price:${filters.priceRange.min} TO ${filters.priceRange.max}`);
    }

    if (filters.dateRange) {
      const startTimestamp = Math.floor(filters.dateRange.start.getTime() / 1000);
      const endTimestamp = Math.floor(filters.dateRange.end.getTime() / 1000);
      filterParts.push(`createdAt:${startTimestamp} TO ${endTimestamp}`);
    }

    return filterParts.join(' AND ');
  }

  /**
   * Index a document
   */
  async indexDocument(
    index: keyof typeof indices,
    objectID: string,
    data: Record<string, any>
  ) {
    try {
      await indices[index].saveObject({
        objectID,
        ...data,
      });
      console.log(`✅ Indexed document in ${index}: ${objectID}`);
    } catch (error) {
      console.error(`Failed to index document in ${index}:`, error);
      throw new Error(`Failed to index document in ${index}`);
    }
  }

  /**
   * Delete a document from index
   */
  async deleteDocument(index: keyof typeof indices, objectID: string) {
    try {
      await indices[index].deleteObject(objectID);
      console.log(`✅ Deleted document from ${index}: ${objectID}`);
    } catch (error) {
      console.error(`Failed to delete document from ${index}:`, error);
      throw new Error(`Failed to delete document from ${index}`);
    }
  }

  /**
   * Update a document in index
   */
  async updateDocument(
    index: keyof typeof indices,
    objectID: string,
    data: Record<string, any>
  ) {
    try {
      await indices[index].partialUpdateObject({
        objectID,
        ...data,
      });
      console.log(`✅ Updated document in ${index}: ${objectID}`);
    } catch (error) {
      console.error(`Failed to update document in ${index}:`, error);
      throw new Error(`Failed to update document in ${index}`);
    }
  }

  /**
   * Clear search cache
   */
  async clearSearchCache() {
    try {
      await cacheManager.invalidatePattern('search:*');
      await cacheManager.invalidatePattern('suggestions:*');
      console.log('✅ Search cache cleared');
    } catch (error) {
      console.error('Failed to clear search cache:', error);
    }
  }
}

// Search hooks
export const useSearchOptimization = () => {
  const searchService = SearchOptimizationService.getInstance();

  return {
    searchDevices: searchService.searchDevices.bind(searchService),
    searchUsers: searchService.searchUsers.bind(searchService),
    searchTransactions: searchService.searchTransactions.bind(searchService),
    searchMarketplace: searchService.searchMarketplace.bind(searchService),
    getSuggestions: searchService.getSuggestions.bind(searchService),
    indexDocument: searchService.indexDocument.bind(searchService),
    deleteDocument: searchService.deleteDocument.bind(searchService),
    updateDocument: searchService.updateDocument.bind(searchService),
    clearSearchCache: searchService.clearSearchCache.bind(searchService),
  };
};

export default SearchOptimizationService.getInstance();

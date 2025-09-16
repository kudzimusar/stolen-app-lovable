import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type MarketplaceListing = Database['public']['Tables']['marketplace_listings']['Row'];
type MarketplaceCategory = Database['public']['Tables']['marketplace_categories']['Row'];
type ListingInsert = Database['public']['Tables']['marketplace_listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['marketplace_listings']['Update'];

interface ListingFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  condition?: string;
  brand?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

interface ListingWithDetails extends MarketplaceListing {
  seller?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    seller_rating: number;
  };
  category?: MarketplaceCategory;
  watchlisted?: boolean;
  distance?: number;
}

export class SupabaseMarketplaceService {
  private static instance: SupabaseMarketplaceService;

  public static getInstance(): SupabaseMarketplaceService {
    if (!SupabaseMarketplaceService.instance) {
      SupabaseMarketplaceService.instance = new SupabaseMarketplaceService();
    }
    return SupabaseMarketplaceService.instance;
  }

  // Listings CRUD operations
  async getListings(filters: ListingFilters = {}): Promise<{
    data: ListingWithDetails[];
    count: number;
    error: string | null;
  }> {
    try {
      const query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          seller:users!seller_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          category:marketplace_categories (
            id,
            name,
            slug,
            icon
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('availability', 'available');

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }

      if (filters.priceMin !== undefined) {
        query = query.gte('price', filters.priceMin);
      }

      if (filters.priceMax !== undefined) {
        query = query.lte('price', filters.priceMax);
      }

      if (filters.location && filters.location !== 'all') {
        query = query.eq('location_province', filters.location);
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }

      if (filters.search) {
        query = query.or(`
          title.ilike.%${filters.search}%,
          description.ilike.%${filters.search}%,
          brand.ilike.%${filters.search}%,
          model.ilike.%${filters.search}%
        `);
      }

      if (filters.featured) {
        query = query.not('featured_until', 'is', null);
      }

      // Sorting and pagination
      query = query
        .order('featured_until', { ascending: false, nullsLast: true })
        .order('created_at', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        error: null
      };

    } catch (error: any) {
      console.error('Error fetching listings:', error);
      return {
        data: [],
        count: 0,
        error: error.message
      };
    }
  }

  async getListing(id: string, userId?: string): Promise<{
    data: ListingWithDetails | null;
    error: string | null;
  }> {
    try {
      const query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          seller:users!seller_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          category:marketplace_categories (
            id,
            name,
            slug,
            icon,
            path
          )
        `)
        .eq('id', id)
        .single();

      const { data: listing, error } = await query;

      if (error) throw error;

      // Check if user has watchlisted this item
      let watchlisted = false;
      if (userId) {
        const { data: watchlistData } = await supabase
          .from('marketplace_watchlist')
          .select('id')
          .eq('user_id', userId)
          .eq('listing_id', id)
          .single();

        watchlisted = !!watchlistData;
      }

      // Track view
      if (listing) {
        await this.trackView(id, userId);
      }

      return {
        data: listing ? { ...listing, watchlisted } : null,
        error: null
      };

    } catch (error: any) {
      console.error('Error fetching listing:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  async createListing(listing: ListingInsert): Promise<{
    data: MarketplaceListing | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(listing)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };

    } catch (error: any) {
      console.error('Error creating listing:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  async updateListing(id: string, updates: ListingUpdate): Promise<{
    data: MarketplaceListing | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null
      };

    } catch (error: any) {
      console.error('Error updating listing:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  async deleteListing(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return { error: null };

    } catch (error: any) {
      console.error('Error deleting listing:', error);
      return { error: error.message };
    }
  }

  // Categories
  async getCategories(parentId?: string): Promise<{
    data: MarketplaceCategory[];
    error: string | null;
  }> {
    try {
      const query = supabase
        .from('marketplace_categories')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');

      if (parentId === undefined) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null
      };

    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }

  async searchCategories(query: string): Promise<{
    data: MarketplaceCategory[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .or(`
          name.ilike.%${query}%,
          description.ilike.%${query}%,
          search_keywords.cs.{${query}}
        `)
        .order('featured', { ascending: false })
        .limit(20);

      if (error) throw error;

      return {
        data: data || [],
        error: null
      };

    } catch (error: any) {
      console.error('Error searching categories:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }

  // Watchlist operations
  async addToWatchlist(userId: string, listingId: string, priceThreshold?: number): Promise<{
    error: string | null;
  }> {
    try {
      const { error } = await supabase
        .from('marketplace_watchlist')
        .insert({
          user_id: userId,
          listing_id: listingId,
          price_alert_threshold: priceThreshold
        });

      if (error) throw error;

      return { error: null };

    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      return { error: error.message };
    }
  }

  async removeFromWatchlist(userId: string, listingId: string): Promise<{
    error: string | null;
  }> {
    try {
      const { error } = await supabase
        .from('marketplace_watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);

      if (error) throw error;

      return { error: null };

    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
      return { error: error.message };
    }
  }

  async getUserWatchlist(userId: string): Promise<{
    data: ListingWithDetails[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('marketplace_watchlist')
        .select(`
          *,
          listing:marketplace_listings (
            *,
            seller:users!seller_id (
              id,
              username,
              full_name,
              avatar_url
            ),
            category:marketplace_categories (
              id,
              name,
              slug,
              icon
            )
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const listings = data?.map(item => ({
        ...item.listing,
        watchlisted: true
      })) || [];

      return {
        data: listings,
        error: null
      };

    } catch (error: any) {
      console.error('Error fetching watchlist:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }

  // Analytics and tracking
  async trackView(listingId: string, viewerId?: string, metadata?: any): Promise<void> {
    try {
      await supabase
        .from('listing_views')
        .insert({
          listing_id: listingId,
          viewer_id: viewerId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  async trackSearch(
    query: string, 
    userId?: string, 
    filters?: any, 
    resultsCount?: number
  ): Promise<void> {
    try {
      await supabase
        .from('search_analytics')
        .insert({
          user_id: userId,
          search_query: query,
          search_type: 'general',
          filters_applied: filters,
          results_count: resultsCount,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Seller operations
  async getSellerListings(sellerId: string): Promise<{
    data: ListingWithDetails[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          category:marketplace_categories (
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null
      };

    } catch (error: any) {
      console.error('Error fetching seller listings:', error);
      return {
        data: [],
        error: error.message
      };
    }
  }

  async getSellerStats(sellerId: string): Promise<{
    data: {
      totalListings: number;
      activeListings: number;
      soldItems: number;
      totalViews: number;
      totalWatchlists: number;
      averageRating: number;
      responseRate: number;
    } | null;
    error: string | null;
  }> {
    try {
      // Get listing counts and metrics
      const { data: listingStats, error: listingError } = await supabase
        .rpc('get_seller_listing_stats', { seller_id: sellerId });

      if (listingError) throw listingError;

      // Get seller rating
      const { data: ratingData, error: ratingError } = await supabase
        .from('seller_reviews')
        .select('rating')
        .eq('seller_id', sellerId);

      if (ratingError) throw ratingError;

      const averageRating = ratingData?.length > 0 
        ? ratingData.reduce((sum, review) => sum + review.rating, 0) / ratingData.length 
        : 0;

      return {
        data: {
          ...listingStats,
          averageRating,
          responseRate: 95 // TODO: Calculate from inquiry response times
        },
        error: null
      };

    } catch (error: any) {
      console.error('Error fetching seller stats:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }

  // Price tracking
  async updateListingPrice(listingId: string, newPrice: number, reason?: string): Promise<{
    error: string | null;
  }> {
    try {
      // Get current price for history
      const { data: currentListing } = await supabase
        .from('marketplace_listings')
        .select('price, seller_id')
        .eq('id', listingId)
        .single();

      if (currentListing) {
        // Add to price history
        await supabase
          .from('price_history')
          .insert({
            listing_id: listingId,
            price: newPrice,
            original_price: currentListing.price,
            change_reason: reason,
            changed_by: currentListing.seller_id
          });

        // Update listing price
        const { error } = await supabase
          .from('marketplace_listings')
          .update({ 
            price: newPrice, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', listingId);

        if (error) throw error;
      }

      return { error: null };

    } catch (error: any) {
      console.error('Error updating price:', error);
      return { error: error.message };
    }
  }

  // Advanced search with AI scoring
  async smartSearch(
    query: string, 
    userId?: string, 
    filters?: ListingFilters
  ): Promise<{
    data: ListingWithDetails[];
    suggestions: string[];
    facets: any;
    error: string | null;
  }> {
    try {
      // Perform the search
      const results = await this.getListings({
        ...filters,
        search: query
      });

      // Track the search
      if (query) {
        await this.trackSearch(query, userId, filters, results.count);
      }

      // Generate search suggestions (simplified)
      const suggestions = this.generateSearchSuggestions(query);

      // Generate facets for filtering
      const facets = await this.generateSearchFacets(results.data);

      return {
        data: results.data,
        suggestions,
        facets,
        error: results.error
      };

    } catch (error: any) {
      console.error('Error in smart search:', error);
      return {
        data: [],
        suggestions: [],
        facets: {},
        error: error.message
      };
    }
  }

  private generateSearchSuggestions(query: string): string[] {
    // Simplified suggestion generation
    const suggestions = [];
    const commonTerms = ['iphone', 'samsung', 'macbook', 'laptop', 'phone', 'tablet'];
    
    for (const term of commonTerms) {
      if (term.toLowerCase().includes(query.toLowerCase()) && term !== query.toLowerCase()) {
        suggestions.push(term);
      }
    }

    return suggestions.slice(0, 5);
  }

  private async generateSearchFacets(listings: ListingWithDetails[]): Promise<any> {
    const brands: Record<string, number> = {};
    const conditions: Record<string, number> = {};
    const priceRanges = { under10k: 0, '10k-20k': 0, '20k-50k': 0, over50k: 0 };
    const locations: Record<string, number> = {};

    listings.forEach(listing => {
      // Brands
      if (listing.brand) {
        brands[listing.brand] = (brands[listing.brand] || 0) + 1;
      }

      // Conditions
      if (listing.condition) {
        conditions[listing.condition] = (conditions[listing.condition] || 0) + 1;
      }

      // Price ranges
      const price = listing.price;
      if (price < 10000) priceRanges.under10k++;
      else if (price < 20000) priceRanges['10k-20k']++;
      else if (price < 50000) priceRanges['20k-50k']++;
      else priceRanges.over50k++;

      // Locations
      if (listing.location_province) {
        locations[listing.location_province] = (locations[listing.location_province] || 0) + 1;
      }
    });

    return {
      brands: Object.entries(brands).map(([name, count]) => ({ name, count })),
      conditions: Object.entries(conditions).map(([name, count]) => ({ name, count })),
      priceRanges,
      locations: Object.entries(locations).map(([name, count]) => ({ name, count }))
    };
  }
}

export const supabaseMarketplaceService = SupabaseMarketplaceService.getInstance();

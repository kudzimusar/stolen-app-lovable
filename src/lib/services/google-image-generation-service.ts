// Google AI Image Generation Service for Marketplace
interface DeviceImageRequest {
  category: string;
  title: string;
  brand?: string;
  model?: string;
  color?: string;
  condition?: string;
  size?: string;
}

interface GeneratedImage {
  url: string;
  alt: string;
  title: string;
}

export class GoogleImageGenerationService {
  private static instance: GoogleImageGenerationService;
  private apiKey: string;
  private cache: Map<string, string> = new Map();

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '';
  }

  public static getInstance(): GoogleImageGenerationService {
    if (!GoogleImageGenerationService.instance) {
      GoogleImageGenerationService.instance = new GoogleImageGenerationService();
    }
    return GoogleImageGenerationService.instance;
  }

  // Generate high-quality product images using Google's AI
  async generateDeviceImage(request: DeviceImageRequest): Promise<GeneratedImage> {
    const cacheKey = `${request.category}-${request.title}-${request.brand}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return {
        url: this.cache.get(cacheKey)!,
        alt: request.title,
        title: request.title
      };
    }

    try {
      // For now, we'll use realistic Unsplash images with proper device categories
      // In production, this would integrate with Google's Imagen API
      const imageUrl = await this.getRealisticDeviceImage(request);
      
      this.cache.set(cacheKey, imageUrl);
      
      return {
        url: imageUrl,
        alt: request.title,
        title: request.title
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      // Fallback to high-quality placeholder
      return this.getFallbackImage(request);
    }
  }

  // Get realistic device images from Unsplash with specific device searches
  private async getRealisticDeviceImage(request: DeviceImageRequest): Promise<string> {
    const { category, title, brand, model, color } = request;
    
    // Create specific search terms for realistic device images
    let searchTerm = '';
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('iphone')) {
      const generation = this.extractiPhoneGeneration(title);
      searchTerm = `iphone-${generation}-${color || 'black'}-product-photo`;
    } else if (lowerTitle.includes('macbook')) {
      const type = lowerTitle.includes('air') ? 'air' : 'pro';
      searchTerm = `macbook-${type}-laptop-product-photography`;
    } else if (lowerTitle.includes('galaxy')) {
      const model = this.extractGalaxyModel(title);
      searchTerm = `samsung-galaxy-${model}-smartphone-product`;
    } else if (lowerTitle.includes('pixel')) {
      const generation = this.extractPixelGeneration(title);
      searchTerm = `google-pixel-${generation}-phone-product-shot`;
    } else if (lowerTitle.includes('ipad')) {
      const type = lowerTitle.includes('pro') ? 'pro' : 'standard';
      searchTerm = `ipad-${type}-tablet-product-photography`;
    } else {
      // Generic category-based search
      switch (category) {
        case 'phones':
          searchTerm = 'smartphone-product-photography-studio-shot';
          break;
        case 'laptops':
          searchTerm = 'laptop-computer-product-photography-clean';
          break;
        case 'tablets':
          searchTerm = 'tablet-device-product-shot-minimal';
          break;
        case 'cameras':
          searchTerm = 'digital-camera-product-photography-professional';
          break;
        case 'consoles':
          searchTerm = 'gaming-console-product-shot-studio';
          break;
        case 'watches':
          searchTerm = 'smartwatch-product-photography-clean';
          break;
        default:
          searchTerm = 'electronic-device-product-photography';
      }
    }

    // Use Unsplash API for high-quality product images
    return `https://source.unsplash.com/800x600/?${searchTerm}&sig=${Math.random()}`;
  }

  // Extract iPhone generation from title
  private extractiPhoneGeneration(title: string): string {
    const match = title.match(/iphone\s*(\d+)/i);
    return match ? match[1] : '14';
  }

  // Extract Galaxy model from title
  private extractGalaxyModel(title: string): string {
    if (title.toLowerCase().includes('s24')) return 's24';
    if (title.toLowerCase().includes('s23')) return 's23';
    if (title.toLowerCase().includes('s22')) return 's22';
    return 's23';
  }

  // Extract Pixel generation from title
  private extractPixelGeneration(title: string): string {
    const match = title.match(/pixel\s*(\d+)/i);
    return match ? match[1] : '8';
  }

  // Fallback to high-quality placeholder images
  private getFallbackImage(request: DeviceImageRequest): GeneratedImage {
    const { category, title } = request;
    
    const fallbackUrls: Record<string, string> = {
      phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
      laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
      tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
      cameras: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
      consoles: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop',
      watches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
      accessories: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=600&fit=crop'
    };

    return {
      url: fallbackUrls[category] || fallbackUrls.phones,
      alt: title,
      title: title
    };
  }

  // Batch generate images for multiple devices
  async generateBatchImages(requests: DeviceImageRequest[]): Promise<GeneratedImage[]> {
    const promises = requests.map(request => this.generateDeviceImage(request));
    return Promise.all(promises);
  }

  // Generate specific images for marketplace listings
  async generateMarketplaceImages(): Promise<Record<string, string>> {
    const deviceRequests: DeviceImageRequest[] = [
      // iPhones
      { category: 'phones', title: 'iPhone 15 Pro Max 256GB', brand: 'Apple', model: '15 Pro Max', color: 'natural-titanium' },
      { category: 'phones', title: 'iPhone 14 Pro 128GB', brand: 'Apple', model: '14 Pro', color: 'deep-purple' },
      { category: 'phones', title: 'iPhone 13 Mini 128GB', brand: 'Apple', model: '13 Mini', color: 'blue' },
      
      // Samsung
      { category: 'phones', title: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', model: 'S24 Ultra', color: 'titanium-black' },
      { category: 'phones', title: 'Samsung Galaxy S23', brand: 'Samsung', model: 'S23', color: 'phantom-black' },
      { category: 'tablets', title: 'Samsung Galaxy Tab S9', brand: 'Samsung', model: 'Tab S9', color: 'graphite' },
      
      // Google
      { category: 'phones', title: 'Google Pixel 8 Pro 256GB', brand: 'Google', model: 'Pixel 8 Pro', color: 'obsidian' },
      { category: 'phones', title: 'Google Pixel 7', brand: 'Google', model: 'Pixel 7', color: 'snow' },
      
      // Apple Laptops
      { category: 'laptops', title: 'MacBook Pro M3 14-inch', brand: 'Apple', model: 'MacBook Pro', color: 'space-gray' },
      { category: 'laptops', title: 'MacBook Air M2 256GB', brand: 'Apple', model: 'MacBook Air', color: 'silver' },
      { category: 'laptops', title: 'MacBook Pro M3 16-inch', brand: 'Apple', model: 'MacBook Pro', color: 'space-black' },
      
      // Other Laptops
      { category: 'laptops', title: 'Dell XPS 13 i7', brand: 'Dell', model: 'XPS 13', color: 'silver' },
      { category: 'laptops', title: 'Lenovo ThinkPad X1 Carbon', brand: 'Lenovo', model: 'ThinkPad', color: 'black' },
      
      // Tablets
      { category: 'tablets', title: 'iPad Pro 12.9-inch M2', brand: 'Apple', model: 'iPad Pro', color: 'space-gray' },
      { category: 'tablets', title: 'iPad Air 5th Gen', brand: 'Apple', model: 'iPad Air', color: 'blue' },
      
      // Watches
      { category: 'watches', title: 'Apple Watch Series 9', brand: 'Apple', model: 'Series 9', color: 'midnight' },
      { category: 'watches', title: 'Samsung Galaxy Watch 6', brand: 'Samsung', model: 'Galaxy Watch', color: 'silver' },
      
      // Cameras
      { category: 'cameras', title: 'Canon EOS R6 Mark II', brand: 'Canon', model: 'EOS R6', color: 'black' },
      { category: 'cameras', title: 'Sony Alpha a7 IV', brand: 'Sony', model: 'Alpha a7', color: 'black' },
      { category: 'cameras', title: 'GoPro HERO12 Black', brand: 'GoPro', model: 'HERO12', color: 'black' },
      
      // Gaming
      { category: 'consoles', title: 'PlayStation 5', brand: 'Sony', model: 'PS5', color: 'white' },
      { category: 'consoles', title: 'Xbox Series X', brand: 'Microsoft', model: 'Series X', color: 'black' },
      { category: 'consoles', title: 'Nintendo Switch OLED', brand: 'Nintendo', model: 'Switch', color: 'neon' },
      
      // Accessories
      { category: 'accessories', title: 'AirPods Pro 2nd Gen', brand: 'Apple', model: 'AirPods Pro', color: 'white' },
      { category: 'accessories', title: 'Sony WH-1000XM5', brand: 'Sony', model: 'WH-1000XM5', color: 'black' }
    ];

    const generatedImages = await this.generateBatchImages(deviceRequests);
    
    const imageMap: Record<string, string> = {};
    deviceRequests.forEach((request, index) => {
      const key = this.createImageKey(request.title);
      imageMap[key] = generatedImages[index].url;
    });

    return imageMap;
  }

  // Create a standardized key for image mapping
  private createImageKey(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Generate thumbnail images (smaller versions)
  generateThumbnail(originalUrl: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
    const sizes = {
      sm: '320x240',
      md: '480x360', 
      lg: '640x480'
    };

    if (originalUrl.includes('unsplash.com')) {
      return originalUrl.replace(/w=\d+&h=\d+/, `w=${sizes[size].split('x')[0]}&h=${sizes[size].split('x')[1]}`);
    }

    return originalUrl;
  }

  // Generate product gallery images
  async generateProductGallery(deviceTitle: string, count: number = 4): Promise<string[]> {
    const request: DeviceImageRequest = {
      category: this.inferCategoryFromTitle(deviceTitle),
      title: deviceTitle
    };

    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      const image = await this.generateDeviceImage({
        ...request,
        title: `${deviceTitle} - View ${i + 1}`
      });
      urls.push(image.url);
    }

    return urls;
  }

  // Infer category from device title
  private inferCategoryFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('iphone') || lowerTitle.includes('galaxy') || lowerTitle.includes('pixel') || lowerTitle.includes('phone')) {
      return 'phones';
    }
    if (lowerTitle.includes('macbook') || lowerTitle.includes('laptop') || lowerTitle.includes('thinkpad')) {
      return 'laptops';
    }
    if (lowerTitle.includes('ipad') || lowerTitle.includes('tablet')) {
      return 'tablets';
    }
    if (lowerTitle.includes('watch')) {
      return 'watches';
    }
    if (lowerTitle.includes('camera') || lowerTitle.includes('canon') || lowerTitle.includes('sony') || lowerTitle.includes('gopro')) {
      return 'cameras';
    }
    if (lowerTitle.includes('playstation') || lowerTitle.includes('xbox') || lowerTitle.includes('nintendo') || lowerTitle.includes('console')) {
      return 'consoles';
    }
    
    return 'accessories';
  }
}

export const googleImageService = GoogleImageGenerationService.getInstance();

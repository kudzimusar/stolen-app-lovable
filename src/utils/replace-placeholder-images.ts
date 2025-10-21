// @ts-nocheck
import { googleImageService } from '@/lib/services/google-image-generation-service';

// Comprehensive image replacement mappings
export const DEVICE_IMAGE_MAPPINGS = {
  // iPhone Images
  'iphone-15-pro-max-256gb': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop&auto=format',
  'iphone-14-pro-128gb': 'https://images.unsplash.com/photo-1663436964999-4db06bbfb67e?w=800&h=600&fit=crop&auto=format',
  'iphone-13-mini-128gb': 'https://images.unsplash.com/photo-1632633173522-cd67e7afc72f?w=800&h=600&fit=crop&auto=format',
  'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&auto=format',
  
  // Samsung Images
  'samsung-galaxy-s24-ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop&auto=format',
  'samsung-galaxy-s23': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop&auto=format',
  'galaxy-s24': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop&auto=format',
  'galaxy-s23': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop&auto=format',
  
  // Google Pixel Images
  'google-pixel-8-pro-256gb': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&auto=format',
  'pixel': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&auto=format',
  
  // Laptop Images
  'macbook-pro-m3-14-inch': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&auto=format',
  'macbook-air-m2-256gb': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop&auto=format',
  'macbook-pro-m3-16-inch': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&auto=format',
  'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&auto=format',
  'dell-xps-13-i7': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop&auto=format',
  'lenovo-thinkpad-x1-carbon': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop&auto=format',
  
  // Tablet Images
  'ipad-pro-12-9-inch-m2': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&auto=format',
  'ipad-air-5th-gen': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop&auto=format',
  'samsung-galaxy-tab-s9': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop&auto=format',
  'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&auto=format',
  
  // Watch Images
  'apple-watch-series-9': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&auto=format',
  'samsung-galaxy-watch-6': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=600&fit=crop&auto=format',
  'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&auto=format',
  
  // Camera Images
  'canon-eos-r6-mark-ii': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&auto=format',
  'sony-alpha-a7-iv': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop&auto=format',
  'gopro-hero12-black': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&auto=format',
  'camera': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&auto=format',
  
  // Gaming Console Images
  'playstation-5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop&auto=format',
  'xbox-series-x': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&h=600&fit=crop&auto=format',
  'nintendo-switch-oled': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
  'console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop&auto=format',
  
  // Accessories Images
  'airpods-pro-2nd-gen': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=600&fit=crop&auto=format',
  'sony-wh-1000xm5': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&auto=format',
  'accessories': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=600&fit=crop&auto=format',
  
  // Product Gallery Images
  'image-1': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&auto=format',
  'image-2': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&auto=format&sig=1',
  'image-3': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&auto=format&sig=2',
  
  // Related Product Images
  'related-1': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format',
  'related-2': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&auto=format',
  'related-3': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&auto=format',
  'related-4': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&auto=format',
  'related-5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&auto=format',
  
  // AI Recommendations Images
  'iphone+14+pro': 'https://images.unsplash.com/photo-1663436964999-4db06bbfb67e?w=320&h=220&fit=crop&auto=format',
  'galaxy+s23': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=320&h=220&fit=crop&auto=format',
  'macbook+air': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=320&h=220&fit=crop&auto=format',
  'perfect+match': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=220&fit=crop&auto=format',
  
  // Buyer Insights Images
  'iphone': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop&auto=format',
  'macbook': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop&auto=format',
  'galaxy': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&h=100&fit=crop&auto=format',
  'pixel': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=150&h=100&fit=crop&auto=format',
  
  // Generic fallbacks with different variations
  'device': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=320&h=220&fit=crop&auto=format',
  'unknown': 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=320&h=220&fit=crop&auto=format'
};

// Different image sizes for different use cases
export const IMAGE_SIZES = {
  thumbnail: { width: 320, height: 220 },
  medium: { width: 480, height: 360 },
  large: { width: 800, height: 600 },
  gallery: { width: 800, height: 600 },
  avatar: { width: 100, height: 100 },
  banner: { width: 1200, height: 400 }
};

// Function to get the appropriate image URL based on content
export function getDeviceImageUrl(
  content: string, 
  size: keyof typeof IMAGE_SIZES = 'medium',
  category?: string
): string {
  // Extract text parameter from placeholder URLs
  const textMatch = content.match(/text=([^&]+)/);
  const placeholderText = textMatch ? textMatch[1].toLowerCase() : '';
  
  // Create a search key from the placeholder text or content
  const searchKey = placeholderText || content.toLowerCase()
    .replace(/[^a-z0-9\s+]/g, '')
    .replace(/\s+/g, '+')
    .replace(/\++/g, '+')
    .trim();

  // Find the best matching image
  let imageUrl = DEVICE_IMAGE_MAPPINGS[searchKey as keyof typeof DEVICE_IMAGE_MAPPINGS];
  
  // Fallback to category-based images
  if (!imageUrl && category) {
    imageUrl = DEVICE_IMAGE_MAPPINGS[category as keyof typeof DEVICE_IMAGE_MAPPINGS];
  }
  
  // Final fallback to generic device image
  if (!imageUrl) {
    imageUrl = DEVICE_IMAGE_MAPPINGS.device;
  }
  
  // Adjust image size parameters
  const targetSize = IMAGE_SIZES[size];
  if (imageUrl.includes('unsplash.com')) {
    imageUrl = imageUrl.replace(/w=\d+&h=\d+/, `w=${targetSize.width}&h=${targetSize.height}`);
  }
  
  return imageUrl;
}

// Function to replace placeholder images in text content
export function replacePlaceholderImages(content: string): string {
  // Replace placehold.co URLs
  content = content.replace(
    /https:\/\/placehold\.co\/(\d+)x(\d+)\?text=([^"'\s&]+)/g,
    (match, width, height, text) => {
      const decodedText = decodeURIComponent(text.replace(/\+/g, ' '));
      return getDeviceImageUrl(decodedText, 'medium');
    }
  );
  
  // Replace other placeholder patterns
  content = content.replace(
    /"https:\/\/placehold\.co\/[^"]+"/g,
    (match) => {
      const url = match.slice(1, -1); // Remove quotes
      const textMatch = url.match(/text=([^&]+)/);
      const text = textMatch ? textMatch[1] : 'device';
      return `"${getDeviceImageUrl(text)}"`;
    }
  );
  
  return content;
}

// Batch replace images for the entire marketplace
export async function replaceAllMarketplaceImages(): Promise<void> {
  console.log('🖼️ Starting comprehensive image replacement...');
  
  // Generate all marketplace images
  const imageMap = await googleImageService.generateMarketplaceImages();
  
  // Update the mappings with generated images
  Object.assign(DEVICE_IMAGE_MAPPINGS, imageMap);
  
  console.log('✅ Image replacement complete! Generated', Object.keys(imageMap).length, 'new images');
}

// Get a random variation of an image to avoid repetition
export function getImageVariation(baseUrl: string, variation: number = 1): string {
  if (baseUrl.includes('unsplash.com')) {
    return baseUrl + `&sig=${variation}`;
  }
  return baseUrl;
}

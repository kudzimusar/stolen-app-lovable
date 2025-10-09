/**
 * Stability Control Utility
 * Prevents race conditions and ensures consistent behavior
 */

// Track initialization state
let isInitialized = false;
const initPromises = new Map<string, Promise<any>>();

/**
 * Ensure a function runs only once globally
 */
export function runOnce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (initPromises.has(key)) {
    return initPromises.get(key)!;
  }
  
  const promise = fn();
  initPromises.set(key, promise);
  
  return promise;
}

/**
 * Debounce function calls to prevent rapid repeated execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safe localStorage wrapper with error handling
 */
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
      return false;
    }
  },
  
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      return false;
    }
  },
  
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('localStorage.clear failed:', error);
      return false;
    }
  }
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Check if app is initialized
 */
export function isAppInitialized(): boolean {
  return isInitialized;
}

/**
 * Mark app as initialized
 */
export function markAppInitialized(): void {
  isInitialized = true;
  console.log('✅ App initialization complete');
}

/**
 * Reset initialization state (for testing)
 */
export function resetInitialization(): void {
  isInitialized = false;
  initPromises.clear();
}


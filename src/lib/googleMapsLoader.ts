// Google Maps Script Loader
let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded) {
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (isLoading) {
      const checkInterval = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Start loading
    isLoading = true;

    // Get API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Temporarily disable Google Maps to use OpenStreetMap fallback
    // Google Maps requires billing to be enabled in Google Cloud Console
    if (!apiKey || true) { // Force fallback for now
      console.log('Using OpenStreetMap fallback (Google Maps requires billing setup)');
      isLoading = false;
      reject(new Error('Google Maps disabled - using OpenStreetMap'));
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && typeof window !== 'undefined' && window.google && window.google.maps;
};

// Google Maps Configuration for STOLEN Platform
// Free Tier API Keys - $200 credit/month

export const googleMapsConfig = {
  // Google Maps API Key (Paid Tier)
  apiKey: 'AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc',
  
  // Google Places API Key (Same key, different service)
  placesApiKey: 'AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc',
  
  // Google Geocoding API Key (Same key, different service)
  geocodingApiKey: 'AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc',
  
  // Google Cloud Project ID
  projectId: 'stolen-platform-123456',
  
  // South African Configuration
  southAfrica: {
    center: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    defaultZoom: 10,
    bounds: {
      north: -22.0,
      south: -35.0,
      east: 33.0,
      west: 16.0
    },
    provinces: [
      'Gauteng',
      'Western Cape',
      'KwaZulu-Natal',
      'Eastern Cape',
      'Mpumalanga',
      'Limpopo',
      'North West',
      'Free State',
      'Northern Cape'
    ]
  },
  
  // Map Styles for South Africa
  mapStyles: {
    default: [
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ visibility: 'simplified' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ],
    dark: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
      }
    ]
  },
  
  // Places API Configuration
  places: {
    types: ['establishment', 'geocode'],
    componentRestrictions: { country: 'za' },
    fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
    sessionToken: null
  },
  
  // Geocoding Configuration
  geocoding: {
    region: 'za',
    language: 'en',
    bounds: {
      north: -22.0,
      south: -35.0,
      east: 33.0,
      west: 16.0
    }
  },
  
  // Custom Markers for STOLEN Platform
  markers: {
    device: {
      url: '/markers/device-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    },
    stolen: {
      url: '/markers/stolen-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    },
    found: {
      url: '/markers/found-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    },
    police: {
      url: '/markers/police-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    },
    repair: {
      url: '/markers/repair-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    }
  },
  
  // Heatmap Configuration
  heatmap: {
    radius: 20,
    opacity: 0.6,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ]
  },
  
  // Clustering Configuration
  clustering: {
    gridSize: 50,
    maxZoom: 15,
    styles: [
      {
        url: '/markers/cluster-1.png',
        width: 53,
        height: 53,
        textColor: '#ffffff',
        textSize: 12
      },
      {
        url: '/markers/cluster-2.png',
        width: 56,
        height: 56,
        textColor: '#ffffff',
        textSize: 13
      },
      {
        url: '/markers/cluster-3.png',
        width: 66,
        height: 66,
        textColor: '#ffffff',
        textSize: 14
      }
    ]
  },
  
  // Directions Service Configuration
  directions: {
    travelMode: 'DRIVING',
    unitSystem: 'METRIC',
    avoidHighways: false,
    avoidTolls: false,
    optimizeWaypoints: true
  },
  
  // Street View Configuration
  streetView: {
    position: null,
    pov: {
      heading: 34,
      pitch: 10
    },
    zoom: 1,
    addressControl: true,
    addressControlOptions: {
      position: 'TOP_LEFT'
    },
    clickToGo: true,
    disableDefaultUI: false,
    enableCloseButton: true,
    fullscreenControl: true,
    imageDateControl: false,
    motionTracking: false,
    motionTrackingControl: false,
    panControl: true,
    scrollwheel: true,
    visible: true,
    zoomControl: true
  }
};

// South African Cities with Coordinates
export const saCities = {
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  capeTown: { lat: -33.9249, lng: 18.4241 },
  durban: { lat: -29.8587, lng: 31.0218 },
  pretoria: { lat: -25.7479, lng: 28.2293 },
  portElizabeth: { lat: -33.7139, lng: 25.5207 },
  bloemfontein: { lat: -29.0852, lng: 26.1596 },
  nelspruit: { lat: -25.4753, lng: 30.9694 },
  polokwane: { lat: -23.9045, lng: 29.4698 },
  kimberley: { lat: -28.7282, lng: 24.7499 },
  eastLondon: { lat: -33.0292, lng: 27.8546 }
};

// South African Provinces with Boundaries
export const saProvinces = {
  gauteng: {
    name: 'Gauteng',
    center: { lat: -26.2041, lng: 28.0473 },
    bounds: {
      north: -25.0,
      south: -27.0,
      east: 29.0,
      west: 27.0
    }
  },
  westernCape: {
    name: 'Western Cape',
    center: { lat: -33.9249, lng: 18.4241 },
    bounds: {
      north: -31.0,
      south: -35.0,
      east: 20.0,
      west: 16.0
    }
  },
  kwazuluNatal: {
    name: 'KwaZulu-Natal',
    center: { lat: -29.8587, lng: 31.0218 },
    bounds: {
      north: -27.0,
      south: -31.0,
      east: 33.0,
      west: 29.0
    }
  }
};

export default googleMapsConfig;

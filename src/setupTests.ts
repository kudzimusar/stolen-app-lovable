import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from '@jest/globals';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock window.URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock window.URL.revokeObjectURL
Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as Storage;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock as Storage;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  })),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  Link: ({ children, ...props }: any) => {
    return React.createElement('a', props, children);
  },
  Navigate: ({ to }: any) => {
    return React.createElement('div', { 'data-testid': 'navigate', 'data-to': to });
  },
}));

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
  })),
  icon: jest.fn(),
}));

// Mock Fuse.js
jest.mock('fuse.js', () => {
  return jest.fn().mockImplementation(() => ({
    search: jest.fn(() => []),
  }));
});

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date) => date.toISOString()),
  parseISO: jest.fn((date) => new Date(date)),
  isToday: jest.fn(() => false),
  isYesterday: jest.fn(() => false),
  differenceInDays: jest.fn(() => 0),
}));

// Mock recharts
jest.mock('recharts', () => {
  return {
    LineChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'line-chart' }, children),
    Line: ({ children }: any) => React.createElement('div', { 'data-testid': 'line' }, children),
    XAxis: ({ children }: any) => React.createElement('div', { 'data-testid': 'x-axis' }, children),
    YAxis: ({ children }: any) => React.createElement('div', { 'data-testid': 'y-axis' }, children),
    CartesianGrid: ({ children }: any) => React.createElement('div', { 'data-testid': 'cartesian-grid' }, children),
    Tooltip: ({ children }: any) => React.createElement('div', { 'data-testid': 'tooltip' }, children),
    ResponsiveContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  };
});

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock fingerprintjs
jest.mock('@fingerprintjs/fingerprintjs', () => ({
  load: jest.fn(() => Promise.resolve({
    get: jest.fn(() => Promise.resolve('mock-fingerprint')),
  })),
}));

// Mock react-google-recaptcha-v3
jest.mock('react-google-recaptcha-v3', () => {
  return {
    GoogleReCaptchaProvider: ({ children }: any) => React.createElement('div', { 'data-testid': 'recaptcha-provider' }, children),
    useGoogleReCaptcha: () => ({
      executeRecaptcha: jest.fn(() => Promise.resolve('mock-token')),
    }),
  };
});

// Mock papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn(),
  unparse: jest.fn(),
}));

// Mock input-otp
jest.mock('input-otp', () => {
  return {
    InputOTP: ({ children }: any) => React.createElement('div', { 'data-testid': 'input-otp' }, children),
    InputOTPGroup: ({ children }: any) => React.createElement('div', { 'data-testid': 'input-otp-group' }, children),
    InputOTPSlot: ({ children }: any) => React.createElement('div', { 'data-testid': 'input-otp-slot' }, children),
  };
});

// Mock embla-carousel-react
jest.mock('embla-carousel-react', () => ({
  useEmblaCarousel: () => ([
    jest.fn(),
    {
      scrollNext: jest.fn(),
      scrollPrev: jest.fn(),
      scrollTo: jest.fn(),
      canScrollNext: true,
      canScrollPrev: true,
    },
  ]),
}));

// Mock react-day-picker
jest.mock('react-day-picker', () => {
  return {
    DayPicker: ({ children }: any) => React.createElement('div', { 'data-testid': 'day-picker' }, children),
    useNavigation: () => ({
      goToMonth: jest.fn(),
      goToDate: jest.fn(),
      goToPreviousMonth: jest.fn(),
      goToNextMonth: jest.fn(),
    }),
  };
});

// Mock react-resizable-panels
jest.mock('react-resizable-panels', () => {
  return {
    Panel: ({ children }: any) => React.createElement('div', { 'data-testid': 'panel' }, children),
    PanelGroup: ({ children }: any) => React.createElement('div', { 'data-testid': 'panel-group' }, children),
    PanelResizeHandle: ({ children }: any) => React.createElement('div', { 'data-testid': 'panel-resize-handle' }, children),
  };
});

// Mock vaul
jest.mock('vaul', () => {
  return {
    Drawer: ({ children }: any) => React.createElement('div', { 'data-testid': 'drawer' }, children),
  };
});

// Mock cmdk
jest.mock('cmdk', () => {
  return {
    Command: ({ children }: any) => React.createElement('div', { 'data-testid': 'command' }, children),
    CommandInput: ({ children }: any) => React.createElement('div', { 'data-testid': 'command-input' }, children),
    CommandList: ({ children }: any) => React.createElement('div', { 'data-testid': 'command-list' }, children),
    CommandEmpty: ({ children }: any) => React.createElement('div', { 'data-testid': 'command-empty' }, children),
    CommandGroup: ({ children }: any) => React.createElement('div', { 'data-testid': 'command-group' }, children),
    CommandItem: ({ children }: any) => React.createElement('div', { 'data-testid': 'command-item' }, children),
    CommandSeparator: ({ children }: any) => React.createElement('div', { 'data-testid': 'command-separator' }, children),
  };
});

// Mock next-themes
jest.mock('next-themes', () => {
  return {
    useTheme: () => ({
      theme: 'light',
      setTheme: jest.fn(),
      themes: ['light', 'dark'],
    }),
    ThemeProvider: ({ children }: any) => React.createElement('div', { 'data-testid': 'theme-provider' }, children),
  };
});

// Mock class-variance-authority
jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => jest.fn()),
}));

// Mock clsx
jest.mock('clsx', () => ({
  clsx: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock tailwind-merge
jest.mock('tailwind-merge', () => ({
  twMerge: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock lucide-react
jest.mock('lucide-react', () => {
  return {
    Search: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'search-icon', ...props }, children),
    Menu: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'menu-icon', ...props }, children),
    User: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'user-icon', ...props }, children),
    Settings: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'settings-icon', ...props }, children),
    Home: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'home-icon', ...props }, children),
  };
});

// Mock tailwindcss-animate
jest.mock('tailwindcss-animate', () => ({}));

// Mock @tailwindcss/typography
jest.mock('@tailwindcss/typography', () => ({}));

// Mock lovable-tagger
jest.mock('lovable-tagger', () => ({
  // Add specific mocks as needed
}));

// Export for use in tests
export {};
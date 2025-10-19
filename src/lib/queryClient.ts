// @ts-nocheck
import { QueryClient } from '@tanstack/react-query';

// HMR-safe singleton
let queryClientInstance = import.meta.hot?.data.queryClient || null;

if (!queryClientInstance) {
  console.log('🔧 Creating new QueryClient');
  queryClientInstance = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000, // 1 minute
        gcTime: 300000, // 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Prevent auto-refetch on mount
        refetchOnReconnect: false,
        retry: 1, // Only retry once on failure
      },
      mutations: {
        retry: 1,
      }
    }
  });
  
  if (import.meta.hot) {
    import.meta.hot.data.queryClient = queryClientInstance;
  }
  console.log('✅ QueryClient created');
} else {
  console.log('♻️ Reusing existing QueryClient');
}

// HMR disposal
if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    console.log('🔥 HMR: Preserving QueryClient');
    data.queryClient = queryClientInstance;
  });
}

export const queryClient = queryClientInstance;




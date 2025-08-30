// Centralized environment configuration
interface AppConfig {
  apiKey: string;
  apiUrl: string;
  environment: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  webhookUrl?: string;
  blockchain: {
    ethereumRpcUrl: string;
    polygonRpcUrl: string;
    bscRpcUrl: string;
    ethereumContractAddress: string;
    polygonContractAddress: string;
    bscContractAddress: string;
  };
  performance: {
    algoliaAppId: string;
    algoliaSearchKey: string;
    sentryDsn: string;
  };
}

export const config: AppConfig = {
  apiKey: import.meta.env.VITE_API_KEY || 'demo-key',
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.stolen.com',
  environment: import.meta.env.MODE || 'development',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL,
  blockchain: {
    ethereumRpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/demo',
    polygonRpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    bscRpcUrl: import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    ethereumContractAddress: import.meta.env.VITE_ETHEREUM_DEVICE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
    polygonContractAddress: import.meta.env.VITE_POLYGON_DEVICE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
    bscContractAddress: import.meta.env.VITE_BSC_DEVICE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'
  },
  performance: {
    algoliaAppId: import.meta.env.VITE_ALGOLIA_APP_ID || 'your-app-id',
    algoliaSearchKey: import.meta.env.VITE_ALGOLIA_SEARCH_KEY || 'your-search-key',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || 'your-sentry-dsn'
  }
};

export default config;

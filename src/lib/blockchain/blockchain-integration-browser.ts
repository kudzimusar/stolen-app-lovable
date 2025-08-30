// Browser-safe version of blockchain integration
// This provides mock implementations for browser environments

export interface BlockchainConfig {
  ethereum: {
    rpcUrl: string;
    contractAddress: string;
  };
  polygon: {
    rpcUrl: string;
    contractAddress: string;
  };
  bsc: {
    rpcUrl: string;
    contractAddress: string;
  };
}

export interface DeviceRegistration {
  deviceId: string;
  owner: string;
  timestamp: number;
  hash: string;
}

export interface VerificationResult {
  verified: boolean;
  owner?: string;
  registrationDate?: Date;
  hash?: string;
}

class BrowserBlockchainManager {
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    console.log('🌐 Using browser-safe blockchain manager');
  }

  // Mock implementations for browser environment
  async registerDevice(deviceId: string, owner: string): Promise<DeviceRegistration> {
    console.log('🔗 Mock: Registering device on blockchain', { deviceId, owner });
    
    return {
      deviceId,
      owner,
      timestamp: Date.now(),
      hash: `0x${deviceId}${Date.now().toString(16)}`
    };
  }

  async verifyDevice(deviceId: string): Promise<VerificationResult> {
    console.log('🔍 Mock: Verifying device on blockchain', { deviceId });
    
    // Simulate verification with 90% success rate
    const verified = Math.random() > 0.1;
    
    if (verified) {
      return {
        verified: true,
        owner: `0x${Math.random().toString(16).substr(2, 40)}`,
        registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        hash: `0x${deviceId}${Date.now().toString(16)}`
      };
    }
    
    return {
      verified: false
    };
  }

  async getDeviceHistory(deviceId: string): Promise<DeviceRegistration[]> {
    console.log('📜 Mock: Getting device history', { deviceId });
    
    return [
      {
        deviceId,
        owner: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: Date.now() - 86400000, // 1 day ago
        hash: `0x${deviceId}${Date.now().toString(16)}`
      }
    ];
  }

  async transferOwnership(deviceId: string, fromOwner: string, toOwner: string): Promise<boolean> {
    console.log('🔄 Mock: Transferring ownership', { deviceId, fromOwner, toOwner });
    return true;
  }
}

class BrowserSmartContractFactory {
  static createDeviceRegistry(config: BlockchainConfig): BrowserBlockchainManager {
    return new BrowserBlockchainManager(config);
  }
}

// Export singleton instance with browser-safe config
export const blockchainManager = BrowserSmartContractFactory.createDeviceRegistry({
  ethereum: {
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/demo',
    contractAddress: import.meta.env.VITE_ETHEREUM_DEVICE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'
  },
  polygon: {
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    contractAddress: import.meta.env.VITE_POLYGON_DEVICE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'
  },
  bsc: {
    rpcUrl: import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    contractAddress: import.meta.env.VITE_BSC_DEVICE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'
  }
});

export default blockchainManager;

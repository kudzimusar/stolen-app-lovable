// Free Blockchain Service using Public RPC Endpoints
// Alternative to paid blockchain services like Infura

export interface BlockchainConfig {
  network: 'ethereum' | 'polygon' | 'bsc' | 'local';
  rpcUrl: string;
  chainId: number;
  currency: string;
  blockTime: number;
  gasLimit: number;
  gasPrice: number;
}

export interface TransactionData {
  to: string;
  value: string;
  data?: string;
  gasLimit?: number;
  gasPrice?: number;
  nonce?: number;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  blockNumber?: number;
  gasUsed?: number;
  cost?: string;
  error?: string;
}

export interface DeviceRegistration {
  deviceId: string;
  owner: string;
  serialNumber: string;
  brand: string;
  model: string;
  purchaseDate: string;
  price: number;
  blockchainHash: string;
}

export class FreeBlockchainService {
  private config: BlockchainConfig;
  private web3: any; // Web3 instance
  
  constructor() {
    this.config = {
      network: 'ethereum',
      rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/demo',
      chainId: 5, // Goerli testnet
      currency: 'ETH',
      blockTime: 12,
      gasLimit: 21000,
      gasPrice: 20000000000 // 20 gwei
    };
  }
  
  // Initialize Web3 connection
  async initialize(): Promise<boolean> {
    try {
      // Use public RPC endpoints
      const publicRPCs = {
        ethereum: [
          'https://eth-goerli.g.alchemy.com/v2/demo',
          'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          'https://rpc.goerli.mudit.blog'
        ],
        polygon: [
          'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          'https://rpc-mumbai.maticvigil.com'
        ],
        bsc: [
          'https://data-seed-prebsc-1-s1.binance.org:8545',
          'https://data-seed-prebsc-2-s1.binance.org:8545'
        ]
      };
      
      // Try different RPC endpoints
      const rpcUrls = publicRPCs[this.config.network as keyof typeof publicRPCs] || [];
      
      for (const rpcUrl of rpcUrls) {
        try {
          this.config.rpcUrl = rpcUrl;
          // Initialize Web3 (in production, import Web3 from 'web3')
          // this.web3 = new Web3(rpcUrl);
          
          // Test connection
          const isConnected = await this.testConnection();
          if (isConnected) {
            console.log(`Connected to ${this.config.network} via ${rpcUrl}`);
            return true;
          }
        } catch (error) {
          console.warn(`Failed to connect to ${rpcUrl}:`, error);
          continue;
        }
      }
      
      throw new Error('Failed to connect to any RPC endpoint');
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      return false;
    }
  }
  
  // Test blockchain connection
  async testConnection(): Promise<boolean> {
    try {
      // Simulate connection test
      const response = await fetch(this.config.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.result !== undefined;
      }
      
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
  
  // Register device on blockchain
  async registerDevice(deviceData: DeviceRegistration): Promise<TransactionResult> {
    try {
      // Create device registration transaction
      const transactionData: TransactionData = {
        to: this.getDeviceRegistryAddress(),
        value: '0',
        data: this.encodeDeviceRegistration(deviceData),
        gasLimit: 200000,
        gasPrice: this.config.gasPrice
      };
      
      // Simulate transaction (in production, use Web3)
      const mockHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockBlockNumber = Math.floor(Math.random() * 1000000);
      
      return {
        success: true,
        hash: mockHash,
        blockNumber: mockBlockNumber,
        gasUsed: 150000,
        cost: '0.003 ETH'
      };
    } catch (error) {
      console.error('Device registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }
  
  // Verify device ownership
  async verifyDeviceOwnership(deviceId: string, owner: string): Promise<boolean> {
    try {
      // Query blockchain for device ownership
      const deviceData = await this.getDeviceData(deviceId);
      
      if (deviceData && deviceData.owner.toLowerCase() === owner.toLowerCase()) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ownership verification failed:', error);
      return false;
    }
  }
  
  // Transfer device ownership
  async transferDeviceOwnership(deviceId: string, fromOwner: string, toOwner: string): Promise<TransactionResult> {
    try {
      // Verify current ownership
      const isOwner = await this.verifyDeviceOwnership(deviceId, fromOwner);
      if (!isOwner) {
        throw new Error('Not the current owner of this device');
      }
      
      // Create transfer transaction
      const transactionData: TransactionData = {
        to: this.getDeviceRegistryAddress(),
        value: '0',
        data: this.encodeTransferOwnership(deviceId, toOwner),
        gasLimit: 150000,
        gasPrice: this.config.gasPrice
      };
      
      // Simulate transaction
      const mockHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockBlockNumber = Math.floor(Math.random() * 1000000);
      
      return {
        success: true,
        hash: mockHash,
        blockNumber: mockBlockNumber,
        gasUsed: 120000,
        cost: '0.0024 ETH'
      };
    } catch (error) {
      console.error('Ownership transfer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }
  
  // Get device data from blockchain
  async getDeviceData(deviceId: string): Promise<DeviceRegistration | null> {
    try {
      // Query blockchain for device data
      // In production, this would call the smart contract
      
      // Mock device data for testing
      const mockDeviceData: DeviceRegistration = {
        deviceId,
        owner: '0x1234567890abcdef1234567890abcdef12345678',
        serialNumber: 'ABC123DEF456',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        purchaseDate: '2024-01-15',
        price: 25000,
        blockchainHash: `0x${deviceId}${Date.now().toString(16)}`
      };
      
      return mockDeviceData;
    } catch (error) {
      console.error('Failed to get device data:', error);
      return null;
    }
  }
  
  // Get transaction history for device
  async getDeviceTransactionHistory(deviceId: string): Promise<any[]> {
    try {
      // Query blockchain for device transaction history
      // In production, this would query events from the smart contract
      
      // Mock transaction history
      const mockHistory = [
        {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: Date.now() - 86400000, // 1 day ago
          type: 'registration',
          from: '0x0000000000000000000000000000000000000000',
          to: '0x1234567890abcdef1234567890abcdef12345678',
          gasUsed: 150000,
          cost: '0.003 ETH'
        },
        {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: Date.now() - 172800000, // 2 days ago
          type: 'transfer',
          from: '0x1234567890abcdef1234567890abcdef12345678',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          gasUsed: 120000,
          cost: '0.0024 ETH'
        }
      ];
      
      return mockHistory;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }
  
  // Get current gas price
  async getGasPrice(): Promise<string> {
    try {
      // Query current gas price from network
      const response = await fetch(this.config.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const gasPrice = parseInt(data.result, 16);
        return `${gasPrice / 1000000000} gwei`;
      }
      
      return '20 gwei'; // Default fallback
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return '20 gwei';
    }
  }
  
  // Get network status
  async getNetworkStatus(): Promise<any> {
    try {
      const response = await fetch(this.config.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const blockNumber = parseInt(data.result, 16);
        
        return {
          network: this.config.network,
          chainId: this.config.chainId,
          blockNumber,
          currency: this.config.currency,
          status: 'connected'
        };
      }
      
      return {
        network: this.config.network,
        status: 'disconnected'
      };
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        network: this.config.network,
        status: 'error'
      };
    }
  }
  
  // Helper methods for smart contract interaction
  private getDeviceRegistryAddress(): string {
    const addresses = {
      ethereum: '0x1234567890123456789012345678901234567890',
      polygon: '0xabcdef1234567890abcdef1234567890abcdef12',
      bsc: '0x9876543210987654321098765432109876543210'
    };
    
    return addresses[this.config.network as keyof typeof addresses] || addresses.ethereum;
  }
  
  private encodeDeviceRegistration(deviceData: DeviceRegistration): string {
    // In production, this would encode the function call using Web3
    return `0x${deviceData.deviceId}${deviceData.owner}${deviceData.serialNumber}`;
  }
  
  private encodeTransferOwnership(deviceId: string, newOwner: string): string {
    // In production, this would encode the function call using Web3
    return `0x${deviceId}${newOwner}`;
  }
  
  // Update blockchain configuration
  updateConfig(newConfig: Partial<BlockchainConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Switch network
  async switchNetwork(network: 'ethereum' | 'polygon' | 'bsc' | 'local'): Promise<boolean> {
    const networkConfigs = {
      ethereum: {
        rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/demo',
        chainId: 5,
        currency: 'ETH'
      },
      polygon: {
        rpcUrl: 'https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        chainId: 80001,
        currency: 'MATIC'
      },
      bsc: {
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        chainId: 97,
        currency: 'BNB'
      },
      local: {
        rpcUrl: 'http://localhost:8545',
        chainId: 1337,
        currency: 'ETH'
      }
    };
    
    const newConfig = networkConfigs[network];
    if (newConfig) {
      this.config = { ...this.config, ...newConfig, network };
      return await this.initialize();
    }
    
    return false;
  }
}

// Export singleton instance
export const freeBlockchainService = new FreeBlockchainService();

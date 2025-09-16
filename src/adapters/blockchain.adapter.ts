// Blockchain Adapter Pattern
export interface DeviceRegistration {
  deviceId: string;
  owner: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface DeviceHistoryEntry {
  deviceId: string;
  action: 'register' | 'transfer' | 'verify';
  fromOwner?: string;
  toOwner?: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface BlockchainAdapter {
  verifyDevice(deviceId: string): Promise<boolean>;
  registerDevice(deviceId: string, owner: string): Promise<DeviceRegistration>;
  getDeviceHistory(deviceId: string): Promise<DeviceHistoryEntry[]>;
  transferOwnership(deviceId: string, fromOwner: string, toOwner: string): Promise<boolean>;
}

// Browser implementation
export class BrowserBlockchainAdapter implements BlockchainAdapter {
  async verifyDevice(deviceId: string): Promise<boolean> {
    console.log(`[Browser] Verifying device: ${deviceId}`);
    // Mock implementation for browser
    return Math.random() > 0.1; // 90% success rate
  }

  async registerDevice(deviceId: string, owner: string): Promise<DeviceRegistration> {
    console.log(`[Browser] Registering device: ${deviceId} for owner: ${owner}`);
    return {
      deviceId,
      owner,
      timestamp: Date.now(),
      transactionHash: `0x${deviceId}${Date.now().toString(16)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  }

  async getDeviceHistory(deviceId: string): Promise<DeviceHistoryEntry[]> {
    console.log(`[Browser] Getting device history: ${deviceId}`);
    return [
      {
        deviceId,
        action: 'register',
        toOwner: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: Date.now() - 86400000,
        transactionHash: `0x${deviceId}${Date.now().toString(16)}`,
        blockNumber: Math.floor(Math.random() * 1000000)
      }
    ];
  }

  async transferOwnership(deviceId: string, fromOwner: string, toOwner: string): Promise<boolean> {
    console.log(`[Browser] Transferring ownership: ${deviceId} from ${fromOwner} to ${toOwner}`);
    return true;
  }
}

// Server implementation (for future use)
export class ServerBlockchainAdapter implements BlockchainAdapter {
  async verifyDevice(deviceId: string): Promise<boolean> {
    // Real ethers.js implementation would go here
    console.log(`[Server] Verifying device: ${deviceId}`);
    return true;
  }

  async registerDevice(deviceId: string, owner: string): Promise<DeviceRegistration> {
    console.log(`[Server] Registering device: ${deviceId} for owner: ${owner}`);
    return { 
      deviceId, 
      owner, 
      timestamp: Date.now(),
      transactionHash: `0x${deviceId}${Date.now().toString(16)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  }

  async getDeviceHistory(deviceId: string): Promise<DeviceHistoryEntry[]> {
    console.log(`[Server] Getting device history: ${deviceId}`);
    return [];
  }

  async transferOwnership(deviceId: string, fromOwner: string, toOwner: string): Promise<boolean> {
    console.log(`[Server] Transferring ownership: ${deviceId} from ${fromOwner} to ${toOwner}`);
    return true;
  }
}

// Factory
export const createBlockchainAdapter = (): BlockchainAdapter => {
  return new BrowserBlockchainAdapter();
};

export default createBlockchainAdapter();

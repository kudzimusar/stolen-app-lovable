// Blockchain Adapter Pattern
export interface BlockchainAdapter {
  verifyDevice(deviceId: string): Promise<boolean>;
  registerDevice(deviceId: string, owner: string): Promise<any>;
  getDeviceHistory(deviceId: string): Promise<any[]>;
  transferOwnership(deviceId: string, fromOwner: string, toOwner: string): Promise<boolean>;
}

// Browser implementation
export class BrowserBlockchainAdapter implements BlockchainAdapter {
  async verifyDevice(deviceId: string): Promise<boolean> {
    console.log(`[Browser] Verifying device: ${deviceId}`);
    // Mock implementation for browser
    return Math.random() > 0.1; // 90% success rate
  }

  async registerDevice(deviceId: string, owner: string): Promise<any> {
    console.log(`[Browser] Registering device: ${deviceId} for owner: ${owner}`);
    return {
      deviceId,
      owner,
      timestamp: Date.now(),
      hash: `0x${deviceId}${Date.now().toString(16)}`
    };
  }

  async getDeviceHistory(deviceId: string): Promise<any[]> {
    console.log(`[Browser] Getting device history: ${deviceId}`);
    return [
      {
        deviceId,
        owner: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: Date.now() - 86400000,
        hash: `0x${deviceId}${Date.now().toString(16)}`
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

  async registerDevice(deviceId: string, owner: string): Promise<any> {
    console.log(`[Server] Registering device: ${deviceId} for owner: ${owner}`);
    return { deviceId, owner, timestamp: Date.now() };
  }

  async getDeviceHistory(deviceId: string): Promise<any[]> {
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

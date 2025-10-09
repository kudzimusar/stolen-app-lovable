// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeviceRegistry
 * @dev Smart contract for registering and verifying device ownership on blockchain
 * This contract provides immutable records for Lost & Found devices
 */
contract DeviceRegistry {
    
    struct Device {
        string deviceId;
        string deviceModel;
        string deviceBrand;
        address owner;
        uint256 registrationTime;
        bool exists;
    }
    
    struct Transfer {
        address from;
        address to;
        uint256 timestamp;
    }
    
    // Mapping from device ID to Device
    mapping(string => Device) public devices;
    
    // Mapping from device ID to transfer history
    mapping(string => Transfer[]) public transferHistory;
    
    // Events
    event DeviceRegistered(
        string indexed deviceId,
        string deviceModel,
        address indexed owner,
        uint256 timestamp
    );
    
    event DeviceTransferred(
        string indexed deviceId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    /**
     * @dev Register a new device on the blockchain
     * @param _deviceId Unique device identifier
     * @param _deviceModel Model of the device
     * @param _deviceBrand Brand of the device
     */
    function registerDevice(
        string memory _deviceId,
        string memory _deviceModel,
        string memory _deviceBrand
    ) public {
        require(!devices[_deviceId].exists, "Device already registered");
        
        devices[_deviceId] = Device({
            deviceId: _deviceId,
            deviceModel: _deviceModel,
            deviceBrand: _deviceBrand,
            owner: msg.sender,
            registrationTime: block.timestamp,
            exists: true
        });
        
        emit DeviceRegistered(_deviceId, _deviceModel, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer device ownership
     * @param _deviceId Device to transfer
     * @param _newOwner New owner address
     */
    function transferDevice(string memory _deviceId, address _newOwner) public {
        require(devices[_deviceId].exists, "Device not registered");
        require(devices[_deviceId].owner == msg.sender, "Not device owner");
        require(_newOwner != address(0), "Invalid address");
        
        address previousOwner = devices[_deviceId].owner;
        devices[_deviceId].owner = _newOwner;
        
        transferHistory[_deviceId].push(Transfer({
            from: previousOwner,
            to: _newOwner,
            timestamp: block.timestamp
        }));
        
        emit DeviceTransferred(_deviceId, previousOwner, _newOwner, block.timestamp);
    }
    
    /**
     * @dev Get device information
     * @param _deviceId Device ID
     */
    function getDevice(string memory _deviceId) 
        public 
        view 
        returns (
            string memory deviceModel,
            string memory deviceBrand,
            address owner,
            uint256 registrationTime,
            bool exists
        ) 
    {
        Device memory device = devices[_deviceId];
        return (
            device.deviceModel,
            device.deviceBrand,
            device.owner,
            device.registrationTime,
            device.exists
        );
    }
    
    /**
     * @dev Get transfer history for a device
     * @param _deviceId Device ID
     */
    function getTransferHistory(string memory _deviceId) 
        public 
        view 
        returns (Transfer[] memory) 
    {
        return transferHistory[_deviceId];
    }
    
    /**
     * @dev Check if device is registered
     * @param _deviceId Device ID
     */
    function isRegistered(string memory _deviceId) public view returns (bool) {
        return devices[_deviceId].exists;
    }
    
    /**
     * @dev Verify device owner
     * @param _deviceId Device ID
     * @param _owner Address to verify
     */
    function verifyOwner(string memory _deviceId, address _owner) 
        public 
        view 
        returns (bool) 
    {
        return devices[_deviceId].exists && devices[_deviceId].owner == _owner;
    }
}


// Deploy script for DeviceRegistry smart contract
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying DeviceRegistry contract...");

  // Get the contract factory
  const DeviceRegistry = await hre.ethers.getContractFactory("DeviceRegistry");
  
  // Deploy the contract
  const deviceRegistry = await DeviceRegistry.deploy();
  
  await deviceRegistry.deployed();

  console.log("✅ DeviceRegistry deployed to:", deviceRegistry.address);
  console.log("📋 Save this address to your .env file:");
  console.log(`   VITE_DEVICE_REGISTRY_ADDRESS=${deviceRegistry.address}`);
  
  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await deviceRegistry.deployTransaction.wait(5);
  
  console.log("✅ Contract verified on blockchain!");
  
  // Test the contract
  console.log("\n🧪 Testing contract...");
  const testDeviceId = "TEST_DEVICE_001";
  const tx = await deviceRegistry.registerDevice(
    testDeviceId,
    "iPhone 15 Pro",
    "Apple"
  );
  await tx.wait();
  
  const device = await deviceRegistry.getDevice(testDeviceId);
  console.log("✅ Test device registered:", {
    model: device.deviceModel,
    brand: device.deviceBrand,
    owner: device.owner,
    time: new Date(device.registrationTime.toNumber() * 1000).toISOString()
  });
  
  console.log("\n🎉 Deployment complete!");
  console.log("📝 Next steps:");
  console.log("1. Add contract address to .env file");
  console.log("2. Update edge functions to use this contract");
  console.log("3. Test with Lost & Found feature");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


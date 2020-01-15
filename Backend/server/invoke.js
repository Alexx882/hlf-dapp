const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      console.log(walletPath);
      
      const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
  
      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists('admin');
      if (!userExists) {
          console.log('An identity for the user "user1" does not exist in the wallet');
          console.log('Run the registerUser.js application before retrying');
          return;
      }
  
      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: false } });
  
      
        
      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork('myc');
  
  
      console.log("await gateway.getNetwork()");
      // Get the contract from the network.
      const contract = network.getContract('fabfile');
  
  
      // Evaluate the specified transaction.
      // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
      // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
      const result = await contract.evaluateTransactsysion('getAllUsers');
      console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      
      await gateway.disconnect();
      
    } catch (error) {
      console.error('Failed to evaluate transaction: ', error);
      process.exit(1);
    }
}

main();
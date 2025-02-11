var express = require('express');
var router = express.Router();

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
//const ccpPath = path.resolve(__dirname, '..', '..','..', 'chaincodes', 'filescc','lib','fabuser.js');

const ccpPath = path.resolve(__dirname, '..', "connection.json");

router.get('/getAllSales', async (req,res) => {
    try {
      
      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      console.log(walletPath);
      
      const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);
  
      // Check to see if we've already enrolled the user.
      const userExists = await wallet.exists('filecc-user');
      if (!userExists) {
          console.log('An identity for the user "filecc-user" does not exist in the wallet');
          console.log('Run the registerUser.js application before retrying');
          return;
      }
  
      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccpPath, { wallet, identity: 'filecc-user', discovery: { enabled: false } });
  
      
        
      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork('mychannel');
  
  
      // Get the contract from the network.
      const contract = network.getContract('fabfile');
  
      // Evaluate the specified transaction.
      // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
      // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
      const result = await contract.evaluateTransaction('FabSale:getAllSales');
      console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      res.status(200).json(JSON.parse(result.toString("utf8")));
      await gateway.disconnect();
  
    } catch (error) {
      console.error('Failed to evaluate transaction: ', error);
      res.status(500).json({error: error});
    } 
  })

router.use('*', function(req, res, next) {
    res.send('wrong URL');
  });
  
  module.exports = router;
  
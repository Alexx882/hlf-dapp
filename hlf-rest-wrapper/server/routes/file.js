var express = require('express');
var router = express.Router();

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
//const ccpPath = path.resolve(__dirname, '..', '..','..', 'chaincodes', 'filescc','lib','fabuser.js');

const ccpPath = path.resolve(__dirname, '..', "connection.json");


router.post('/registerFile',async (req,res) => {
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
    await gateway.connect(ccpPath, { wallet, identity: 'filecc-user', discovery: { enabled: false} });

    
      
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');


    // Get the contract from the network.
    const contract = network.getContract('fabfile');

    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
    console.log(req.body);
    
    const result = await contract.submitTransaction('FabFile:registerFile', req.body.filename, req.body.owner, req.body.type, req.body.price, req.body.available, req.body.hash);
    console.log(`Transaction has been submitted, result is: ${result.toString()}`);
    const out = await contract.evaluateTransaction('FabFile:getFile',req.body.filename);
    if (!out) {
      return res.status(500).send("Failed to register File")
    }
    res.status(200).json(JSON.parse(out.toString("utf8")));
    await gateway.disconnect();

  } catch (error) {
    console.error('Failed to evaluate transaction: ', error);
    res.status(400).json({error: error});
  } 
})


router.post('/buyFile',async (req,res) => {
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
    await gateway.connect(ccpPath, { wallet, identity: 'filecc-user', discovery: { enabled: false} });

    
      
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');


    // Get the contract from the network.
    const contract = network.getContract('fabfile');

    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
    
    const result = await contract.submitTransaction('FabFile:buyFile', req.body.filename, req.body.buyername);
    console.log(`Transaction has been submitted, result is: ${result.toString()}`);
    let out = await (await contract.evaluateTransaction('FabSale:getAllSales')).toString("utf8");
    if (!out) {
      return res.status(500).send("Failed to register File")
    }
    out = JSON.parse(out)
  
    out.forEach(element => {
      console.log(element);
      
      if (element.Record.filename == req.body.filename && element.Record.buyername == req.body.buyername) {
        res.status(200).json(element);
      }
    });
    
    await gateway.disconnect();

  } catch (error) {
    console.error('Failed to evaluate transaction: ', error);
    res.status(400).json({error: error});
  } 
})


router.patch('/',async (req,res) => {
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

    if (req.body.available) {
      const result = await contract.submitTransaction("FabFile:updateFileAvailability",req.body.filename, req.body.available);
      
      const out = await contract.evaluateTransaction('FabFile:getFile',req.body.filename);
    if (!out) {
      return res.status(500).send("Failed to update File")
    }
    res.status(200).json(JSON.parse(out.toString("utf8")));
    } else if (req.body.price) {
      const result = await contract.submitTransaction('FabFile:updateFilePrice',req.body.filename,req.body.price);
      const out = await contract.evaluateTransaction('FabFile:getFile',req.body.filename);
    if (!out) {
      return res.status(500).send("Failed to update File")
    }
    res.status(200).json(JSON.parse(out.toString("utf8")));
    } else {
      res.status(404).send("Update unsuccessfull")
    }

    await gateway.disconnect();
  } catch (error) {
    console.error('Failed to evaluate transaction: ', error);
    res.status(500).json({error: error});
  }
})

router.get('/getFile', async (req,res) => {
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
    const result = await contract.evaluateTransaction('FabFile:getFile',req.body.filename);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    res.status(200).json(JSON.parse(result.toString("utf8")));
    await gateway.disconnect();

  } catch (error) {
    console.error('Failed to evaluate transaction: ', error);
    res.status(400).json({error: error.message});
  } 
})


router.get('/getAllFiles', async (req,res) => {
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
    const result = await contract.evaluateTransaction('FabFile:getAllFiles');
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    res.status(200).json(JSON.parse(result.toString("utf8")));
    await gateway.disconnect();

  } catch (error) {
    console.error('Failed to evaluate transaction: ', error);
    res.status(500).json({error: error});
  } 
})

router.use('*', function(req, res, next) {
  res.status(404).send('wrong URL');
});



module.exports = router;
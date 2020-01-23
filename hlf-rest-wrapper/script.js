const connection = require("./connection.json")

let endpoint = process.env.WRAPPER_ENDPOINT;
connection.orderers["orderer.example.com"].url = connection.orderers["orderer.example.com"].url.replace("localhost",endpoint)
connection.certificateAuthorities["ca.example.com"].url = connection.certificateAuthorities["ca.example.com"].url.replace("localhost",endpoint)
connection.peers["peer0.org1.example.com"].url = connection.peers["peer0.org1.example.com"].url.replace("localhost",endpoint)

const fs = require('fs');
fs.writeFileSync("./connection.json",JSON.stringify(connection))
const connection = require("./connection.json")

let ep_orderer = process.env.ORDERER_ENDPOINT;
let ep_peer = process.env.PEER_ENDPOINT;
let ep_ca = process.env.CA_ENDPOINT;
connection.orderers["orderer.example.com"].url = connection.orderers["orderer.example.com"].url.replace("localhost",ep_orderer)
connection.certificateAuthorities["ca.example.com"].url = connection.certificateAuthorities["ca.example.com"].url.replace("localhost",ep_ca)
connection.peers["peer0.org1.example.com"].url = connection.peers["peer0.org1.example.com"].url.replace("localhost",ep_peer)

const fs = require('fs');
fs.writeFileSync("./connection.json",JSON.stringify(connection))
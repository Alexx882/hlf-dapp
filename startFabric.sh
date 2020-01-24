#!/bin/bash

### DOCU ###
# The whole network will run with docker-compose as the provided architecture
# maps the same folders to multiple containers (crypto-config folder).
# We added our services (the wrapper and the webservice) to the existing docker-compose 
# and start them after the hlf network is running.
############

# Exit on first error
set -e

echo "### building local docker images for hlf-wrapper and webstore"
docker build -t hlf-rest-wrapper:latest ./hlf-rest-wrapper/
docker build -t filestore:latest ./flask_backend/

# clean the keystore
rm -rf ./blockchain/hfc-key-store

echo "### launching hlf network; creating channel and joining peer to channel"
cd blockchain/basic-network
./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabfile -v 1.0 -p /opt/gopath/src/github.com/chaincodes/filescc -l node
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabfile -l node -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"

echo "### launching hlf-wrapper and webstore"
docker-compose -f ./docker-compose.yml up -d hlf-rest-wrapper filestore

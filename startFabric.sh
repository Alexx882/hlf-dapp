#!/bin/bash

### DOCU ###
# The whole network will run with docker-compose as the provided architecture
# maps the same folders to multiple containers (crypto-config folder).
# We added our services (the wrapper and the webservice) to the existing docker-compose 
# and start them after the hlf network is running.
############

# Exit on first error
set -e

# clean the keystore
rm -rf ./blockchain/hfc-key-store

# launch network; create channel and join peer to channel
cd blockchain/basic-network
./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabfile -v 1.0 -p /opt/gopath/src/github.com/chaincodes/filescc -l node
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabfile -l node -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"

# Now we build and launch the node.js wrapper and the webstore
docker build -t filestore ../../flask_backend/
docker build -t hlf-rest-wrapper ../../hlf-rest-wrapper/

docker-compose -f ./docker-compose.yml up -d hlf-rest-wrapper filestore

exit 0

# old documentation kept for usability reasons
cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

Next, use the FabCar applications to interact with the deployed FabCar contract.
The FabCar applications are available in multiple programming languages.
Follow the instructions for the programming language of your choice:

JavaScript:

  Start by changing into the "javascript" directory:
    cd javascript

  Next, install all required packages:
    npm install

  Then run the following applications to enroll the admin user, and register a new user
  called user1 which will be used by the other applications to interact with the deployed
  FabCar contract:
    node enrollAdmin
    node registerUser

  You can run the invoke application as follows. By default, the invoke application will
  create a new car, but you can update the application to submit other transactions:
    node invoke

  You can run the query application as follows. By default, the query application will
  return all cars, but you can update the application to evaluate other transactions:
    node query

TypeScript:

  Start by changing into the "typescript" directory:
    cd typescript

  Next, install all required packages:
    npm install

  Next, compile the TypeScript code into JavaScript:
    npm run build

  Then run the following applications to enroll the admin user, and register a new user
  called user1 which will be used by the other applications to interact with the deployed
  FabCar contract:
    node dist/enrollAdmin
    node dist/registerUser

  You can run the invoke application as follows. By default, the invoke application will
  create a new car, but you can update the application to submit other transactions:
    node dist/invoke

  You can run the query application as follows. By default, the query application will
  return all cars, but you can update the application to evaluate other transactions:
    node dist/query

EOF

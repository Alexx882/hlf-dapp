### Setup
peer chaincode install -l node -p chaincodes/filescc -n test_cc -v 1
peer chaincode instantiate -l node -o orderer:7050 -c '{"Args":[]}' -n test_cc -C myc -v 1


peer chaincode install -l node -p /opt/gopath/src/github.com/chaincodes/filescc -n test_cc -v 1
peer chaincode instantiate -l node -o orderer.example.com:7050 -c '{"Args":[]}' -n test_cc -C mychannel -v 1 -P "OR ('Org1MSP.member','Org2MSP.member')"

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n test1_cc -v 1.0 -p /opt/gopath/src/github.com/chaincodes/filescc -l node
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n test2_cc -l node -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"


#  docker exec -it cli bash
# TEST
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p /opt/gopath/src/github.com/fabcar/javascript -l node
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -l node -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"


### Users
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabUser:registerUser","Alex","10","Buyer","1"]}'
peer chaincode query -C mychannel -n test_cc -c '{"Args":["FabUser:getUser","Alex"]}'

peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabUser:updateUserCredit","Alex","20"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabUser:getUser","Alex"]}'
# credit = 20
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabUser:updateUserCredit","Peter","20"]}'
# <error>
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabUser:updateUserTradingType","Alex","Seller"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabUser:getUser","Alex"]}'
# type = Seller

### Files
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:registerFile","video1","Peter","video","5","1","AB12"]}'
# <error>
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabFile:registerFile","video1","Alex","video","5","1","AB12"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:getFile","video1"]}'

peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabFile:updateFileAvailability","video1","0"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:getFile","video1"]}'
# avail = 0
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabFile:updateFilePrice","video1","25"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:getFile","video1"]}'
# price = 25
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:updateFilePrice","video2","25"]}'
# <error>

### Transactions
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:buyFile","video1","Alex"]}'
# <error>
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabFile:updateFileAvailability","video1","1"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:buyFile","video1","Alex"]}'
# <error>
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabUser:updateUserCredit","Alex","25"]}'
peer chaincode invoke -C myc -n test_cc -c '{"Args":["FabFile:buyFile","video1","Alex"]}'

### List Entries
peer chaincode query -C myc -n test_cc -c '{"Args":["FabUser:getAllUsers"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabFile:getAllFiles"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["FabSale:getAllSales"]}'
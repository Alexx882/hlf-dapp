#  docker exec -it cli bash

### Setup
## This part is done automatically by blockchain/startFabric.sh
peer chaincode install -l node -p chaincodes/filescc -n fabfile -v 1
peer chaincode instantiate -l node -o orderer:7050 -c '{"Args":[]}' -n fabfile -C mychannel -v 1


### Users
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabUser:registerUser","Alex","10","Buyer","1"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabUser:getUser","Alex"]}'

peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabUser:updateUserCredit","Alex","20"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabUser:getUser","Alex"]}'
# credit = 20
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabUser:updateUserCredit","Peter","20"]}'
# <error>
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabUser:updateUserTradingType","Alex","Seller"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabUser:getUser","Alex"]}'
# type = Seller

### Files
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:registerFile","video1","Peter","video","5","1","AB12"]}'
# <error>
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabFile:registerFile","video1","Alex","video","5","1","AB12"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:getFile","video1"]}'

peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabFile:updateFileAvailability","video1","0"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:getFile","video1"]}'
# avail = 0
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabFile:updateFilePrice","video1","25"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:getFile","video1"]}'
# price = 25
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:updateFilePrice","video2","25"]}'
# <error>

### Transactions
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:buyFile","video1","Alex"]}'
# <error>
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabFile:updateFileAvailability","video1","1"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:buyFile","video1","Alex"]}'
# <error>
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabUser:updateUserCredit","Alex","25"]}'
peer chaincode invoke -C mychannel -n fabfile -c '{"Args":["FabFile:buyFile","video1","Alex"]}'

### List Entries
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabUser:getAllUsers"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabFile:getAllFiles"]}'
peer chaincode query -C mychannel -n fabfile -c '{"Args":["FabSale:getAllSales"]}'
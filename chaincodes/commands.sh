### Setup
peer chaincode install -l node -p chaincodes/filescc/ -n test12_cc -v 1
peer chaincode instantiate -l node -o orderer:7050 -c '{"Args":[]}' -n test12_cc -C myc -v 1

### Users
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["registerUser","Alex","10","Buyer","1"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getUser","Alex"]}'

peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateUserCredit","Alex","20"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getUser","Alex"]}'
# credit = 20
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateUserCredit","Peter","20"]}'
# <error>
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateUserTradingType","Alex","Seller"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getUser","Alex"]}'
# type = Seller

### Files
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["registerFile","video1","Alex","video","5","1","AB12"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getFile","video1"]}'

peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateFileAvailability","video1","0"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getFile","video1"]}'
# avail = 0
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateFilePrice","video1","25"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getFile","video1"]}'
# price = 25
peer chaincode query -C myc -n test12_cc -c '{"Args":["updateFilePrice","video2","25"]}'
# <error>

### Transactions
peer chaincode query -C myc -n test12_cc -c '{"Args":["buyFile","video1","Alex"]}'
# <error>
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateFileAvailability","video1","1"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["buyFile","video1","Alex"]}'
# <error>
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["updateUserCredit","Alex","25"]}'
peer chaincode invoke -C myc -n test12_cc -c '{"Args":["buyFile","video1","Alex"]}'

peer chaincode query -C myc -n test12_cc -c '{"Args":["getAllUsers"]}'
peer chaincode query -C myc -n test12_cc -c '{"Args":["getAllFiles"]}'
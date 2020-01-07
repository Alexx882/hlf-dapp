peer chaincode install -l node -p chaincodes/filescc/ -n test_cc -v 1

peer chaincode instantiate -l node -o orderer:7050 -c '{"Args":["initLedger"]}' -n test_cc -C myc -v 1

peer chaincode invoke -C myc -n test_cc -c '{"Args":["registerUser","Alex","10","1","1"]}'
peer chaincode query -C myc -n test_cc -c '{"Args":["getUser","Alex"]}'

# peer chaincode query -C myc -n test_cc -c '{"Args":["registerFile","file","10","1","1"]}'
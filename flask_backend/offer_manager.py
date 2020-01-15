from offer import Offer
import json

class OfferManager:
    def __init__(self, documentPath, buysPath):
        self.documentPath=documentPath
        self.buysPath = buysPath
        self.offers = []
        self.buys = {}

        dataFile = open(self.documentPath, "r")
        data = dataFile.read()
        dataFile.close()

        offers = json.loads(data)
        for offerObj in offers["offers"]:
            if 'price' in offerObj.keys() and 'filename' in offerObj.keys() and 'type' in offerObj.keys() and 'offererId' in offerObj.keys():
                offer = Offer(
                    offerObj['price'],
                    offerObj['filename'],
                    offerObj['type'],
                    offerObj['offererId']
                )

                self.offers.append(offer)
        
        buysFile = open(self.buysPath, "r")
        data = buysFile.read()
        buysFile.close()

        buysData = json.loads(data)
        for buyerId in buysData:
            bId = int(buyerId)
            self.buys[bId] = []
            buysList = buysData[buyerId]

            for singleBuy in buysList:
                self.buys[bId].append(singleBuy)

        print("registered offersmanager at %s with %s stored offers" % (self.documentPath, str(len(self.offers))))
    
    def getOfferForFilename(self, filename):
        for offer in self.offers:
            if offer.filename == filename:
                return offer
            
        return None

    def removeFile(self, filename):
        deleted = False
        for i in range(0, len(self.offers)):
            if self.offers[i].filename == filename:
                self.offers.pop(i)
                deleted = True
                break

        if deleted:
            self.writeToFile()

    def writeToFile(self):
        dataFile = open(self.documentPath, "w")
        data = {"offers":[offer.toDictionary() for offer in self.offers]}
        dataFile.write(json.dumps(data))
        dataFile.close()

        dataFile = open(self.buysPath, "w")
        dataFile.write(json.dumps(self.buys))
        dataFile.close()
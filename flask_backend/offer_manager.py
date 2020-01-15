from offer import Offer
import json

class OfferManager:
    def __init__(self, documentPath):
        self.documentPath=documentPath
        self.offers = []

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
        
        print("registered offersmanager at %s with %s stored offers" % (self.documentPath, str(len(self.offers))))
    
    def writeToFile(self):
        dataFile = open(self.documentPath, "w")

        data = {"offers":[offer.toDictionary() for offer in self.offers]}
        dataFile.write(json.dumps(data))

        dataFile.close()
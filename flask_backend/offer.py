import json

class Offer:
    def __init__(self, price, filename, offertype, offererId, available):
        self.price = price
        self.filename = filename
        self.type = offertype
        self.offererId = offererId
        self.ownOffer = False
        self.available = available
    
    def toDictionary(self):
        return {'price': str(self.price), 'filename': self.filename, 'type': self.type, 'offererId': self.offererId, 'ownOffer': self.ownOffer, 'available': self.available}

    def toJson(self):
        return json.dumps(self.toDictionary())

    def __str__(self):
        return "Offer(%s, %s)" % (self.filename, self.price)
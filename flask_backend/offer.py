import json

class Offer:
    def __init__(self, price, filename, offertype, offererId):
        self.price = price
        self.filename = filename
        self.type = offertype
        self.offererId = offererId
    
    def toDictionary(self):
        return {'price': str(self.price), 'filename': self.filename, 'type': self.type, 'offererId': self.offererId}

    def toJson(self):
        return json.dumps(self.toDictionary())

    def __str__(self):
        return "Offer(%s, %s)" % (self.filename, self.price)
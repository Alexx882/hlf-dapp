from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, name):
        self.id = id
        self.name = name
    
    def toDictionary(self):
        return {'id': self.id, 'name': self.name}
    
    def __str__(self):
        return "User(%s, %s)" % (self.id, self.name)
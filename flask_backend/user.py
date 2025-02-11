from flask_login import UserMixin

class User(UserMixin):
    is_authenticated = True
    is_active = True
    is_anonymous = False
    nextId = 1

    def __init__(self, id, name, email, password, balance):
        self.id = User.nextId
        User.nextId += 1

        self.name = name
        self.email = email
        self.password = password
        self.balance = balance

    def get_id(self):
         return self.id

    def toDictionary(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'password': self.password, 'balance': self.balance}

    def checkPassword(self, password):
        return self.password == password

    def __str__(self):
        return "User(%s, %s)" % (self.id, self.name)

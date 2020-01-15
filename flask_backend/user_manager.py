import json
from user import User

class UserManager:
    def __init__(self, userPath):
        self.users = []
        self.userPath = userPath

        dataFile = open(self.userPath, "r")
        data = dataFile.read()
        dataFile.close()

        for userDict in json.loads(data):
            if "id" in userDict and "email" in userDict and "name" in userDict and "password":
                self.users.append(
                    User(
                        int(userDict["id"]),
                        userDict["name"],
                        userDict["email"],
                        userDict["password"],
                        0
                    )
                )
    
    def writeToFile(self):
        dataFile = open(self.userPath, "w")
        data = [user.toDictionary() for user in self.users]
        dataFile.write(json.dumps(data))
        dataFile.close()
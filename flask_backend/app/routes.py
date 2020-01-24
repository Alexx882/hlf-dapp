from flask import render_template, send_from_directory, redirect, url_for, send_file
from app import app, login
from app.forms import SearchForm, UploadForm, LoginForm, RegisterForm
from flask_login import current_user, login_user, logout_user
from offer import Offer
from user import User
import re
import os
from werkzeug.utils import secure_filename
from offer_manager import OfferManager
from user_manager import UserManager
import requests
import json
import hashlib


@login.user_loader
def load_user(id):
    for user in userManager.users:
        if user.id == id:
            return user

    return None


try:
    url = os.environ['WRAPPER_ENDPOINT']
except:
    url = "http://test.nope-api.systems:3033/api"

colorMapping = {
    "video": "primary",
    "image": "success",
    "music": "info",
    "text": "warning"
}

iconMapping = {
    "video": "video",
    "image": "image",
    "music": "audio",
    "text": "alt"
}

offerManager = OfferManager(
    os.path.join(
        app.instance_path, 'offers.json'
    ),
    os.path.join(
        app.instance_path, 'buys.json'
    )
)

userManager = UserManager(
    os.path.join(
        app.instance_path, 'users.json'
    )
)


@app.route('/')
@app.route('/index')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('shop'))

    return render_template(
        'index.html',
        form=LoginForm()
    )


@app.route("/registerAction", methods=['POST'])
def signUp():
    form = RegisterForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        password = form.password.data

        userNew = User(None, name, email, password, 0)

        duplicate = False
        for user in userManager.users:
            if user.email == userNew.email:
                duplicate = True

        if not duplicate:
            userManager.users.append(userNew)
            userManager.writeToFile()

            # register user at back-backend
            if url != "undefined":
                requests.post("%s/users/registerUser" % (url), data={
                    "username": userNew.email, "credit": "1000", "tradingType": "Buyer", "admin": "0"})

    return redirect(url_for('index'))


@app.route("/register")
def register():
    if current_user.is_authenticated:
        return redirect(url_for('shop'))

    return render_template(
        "register.html",
        form=RegisterForm()
    )


@app.route('/download/<filename>')
def download(filename):
    if not current_user.is_authenticated or current_user.id not in offerManager.buys:
        return redirect(url_for('index'))

    path = os.path.join(app.instance_path, '_user_files/%s' % (filename))
    if os.path.isfile(path):
        return send_file(path)
    else:
        return "File not found."

    return redirect(url_for('index'))


@app.route('/buy/<filename>')
def buy(filename):
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    offer = offerManager.getOfferForFilename(filename)
    price = int(offer.price)

    if offer != None and current_user.balance > price:
        current_user.balance -= price

        if current_user.id not in offerManager.buys:
            offerManager.buys[current_user.id] = []

        offerManager.buys[current_user.id].append(filename)
        offerManager.writeToFile()

        try:
            # tell the server that the file was bought
            if url != "undefined":
                requests.post("%s/file/buyFile" % (url),
                              data={"filename": filename, "buyername": current_user.email})

            # update balance in backend

            if url != "undefined":
                requests.patch("%s/users/updateUserCredit",
                               data={"username": current_user.email, "credit": current_user.balance})

            return render_template(
                "success-download.html",
                filename=filename
            )
        except:
            return "File Could not be purchased."

    return redirect(url_for('index'))


@app.route('/offer/<filename>')
def offer(filename):
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    offer = offerManager.getOfferForFilename(filename)

    if current_user.id in offerManager.buys and filename in offerManager.buys[current_user.id]:
        return redirect(url_for('download', filename=filename))

    if offer != None:
        return render_template(
            "offer.html",
            offer=offer,
            user=current_user,
            balanceAfter=current_user.balance - int(offer.price)
        )
    else:
        return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('shop'))

    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        for user in userManager.users:
            if user.email == username and user.checkPassword(password):

                if url != "undefined":
                    data = requests.get("%s/users/getUser" %
                                        (url), data={"username": user.email})

                    try:
                        obj = json.loads(data.text)
                    except:
                        return data.text

                    print(obj)
                    print("server credit: ", obj["credit"])
                    user.balance = int(obj["credit"])

                    login_user(user, remember=True)
                    userManager.writeToFile()

                return redirect(url_for('index'))

        return "success %s/%s" % (username, password)
    else:
        return redirect(url_for('index'))


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/success')
def success():
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    return render_template("success.html")


@app.route('/upload', methods=['POST'])
def upload():
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    form = UploadForm()
    if form.validate_on_submit():
        f = form.ffield.data
        filename = secure_filename(f.filename)

        offerManager.removeFile(filename)

        f.save(os.path.join(
            app.instance_path, '_user_files', filename
        ))

        ending = filename[-3:]

        print("ending: %s" % (ending))

        if ending == "jpg" or ending == "png":
            filetype = "image"
        elif ending == "mp4" or ending == "flv":
            filetype = "video"
        elif ending == "txt" or ending == "doc" or ending == "pdf":
            filetype = "text"
        else:
            filetype = "music"

        offer = Offer(
            form.price.data,
            filename,
            filetype,
            current_user.id,
            True
        )

        offerManager.offers.append(offer)
        offerManager.writeToFile()

        readable_hash = ""
        with open(os.path.join(app.instance_path, '_user_files', filename), "rb") as f:
            bytes = f.read()  # read entire file as bytes
            readable_hash = hashlib.sha256(bytes).hexdigest()

        if url != "undefined":
            requests.post("%s/file/registerFile" % (url), data={"filename": filename, "owner": current_user.email,
                                                                "type": "filetype", "price": form.price.data, "available": "1", "hash": readable_hash})

        return redirect(url_for('success'))
    else:
        return "nope, no good data"


@app.route('/add')
def add():
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    return render_template(
        'add.html',
        form=UploadForm()
    )

@app.route('/enable/<filename>')
def enable(filename):
    if not current_user.is_authenticated:
        return redirect(url_for('index'))
    
    for offer in offerManager.offers:
        if offer.filename == filename:
            offer.available = True

            avString = "0"
            if offer.available:
                avString = "1"

            if url != "undefined":
                requests.patch("%s/file/updateFileAvailability" % (url), data = {"filename":filename, "available": avString})
            break
    
    offerManager.writeToFile()
    
    return redirect(url_for("index"))


@app.route('/disable/<filename>')
def disable(filename):
    if not current_user.is_authenticated:
        return redirect(url_for('index'))
    
    for offer in offerManager.offers:
        if offer.filename == filename:
            offer.available = False

            avString = "0"
            if offer.available:
                avString = "1"

            if url != "undefined":
                requests.patch("%s/file/updateFileAvailability" % (url), data = {"filename":filename, "available": avString})
            break
    
    offerManager.writeToFile()
    
    return redirect(url_for("index"))


@app.route('/search', methods=['POST'])
def search():
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    form = SearchForm()
    if form.validate_on_submit():
        searchstring = ".*%s.*" % (form.search.data)

        offersShown = []

        # display only matching offers
        for offer in offerManager.offers:
            if re.search(searchstring, offer.filename):
                offersShown.append(offer)

        usersMap = {}
        for user in userManager.users:
            usersMap[user.id] = user.name

        if current_user.id in offerManager.buys:
            buys = offerManager.buys[current_user.id]
        else:
            buys = []
        
        offersShown = [offer.toDictionary() for offer in offerManager.offers]
        for offer in offersShown:
            offer['ownOffer'] = offer['offererId'] == current_user.id
        
        return render_template(
            'shop.html',
            username='Herry',
            offersShown=[offer.toDictionary() for offer in offersShown],
            colorMapping=colorMapping,
            iconMapping=iconMapping,
            users=usersMap,
            form=form,
            buys=buys
        )
    else:
        return "nope, no good data"


@app.route('/shop')
def shop():
    if not current_user.is_authenticated:
        return redirect(url_for('index'))

    usersMap = {}
    for user in userManager.users:
        usersMap[user.id] = user.name

    form = SearchForm()

    if current_user.id in offerManager.buys:
        buys = offerManager.buys[current_user.id]
    else:
        buys = []

    userManager.writeToFile()

    offersShown = [offer.toDictionary() for offer in offerManager.offers]
    for offer in offersShown:
        offer['ownOffer'] = offer['offererId'] == current_user.id
    
    return render_template(
        'shop.html',
        username=current_user.email,
        balance=current_user.balance,
        offersShown=offersShown,
        colorMapping=colorMapping,
        iconMapping=iconMapping,
        users=usersMap,
        form=form,
        buys=buys
    )

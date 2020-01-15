from flask import render_template, send_from_directory, redirect, url_for, send_file
from app import app, login
from app.forms import SearchForm, UploadForm, LoginForm
from flask_login import current_user, login_user, logout_user
from offer import Offer
from user import User
import re
import os
from werkzeug.utils import secure_filename
from offer_manager import OfferManager


@login.user_loader
def load_user(id):
    for user in users:
        if user.id == id:
            return user
    return None


users = [
    User(1, "Dirty Jules", "email@email.com", "p1", 900),
    User(2, "ChickPro Wolfi", "email2@email.com", "p2", 900),
    User(3, "Herry", "herrytco@gmail.com", "hallihallo", 420)
]

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


@app.route('/')
@app.route('/index')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('shop'))

    return render_template(
        'index.html',
        form=LoginForm()
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

        return render_template(
            "success-download.html",
            filename=filename
        )

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

        for user in users:
            if user.email == username and user.checkPassword(password):
                login_user(user, remember=True)
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
        elif ending == "txt" or ending == "doc":
            filetype = "text"
        else:
            filetype = "music"

        offer = Offer(
            form.price.data,
            filename,
            filetype,
            current_user.id
        )

        offerManager.offers.append(offer)
        offerManager.writeToFile()

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
        for user in users:
            usersMap[user.id] = user.name

        if current_user.id in offerManager.buys:
            buys = offerManager.buys[current_user.id]
        else:
            buys = []
        
        print("aöslkdfjölsdkfj")
        print("buys: %s" % (str(buys)))

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
    for user in users:
        usersMap[user.id] = user.name

    form = SearchForm()

    if current_user.id in offerManager.buys:
        buys = offerManager.buys[current_user.id]
    else:
        buys = []

    return render_template(
        'shop.html',
        username=current_user.email,
        balance=current_user.balance,
        offersShown=[offer.toDictionary() for offer in offerManager.offers],
        colorMapping=colorMapping,
        iconMapping=iconMapping,
        users=usersMap,
        form=form,
        buys=buys
    )

from flask import render_template, send_from_directory, redirect, url_for
from app import app
from app.forms import SearchForm, UploadForm, LoginForm
from offer import Offer
from user import User
import re
import os
from werkzeug.utils import secure_filename
from offer_manager import OfferManager

users = [
    User(1, "Dirty Jules"),
    User(2, "ChickPro Wolfi"),
    User(3, "Herry")
]

loggedInUser = 3

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
    )
)



@app.route('/')
@app.route('/index')
def index():
    return render_template(
        'index.html', 
        form=LoginForm()
        )

@app.route('/success')
def success():
    return render_template("success.html")

@app.route('/upload', methods=['POST'])
def upload():
    form = UploadForm()
    if form.validate_on_submit():
        f = form.ffield.data
        filename = secure_filename(f.filename)
        f.save(os.path.join(
            app.instance_path, '_user_files', filename
        ))

        offer = Offer(
            form.price.data,
            filename,
            "text",
            loggedInUser
        )

        offerManager.offers.append(offer)
        offerManager.writeToFile()

        return redirect(url_for('success'))
    else:
        return "nope, no good data"

@app.route('/add')
def add():
    return render_template(
        'add.html',
        form=UploadForm()
    )

@app.route('/search', methods=['POST'])
def search():
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

        return render_template(
            'shop.html', 
            username='Herry', 
            offersShown=[offer.toDictionary() for offer in offersShown],
            colorMapping=colorMapping,
            iconMapping=iconMapping,
            users=usersMap,
            form=form
        )
    else:
        return "nope, no good data"

@app.route('/shop')
def shop():
    usersMap = {}
    for user in users:
        usersMap[user.id] = user.name

    form = SearchForm()
    
    return render_template(
        'shop.html', 
        username='Herry', 
        offersShown=[offer.toDictionary() for offer in offerManager.offers],
        colorMapping=colorMapping,
        iconMapping=iconMapping,
        users=usersMap,
        form=form
        )
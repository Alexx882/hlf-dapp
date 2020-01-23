from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, PasswordField, BooleanField, SubmitField, DecimalField
from wtforms.validators import DataRequired

class RegisterForm(FlaskForm):
    name = StringField(
        'Username', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Enter Your Name",
            "id": "exampleFirstName",
            "type": "text"
        }
    )

    email = StringField(
        'E-Mail-Address', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Enter Your E-Mail Address",
            "id": "exampleInputEmail",
            "type": "email"
        }
    )

    password = PasswordField(
        'Password', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Password",
            "id": "exampleInputPassword",
            "type": "password"
        }
    )

    password2 = PasswordField(
        'repeat Password', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Repeat Password",
            "id": "exampleRepeatPassword",
            "type": "password"
        }
    )

class LoginForm(FlaskForm):
    username = StringField(
        'Username', 
        validators=[DataRequired()],
        render_kw={
            "type": "email",
            "id": "exampleInputEmail",
            "aria-describedby": "emailHelp",
            "placeholder": "Email Address"
        }
    )
    password = PasswordField(
        'Password', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Password",
            "id": "exampleInputPassword",
            "type": "password"
        }
    )
    submit = SubmitField('Sign In')

class SearchForm(FlaskForm):
    search = StringField(
        'Search', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Search for a File ..."
        }
    )
    submit = SubmitField('Search')

class UploadForm(FlaskForm):
    price = DecimalField(
        'Price', 
        validators=[DataRequired()],
        render_kw={
            "placeholder": "Price",
            "min": "0",
            "step": "0.01",
            "type": "number",
        },
        places=2
    )
    ffield = FileField(
        'File to Sale',
        validators=[FileRequired(),],
        render_kw= {
            "aria-describedby": "inputGroupFileAddon01",
            "id": "inputGroupFile01"
        }
    )
    upload = SubmitField('Upload')
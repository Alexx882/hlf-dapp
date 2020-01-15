import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'e39dd2f757ca78baaf4374a962c08967'

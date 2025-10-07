from dotenv import load_dotenv
import os
from flask import Flask
from flask_migrate import Migrate
from sqlalchemy_serializer import SerializerMixin

from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData, create_engine

# need to initialize to use os.getenv instead of os.environ
load_dotenv()

# metadata to fix alembic bug
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# init flask app
# ADD STATIC FOLDER PATHS FOR DEPLOYMENT
# what are static folders? 
static_folder = os.path.join(os.path.dirname(__file__), '../../client/dist')
print(os.path.abspath(static_folder))

app = Flask(
    __name__,
    static_url_path='',
    static_folder=static_folder,
    template_folder='../../client/dist'
)

# JUST SHOW ERRORS FOR REQUESTS
import logging
log = logging.getLogger('werkzeug')
log.disabled = True

# switched from os.environ['DATABASE_URI] to os.getenv('DATABASE_URI)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY')


# init sqlalchemy object
db = SQLAlchemy(metadata=MetaData(naming_convention=convention))
# initialize sqlalchemy plugin 
db.init_app(app)
# initialize alembic aka flask migrate
Migrate(app, db)

CORS(app, supports_credentials=True)

# init bcrypt plugin
bcrypt = Bcrypt()

# GUNICORN stuff


# workers = int(os.environ.get('GUNICORN_PROCESSES', '2'))

# threads = int(os.environ.get('GUNICORN_THREADS', '4'))

# # timeout = int(os.environ.get('GUNICORN_TIMEOUT', '120'))

# bind = os.environ.get('GUNICORN_BIND', '0.0.0.0:8080')



# forwarded_allow_ips = '*'

# secure_scheme_headers = { 'X-Forwarded-Proto': 'https' }

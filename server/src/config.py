import os
from flask import Flask
from flask_migrate import Migrate
from sqlalchemy_serializer import SerializerMixin

from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData, create_engine

# metadata to fix alembic bug
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# init flask app
app = Flask(__name__)
# pip install python-dotenv in command line 
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URI']

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.environ['SECRET_KEY']


# init sqlalchemy object
db = SQLAlchemy(metadata=MetaData(naming_convention=convention))
# initialize sqlalchemy plugin 
db.init_app(app)
# initialize alembic aka flask migrate
Migrate(app, db)

CORS(app, supports_credentials=True)

# init bcrypt plugin
bcrypt = Bcrypt()
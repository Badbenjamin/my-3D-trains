from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates

from sqlalchemy.ext.hybrid import hybrid_property

from config import db, bcrypt

class Rider(db.Model, SerializerMixin):
    __tablename__ = "riders"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String)
    fav_subway_activity = db.Column(db.String)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id')) 

    @hybrid_property
    def password_hash(self):
         return self._password_hash
    
    @password_hash.setter
    def password_hash(self, plain_text_password):
         bytes = plain_text_password.encode('utf-8')
         self._password_hash = bcrypt.generate_password_hash(bytes)

    def authenticate(self, password):
         return bcrypt.check_password_hash(
              self._password_hash,
              password.encode('utf-8')
         )
         

    station = db.relationship('Station', uselist=False, back_populates='riders')
    # routes = db.relationship('Route', back_populates='rider')

    serialize_rules=['-station.riders',]

    def __repr__(self):
          return f'<Rider {self.username}, {self.my_stop}>'
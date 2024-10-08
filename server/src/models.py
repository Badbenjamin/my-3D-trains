from config import db
from sqlalchemy_serializer import SerializerMixin

from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property

from config import bcrypt

# station data from https://data.ny.gov/Transportation/MTA-Subway-Stations/39hk-dx4f/about_data
class Station(db.Model, SerializerMixin):
    __tablename__ = 'stations'

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    gtfs_stop_id = db.Column(db.String)
    station_id = db.Column(db.Integer)
    complex_id = db.Column(db.Integer)
    division = db.Column(db.String)
    line = db.Column(db.String)
    stop_name = db.Column(db.String)
    borough = db.Column(db.String)
    cbd = db.Column(db.String)
    daytime_routes = db.Column(db.String)
    structure = db.Column(db.String)
    gtfs_latitude = db.Column(db.String)
    gtfs_longitude = db.Column(db.String)
    north_direction_label = db.Column(db.String)
    south_direction_label = db.Column(db.String)

    station_endpoints = db.relationship('StationEndpoint', back_populates='station')
    riders = db.relationship('Rider', back_populates='station')

    # start_stops = db.relationship('Route', back_populates='start_stop')
    # end_stops = db.relationship('Route', back_populates='end_stop')

    serialize_rules=['-station_endpoints.stations', '-riders.station']

    def __repr__(self):
         return f'<Station {self.stop_name}, {self.gtfs_stop_id}, {self.daytime_routes}>'
    

class Endpoint(db.Model, SerializerMixin):
     __tablename__ = 'endpoints'

     id = db.Column(db.Integer, primary_key=True, nullable=False)
     lines = db.Column(db.String)
     endpoint = db.Column(db.String)

     station_endpoints = db.relationship('StationEndpoint', back_populates='endpoint')

     def __repr__(self):
          return f'<Endpoint {self.lines}, {self.endpoint}>'
     

class StationEndpoint(db.Model, SerializerMixin):
    __tablename__ = 'station_endpoints'

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    route = db.Column(db.String)
    station_name = db.Column(db.String)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=False)
    endpoint_id = db.Column(db.Integer, db.ForeignKey('endpoints.id'), nullable=False)

    station = db.relationship('Station', back_populates='station_endpoints')
    endpoint = db.relationship('Endpoint', back_populates='station_endpoints')

    serialize_rules=['-stations.station_endpoints', '-endpoints.station_endpoints']

    def __repr__(self):
          return f'<StationEndpoint {self.station_id}, {self.route}, {self.station_name}, {self.endpoint_id}>'
    
class Rider(db.Model, SerializerMixin):
    __tablename__ = "riders"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True)
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
          return f'<Rider {self.username}, {self.station}>'
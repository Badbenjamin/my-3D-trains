from config import db
from sqlalchemy_serializer import SerializerMixin

# from StationEndpoint import StationEndpoint
# from Station import Station

class Endpoint(db.Model, SerializerMixin):
     __tablename__ = 'endpoints'

     id = db.Column(db.Integer, primary_key=True, nullable=False)
     lines = db.Column(db.String)
     endpoint = db.Column(db.String)

     station_endpoints = db.relationship('StationEndpoint', back_populates='endpoint')

     def __repr__(self):
          return f'<Endpoint {self.lines}, {self.endpoint}>'
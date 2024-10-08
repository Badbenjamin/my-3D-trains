from config import db
from sqlalchemy_serializer import SerializerMixin

# from Station import Station
# from Endpoint import Endpoint

class StationEndpoint(db.Model, SerializerMixin):
    __tablename__ = 'station_endpoints'

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    route = db.Column(db.String)
    station_name = db.Column(db.String)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=False)
    endpoint_id = db.Column(db.Integer, db.ForeignKey('endpoints.id'), nullable=False)

    station = db.relationship('Station', back_populates='station_endpoints', viewonly=True)
    endpoint = db.relationship('Endpoint', back_populates='station_endpoints',viewonly=True)

    serialize_rules=['-stations.station_endpoints', '-endpoints.station_endpoints']

    def __repr__(self):
          return f'<StationEndpoint {self.station_id}, {self.route}, {self.station_name}, {self.endpoint_id}>'

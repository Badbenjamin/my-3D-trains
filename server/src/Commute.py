from config import db
from sqlalchemy_serializer import SerializerMixin

class Commute(db.Model, SerializerMixin):
    __tablename__ = 'commutes'

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('riders.id'), nullable=False)
    start_station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=False)
    end_station_id = db.Column(db.Integer, db.ForeignKey('stations.id'),  nullable=False)
    name = db.Column(db.String, nullable=False)

    start_station = db.relationship('Station', foreign_keys=[start_station_id], back_populates='start_stations')
    end_station = db.relationship('Station', foreign_keys=[end_station_id], back_populates='end_stations')
    rider = db.relationship('Rider', foreign_keys=[rider_id], back_populates='commutes')
    commutes = db.relationship('CommuteTime', back_populates=('commute'))

    serialize_rules = ['-start_station.start_stations', '-end_station.end_stations', '-rider.commutes']

    # update for sub category in relationship
    def __repr__(self):
        return f'<Commute {self.rider.username}, {self.start_station.stop_name}, {self.end_station.stop_name}, {self.name}'
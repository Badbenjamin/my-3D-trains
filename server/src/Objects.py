from config import db, app
from flask import request

from models import Station

class Journey:

    def __init__(self, start_station_id, end_station_id):
        self.start_station = Station.query.filter(Station.id == start_station_id).first()
        self.end_station = Station.query.filter(Station.id == end_station_id).first()
        
        start_station_endpoints = []
        for endpoint in self.start_station.station_endpoints:
            start_station_endpoints.append(endpoint.endpoint.endpoint)

        self.start_station_endpoints = list(set(start_station_endpoints))

        end_station_endpoints = []
        for endpoint in self.end_station.station_endpoints:
            end_station_endpoints.append(endpoint.endpoint.endpoint)

        self.end_station_endpoints = list(set(end_station_endpoints))
        
        # get shared stations or complexes
    

    def __repr__(self):
        return f'<Journey {self.start_station.stop_name} to {self.end_station.stop_name}>'
    

if __name__ == "__main__":
    with app.app_context():
        new_journey = Journey(1,26)
        print(new_journey.start_station_endpoints)
        print(new_journey.end_station_endpoints)
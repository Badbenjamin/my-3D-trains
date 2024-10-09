from config import db, app
from flask import session, request
import requests

from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2

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

class TrainData:

    def __init__(self, start_station_endpoints, end_station_endpoints, shared_station_endpoints = None):

        all_train_data = []

        all_endpoints = []
     
        for endpoint in start_station_endpoints:
            all_endpoints.append(endpoint)
        
        for endpoint in end_station_endpoints:
            all_endpoints.append(endpoint)

        if shared_station_endpoints != None:
            for endpoint in shared_station_endpoints:
                all_endpoints.append(endpoint)

        # get rid of identical endpoints from each station
        de_duplicated_endpoints = list(set(all_endpoints))

        # get rid of endpoints that will not be used in the trip
        # (endpoints that start and end do not share with shared station, or are not shared with start and end)
        final_endpoints = []
        for endpoint in de_duplicated_endpoints:
            if shared_station_endpoints is None:
                if endpoint in start_station_endpoints and endpoint in end_station_endpoints:
                    final_endpoints.append(endpoint)
            elif shared_station_endpoints is not None:
                if (endpoint in start_station_endpoints and endpoint in shared_station_endpoints) or (endpoint in end_station_endpoints and endpoint in shared_station_endpoints):
                    final_endpoints.append(endpoint)
        print("fe", final_endpoints)

        for endpoint in final_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)

        self.all_train_data = all_train_data



if __name__ == "__main__":
    with app.app_context():
        new_journey = Journey(178, 403)
        new_data = TrainData(new_journey.start_station_endpoints, new_journey.end_station_endpoints, ['https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace', 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs'])
        # print(new_data.feed)
        # print(new_journey.start_station_endpoints)
        # print(new_journey.end_station_endpoints)
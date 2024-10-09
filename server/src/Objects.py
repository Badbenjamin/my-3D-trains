from config import db, app
from flask import session, request
import requests

from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2

from models import Station

class Journey:

    def __init__(self, start_station_id, end_station_id, time=None):
        self.start_station = Station.query.filter(Station.id == start_station_id).first()
        self.end_station = Station.query.filter(Station.id == end_station_id).first()
        self.time = time
        
        start_station_endpoints = []
        for endpoint in self.start_station.station_endpoints:
            start_station_endpoints.append(endpoint.endpoint.endpoint)

        self.start_station_endpoints = list(set(start_station_endpoints))

        end_station_endpoints = []
        for endpoint in self.end_station.station_endpoints:
            end_station_endpoints.append(endpoint.endpoint.endpoint)

        self.end_station_endpoints = list(set(end_station_endpoints))
        
        # get shared stations or complexes
        self.shared_stations = []
        # for test, delete later!
        self.shared_station_endpoints = ['https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace', 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs']
    

    def __repr__(self):
        return f'<Journey {self.start_station.stop_name} to {self.end_station.stop_name} through{self.shared_stations} at {self.time}>'

# accepts journey object as arg
# all_train_data will provide every relevant train for a multi leg trip
class TrainData:

    def __init__(self, journey_object):

        self.start_station_name = journey_object.start_station.stop_name
        self.end_station_name = journey_object.end_station.stop_name
        self.shared_station_names = journey_object.shared_stations
        self.journey_object = journey_object
        
        all_train_data = []
        all_endpoints = []
     
        for endpoint in journey_object.start_station_endpoints:
            all_endpoints.append(endpoint)
        
        for endpoint in journey_object.end_station_endpoints:
            all_endpoints.append(endpoint)

        if journey_object.shared_station_endpoints != None:
            for endpoint in journey_object.shared_station_endpoints:
                all_endpoints.append(endpoint)

        # get rid of identical endpoints from each station
        de_duplicated_endpoints = list(set(all_endpoints))

        # get rid of endpoints that will not be used in the trip
        # (endpoints that start and end do not share with shared station, or are not shared with start and end)
        final_endpoints = []
        for endpoint in de_duplicated_endpoints:
            if journey_object.shared_station_endpoints is None:
                if endpoint in journey_object.start_station_endpoints and endpoint in journey_object.end_station_endpoints:
                    final_endpoints.append(endpoint)
            elif journey_object.shared_station_endpoints is not None:
                if (endpoint in journey_object.start_station_endpoints and endpoint in journey_object.shared_station_endpoints) or (endpoint in journey_object.end_station_endpoints and endpoint in journey_object.shared_station_endpoints):
                    final_endpoints.append(endpoint)
        

        for endpoint in final_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)

        self.all_train_data = all_train_data

    def __repr__(self):
        return f'<TrainData {self.start_station_name} to {self.end_station_name} through {self.shared_station_names}>'

class AllTrains:

    def __init__(self, train_data_obj):
        self.all_train_data = train_data_obj.all_train_data
        self.start_stop_gtfs_id = train_data_obj.journey_object.start_station.gtfs_stop_id
        self.end_stop_gtfs_id = train_data_obj.journey_object.end_station.gtfs_stop_id
        # print(self.all_train_data[0].entity)
        # filtered trains includes trains that stop at both start and end stations, and the end station comes after the start station

        # STOPPED HERE NEEDS WORK
        filtered_trains = []
        for train in self.all_train_data[0].entity: 
            if train.HasField('trip_update'):
                stops = []
                # filtered_trains.append(train)
                # stops list contains each trains stop array. used to determine if start stop is before end stop
                for stop in train.trip_update.stop_time_update:
                    stops.append(stop.stop_id[:-1])
                if (self.start_stop_gtfs_id in stops and self.end_stop_gtfs_id in stops and stops.index(self.start_stop_gtfs_id) < stops.index(self.end_stop_gtfs_id)):
                    filtered_trains.append(train)
        print(filtered_trains)



if __name__ == "__main__":
    with app.app_context():
        new_journey = Journey(178, 403)
        new_data = TrainData(new_journey)
        new_trains = AllTrains(new_data)
        # print(new_trains.end_stop_gtfs_id)
        # print(new_journey.start_station_endpoints)
        # print(new_journey.end_station_endpoints)
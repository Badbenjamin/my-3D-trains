from config import db, app
from flask import session, request
import requests

from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2

from models import Station

current_time = datetime.now()

# convert 10 digit POSIX timestamp used in feed to readable format
def convert_timestamp(timestamp):
    return datetime.fromtimestamp(timestamp)

# converts seconds to delta time type
def convert_seconds(seconds):
    return timedelta(seconds = seconds)

def time_difference(first_time, second_time):
    detla_time = second_time - first_time
    return detla_time

class Journey:

    def __init__(self, start_station_id, end_station_id, time=None):
        self.start_station = Station.query.filter(Station.id == start_station_id).first()
        self.end_station = Station.query.filter(Station.id == end_station_id).first()
        self.time = time
        
        start_station_endpoints = []
        for endpoint in self.start_station.station_endpoints:
            start_station_endpoints.append(endpoint.endpoint.endpoint)

        self.start_station_endpoints = list(set(start_station_endpoints))

        # End station endpoints might not be needed 
        end_station_endpoints = []
        for endpoint in self.end_station.station_endpoints:
            end_station_endpoints.append(endpoint.endpoint.endpoint)

        self.end_station_endpoints = list(set(end_station_endpoints))
        
        # get shared stations or complexes
        self.shared_stations = []
        # for test, delete later!
        # self.shared_station_endpoints = ['https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace', 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs']
        self.shared_station_endpoints = []

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
        
        
        all_endpoints = []

        for endpoint in journey_object.start_station_endpoints:
            all_endpoints.append(endpoint)
        
        # try removing end station endpoints
        for endpoint in journey_object.end_station_endpoints:
            all_endpoints.append(endpoint)

        if journey_object.shared_station_endpoints != None:
            for endpoint in journey_object.shared_station_endpoints:
                all_endpoints.append(endpoint)

        # get rid of identical endpoints from each station
        de_duplicated_endpoints = list(set(all_endpoints))

        # get rid of endpoints that will not be used in the trip
        # (endpoints that start and end do not share with shared station, or are not shared with start and end)
        # end station endpoints probably not needed, unless reversing trip....
        final_endpoints = []
        for endpoint in de_duplicated_endpoints:
            if journey_object.shared_station_endpoints == []:
                if endpoint in journey_object.start_station_endpoints and endpoint in journey_object.end_station_endpoints:
                    final_endpoints.append(endpoint)
            elif journey_object.shared_station_endpoints != []:
                if (endpoint in journey_object.start_station_endpoints and endpoint in journey_object.shared_station_endpoints) or (endpoint in journey_object.end_station_endpoints and endpoint in journey_object.shared_station_endpoints):
                    final_endpoints.append(endpoint)
        
        # print(final_endpoints)
        all_train_data = []

        for endpoint in final_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)

        self.all_train_data = all_train_data

    # returns all trains from provided endpoints
    def get_all_trains(self):
        all_trains = []
        for train_feed in self.all_train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    all_trains.append(train)
        # print(all_trains)
        return all_trains
    
    # returns list of trains going from start station to end station
    def filter_trains_for_stations_and_direction(self):
        filtered_trains = []
        for train_feed in self.all_train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = []
                    # stops list contains each trains stop array. used to determine if start stop is before end stop
                    for stop in train.trip_update.stop_time_update:
                        stops.append(stop.stop_id[:-1])
                    if (self.journey_object.start_station.gtfs_stop_id in stops and self.journey_object.end_station.gtfs_stop_id in stops and stops.index(self.journey_object.start_station.gtfs_stop_id) < stops.index(self.journey_object.end_station.gtfs_stop_id)):
                        filtered_trains.append(train)
        return filtered_trains
    
    def filter_trains_for_current(self, train_list):
        filtered_trains = []
        for train in train_list:
            for stop in train.trip_update.stop_time_update:
                    # Filter for station and arrival time in future
                if stop.stop_id[:-1] == self.journey_object.start_station.gtfs_stop_id and time_difference(current_time, convert_timestamp(stop.arrival.time)) > convert_seconds(30):
                    filtered_trains.append(train)
        # print(filtered_trains)
        return filtered_trains
            

    def __repr__(self):
        return f'<TrainData {self.start_station_name} to {self.end_station_name} through {self.shared_station_names}>'



if __name__ == "__main__":
    with app.app_context():
        new_journey = Journey(178, 175)
        new_data = TrainData(new_journey)
        new_data.filter_trains_for_current(new_data.filter_trains_for_stations_and_direction())
        for train in new_data.filter_trains_for_current(new_data.filter_trains_for_stations_and_direction()):
            print(train.trip_update.trip.trip_id)
        # print(len(new_data.filter_trains_for_stations_and_direction()))
        # print(new_trains.end_stop_gtfs_id)
        # print(new_journey.start_station_endpoints)
        # print(new_journey.end_station_endpoints)
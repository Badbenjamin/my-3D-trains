from config import db, app
from flask import session, request
from sqlalchemy_serializer import SerializerMixin
import requests

from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2

from models import Station
import pprint
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

def trains_to_objects(train_list):
        train_object_list = []
        for train in train_list:
            new_schedule = []
            for stop in train.trip_update.stop_time_update:
                new_stop = Stop(
                    arrival= stop.arrival.time,
                    departure= stop.departure.time,
                    stop_id= stop.stop_id
                )
                new_schedule.append(new_stop)
            
            new_train = Train(
                trip_id= train.trip_update.trip.trip_id,
                start_time= train.trip_update.trip.start_time,
                start_date= train.trip_update.trip.start_date,
                route_id= train.trip_update.trip.route_id,
                schedule= new_schedule
            )
            train_object_list.append(new_train)
        return train_object_list

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

class Train:
    def __init__(self, trip_id, start_time, start_date, route_id, schedule=[]):
        self.trip_id = trip_id
        self.start_time = start_time
        self.start_date = start_date
        self.route_id = route_id
        self.schedule = schedule

    def last_stop(self):
        return self.schedule[0]
    
    def next_stop(self):
        return self.schedule[1]

    def arrival_time(self, station_gtfs_id):
        for stop in self.schedule:
            if stop.stop_id[:-1] == station_gtfs_id:
                return stop.arrival
            
    def route(self):
        return self.route_id
    
    def direction(self):
        return self.schedule[0].stop_id[-1]
            
    def current_location(self):
        location = {
            "last_stop" : self.schedule[0].stop_id,
            "last_stop_departure" : self.schedule[0].departure,
            "next_stop" : self.schedule[1].stop_id,
            "next_stop_arrival" : self.schedule[1].arrival,
            "length_of_trip" : convert_seconds(self.schedule[1].arrival - self.schedule[0].departure)
        }
        return location

            
    # work on this later
    def number_of_stops(self, start_station_gtfs_id, end_station_gtfs_id):
        pass

    def time_between_stops(self, start_station_gtfs_id, end_station_gtfs_id):
        pass

    def __repr__(self):
        return f'<Train {self.trip_id}>'

class Stop:
    def __init__(self, arrival, departure, stop_id):

        self.arrival = arrival
        self.departure = departure
        self.stop_id = stop_id

    def __repr__(self):
        return f'<Stop {self.stop_id} {str(convert_timestamp(self.arrival))[11:-3]}>'


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
            if journey_object.shared_station_endpoints == []:
                if endpoint in journey_object.start_station_endpoints and endpoint in journey_object.end_station_endpoints:
                    final_endpoints.append(endpoint)
            elif journey_object.shared_station_endpoints != []:
                if (endpoint in journey_object.start_station_endpoints and endpoint in journey_object.shared_station_endpoints) or (endpoint in journey_object.end_station_endpoints and endpoint in journey_object.shared_station_endpoints):
                    final_endpoints.append(endpoint)
        
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
        return all_trains
    
    # returns list of current trains going from start station to end station
    def filter_trains_for_stations_direction_current(self):
        # maybe make an optional branch that replaces end station with shared station, then replaces start station with shared station

        start_station_id = self.journey_object.start_station.gtfs_stop_id
        end_station_id = self.journey_object.end_station.gtfs_stop_id

        filtered_trains = []
        for train_feed in self.all_train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = []
                    # stops list contains each trains stop array. used to determine if start stop is before end stop
                    for stop in train.trip_update.stop_time_update:
                        stops.append(stop.stop_id[:-1])
                    # checking if start stop is before end stop in stops array
                    if (start_station_id in stops and end_station_id in stops and stops.index(start_station_id) < stops.index(end_station_id)):
                        # filtering out trains that have already departed the start station (departure time in pase)
                        for stop in train.trip_update.stop_time_update:
                            if stop.stop_id[:-1] == start_station_id and time_difference(current_time, convert_timestamp(stop.arrival.time)) > convert_seconds(30):
                                filtered_trains.append(train)
        return trains_to_objects(filtered_trains)
    
    
    # takes filtered list of trains and sorts by arrival time at destination
    def sort_trains_by_arrival_at_destination(self):
        end_station_id = self.journey_object.end_station.gtfs_stop_id
        trains_with_arrival = []
        for train in self.filter_trains_for_stations_direction_current():
            arrival_train = {"train" : train, "dest_arrival_time" : None}
            for stop in train.schedule:
                if stop.stop_id[:-1] == end_station_id:
                    arrival_train['dest_arrival_time'] = stop.arrival
            trains_with_arrival.append(arrival_train)
        trains_by_dest_arrival = sorted(trains_with_arrival, key=lambda d: d['dest_arrival_time'])
        # print(trains_by_dest_arrival)
        return [arrival_train["train"] for arrival_train in trains_by_dest_arrival]
       
    def format_for_react(self, journey_object):
        trains_for_react = []
        
        for train in self.sort_trains_by_arrival_at_destination():
            stop_schedule = []
            
            for stop in train.schedule:
                stop_obj = {
                    "stop_id" : stop.stop_id,
                    "arrival" : stop.arrival,
                    "departure" : stop.departure
                }
                stop_schedule.append(stop_obj)
            stop_schedule_ids = []
            for stop in stop_schedule:
                stop_schedule_ids.append(stop['stop_id'][:-1])
            # print()
            # print(stop_schedule_ids.index(journey_object.end_station.gtfs_stop_id) - stop_schedule_ids.index(journey_object.start_station.gtfs_stop_id))
            
            train_for_react = {
                "train_id" : train.trip_id,
                "start_station" : journey_object.start_station.stop_name,
                "start_station_gtfs" : journey_object.start_station.gtfs_stop_id,
                "start_station_arrival" : str(convert_timestamp(train.arrival_time(journey_object.start_station.gtfs_stop_id))),
                "end_station" : journey_object.end_station.stop_name,
                "end_station_gtfs" : journey_object.end_station.gtfs_stop_id,
                "end_station_arrival" : str(convert_timestamp(train.arrival_time(journey_object.end_station.gtfs_stop_id))),
                "transfer_station" : None,
                "route" : train.route(),
                "direction_label" : None,
                "schedule" : stop_schedule,
                "number_of_stops" : stop_schedule_ids.index(journey_object.end_station.gtfs_stop_id) - stop_schedule_ids.index(journey_object.start_station.gtfs_stop_id),
                "trip_time" : (train.arrival_time(journey_object.end_station.gtfs_stop_id) - train.arrival_time(journey_object.start_station.gtfs_stop_id)) / 60
            }
            if train.direction() == "N":
                train_for_react['direction_label'] = journey_object.start_station.north_direction_label
            if train.direction() == "S":
                train_for_react['direction_label'] = journey_object.start_station.south_direction_label
            trains_for_react.append(train_for_react)
            # print(train_for_react['start_station_arrival'])
        return trains_for_react


        
            

    def __repr__(self):
        return f'<TrainData {self.start_station_name} to {self.end_station_name} through {self.shared_station_names}>'



if __name__ == "__main__":
    with app.app_context():
        new_journey = Journey(175, 178)
        new_data = TrainData(new_journey)
        # print(new_journey.start_station.gtfs_stop_id)
        # sorted_trains = new_data.sort_trains_by_arrival_at_destination()
        # for train in sorted_trains:
        #     print(train.arrival_time(train.arrival_time(new_journey.end_station.gtfs_stop_id)))

        trains_for_react = new_data.format_for_react(new_journey)
        # for train in trains_for_react:
        #     print(train["start_station_arrival"])

        # for train in new_data.filter_trains_for_stations_direction_current():
        #     print("fsd", train)
        # t1 = trains_to_objects(new_data.filter_trains_for_stations_direction_current())[0]
        # # print(t1.schedule)
        # print(t1.current_location())
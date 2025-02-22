from config import db, app
from flask import session, request
from sqlalchemy_serializer import SerializerMixin
import requests

from datetime import datetime
from google.transit import gtfs_realtime_pb2

from models import Station
import pprint
current_time = datetime.now()

from collections import Counter

import modules

# Converts JSON train into a easier to read object
# circular import issue, couldn't move to modules
def trains_to_objects(filtered_trains):
        train_object_list = []
        for train in filtered_trains:
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

# the journey object takes a start and end station
# it will contain endpoints for the start and end station, as well as the transfer station if applicable
class Journey:

    def __init__(self, start_station_id, end_station_id, time=None):

        self.start_station = Station.query.filter(Station.id == start_station_id).first()
        self.end_station = Station.query.filter(Station.id == end_station_id).first()
        
        # these will be reset or used as base case for recursive version
        self.start_station_terminus = None
        self.end_station_origin = None
        
        # LET USER INPUT TRANSFER STATIONS IF THEY WANT
        self.shared_stations = []
        self.time = time
        self.start_station_routes = self.start_station.daytime_routes.split()
        self.end_station_routes = self.end_station.daytime_routes.split()
        # am i using the routes variable correctly? is it needed?
        start_and_end_routes = list(set(self.start_station_routes + self.end_station_routes))
        
        # False if end station does not share a route with start station
        # True if they share a route
        same_line = modules.same_line(self.start_station_routes, self.end_station_routes)

        # NEED TO MAKE BRANCH FOR SAME LINE BUT EXPRESS TO LOCAL OR LOCAL TO EXPRESS
        if same_line == False:
            # 
            start_line_complex_ids = modules.find_complex_ids(self.start_station.daytime_routes)
            end_line_complex_ids = modules.find_complex_ids(self.end_station.daytime_routes)

            all_complex_ids = start_line_complex_ids + end_line_complex_ids
            
            # only return complex ids that appear more than once in the list
            # this means they appear both in start station and end station complexes
            shared_complexes = list(set([complex_id for complex_id in all_complex_ids if all_complex_ids.count(complex_id)>1]))
            
            # takes the complex_id list of shared_complexes and returns stations for each complex
            stations_in_complexes =  modules.complex_ids_to_stations(shared_complexes)
            
            # return all stations that serve a route that is served by the start and end station
            shared_stations = modules.get_shared_stations(stations_in_complexes, start_and_end_routes)
            self.shared_stations = shared_stations

            # Assign correct shared station to start_terminus and end_origin
            if shared_stations:
                for station in shared_stations:
                    shared_station_routes = station.daytime_routes.split()
                    for route in self.start_station_routes:
                        if route in shared_station_routes:
                            self.start_station_terminus = station
                    for route in self.end_station_routes:
                        if route in shared_station_routes:
                            self.end_station_origin = station

        start_station_endpoints = []
        for endpoint in self.start_station.station_endpoints:
            start_station_endpoints.append(endpoint.endpoint.endpoint)
        
        self.start_station_endpoints = list(set(start_station_endpoints))

        # End station endpoints might not be needed 
        end_station_endpoints = []
        for endpoint in self.end_station.station_endpoints:
            end_station_endpoints.append(endpoint.endpoint.endpoint)
        
        self.end_station_endpoints = list(set(end_station_endpoints))

        # self.all_endpoints = [self.start_station_endpoints] + [self.end_station_endpoints]
        # print('all eps', self.all_endpoints)

        

    def __repr__(self):
        return f'<Journey {self.start_station.stop_name} to {self.end_station.stop_name} through{self.shared_stations} at {self.time}>'

# accepts journey object as arg
# 
# all_train_data will provide every relevant train for a multi leg trip

class TrainData:

    def __init__(self, journey_object):
        # 2/4 look for this atribute in app.py and return message to front end? 
        self.missing_stations = None
        self.start_station_name = journey_object.start_station.stop_name
        self.end_station_name = journey_object.end_station.stop_name
        self.shared_station_names = None
        self.shared_stations = None
        self.journey_object = journey_object
        self.routes = set(journey_object.start_station_routes + journey_object.end_station_routes)

        if journey_object.shared_stations:
            self.shared_station_names = set([station.stop_name for station in journey_object.shared_stations]).pop()
            self.shared_stations = journey_object.shared_stations

        self.start_station_id = self.journey_object.start_station.gtfs_stop_id
        self.end_station_id = self.journey_object.end_station.gtfs_stop_id
        self.start_station_terminus_id = None
        self.end_station_origin_id = None
        if self.journey_object.start_station_terminus:
            self.start_station_terminus_id = self.journey_object.start_station_terminus.gtfs_stop_id
        if self.journey_object.end_station_origin:
            self.end_station_origin_id = self.journey_object.end_station_origin.gtfs_stop_id
        

        all_endpoints = journey_object.start_station_endpoints + journey_object.end_station_endpoints
        

        de_duplicated_endpoints = list(set(all_endpoints))
      
        # THIS IS WHERE THE REQUESTS HAPPEN 
        all_train_data = []
        for endpoint in de_duplicated_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)
        
        # THIS IS THE IMPORTANT INFO
        self.all_train_data = all_train_data
    
    def __repr__(self):
        return f'<TrainData from {self.routes} for {self.journey_object}>'
        

# FilteredTrains class takes train_data (gtfs json response), and start and end station gtfs id.
# It filters out trains that are irrelevant to our trip (not stoping at both stations) and converts json into an array of objects of the Train class.
class FilteredTrains:

    def __init__(self, train_data, start_station_id, end_station_id):
        
        self.start_station_id = start_station_id
        self.end_station_id = end_station_id
        # this is passed to SortedTrains if filter yields results
        self.train_obj_array = None
        # this is passed to TripError if filter produces empty array
        self.error_obj = None

        # filter the gtfs json data for trains relevant to the user's trip.
        # a successful trip (both stations in service), will yield a list of trains for our trip.
        # if no trains are found, an error object is returned containing information on which stops are not in service.
        self.filtered_train_data = modules.filter_trains_for_stations_direction_future_arrival(train_data, start_station_id, end_station_id)
        
        if self.filtered_train_data:
            self.train_obj_array = trains_to_objects(self.filtered_train_data)
        else:
            self.error_obj = self.filtered_train_data
        
    def __repr__(self):
        return f'<FilteredTrains #{len(self.filtered_train_data)} between {self.start_station_id} and {self.end_station_id} >'

# SortedTrains takes an array of Train objects, and sorts them by arrival at destination.
# start station, end station, and time can be changed to split trip into multiple legs
class SortedTrains:

    def __init__(self, train_obj_array, start_station_id, end_station_id, time=(round(current_time.timestamp()))):
        self.train_array = train_obj_array
        self.start_station_id = start_station_id
        self.end_station_id = end_station_id


        self.sorted_trains  = modules.sort_trains_by_arrival_at_destination(train_obj_array, start_station_id, end_station_id, time)
        self.first_train = self.sorted_trains[0]
        # self.first_train_id = self.first_train.train
        self.dest_arrival_time = self.sorted_trains[0]['dest_arrival_time']
        self.origin_arrival_time = self.sorted_trains[0]['origin_arrival_time']
        self.dest_arrival_time_readable = datetime.fromtimestamp(self.sorted_trains[0]['dest_arrival_time']).strftime('%H:%M:%S')
        self.origin_arrival_time_readable = datetime.fromtimestamp(self.sorted_trains[0]['origin_arrival_time']).strftime('%H:%M:%S')

    def __repr__(self):
        return f'<SortedTrains {self.first_train} from {self.start_station_id} at {self.origin_arrival_time_readable} to {self.end_station_id} at {self.dest_arrival_time_readable} >'
    
class TripError:

    def __init__(self, error_obj):
        self.error_obj = error_obj

    def __repr__(self):
        f'<TripError {self.error_obj}>'
            

# Takes data from SortedTrains object and formats it into an object that is sent to the client. 
# only returns one object, from the first train in trip_sequence
# trip sequence is a list created in app.py from SorteDTrains object(s). It is a list of trains sorted by dest arrival time, for each leg of the trip. 
class FormattedTrainData:
    def __init__(self, trip_sequence):
        self.trip_sequence = trip_sequence
        # for each trip in trip_sequence, a json compatible object is created and appended to trains_for_react.
        # trains for react is sent to the client and the information is displaid. 
        self.trains_for_react = []
        for trip in self.trip_sequence:
            
            start_station = Station.query.filter(Station.gtfs_stop_id == trip.start_station_id).first()
            end_station = Station.query.filter(Station.gtfs_stop_id == trip.end_station_id).first()
            # building our object from first train in trip_sequence
            first_train = trip.first_train['train']
            first_train_schedule = first_train.schedule
            # create an array of stop objects, the schedule for the train. 
            first_train_stop_schedule = []
            for stop in first_train_schedule:
                stop_obj = {
                    "stop_id" : stop.stop_id,
                    "arrival" : stop.arrival,
                    "departure" : stop.departure
                }
                first_train_stop_schedule.append(stop_obj)
            stop_schedule_ids = []
            for stop in first_train_stop_schedule:
                
                stop_schedule_ids.append(stop['stop_id'][:-1])

            train_for_react = {
                "train_id" : first_train.trip_id,
                "start_station" : start_station.stop_name,
                "start_station_gtfs" : trip.start_station_id,
                "start_station_arrival" : str(modules.convert_timestamp(first_train.arrival_time(trip.start_station_id)))[10:16],
                "end_station" : end_station.stop_name,
                "end_station_gtfs" : trip.end_station_id,
                "end_station_arrival" : str(modules.convert_timestamp(first_train.arrival_time(trip.end_station_id)))[10:16],
                "transfer_station" : None,
                "route" : first_train.route(),
                "direction_label" : None,
                "schedule" : first_train_stop_schedule,
                "number_of_stops" : stop_schedule_ids.index(trip.end_station_id) - stop_schedule_ids.index(trip.start_station_id),
                "trip_time" : round((first_train.arrival_time(trip.end_station_id) - first_train.arrival_time(trip.start_station_id)) / 60)
            }
            if first_train.direction() == "N":
                train_for_react['direction_label'] = start_station.north_direction_label
            if first_train.direction() == "S":
                train_for_react['direction_label'] = start_station.south_direction_label
            self.trains_for_react.append(train_for_react)
        # print('s.ft', self.first_train)
    def __repr__(self):
        return f'<FormattedTrainData >'

# Class to represent data from gtfs json train
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
            "length_of_trip" : modules.convert_seconds(self.schedule[1].arrival - self.schedule[0].departure)
        }
        return location

    def __repr__(self):
        return f'<Train {self.trip_id}>'

class Stop:
    def __init__(self, arrival, departure, stop_id):

        self.arrival = arrival
        self.departure = departure
        self.stop_id = stop_id

    def __repr__(self):
        return f'<Stop {self.stop_id} {str(modules.convert_timestamp(self.arrival))[11:-3]}>'
    
if __name__ == "__main__":
    with app.app_context():
        pass
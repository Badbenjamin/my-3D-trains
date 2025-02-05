from config import db, app
from flask import session, request
from sqlalchemy_serializer import SerializerMixin
import requests

from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2

from models import Station
import pprint
current_time = datetime.now()

from collections import Counter

import modules

# Converts JSON train into a easier to read object
# circular import issue, couldn't move to modules
def trains_to_objects(train_list):
        if type(train_list) == str:
            return train_list
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
        start_station_routes = self.start_station.daytime_routes.split()
        end_station_routes = self.end_station.daytime_routes.split()
        # am i using the routes variable correctly? is it needed?
        start_and_end_routes = list(set(start_station_routes + end_station_routes))
        
        # False if end station does not share a route with start station
        # True if they share a route
        same_line = modules.same_line(start_station_routes, end_station_routes)

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
                    for route in start_station_routes:
                        if route in shared_station_routes:
                            self.start_station_terminus = station
                    for route in end_station_routes:
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

        self.all_endpoints = [self.start_station_endpoints] + [self.end_station_endpoints]
        print('all eps', self.all_endpoints)

        

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
    
class Schedule:
    # make a train schedule class
    pass


# accepts journey object as arg
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
        if journey_object.shared_stations:
            # just working with one shared station now!
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
        
        all_endpoints = []

        for endpoint in journey_object.start_station_endpoints:
            all_endpoints.append(endpoint)
        
        for endpoint in journey_object.end_station_endpoints:
            all_endpoints.append(endpoint)

        de_duplicated_endpoints = list(set(all_endpoints))
      
        # THIS IS WHERE THE REQUESTS HAPPEN 
        all_train_data = []
        for endpoint in de_duplicated_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)
        
        self.all_train_data = all_train_data
        

    # returns all trains from provided endpoints
    # def get_all_trains(self):
    #     all_trains = []
    #     for train_feed in self.all_train_data:
    #         for train in train_feed.entity: 
    #             if train.HasField('trip_update'):
    #                 all_trains.append(train)
    #     return all_trains
    
    
    # HERE IS WHERE TO CHECK FOR STATION
    # get all trains heading in the correct direction and stopping at start and end stations
    # OR going to and from shared station (has start station terminus and end station origin)
    def get_leg_trains(self):
        filtered_leg_info_obj = {}
        if self.start_station_terminus_id == None and self.end_station_origin_id == None:
            # LEFT OFF HERE 2/4
            single_leg_data = trains_to_objects(modules.filter_trains_for_stations_direction_current(self.all_train_data, self.start_station_id, self.end_station_id))
            filtered_leg_info_obj = {"single_leg" : single_leg_data}
        elif self.start_station_terminus_id and self.end_station_origin_id:
            first_leg_data =  trains_to_objects(modules.filter_trains_for_stations_direction_current(self.all_train_data, self.start_station_id, self.start_station_terminus_id))
            second_leg_data = trains_to_objects(modules.filter_trains_for_stations_direction_current(self.all_train_data, self.end_station_origin_id, self.end_station_id))
            filtered_leg_info_obj = { "leg_one" :first_leg_data,"leg_two" : second_leg_data}
        return filtered_leg_info_obj
    
    # find the train that is arriving closest to current time
    # if two leg trip, "time" arg is current time by default, but is replaced by leg 1 dest arrival time in second function call.
    # CHANGE FROM 
    def get_next_train_data(self):
        leg_info = self.get_leg_trains()
        print("leg info", leg_info)
        if "leg_two" in leg_info:
            leg_one_train = modules.sort_trains_by_arrival_at_destination(leg_info['leg_one'], self.start_station_id, self.start_station_terminus_id)
            leg_one_arrival_time = leg_one_train['dest_arrival_time'] + 120
            leg_two_train = modules.sort_trains_by_arrival_at_destination(leg_info['leg_two'], self.end_station_origin_id, self.end_station_id, leg_one_arrival_time)
            return [{"train":leg_one_train['train'], "start": self.start_station_id, "end":self.start_station_terminus_id}, {"train":leg_two_train['train'], "start":self.end_station_origin_id, "end": self.end_station_id}]
        elif "single_leg" in leg_info:
            single_leg_train = modules.sort_trains_by_arrival_at_destination(leg_info['single_leg'], self.start_station_id, self.end_station_id)
            return [{"train" : single_leg_train['train'], "start":self.start_station_id, "end":self.end_station_id}]
        
    def format_for_react(self):
        trains_for_react = []
        
        for train in self.get_next_train_data():
            start_station = Station.query.filter(Station.gtfs_stop_id == train['start']).first()
            end_station = Station.query.filter(Station.gtfs_stop_id == train['end']).first()
            stop_schedule = []
            
            # should Schedule be replaced with a class?
            for stop in train['train'].schedule:
                stop_obj = {
                    "stop_id" : stop.stop_id,
                    "arrival" : stop.arrival,
                    "departure" : stop.departure
                }
                stop_schedule.append(stop_obj)
            stop_schedule_ids = []
            for stop in stop_schedule:
                stop_schedule_ids.append(stop['stop_id'][:-1])
            
            print("arrival", train['train'].arrival_time(train['start']))
            # print("train",train)
            train_for_react = {
                
                "train_id" : train['train'].trip_id,
                # START STATION CHANGES 
                "start_station" : start_station.stop_name,
                "start_station_gtfs" : train['start'],
                "start_station_arrival" : str(modules.convert_timestamp(train['train'].arrival_time(train['start'])))[10:16],
                # END STATION CHANGES
                "end_station" : end_station.stop_name,
                "end_station_gtfs" : train['end'],
                "end_station_arrival" : str(modules.convert_timestamp(train['train'].arrival_time(train['end'])))[10:16],
                "transfer_station" : None,
                "route" : train['train'].route(),
                "direction_label" : None,
                "schedule" : stop_schedule,
                "number_of_stops" : stop_schedule_ids.index(train['end']) - stop_schedule_ids.index(train['start']),
                "trip_time" : round((train['train'].arrival_time(train['end']) - train['train'].arrival_time(train['start'])) / 60)
            }
            # DIRECTION LABEL NEEDS WORK
            # Do I want to query db again to get info or pass that info down from the start?
            if train['train'].direction() == "N":
                train_for_react['direction_label'] = start_station.north_direction_label
            if train['train'].direction() == "S":
                train_for_react['direction_label'] = start_station.south_direction_label
            trains_for_react.append(train_for_react)
            # print(train_for_react['start_station_arrival'])
        # print(trains_for_react)
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
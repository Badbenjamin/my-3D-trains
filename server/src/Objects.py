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

def filter_trains_for_stations_direction_current(train_data, start_station_id, end_station_id):
        
        filtered_trains = []
        for train_feed in train_data:
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


def sort_trains_by_arrival_at_destination(filtered_train_data_object, dest_station_id, time=(round(current_time.timestamp()))):
    
        trains_with_arrival = []
        # swapped self.filter_trains_for_stations_direction_current() for get_legInfo()
        for train in filtered_train_data_object:
            arrival_train = {"train" : train, "dest_arrival_time" : None}
            for stop in train.schedule:
                if stop.stop_id[:-1] == dest_station_id:
                    arrival_train['dest_arrival_time'] = stop.arrival
            trains_with_arrival.append(arrival_train)
        
        next_train = None
       
        for train in trains_with_arrival:
            if next_train == None and train['dest_arrival_time'] > time:
                next_train = train
            elif train['dest_arrival_time'] > time and train['dest_arrival_time'] < next_train['dest_arrival_time']:
                next_train = train
        return next_train

class Journey:

    def __init__(self, start_station_id, end_station_id, time=None):
        self.start_station = Station.query.filter(Station.id == start_station_id).first()
        self.end_station = Station.query.filter(Station.id == end_station_id).first()
        self.start_station_terminus = None
        self.end_station_origin = None
        # self.transfer_stations = []
        self.shared_stations = []
        self.time = time
        
        if self.start_station.daytime_routes != self.end_station.daytime_routes:
            # split up daytime route strings, add complex ids to list 
            start_line_complex_ids = []
            for route in (self.start_station.daytime_routes):
                if route != " ":
                    for station in Station.query.filter(Station.daytime_routes.contains(route)).all():
                        if station.complex_id not in start_line_complex_ids:
                            start_line_complex_ids.append(station.complex_id)
            end_line_complex_ids = []
            for route in (self.end_station.daytime_routes):
                if route != " ":
                    for station in Station.query.filter(Station.daytime_routes.contains(route)).all():
                        if station.complex_id not in end_line_complex_ids:
                            end_line_complex_ids.append(station.complex_id)
            
            # all the complex ids for each station on the lines involved in the trip
            complex_ids = start_line_complex_ids + end_line_complex_ids
            # complex_ids = [station.complex_id for station in all_stations]
            
            # only return complex ids that appear more than once in the list
            # this means they appear both in start station and end station complexes
            # all other complex ids are unique to individual lines, and not shared
            shared_complexes = list(set([complex_id for complex_id in complex_ids if complex_ids.count(complex_id)>1]))
            
            complex_stations =  []
            for complex_number in shared_complexes:
                complexes = Station.query.filter(Station.complex_id == complex_number).all()
                for complex in complexes:
                    complex_stations.append(complex)
            
            # NEED TO MODIFY THIS TO TAKE INDIVIDUAL ROUTES
            # these are the stations that share the daytime routes with the start and end stations
            # make list of routes for start and end stations
            routes = []
            for route in (self.start_station.daytime_routes + self.end_station.daytime_routes):
                if route != " ":
                    routes.append(route)
            print("routes", routes)
            shared_stations = []
            for station in complex_stations:
                # Modify to work with stations that have multiple daytime routes
                complex_station_routes = []
                for route in station.daytime_routes:
                    if route != " " and route in routes:
                        shared_stations.append(station)    
            self.shared_stations = list(set(shared_stations))
            print('ss',self.shared_stations)
            
            # assign shared stations to start line and end line (might need to be list in future)
            
            # print(self.start_station.daytime_routes)
            if shared_stations:
                for station in shared_stations:
                    # print(self.start_station.daytime_routes)
                    if station.daytime_routes == self.start_station.daytime_routes:
                        self.start_station_terminus = station
                    if station.daytime_routes == self.end_station.daytime_routes:
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
    
class Schedule:
    # make a train schedule class
    pass


# accepts journey object as arg
# all_train_data will provide every relevant train for a multi leg trip
class TrainData:

    def __init__(self, journey_object):
        print(journey_object)

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
      
        all_train_data = []
        
        for endpoint in de_duplicated_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)
        
        print(self.shared_stations)
        self.all_train_data = all_train_data
        

    # returns all trains from provided endpoints
    def get_all_trains(self):
        all_trains = []
        for train_feed in self.all_train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    all_trains.append(train)
        return all_trains
    
    
    def get_leg_info(self):
        filtered_leg_info_obj = {}
        if self.start_station_terminus_id == None and self.end_station_origin_id == None:
            single_leg_data = filter_trains_for_stations_direction_current(self.all_train_data, self.start_station_id, self.end_station_id)
            filtered_leg_info_obj = {"single_leg" : single_leg_data}
        elif self.start_station_terminus_id and self.end_station_origin_id:
            first_leg_data =  filter_trains_for_stations_direction_current(self.all_train_data, self.start_station_id, self.start_station_terminus_id)
            second_leg_data = filter_trains_for_stations_direction_current(self.all_train_data, self.end_station_origin_id, self.end_station_id)
            filtered_leg_info_obj = { "leg_one" :first_leg_data,"leg_two" : second_leg_data}
        return filtered_leg_info_obj

    def get_next_train_data(self):
        leg_info = self.get_leg_info()
        if "leg_two" in leg_info:
            leg_one_train = sort_trains_by_arrival_at_destination(leg_info['leg_one'], self.start_station_terminus_id)
            leg_one_arrival_time = leg_one_train['dest_arrival_time']
            leg_two_train = sort_trains_by_arrival_at_destination(leg_info['leg_two'],self.end_station_id, leg_one_arrival_time)
            return [{"train":leg_one_train['train'], "start": self.start_station_id, "end":self.start_station_terminus_id}, {"train":leg_two_train['train'], "start":self.end_station_origin_id, "end": self.end_station_id}]
        elif "single_leg" in leg_info:
            single_leg_train = sort_trains_by_arrival_at_destination(leg_info['single_leg'], self.end_station_id)
            return [{"train" : single_leg_train['train'], "start":self.start_station_id, "end":self.end_station_id}]
        
    def format_for_react(self, journey_object):
        print('ntd',self.get_next_train_data())
        trains_for_react = []
        # get correct start and end stations depending on single leg, first leg, second leg...
        for train in self.get_next_train_data():
            print("t",train)
            # print("j", journey_object.end_station)
            print(journey_object.start_station_terminus)
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
            # print()
            # print(stop_schedule_ids.index(journey_object.end_station.gtfs_stop_id) - stop_schedule_ids.index(journey_object.start_station.gtfs_stop_id))
            
            train_for_react = {
                "train_id" : train['train'].trip_id,
                # START STATION CHANGES 
                "start_station" : train['start'],
                # "start_station_gtfs" : journey_object.start_station.gtfs_stop_id,
                # "start_station_arrival" : str(convert_timestamp(train.arrival_time(journey_object.start_station.gtfs_stop_id))),
                # END STATION CHANGES
                "end_station" : train['end'],
                # "end_station_gtfs" : journey_object.end_station.gtfs_stop_id,
                # "end_station_arrival" : str(convert_timestamp(train.arrival_time(journey_object.end_station.gtfs_stop_id))),
                "transfer_station" : None,
                "route" : train['train'].route(),
                "direction_label" : None,
                "schedule" : stop_schedule,
                # "number_of_stops" : stop_schedule_ids.index(journey_object.end_station.gtfs_stop_id) - stop_schedule_ids.index(journey_object.start_station.gtfs_stop_id),
                # "trip_time" : (train.arrival_time(journey_object.end_station.gtfs_stop_id) - train.arrival_time(journey_object.start_station.gtfs_stop_id)) / 60
            }
            # DIRECTION LABEL NEEDS WORK
            # Do I want to query db again to get info or pass that info down from the start?
            if train['train'].direction() == "N":
                train_for_react['direction_label'] = journey_object.start_station.north_direction_label
            if train['train'].direction() == "S":
                train_for_react['direction_label'] = journey_object.start_station.south_direction_label
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
from datetime import datetime, timedelta
import math

# CIRCULAR IMPORT ISSUE
# from Objects import Train, Stop
from Objects import current_time
from Objects import Station
# from Objects import Stop

# convert 10 digit POSIX timestamp used in feed to readable format
def convert_timestamp(timestamp):
    return datetime.fromtimestamp(timestamp)

# converts seconds to delta time type
def convert_seconds(seconds):
    return timedelta(seconds = seconds)

# difference between a first time and a later time (second time)
def time_difference(first_time, second_time):
    detla_time = second_time - first_time
    return detla_time

def create_stop_schedule(train):
    stops = []
    # stops list contains each trains stop array. used to determine if start stop is before end stop
    stop_schedule = train.trip_update.stop_time_update
    for stop in stop_schedule:
        stops.append(stop.stop_id[:-1])
    return stops

def create_stop_scheudle_for_frontend():
     pass

# could I combine this into filter trains for station direction current?
def check_for_station_service(train_array, station_id):
    station_serivce = False
    for train in train_array:
        stops = create_stop_schedule(train)
        if station_id in stops:
            station_serivce = True
    return station_serivce
          
# takes all json data from endpoints and returns array of trains relevant for our trip
# returns array of JSON trains, each containing a schedule. 
def filter_trains_for_stations_direction_future_arrival(train_data, start_station_id, end_station_id):
        filtered_trains = []
        for train_feed in train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = create_stop_schedule(train)
                    # checking if start stop and end stop are present, and start stop is before end stop in stops array
                    if ((start_station_id in stops and end_station_id in stops) and (stops.index(start_station_id) < stops.index(end_station_id))):
                        stop_schedule = train.trip_update.stop_time_update
                        
                        for stop in stop_schedule:
                            arrival_time = stop.arrival.time
                            current_time_int = int(math.ceil(current_time.timestamp()))
                            # only add train if it arrives at start station, and that arrival time is in the future
                            if (stop.stop_id[:-1] == start_station_id) and (arrival_time > current_time_int):
                                filtered_trains.append(train)
                            # else:
                            #      other_trains.append(train)      
        return filtered_trains
       
             
# 
def create_obj_array_with_train_and_arrival(filtered_train_data_object, start_station_id, dest_station_id, ):
    # print('ftdo', filtered_train_data_object)
    trains_with_arrival = []
    for train in filtered_train_data_object:
        arrival_train = {"train" : train, "dest_arrival_time" : None, "origin_arrival_time" : None}
        for stop in train.schedule:
            if stop.stop_id[:-1] == dest_station_id:
                arrival_train['dest_arrival_time'] = stop.arrival
            elif stop.stop_id[:-1] == start_station_id:
                 arrival_train['origin_arrival_time'] = stop.arrival
        trains_with_arrival.append(arrival_train)
    return trains_with_arrival

# is quick sort efficient for a sorted array?
# it should be sorted correctly unless an express train arrives at the destination. 
def quick_sort_trains_by_arrival_time(train_obj_array):
    new_train_obj_array = [*train_obj_array]
    if len(new_train_obj_array) < 2:
         return new_train_obj_array
    else:
         pivot = new_train_obj_array[0]
         less = [nto for nto in new_train_obj_array[1:] if nto['dest_arrival_time'] <= pivot['dest_arrival_time']]
         greater = [nto for nto in new_train_obj_array[1:] if nto['dest_arrival_time'] > pivot['dest_arrival_time']]
         return quick_sort_trains_by_arrival_time(less) + [pivot] + quick_sort_trains_by_arrival_time(greater)

# def check_station_status(train_obj_array, start_station_id, end_station_id):
#     #  include line info?
#      for train_obj in train_obj_array:
#           train_schedule = [stop.stop_id[0:-1] for stop in train_obj['train'].schedule]
#           if start_station_id not in train_schedule:
#                print("start station not in service")
#           elif end_station_id not in train_schedule:
#                print('end station not in service')
#           else:
#                print('both stations in service')
               
     

# takes list of JSON trains (from filter_trains_for_stations_direction_future_arrival()) and returns list of trains sorted by arrival time at destination.
def sort_trains_by_arrival_at_destination(filtered_train_data_object, start_station_id, dest_station_id, time=(round(current_time.timestamp()))):
        
        # take JSON train array (filtered) and build objects with {train, dest arrival, origin arrival} key value pairs
        trains_with_arrival_objs_array = create_obj_array_with_train_and_arrival(filtered_train_data_object, start_station_id, dest_station_id)
        # use quicksort to sort array of objects by arrival at destination. 
        sorted_trains = [train for train in quick_sort_trains_by_arrival_time(trains_with_arrival_objs_array) if train['origin_arrival_time'] > time]
        
        return sorted_trains

# return a list of routes eg. [A,C,E] for a station
# This doesn't appear to be used!
def get_station_routes(station_daytime_routes):
    routes = []
    for route in station_daytime_routes:
        if route != " ":
            routes.append(route)
    return routes

# returns True if a route from the start station routes is present in the end station routes
# NEEDS TO BE ABLE TO HANDLE EXPRESS/LOCAL LOGIC
def same_line(start_station_routes, end_station_routes):
    for route in start_station_routes:
            if route not in end_station_routes:
                return False
            else:
                 return True

# takes daytime routes of a station (start or end), and returns the complex ids of all stations that are served by that route (eg. "G")
def find_complex_ids(daytime_routes):
     complex_ids = []
     for route in (daytime_routes):
                if route != " ":
                    # look at each station that has a route from daytime routes
                    for station in Station.query.filter(Station.daytime_routes.contains(route)).all():
                        # add the complex id of that station to our result
                        if station.complex_id not in complex_ids:
                            complex_ids.append(station.complex_id)
                return complex_ids

# convert complex ids to Stations   
def complex_ids_to_stations(shared_complexes):
    complex_stations =  []
    for complex_number in shared_complexes:
        complexes = Station.query.filter(Station.complex_id == complex_number).all()
        for complex in complexes:
            complex_stations.append(complex)
    return complex_stations

# 
def get_shared_stations(stations_in_complexes, routes):
    shared_stations = []
    for station in stations_in_complexes:
        for route in station.daytime_routes:
            if route != " " and route in routes:
                shared_stations.append(station) 
    return list(set(shared_stations))

def build_trip_schedule():
     pass
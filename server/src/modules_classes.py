from datetime import datetime, timedelta
import math

# CIRCULAR IMPORT ISSUE
# from Objects import Train, Stop
from Classes import current_time
from Classes import Station
import pprint
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
def check_for_station_service_on_failed_trip(train_data, start_station_id, end_station_id):
    
    # there are trains stopping at start station, and at end station, but not at both
    start_service = False
    end_service = False
    start_to_end_service = False
    for train_feed in train_data:
            
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = create_stop_schedule(train)
                    if (start_station_id in stops):
                         start_service = True
                    if (end_station_id in stops):
                         end_service = True
                    if (start_station_id in stops) and (end_station_id in stops):
                         start_to_end_service = True
    service_obj = {
        'start_station_service' : start_service,
        'end_station_service' : end_service,
        'start_to_end_service' : start_to_end_service,
    }
    return service_obj

# can i figure out direction if no trains are returned from filter?
def get_trip_direction(train_data, start_station_id, end_station_id):
     pass

# returns true if the station appears in the schedule of a train
def check_for_station_service(stops, station_id):
     service = False
     if station_id in stops:
          service = True
     else:
          service = False
     return service

# if start station id is before stop station id in stops (train schedule), then the train is headed in the correct direction.   
def check_for_correct_direction(stops, start_station_id, end_station_id):
     if (stops.index(start_station_id) < stops.index(end_station_id)):
         return True
     else:
          return False

# returns True train if it arrives at a specified station in the future
def check_station_arrival_or_departure(stop, station_id, deptarture_or_arrival):
        arrival_time = stop.arrival.time
        departure_time = stop.departure.time
        current_time_int = int(math.ceil(current_time.timestamp()))
        deptarture_or_arrival_time = None
        if deptarture_or_arrival == "departure":
             deptarture_or_arrival_time = departure_time
        if deptarture_or_arrival == "arrival":
             deptarture_or_arrival_time = arrival_time
        
        if (stop.stop_id[:-1] == station_id) and (deptarture_or_arrival_time > current_time_int):
            return True
        else:
            return False

# NOT SURE IF I NEED THIS. CHECK SS SERVICE AND CHECK ES SERVICE SHOULD COVER THIS. 
def check_if_train_route_matches_end_station_routes_start_station_routes(start_station_routes, end_station_routes, train_route):
    #  return True
     train_route_sliced = train_route[0]
     shared_routes_matching_train_route = []
     if (train_route_sliced in start_station_routes) and (train_route_sliced in end_station_routes):
          shared_routes_matching_train_route.append(train_route_sliced)
     if (shared_routes_matching_train_route):
        return True
     else:
        return False

# takes all json data from endpoints and returns array of trains relevant for our trip
# if there are trains serving both stations currently, and in the correct direction, return array of JSON trains, each containing a schedule. 
# if the trip is not possible, a trip_error_obj is returned with info about stations
def filter_trains_for_stations_direction_future_arrival(train_data, start_station, end_station):
        start_station_id = start_station.gtfs_stop_id
        end_station_id = end_station.gtfs_stop_id
        filtered_trains = []
        for train_feed in train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = create_stop_schedule(train)
                    if ((check_for_station_service(stops, start_station_id) and check_for_station_service(stops, end_station_id)) and (check_for_correct_direction(stops, start_station_id, end_station_id))):
                        stop_schedule = train.trip_update.stop_time_update
                        for stop in stop_schedule:
                            if (check_station_arrival_or_departure(stop, end_station_id, "arrival")):
                                 filtered_trains.append(train)
        return filtered_trains
         
        
       
             
# 
def create_obj_array_with_train_and_arrival(filtered_train_data_object, start_station_id, dest_station_id):

    trains_with_arrival = []
    for train in filtered_train_data_object:
        arrival_train = {"train" : train, "dest_arrival_time" : None, "origin_departure_time" : None}
        for stop in train.schedule:
            
            if stop.stop_id[:-1] == dest_station_id:
                arrival_train['dest_arrival_time'] = stop.arrival
            elif stop.stop_id[:-1] == start_station_id:
                 arrival_train['origin_departure_time'] = stop.departure
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


# takes list of JSON trains (from filter_trains_for_stations_direction_future_arrival()) and returns list of trains sorted by arrival time at destination.
# MULTI LEG TRIP PROBLEM WITH QUICK SORT
def sort_trains_by_arrival_at_destination(filtered_train_data_object, start_station_id, dest_station_id, time):
        # NO DESTINATION ARRIVAL TIME
        # take JSON train array (filtered) and build objects with {train, dest arrival, origin arrival} key value pairs
        trains_with_arrival_objs_array = create_obj_array_with_train_and_arrival(filtered_train_data_object, start_station_id, dest_station_id)
        # use quicksort to sort array of objects by arrival at destination.
        # 7 TRAIN TERMINUSES GIVING ORIGIN ARRIVAL TIME OF ZERO
        sorted_trains = [train for train in quick_sort_trains_by_arrival_time(trains_with_arrival_objs_array) if train['origin_departure_time'] >= time]
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

def start_shares_routes_with_end(start_station_routes, end_station_routes):
    shared_routes_between_start_end_stations = [route for route in end_station_routes if route in start_station_routes]
    if shared_routes_between_start_end_stations == []:
         return False
    else:
         return True

def get_station_express_local_info(lines_with_express_obj, station_routes):
    #  returns and array 
    routes_with_express_or_local = []
    for route in station_routes:
        # result_obj['start_routes'].append(start_route)
        for line_obj in lines_with_express_obj:
            if route in line_obj:
                selected_line_obj = lines_with_express_obj[line_obj]
                for line_route in selected_line_obj:
                     if route == line_route:
                        # result_obj['start_route']
                        routes_with_express_or_local.append({route : selected_line_obj[line_route]})
    return routes_with_express_or_local

def on_same_line(lines_with_express_obj, start_station_routes, end_station_routes):
    on_same_line = False
    for start_route in start_station_routes:
         for end_route in end_station_routes:
              for line_obj in lines_with_express_obj:
                   if start_route in line_obj and end_route in line_obj:
                        on_same_line = True
    return on_same_line 

def station_contains_express(station_routes_array_with_express_or_local, local_or_express):
    station_contains_express = False
    station_contains_local = False
    for route_obj in station_routes_array_with_express_or_local:
         for key in route_obj:
               if route_obj[key]:
                    station_contains_express = True
               elif route_obj[key] == False:
                    station_contains_local = True
    if local_or_express == "local":
         return station_contains_local
    elif local_or_express == "express":
         return station_contains_express
               

def get_journey_info(start_station_routes, end_station_routes):
    # print('ssr,esr', start_station_routes, end_station_routes)
    lines_with_express = {
        # Blue lines
        "ACE": {
            "A": True,   # Express
            "C": False,  # Local
            "E": True    # Express
        },
        
        # Orange lines
        "BDFM": {
            "B": True,   # Express
            "D": True,   # Express
            "F": True,   # Express on some segments
            "M": False   # Local
        },
        
        # Yellow lines
        "NQRW": {
            "N": True,   # Express
            "Q": True,   # Express
            "R": False,  # Local
            "W": False   # Local
        },
        
        # Red lines
        "123": {
            "1": False,  # Local
            "2": True,   # Express
            "3": True    # Express
        },
        
        # Green lines
        "456": {
            "4": True,   # Express
            "5": True,   # Express
            "6": False,  # Local
            "6x": True  # Express variant (rush hours)
        },
        
        # Purple line
        "7": {
            "7": False,      # Local
            "7x": True  # Express
        },
        
        # Brown lines
        "JZ": {
            "J": False,  # Local (express during rush hours)
            "Z": True    # Express (rush hours)
        },
        
        # Light green line
        "G": {
            "G": False   # Local
        },
        
        # Gray line
        "L": {
            "L": False   # Local
        },
        
        # Shuttles
        "S": {
            "S": False   # All shuttle services
        }
    }
    
    result_obj ={
         "start_routes" : [],
         "end_routes" : [],
         "on_same_colored_line" : None,
         "start_shares_routes_with_end" : None,
         "start_contains_express" : None,
         "start_contains_local" : None,
         "end_contains_express" : None,
         "end_contains_local" : None
    }
    
    result_obj['start_routes'] = get_station_express_local_info(lines_with_express, start_station_routes)
    result_obj['end_routes'] = get_station_express_local_info(lines_with_express, end_station_routes)
    result_obj['on_same_colored_line'] = on_same_line(lines_with_express, start_station_routes, end_station_routes)
    result_obj['start_shares_routes_with_end'] = start_shares_routes_with_end(start_station_routes, end_station_routes)             
    result_obj['start_contains_express'] = station_contains_express(result_obj['start_routes'], "express")
    result_obj['start_contains_local'] = station_contains_express(result_obj['start_routes'], "local")
    result_obj['end_contains_express'] = station_contains_express(result_obj['end_routes'], "express")
    result_obj['end_contains_local'] = station_contains_express(result_obj['end_routes'], "local")


    # print('ce', start_contains_express, end_contains_express)
    return result_obj
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

def get_transfer_station_info(shared_stations, start_station_routes, end_station_routes):
    # print('shared stations', shared_stations)
    start_station_termini = []
    end_station_origins = []
    transfer_station_obj_array = []
    for station in shared_stations:
        shared_station_routes = station.daytime_routes.split()
        for route in start_station_routes:
            if route in shared_station_routes:
                start_station_termini.append(station)
        for route in end_station_routes:
            if route in shared_station_routes:
                end_station_origins.append(station)
    
    for start_station in start_station_termini:
          transfer_info_obj = {
            'complex_id' : None,
            'start_term' : None,
            'end_origin' : None
          }
          for end_station in end_station_origins:
               if start_station.complex_id == end_station.complex_id:
                    transfer_info_obj['complex_id'] = start_station.complex_id
                    transfer_info_obj['start_term'] = start_station
                    transfer_info_obj['end_origin'] = end_station
          transfer_station_obj_array.append(transfer_info_obj)
    return transfer_station_obj_array
# def build_trip_sequence(journey_obj, train_data_obj):
#     trip_sequence = []
#     if journey_obj.shared_stations == []:
#         train_objs = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.end_station_id)
#         if (train_objs.train_obj_array):
#             sorted_trains = SortedTrains(train_objs.train_obj_array, train_data_obj.start_station_id, train_data_obj.end_station_id)
#             trip_sequence.append(sorted_trains)
#         else:
#             error = TripError(train_objs)
#             trip_sequence.append(error)
#     else:
#         leg_one = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.start_station_terminus_id)
#         trip_sequence.append(leg_one)
#         leg_two = FilteredTrains(train_data_obj.all_train_data, train_data_obj.end_station_origin_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120)
#         trip_sequence.append(leg_two)
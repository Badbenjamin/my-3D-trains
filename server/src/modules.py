from datetime import datetime, timedelta

# CIRCULAR IMPORT ISSUE
# from Objects import Train, Stop
from Objects import current_time
from Objects import Station

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

# this could be split up further
# WORK ON THIS FUNCTION
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
                            # might need to change this if moved to modules!
                            if stop.stop_id[:-1] == start_station_id and time_difference(current_time, convert_timestamp(stop.arrival.time)) > convert_seconds(30):
                                filtered_trains.append(train)
        # print("ft", filtered_trains)
        return filtered_trains

# WORK ON THIS FUNCTION
def sort_trains_by_arrival_at_destination(filtered_train_data_object, dest_station_id, time=(round(current_time.timestamp()))):
        print('time', time)
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
            elif train['dest_arrival_time'] > time and (train['dest_arrival_time'] < next_train['dest_arrival_time']):
                next_train = train
        print('next train', next_train)
        # print('ntat', convert_timestamp(next_train['dest_arrival_time']))
        # Raise except try that here?
        if next_train == None:
             print("no trains arriving at", dest_station_id)
        else:
            return next_train

# return a list of routes eg. [A,C,E] for a station
# This doesn't appear to be used!
def get_station_routes(station_daytime_routes):
    routes = []
    for route in station_daytime_routes:
        if route != " ":
            routes.append(route)
    return routes

# returns True if a route from the start station routes is present in the end station routes
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
     
def complex_ids_to_stations(shared_complexes):
    complex_stations =  []
    for complex_number in shared_complexes:
        complexes = Station.query.filter(Station.complex_id == complex_number).all()
        for complex in complexes:
            complex_stations.append(complex)
    return complex_stations

def get_shared_stations(stations_in_complexes, routes):
    shared_stations = []
    for station in stations_in_complexes:
        for route in station.daytime_routes:
            if route != " " and route in routes:
                shared_stations.append(station) 
    return list(set(shared_stations))
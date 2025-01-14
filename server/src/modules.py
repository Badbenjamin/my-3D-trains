from datetime import datetime, timedelta

# CIRCULAR IMPORT ISSUE
# from Objects import Train, Stop
from Objects import current_time

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

# CIRCULAR IMPORT ISSUE?
# def trains_to_objects(train_list):
#         train_object_list = []
#         for train in train_list:
#             new_schedule = []
#             for stop in train.trip_update.stop_time_update:
#                 new_stop = Stop(
#                     arrival= stop.arrival.time,
#                     departure= stop.departure.time,
#                     stop_id= stop.stop_id
#                 )
#                 new_schedule.append(new_stop)
            
#             new_train = Train(
#                 trip_id= train.trip_update.trip.trip_id,
#                 start_time= train.trip_update.trip.start_time,
#                 start_date= train.trip_update.trip.start_date,
#                 route_id= train.trip_update.trip.route_id,
#                 schedule= new_schedule
#             )
#             train_object_list.append(new_train)
#         return train_object_list

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
        return filtered_trains

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
        print('ntat', convert_timestamp(next_train['dest_arrival_time']))
        return next_train

# return a list of routes eg. [A,C,E] for a station
# This doesn't appear to be used!
def get_station_routes(station_daytime_routes):
    routes = []
    for route in station_daytime_routes:
        if route != " ":
            routes.append(route)
    return routes
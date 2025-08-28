from datetime import datetime, timedelta
import math

from Classes import current_time
from Classes import Station

current_time_int = int(math.ceil(current_time.timestamp()))

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



def trains_to_objects(filtered_trains):
        train_object_list = []
        for train in filtered_trains:
            new_schedule = []
            for stop in train.trip_update.stop_time_update:
                from Classes import Stop
                new_stop = Stop(
                    arrival= stop.arrival.time,
                    departure= stop.departure.time,
                    stop_id= stop.stop_id
                )
                new_schedule.append(new_stop)
            from Classes import Train
            new_train = Train(
                trip_id= train.trip_update.trip.trip_id,
                start_time= train.trip_update.trip.start_time,
                start_date= train.trip_update.trip.start_date,
                route_id= train.trip_update.trip.route_id,
                schedule= new_schedule
            )
            train_object_list.append(new_train)
        return train_object_list

def single_train_to_train_class(train):
    new_schedule = []
    for stop in train.trip_update.stop_time_update:
        from Classes import Stop
        new_stop = Stop(
            arrival= stop.arrival.time,
            departure= stop.departure.time,
            stop_id= stop.stop_id
        )
        new_schedule.append(new_stop)
    from Classes import Train
    new_train = Train(
                trip_id= train.trip_update.trip.trip_id,
                start_time= train.trip_update.trip.start_time,
                start_date= train.trip_update.trip.start_date,
                route_id= train.trip_update.trip.route_id,
                schedule= new_schedule
            )
    return new_train

# could I combine this into filter trains for station direction current?
def check_for_station_service_on_failed_leg(train_data, start_station_id, start_station_routes, end_station_id, end_station_routes):
    # there are trains stopping at start station, and at end station, but not at both
    start_service = False
    end_service = False
    start_to_end_service = False
    # I need to find the direction of the trip
    # then check if those trains serve the stations
    start_north_bound_service = False
    start_south_bound_service = False
    end_north_bound_service = False
    end_south_bound_service = False

    # start_station_daytimte_routes = start_station_routes
    # end_station_daytime_routes = end_station_routes

    # HOW DO I FIND SERVICE STATUS FOR EACH ROUTE?
    start_station_current_routes = []
    end_station_current_routes = []
    start_station_current_routes_north = []
    start_station_current_routes_south = []
    end_station_current_routes_north = []
    end_station_current_routes_south = []

    for train_feed in train_data:
            
            for train in train_feed.entity: 
                
                if train.HasField('trip_update'):
                    stops = create_stop_schedule(train)
                    direction = None
                    route_id = train.trip_update.trip.route_id
                    if (len(train.trip_update.stop_time_update)>0):
                        direction = train.trip_update.stop_time_update[0].stop_id[-1]

                    if (start_station_id in stops):
                         start_service = True
                         if route_id not in start_station_current_routes:
                            start_station_current_routes.append(route_id)
                    if (end_station_id in stops):
                         end_service = True
                         if route_id not in end_station_current_routes:
                            end_station_current_routes.append(route_id)
                    if (start_station_id in stops) and (end_station_id in stops):
                         start_to_end_service = True
                    if (direction):
                        if ((direction == "N") and (start_station_id in stops)):
                            start_north_bound_service = True
                            if route_id not in start_station_current_routes_north:
                                 start_station_current_routes_north.append(route_id)
                        if ((direction == "S") and (start_station_id in stops)):
                            start_south_bound_service = True
                            if route_id not in start_station_current_routes_south:
                                 start_station_current_routes_south.append(route_id)
                        if ((direction == "N") and (end_station_id in stops)):
                            end_north_bound_service = True
                            if route_id not in end_station_current_routes_north:
                                 end_station_current_routes_north.append(route_id)
                        if ((direction == "S") and (end_station_id in stops)):
                            end_south_bound_service = True
                            if route_id not in end_station_current_routes_south:
                                 end_station_current_routes_south.append(route_id)
    # print(start_station_current_routes, end_station_current_routes) 
    # print(start_station_current_routes_north, start_station_current_routes_south)
    # print(end_station_current_routes_north, end_station_current_routes_south)             
    service_obj = {
        'start_station_service' : start_service,
        'end_station_service' : end_service,
        'start_to_end_service' : start_to_end_service,
        "start_north_bound_service" : start_north_bound_service,
        "start_south_bound_service" : start_south_bound_service, 
        "end_north_bound_service" : end_north_bound_service, 
        "end_south_bound_service" : end_south_bound_service,

        # "start_station_daytime_routes" : start_station_daytimte_routes,
        # "end_station_daytime_routes" : end_station_daytime_routes,

        "start_station_current_routes_north" : start_station_current_routes_north,
        "start_station_current_routes_south": start_station_current_routes_south,
        "end_station_current_routes_north" : end_station_current_routes_north,
        "end_station_current_routes_south" : end_station_current_routes_south,

    }
    # print('so', service_obj)
    return service_obj

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
        deptarture_or_arrival_time = None
        if deptarture_or_arrival == "departure":
             deptarture_or_arrival_time = departure_time
        if deptarture_or_arrival == "arrival":
             deptarture_or_arrival_time = arrival_time

        if ((stop.stop_id[:-1] == station_id) and (deptarture_or_arrival_time > current_time_int)):
            return True
        else:
            return False

# NOT SURE IF I NEED THIS. CHECK SS SERVICE AND CHECK ES SERVICE SHOULD COVER THIS. 
def check_if_train_route_matches_end_station_routes_start_station_routes(start_station_routes, end_station_routes, train_route):
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
def filter_trains_for_stations_direction_future_arrival(train_data, start_station, end_station):
        start_station_id = start_station.gtfs_stop_id
        end_station_id = end_station.gtfs_stop_id
        filtered_trains = []
        for train_feed in train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = create_stop_schedule(train)
                    # could this be more performat? do all checks in one loop? 
                    if ((check_for_station_service(stops, start_station_id) and check_for_station_service(stops, end_station_id)) and (check_for_correct_direction(stops, start_station_id, end_station_id))):
                        stop_schedule = train.trip_update.stop_time_update
                        # HOW DO I CHECK FOR START STATION DEPARTURE IN FUTURE? 
                        origin_departure_in_future = False
                        dest_arrival_in_future = False
                        for stop in stop_schedule:
                            if ((check_station_arrival_or_departure(stop, start_station_id, "departure"))):
                                 origin_departure_in_future = True
                            if ((check_station_arrival_or_departure(stop, end_station_id, "arrival"))):
                                 dest_arrival_in_future = True
                        if (origin_departure_in_future and dest_arrival_in_future):
                            filtered_trains.append(train)
        return filtered_trains

def check_for_future_arrival_at_station(stops_with_info, gtfs_stop_id):
    result = False
    for stop in stops_with_info:
         if ((stop.stop_id[:-1] == gtfs_stop_id) and (stop.arrival.time >= current_time_int)):
              result = True
    return result

def get_station_arrival_times(gtfs_trains_for_station, gtfs_stop_id):
    
    trains_arriving_at_station_n = []
    trains_arriving_at_station_s = []
    for train_feed in gtfs_trains_for_station:
        for train in train_feed.entity: 
            if train.HasField('trip_update'):
                stops_no_direction = create_stop_schedule(train)
                stops_full_info = [stop for stop in train.trip_update.stop_time_update]
                if check_for_station_service(stops_no_direction, gtfs_stop_id) and check_for_future_arrival_at_station(stops_full_info, gtfs_stop_id):
                     our_stop = None
                     for stop in stops_full_info:
                          if gtfs_stop_id == stop.stop_id[:-1]:
                               our_stop = stop
                     
                     train_obj = {"route" : train.trip_update.trip.route_id, "train_id" : train.id, "arrival_time" : our_stop.arrival.time, "direction" : our_stop.stop_id[-1]}
                     if (train_obj['direction'] == "N"):
                          trains_arriving_at_station_n.append(train_obj)
                     elif (train_obj['direction'] == "S"):
                          trains_arriving_at_station_s.append(train_obj)
            elif train.HasField('alert'):
                #  WHAT CAN I DO WITH THIS INFO? 
                #  print('train alert 1', train)
                pass

    sorted_north_bound_trains = sorted(trains_arriving_at_station_n, key= lambda train : (train['arrival_time']))
    sorted_south_bound_trains = sorted(trains_arriving_at_station_s, key= lambda train : (train['arrival_time']))
    return {"n_bound_arrivals" : sorted_north_bound_trains[0:3], "s_bound_arrivals" : sorted_south_bound_trains}
                          
                    
# creates objs that make it easier to sort trains by arrival time.
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
# it should already be sorted correctly UNLESS an express train arrives at the destination. 
def quick_sort_trains_by_arrival_time(train_obj_array, sort_by_origin_departure_or_dest_arrival):
    sort_by = ''
    if sort_by_origin_departure_or_dest_arrival == 'destination_arrival':
         sort_by = 'dest_arrival_time'
    elif sort_by_origin_departure_or_dest_arrival == 'origin_departure':
         sort_by = 'origin_departure_time'
    new_train_obj_array = [*train_obj_array]
    if len(new_train_obj_array) < 2:
         return new_train_obj_array
    else:
         pivot = new_train_obj_array[0]
         less = [nto for nto in new_train_obj_array[1:] if nto[sort_by] <= pivot[sort_by]]
         greater = [nto for nto in new_train_obj_array[1:] if nto[sort_by] > pivot[sort_by]]
         return quick_sort_trains_by_arrival_time(less, sort_by_origin_departure_or_dest_arrival) + [pivot] + quick_sort_trains_by_arrival_time(greater, sort_by_origin_departure_or_dest_arrival)


# takes list of JSON trains (from filter_trains_for_stations_direction_future_arrival()) and returns list of trains sorted by arrival time at destination.
def sort_trains_by_arrival_at_destination_or_origin_departure(filtered_train_data_object, start_station_id, dest_station_id, time, sort_by_departure_or_arrival):
        departure_or_arrival = ''
        if sort_by_departure_or_arrival == 'destination_arrival':
             departure_or_arrival = 'destination_arrival'
        elif sort_by_departure_or_arrival == 'origin_departure':
             departure_or_arrival = 'origin_departure'
        # take JSON train array (filtered) and build objects with {train, dest arrival, origin arrival} key value pairs
        trains_with_arrival_objs_array = create_obj_array_with_train_and_arrival(filtered_train_data_object, start_station_id, dest_station_id)
        # use quicksort to sort array of objects by arrival at destination.
        sorted_trains = [train for train in quick_sort_trains_by_arrival_time(trains_with_arrival_objs_array, departure_or_arrival) if train['origin_departure_time'] >= time]
        return sorted_trains

# returns True if a route from the start station routes is present in the end station routes
def start_shares_routes_with_end(start_station_routes, end_station_routes):
    shared_routes_between_start_end_stations = [route for route in end_station_routes if route in start_station_routes]
    if shared_routes_between_start_end_stations == []:
         return False
    else:
         return True

# Takes a dict that contains info on express and local trains for each line. Returns an array of objects that state whether lines served by the station are express or local. 
def get_station_express_local_info(lines_with_express_obj, station_routes):
    routes_with_express_or_local = []
    for route in station_routes:
        for line_obj in lines_with_express_obj:
            if route in line_obj:
                selected_line_obj = lines_with_express_obj[line_obj]
                for line_route in selected_line_obj:
                     if route == line_route:
                        routes_with_express_or_local.append({route : selected_line_obj[line_route]})
    return routes_with_express_or_local

# Determines if a trip from start to dest is on one single line. 
def on_same_line(lines_with_express_obj, start_station_routes, end_station_routes):
    on_same_line = False
    for start_route in start_station_routes:
         for end_route in end_station_routes:
              for line_obj in lines_with_express_obj:
                   if start_route in line_obj and end_route in line_obj:
                        on_same_line = True
    return on_same_line 

# takes array fro get_station_express_local_info() and determines if it contains local or express routes. 
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
               
# Build an object that has info about what type of trip our user is trying to embark on. 
def get_journey_info(start_station_routes, end_station_routes):

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

def get_station_arrival_or_departure_time(stops, station_id, arrival_or_departure):   
     for stop in stops:
          if stop.stop_id[:-1] == station_id:
               if arrival_or_departure == "arrival":
                    return stop.arrival.time
               elif arrival_or_departure == "departure":
                    return stop.departure.time

# build an object with info for a transfer station. Start station trip terminus, and end station trip origin. 
def get_transfer_station_info(shared_stations, start_station_routes, end_station_routes):

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

# build object containing arrays of trains serving the start station, end station, or both. 
def get_trains_serving_start_station_end_station_or_both(train_data, start_station_id, end_station_id):
     trains_serving_start_station = []
     trains_serving_end_station = []
     trains_traveling_between_stations = []
     for train_feed in train_data.all_train_data:
            for train in train_feed.entity: 
                if train.HasField('trip_update'):
                    stops = create_stop_schedule(train)
                    stops_all_info = [stop for stop in train.trip_update.stop_time_update]
                    if check_for_station_service(stops, start_station_id) and check_for_station_service(stops, end_station_id) and check_for_correct_direction(stops, start_station_id, end_station_id):
                         new_train_obj = {
                              'train_id' : train.id,
                              'train' : train,
                              'start_station_arrival' : get_station_arrival_or_departure_time(stops_all_info, start_station_id, "arrival"),
                              'end_station_arrival' : get_station_arrival_or_departure_time(stops_all_info, end_station_id, 'arrival')
                         }
                         if new_train_obj['start_station_arrival'] < new_train_obj['end_station_arrival']:
                            trains_traveling_between_stations.append(new_train_obj)
                    elif check_for_station_service(stops, start_station_id) and (not check_for_station_service(stops, end_station_id)):
                         trains_serving_start_station.append(train)
                    elif check_for_station_service(stops, end_station_id) and (not check_for_station_service(stops, start_station_id)):
                         trains_serving_end_station.append(train)

     return {'trains_serving_start_station' : trains_serving_start_station, 'trains_serving_end_station' : trains_serving_end_station, 'trains_traveling_between_stations' : trains_traveling_between_stations}

# WORKS. MIGHT WANT TO OPTIMIZE LATER.
# do i need trains traveling between stations?
def find_local_and_express_train_pairs_with_transfer(start_station_id, end_station_id, trains_serving_start_station_array, trains_serving_end_station_array, trains_traveling_between_stations_array):
     # pairs of trains where the start train and end train (each stoping at start or end station), have a shared station in schedules
     train_pairs_with_transfer = []
    #  sorted_trains_traveling_between_stations = sorted(trains_traveling_between_stations_array, key= lambda train : (train['end_station_arrival']))
    

    #  looping throuth all trains that serve the start station
     for start_train in trains_serving_start_station_array:
        start_train_stops = [stop for stop in start_train.trip_update.stop_time_update]
        start_train_stops_no_direction = [stop.stop_id[:-1] for stop in start_train.trip_update.stop_time_update]
        start_station_info = None
        # for each start train, loop through every train serving the end station
        for end_train in trains_serving_end_station_array:   
            end_train_stops = [stop for stop in end_train.trip_update.stop_time_update]
            end_train_stops_no_direction = [stop.stop_id[:-1] for stop in end_train.trip_update.stop_time_update]

            end_station_info = None

            transfer_station_id = None
            start_train_transfer_station_arrival_time = None
            end_train_transfer_station_departure_time = None
            # looping through stop schedule of train serving start station
            for start_train_stop in start_train_stops:
                    if start_train_stop.stop_id[:-1] == start_station_id:
                        start_station_info = start_train_stop
                    # looping through schedule of train arriving at dest station
                    for end_train_stop in end_train_stops: 
                        if end_train_stop.stop_id[:-1] == end_station_id:
                            end_station_info = end_train_stop
                            
                        if start_train_stop.stop_id[:-1] == end_train_stop.stop_id[:-1]:
                            transfer_station_id = start_train_stop.stop_id[:-1]
                            start_train_transfer_station_arrival_time = start_train_stop.arrival.time
                            end_train_transfer_station_departure_time = end_train_stop.arrival.time
                            
                        if (start_train_stop.stop_id[:-1] == end_train_stop.stop_id[:-1]) and (start_station_info) and (end_station_info) and (transfer_station_id) and (start_station_info.departure.time > current_time_int) and (start_train_transfer_station_arrival_time + 60 < end_train_transfer_station_departure_time) and (end_train_transfer_station_departure_time - start_train_transfer_station_arrival_time <= 1200) and (start_train_stops_no_direction.index(start_station_id) < start_train_stops_no_direction.index(transfer_station_id) and (end_train_stops_no_direction.index(transfer_station_id) < end_train_stops_no_direction.index(end_station_id))):
                            new_train_pair_obj = {
                                'start_train_id' : start_train.id,
                                'end_train_id' : end_train.id,
                                'start_train' : start_train,
                                'end_train' : end_train,
                                'start_station_arrival' : start_station_info.arrival.time,
                                'end_station_arrival' : end_station_info.arrival.time,
                                'transfer_station_arrival' : start_train_transfer_station_arrival_time,
                                'transfer_station_departure' : end_train_transfer_station_departure_time,
                                'transfer_station_time_gap' : end_train_transfer_station_departure_time - start_train_transfer_station_arrival_time,
                                'transfer_station_start_train' : start_train_stop.stop_id[:-1],
                                'transfer_station_end_train' : end_train_stop.stop_id[:-1],
                            }   
                            
                            train_pairs_with_transfer.append(new_train_pair_obj)
                            # THIS APPEARS TO BE WORKING THE SAME WITHOUT PREVENTING DUPLICATES FROM GETTING IN ARRAY?
                            # COULD I ADD A HASHMAP TO MAKE THIS BETTER? 

                            # make sure duplicates are not in array of train pair objs. Only include unique pairs with unique transfers. 
                            # COULD I USE A HASHMAP TO MAKE THIS BETTER?
                            # if train_pairs_with_transfer:
                            #     in_array = False
                            #     for prev_train_obj in train_pairs_with_transfer:
                            #         if (prev_train_obj['start_train_id'] == new_train_pair_obj['start_train_id']) and (prev_train_obj['end_train_id'] == new_train_pair_obj['end_train_id']) and (prev_train_obj['transfer_station_start_train'] == new_train_pair_obj['transfer_station_start_train']):
                            #             in_array = True
                            #         else:
                            #             in_array = False
                            #     if in_array == False:
                            #         train_pairs_with_transfer.append(new_train_pair_obj)
                            # else:
                            #     train_pairs_with_transfer.append(new_train_pair_obj)
                           
     print('tpt0',len(train_pairs_with_transfer))
     return train_pairs_with_transfer

def find_train_with_soonest_arrival(train_array):
     best_train = None
     if train_array:
          for train in train_array:
               if (best_train == None) and (train['start_station_arrival'] > current_time_int):
                    best_train = train
               elif (train['end_station_arrival'] < best_train['end_station_arrival']) and (train['start_station_arrival'] > current_time_int):
                    best_train = train
     return best_train

# THIS ONE MIGHT NEED SOME WORK FOR WHEN EXPRESS RUNS LOCAL AT NIGHT
def find_best_trains_and_transfer_local_express(train_data, start_station_id, end_station_id):
    
     trains_serving_stations_obj = get_trains_serving_start_station_end_station_or_both(train_data, start_station_id, end_station_id)
     trains_serving_start_station_array = trains_serving_stations_obj['trains_serving_start_station']
     trains_serving_end_station_array = trains_serving_stations_obj['trains_serving_end_station']
     trains_traveling_between_stations_array = trains_serving_stations_obj['trains_traveling_between_stations']
     print('st', len(trains_serving_start_station_array), 'en', len(trains_serving_end_station_array), 'both', len(trains_traveling_between_stations_array))
     
     train_pairs_with_transfer_array = find_local_and_express_train_pairs_with_transfer(start_station_id, end_station_id, trains_serving_start_station_array, trains_serving_end_station_array, trains_traveling_between_stations_array)
    # sort for earliest arrival at end station, AND largest gap between transfer station arrival and departure. 
     best_train_pairs_sorted = sorted(train_pairs_with_transfer_array, key= lambda tp : (tp['end_station_arrival'], -tp['transfer_station_time_gap']))
     best_train_pairs_sorted_de_duplicated = []
     train_pair_ids = []
     if best_train_pairs_sorted:
          for train_pair in best_train_pairs_sorted:
               if train_pair['start_train_id'] not in train_pair_ids:
                    train_pair_ids.append(train_pair['start_train_id'])
                    best_train_pairs_sorted_de_duplicated.append(train_pair)
    # LOOK INTO THIS SINCE IT HAS PROBLEMS WITH A TRAIN ON NIGHT SCHEDULE
     best_single_trains_sorted = sorted(trains_traveling_between_stations_array, key = lambda bst: bst['end_station_arrival'])
  
     print('btps', len(best_train_pairs_sorted_de_duplicated), 'bsts', len(best_single_trains_sorted) )
     if (len(best_train_pairs_sorted)>0) and (len(best_single_trains_sorted) > 0):
          if best_train_pairs_sorted_de_duplicated[0]['end_station_arrival'] < best_single_trains_sorted[0]['end_station_arrival']:
               return best_train_pairs_sorted_de_duplicated
          else: 
               return best_single_trains_sorted
     elif (len(best_train_pairs_sorted_de_duplicated) > 0) and not (len(best_single_trains_sorted) > 0):
          return best_train_pairs_sorted_de_duplicated
     elif (len(best_single_trains_sorted) > 0) and not (len(best_train_pairs_sorted_de_duplicated) > 0):
          return best_single_trains_sorted
     else:
          print('error')
          return False


def get_endpoints_for_station(station_endpoints):
    endpoints = []
    for endpoint in station_endpoints:
        endpoints.append(endpoint.endpoint.endpoint)
    
    de_duped_endpoints = list(set(endpoints))
    return de_duped_endpoints
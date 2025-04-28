from config import db, app
from flask import session, request
from sqlalchemy_serializer import SerializerMixin
import requests

from datetime import datetime
from google.transit import gtfs_realtime_pb2

from models import Station

current_time = datetime.now()
current_time_timestamp = round(current_time.timestamp())

import modules_classes

import pprint
# the journey class recieves start and end station ids from the front end.
# it determines what type of trip is being taken (a to b on one line, a to b through c, a to b with local to express transfer), and also gathers relevant endpoints for the trip. 
class Journey:

    def __init__(self, start_station_id, end_station_id, time=None):

        self.start_station = Station.query.filter(Station.id == start_station_id).first()
        self.end_station = Station.query.filter(Station.id == end_station_id).first()
        
        # accounting for stations in complexes, these are the stations that are shared between two lines on a two part trip.
        self.shared_stations = []

        # This array contains objects with start terminus and end origin stations, which have been derived from the shared stations array
        self.transfer_info_obj_array = None
        
        self.local_express = False
        self.time = time
        self.start_station_routes = self.start_station.daytime_routes.split()
        self.end_station_routes = self.end_station.daytime_routes.split()
        start_and_end_routes = list(set(self.start_station_routes + self.end_station_routes))
        
        # This variable contains info for the type of trip. Whether there is a transfer or if it involves local and express trains. 
        journey_info_obj = modules_classes.get_journey_info(self.start_station_routes, self.end_station_routes)

        # if not on same route, and also not on same colored line, the trip requires a transfer btw lines
        if (journey_info_obj['start_shares_routes_with_end'] == False) and (journey_info_obj['on_same_colored_line'] == False):
            # find complexes on start and end lines
            start_line_complex_ids = modules_classes.find_complex_ids(self.start_station.daytime_routes)
            end_line_complex_ids = modules_classes.find_complex_ids(self.end_station.daytime_routes)
            
            all_complex_ids = start_line_complex_ids + end_line_complex_ids
            shared_complexes = list(set([complex_id for complex_id in all_complex_ids if all_complex_ids.count(complex_id)>1]))
            
            # takes the complex_id list of shared_complexes and returns stations for each complex
            stations_in_complexes =  modules_classes.complex_ids_to_stations(shared_complexes)
            
            # return all stations that serve a route that is served by both the start and end station
            shared_stations = modules_classes.get_shared_stations(stations_in_complexes, start_and_end_routes)
            self.shared_stations = shared_stations
            
            # Assign correct shared station to start_terminus and end_origin. This array will be used to create routes for a trip involving two different lines. 
            if shared_stations:
                self.transfer_info_obj_array = modules_classes.get_transfer_station_info(shared_stations, self.start_station_routes, self.end_station_routes)
        # IF ON SAME COLORED LINE, BUT NOT SHARING ROUTE BTW START AND END, IT IS A LOCAL TO EXPRESS OR EXPRESS TO LOCAL TRIP
        elif (journey_info_obj['start_shares_routes_with_end'] == False) and (journey_info_obj['on_same_colored_line'] == True):
            self.local_express = True
        
        # Might not need end station endpoints? Train is leaving from a station that is served by a start station line to get to end station. 
        self.start_station_endpoints = modules_classes.get_endpoints_for_station(self.start_station.station_endpoints)
        self.end_station_endpoints = modules_classes.get_endpoints_for_station(self.end_station.station_endpoints)

    def __repr__(self):
        return f'<Journey {self.start_station.stop_name} to {self.end_station.stop_name} through{self.shared_stations} at {self.time}>'

# accepts journey object 
# all_train_data will provide every relevant train for a multi leg trip
class TrainData:

    def __init__(self, journey_object):
        
        self.start_station_name = journey_object.start_station.stop_name
        self.end_station_name = journey_object.end_station.stop_name
        self.journey_object = journey_object
        self.routes = set(journey_object.start_station_routes + journey_object.end_station_routes)
        self.local_express = None
        
        if journey_object.local_express:
            self.local_express = True

        self.start_station_id = self.journey_object.start_station.gtfs_stop_id
        self.end_station_id = self.journey_object.end_station.gtfs_stop_id
        
        all_endpoints = journey_object.start_station_endpoints + journey_object.end_station_endpoints
        
        de_duplicated_endpoints = list(set(all_endpoints))
       
        # THIS IS WHERE THE REQUESTS HAPPEN 
        # MAYBE SPLIT INTO START STATION AND END STATION ENDPOINTS IN FUTURE FOR EFFICIENT TWO LEG TRIPS
        all_train_data = []
        for endpoint in de_duplicated_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            all_train_data.append(feed)
        
        # THIS IS THE IMPORTANT INFO
        self.all_train_data = all_train_data
    
    def __repr__(self):
        return f'<TrainData from {self.routes} lines for trip from {self.start_station_name} to {self.end_station_name}>'

# Created in FilteredTrains class if the trip involves both local and express trains. 
# A best_trains_and_transfer object is translated into an array that will later be turned into TripSequenceElement objs
class LocalExpress:

    def __init__(self, best_trains_and_transfer_obj, start_station_id, end_station_id):
        self.best_trains_and_transfer_obj = best_trains_and_transfer_obj
        self.first_train = best_trains_and_transfer_obj[0]
        self.start_station_id = start_station_id
        self.end_station_id = end_station_id
        self.transfer_station = None
        self.two_trains = False
        self.local_is_faster = False
        self.error = False
        self.local_express_seq = None
        
        # if the filter doesn't yield results, it produces a TripError object, which is passed on to here. 
        if isinstance(self.first_train, TripError):
            self.error = True
        # If the trip can be completed with two trains, those two will be added to an array and formatted to be converted to TripSequenceElements later.
        elif self.first_train['transfer_station_start_train']:
            # THIS NEEDS WORK 
            # first_six_trains = []
            # start_train_ids = []
            # for train in best_trains_and_transfer_obj:
            #     # print(train['start_train_id'])
            #     if first_six_trains == []:
            #         first_six_trains.append(train)
            #         start_train_ids.append(train['start_train_id'])
            #     elif (len(first_six_trains) < 6) and (train['start_train_id'] not in start_train_ids):

            #         first_six_trains.append(train)
            #         start_train_ids.append(train['start_train_id'])
            # print(len(first_six_trains))
            self.two_trains = True
            self.transfer_station = self.first_train['transfer_station_start_train']
            self.start_station_arrival = self.first_train['start_station_arrival']
            self.transfer_station_arrival = self.first_train['transfer_station_arrival']
            self.end_station_arrival = self.first_train['end_station_arrival']
            self.sorted_start_trains = modules_classes.trains_to_objects([self.first_train['start_train']])
            self.sorted_end_trains = modules_classes.trains_to_objects([self.first_train['end_train']])
            # self.first_three_arrival_times_first_train = 
            
            # NEED TO LOOP THIS WITH TRAIN PAIRS
            self.local_express_seq = [
                {
                    'train_id' : self.first_train['start_train_id'],
                    'train' : self.sorted_start_trains[0],
                    # 'first_six_trains' : first_six_trains,
                    'start_station_id' : start_station_id,
                    'end_station_id' : self.first_train['transfer_station_start_train'],
                    'start_station_arrival' : self.first_train['start_station_arrival'],
                    'end_station_arrival' : self.first_train['transfer_station_arrival'],
                },
                {
                    'train_id' : self.first_train['end_train_id'],
                    'train' : self.sorted_end_trains[0], 
                    'start_station_id' : self.first_train['transfer_station_end_train'],
                    'end_station_id' : end_station_id,
                    'start_station_arrival' : self.first_train['transfer_station_departure'],
                    'end_station_arrival' : self.first_train['end_station_arrival'],
                }
            ]
        # if a local is available and faster, there is just one train for the trip.
        elif self.first_train['train_id']:
            self.local_is_faster = True
            sorted_trains = modules_classes.trains_to_objects([self.first_train['train']])
            first_six_trains = best_trains_and_transfer_obj[0:6]
            self.local_express_seq = [
                {
                    'train_id' : self.first_train['train_id'],
                    'train' : sorted_trains[0],
                    'first_six_arrival_times' : first_six_trains,
                    'start_station' : start_station_id,
                    'end_station' : end_station_id,
                    'start_station_arrival' : self.first_train['start_station_arrival'],
                    'end_station_arrival' : self.first_train['end_station_arrival']
                }
            ]

    def __repr__(self):
        if self.two_trains:
            return f'<LocalExpress {self.start_station_id} through {self.transfer_station} to {self.end_station_id} at {modules_classes.convert_timestamp(self.end_station_arrival)}>'
        elif self.local_is_faster:
            return f'<LocalExpress local is faster {self.start_station_id} to {self.end_station_id} at {modules_classes.convert_timestamp(self.end_station_arrival)}>'
        elif (self.error):
            return f'<LocalExpress ERROR {self.best_trains_and_transfer_obj}>'




# FilteredTrains class takes train_data (gtfs json response), and start and end station gtfs id.
# It filters out trains that are irrelevant to our trip (not stoping at both stations) and converts json into an array of objects of the Train class.
# COULD PASS START ENDPOINT DATA OR END ENDPOINT DATA IN TO MAKE MORE EFFICIENT ON TWO LEG TRIPS
class FilteredTrains:

    def __init__(self, train_data, start_station_id, end_station_id, time=current_time_timestamp):
        self.all_train_data = train_data.all_train_data
        self.start_station_id = start_station_id
        self.end_station_id = end_station_id
        self.start_station = Station.query.filter(Station.gtfs_stop_id == start_station_id).first()
        self.end_station = Station.query.filter(Station.gtfs_stop_id == end_station_id).first()
        
        self.trip_error_obj = None
        self.best_train = None
        self.sorted_train_objects = None
        self.local_express_seq = None
        self.local_express_seq_2 = []
        # if the trip involves a transfer from local to express trains or vice versa. 
        if train_data.local_express:
            # finds either a pair of trains with a transfer station, a single train (local faster), or no trains. No trains produces TripError object.
            # make this
            best_trains_and_transfer = modules_classes.find_best_trains_and_transfer_local_express(train_data, start_station_id, end_station_id)
            # print('bt&t', len(best_trains_and_transfer))
            if best_trains_and_transfer:
                for train_pair in best_trains_and_transfer:
                    # ACCOMODATE SINGLE TRAIN LATER IF THAT IS FASTEST OPTION
                    le_pair = [
                        {
                            'train_id' : train_pair['start_train_id'],
                            'train' : modules_classes.single_train_to_train_class(train_pair['start_train']),
                            # 'first_six_trains' : first_six_trains,
                            'start_station_id' : start_station_id,
                            'end_station_id' : train_pair['transfer_station_start_train'],
                            'start_station_arrival' : train_pair['start_station_arrival'],
                            'end_station_arrival' : train_pair['transfer_station_arrival'],
                        },
                        {
                            'train_id' : train_pair['end_train_id'],
                            'train' : modules_classes.single_train_to_train_class(train_pair['end_train']), 
                            'start_station_id' : train_pair['transfer_station_end_train'],
                            'end_station_id' : end_station_id,
                            'start_station_arrival' : train_pair['transfer_station_departure'],
                            'end_station_arrival' : train_pair['end_station_arrival'],
                        }
                    ]
                    # print('lepair')
                    # pprint.pp(le_pair)
                    self.local_express_seq_2.append(le_pair)
            # if best_trains_and_transfer:
            #     # print('btato', len(best_trains_and_transfer))
            #     local_express_obj = LocalExpress(
            #         best_trains_and_transfer_obj = best_trains_and_transfer,
            #         start_station_id = start_station_id,
            #         end_station_id= end_station_id
            #     )
            #     self.local_express_seq = local_express_obj.local_express_seq
            else:
                self.trip_error_obj = TripError(self.all_train_data, self.start_station.gtfs_stop_id, self.end_station.gtfs_stop_id)
            # print('leseq2', self.local_express_seq_2)
        else:
            # filter the gtfs json data for trains relevant to the user's trip.
            self.filtered_train_data = modules_classes.filter_trains_for_stations_direction_future_arrival(self.all_train_data, self.start_station, self.end_station)
            # if filter yields results (trip can be completed by one or more trains), we will turn the first train into a BestTrain object.
            if len(self.filtered_train_data) > 0:
                train_obj_array = modules_classes.trains_to_objects(self.filtered_train_data)
                self.sorted_train_objects =  modules_classes.sort_trains_by_arrival_at_destination(train_obj_array, start_station_id, end_station_id, time)
                
                # self.best_train = self.sorted_train_objects[0]
                # print('sorted', self.sorted_train_objects)
                # MIGHT NOT NEED THIS
                self.best_train = self.sorted_train_objects[0]
                # print('bt', self.best_train)
            # if no trains are returned from the filter, we create a TripError object
            elif (self.filtered_train_data == []):
                self.trip_error_obj = TripError(self.all_train_data, self.start_station_id, self.end_station_id)

    def __repr__(self):
        if (self.best_train):
            return f'<FilteredTrains #Trains {len(self.filtered_train_data)} between {self.start_station_id} and {self.end_station_id} >'
        elif (self.local_express_seq):
            return f'<FilteredTrains Local->Exp trip {self.local_express_seq} >'
        else:
            return f'<FilteredTrains ERROR {self.trip_error_obj.start_station_id} {self.trip_error_obj.start_station_service} {self.trip_error_obj.end_station_id} {self.trip_error_obj.end_station_service}>'

# Created when a trip between stations yields no results from the FilteredTrains class.
# Checks for service at start station, end station, and if trains run between stations. 
class TripError:
    def __init__(self, train_data, start_station_id, end_station_id):
        self.train_data = train_data
        self.start_station_id = start_station_id
        self.end_station_id = end_station_id
        station_service_obj = modules_classes.check_for_station_service_on_failed_trip(train_data, start_station_id, end_station_id)

        self.start_station_service = station_service_obj['start_station_service']
        self.end_station_service = station_service_obj['end_station_service']
        self.between_station_service = station_service_obj['start_to_end_service']
        
    def __repr__(self):
        return f'<TripError {self.start_station_id} {self.start_station_service} {self.end_station_id} {self.end_station_service} trains between: {self.between_station_service}>'

# BestTrain takes an array of Train objects, sorts them by arrival at destination, and saves the first train.
class BestTrain:

    def __init__(self, train_obj_array, start_station_id, end_station_id, time):
        self.train_array = train_obj_array
        self.start_station_id = start_station_id #
        self.end_station_id = end_station_id #
        self.sorted_trains  = modules_classes.sort_trains_by_arrival_at_destination(train_obj_array, start_station_id, end_station_id, time)
        # print('bt sorted trains', self.sorted_trains)
        self.first_train_and_schedule = self.sorted_trains[0]
        self.first_six_sorted_trains = []

        if self.sorted_trains:
            for sorted_train in self.sorted_trains:
                if len(self.first_six_sorted_trains) < 3:
                    self.first_six_sorted_trains.append(sorted_train)

        
        self.first_train_only = self.first_train_and_schedule['train'] #
        self.first_train_id = self.first_train_only.trip_id #
        self.dest_arrival_time = self.first_train_and_schedule['dest_arrival_time'] #
        self.origin_departure_time = self.first_train_and_schedule['origin_departure_time'] #
        # print('st3',self.first_three_sorted_trains)
    def __repr__(self):
        return f'<BestTrain {self.first_train_id} of {len(self.sorted_trains)} from {self.start_station_id} at {self.origin_departure_time_readable} to {self.end_station_id} at {self.dest_arrival_time_readable} >'

class NextTrains:

    def __init__(self):
        pass


# accepts trip_sequence, which is made up of TripSequenceElement objs or TripError objs, and converts to JSON style for front end. 
class FormattedTrainData:
    def __init__(self, trip_sequence):
        self.trip_sequence = trip_sequence
        # trains for react is sent to the client and the information is displaid. 
        self.trains_for_react = []
        for trip in self.trip_sequence:
            if isinstance(trip, TripSequenceElement):
                start_station = Station.query.filter(Station.gtfs_stop_id == trip.start_station_id).first()
                end_station = Station.query.filter(Station.gtfs_stop_id == trip.end_station_id).first()
                first_train = trip.train
                # print('ft', first_train)
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
                    "start_station_departure" : datetime.fromtimestamp(trip.start_station_arrival).strftime('%-I:%M'),
                    "end_station" : end_station.stop_name,
                    "end_station_gtfs" : trip.end_station_id,
                    "end_station_arrival" : datetime.fromtimestamp(trip.end_station_arrival).strftime('%-I:%M'),
                    "transfer_station" : None,
                    "route" : first_train.route(),
                    "direction_label" : None,
                    "schedule" : first_train_stop_schedule,
                    "number_of_stops" : stop_schedule_ids.index(trip.end_station_id) - stop_schedule_ids.index(trip.start_station_id),
                    "trip_time" : (trip.end_station_arrival - trip.start_station_arrival)//60,

                    
                }
                if first_train.direction() == "N":
                    train_for_react['direction_label'] = start_station.north_direction_label
                if first_train.direction() == "S":
                    train_for_react['direction_label'] = start_station.south_direction_label
                # if hasattr(trip,'first_six_trains'):
                #     first_six_trains_formatted = []
                #     for train in trip.first_six_trains:
                #         # print(train['start_station_arrival'])
                #         if 'start_station_arrival' in train:
                #             # print('worked')
                #             formatted_string = train['start_train_id'][-1] + " " + datetime.fromtimestamp(train['start_station_arrival']).strftime('%-I:%M')
                #             first_six_trains_formatted.append(formatted_string)
                #         elif 'origin_departure_time' in train:
                #             # print('worked')
                #             formatted_string = train['train'].route_id + " " + datetime.fromtimestamp(train['origin_departure_time']).strftime('%-I:%M')
                #             first_six_trains_formatted.append(formatted_string)

                    # train_for_react["first_six_trains"] = first_six_trains_formatted
                # self.trains_for_react.append(train_for_react)
            elif isinstance(trip, TripError):
                start_station = Station.query.filter(Station.gtfs_stop_id == trip.start_station_id).first()
                end_station = Station.query.filter(Station.gtfs_stop_id == trip.end_station_id).first()
                error_for_react = {
                    "start_station_name" : start_station.stop_name,
                    "start_station_gtfs" : trip.start_station_id,
                    "start_station_service" : trip.start_station_service,
                    "end_station_name" : end_station.stop_name,
                    "end_station_gtfs" : trip.end_station_id,
                    "end_station_service" : trip.end_station_service,
                    "station_to_station_service" : trip.between_station_service
                }
                self.trains_for_react.append(error_for_react)
            
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

    # bug on terminus with no arrival time provided! Return departure if on the terminus. 
    def arrival_time(self, station_gtfs_id):
        for stop in self.schedule:
            if stop.stop_id[:-1] == station_gtfs_id:
                if stop.arrival:
                    return stop.arrival
                else:
                    return stop.departure
            
    def route(self):
        return self.route_id
    
    def direction(self):
        return self.schedule[0].stop_id[-1]
            
    def __repr__(self):
        return f'<Train {self.trip_id}>'

class Stop:
    def __init__(self, arrival, departure, stop_id):

        self.arrival = arrival
        self.departure = departure
        self.stop_id = stop_id

    def __repr__(self):
        return f'<Stop {self.stop_id} ARRIVAL {str(modules_classes.convert_timestamp(self.arrival))[11:-3]} DEPARTURE {str(modules_classes.convert_timestamp(self.departure))[11:-3]}>'
    
# This class accepts a BestTrain obj, or info from the local_express_sequence of a LocalExpress object, and saves the info to itself. 
class TripSequenceElement:

    def __init__(self, trip_info, start_gtfs=None, end_gtfs=None):
        self.train_id = None
        self.train = None
        self.start_station_id = start_gtfs
        self.end_station_id = end_gtfs
        self.start_station_arrival = None
        self.end_station_arrival = None
        self.error = None

        # if isinstance(trip_info, BestTrain):
        #     self.train = trip_info.first_train_only
        #     self.train_id = trip_info.first_train_id
        #     self.first_six_trains = trip_info.first_six_sorted_trains
        #     self.start_station_id = trip_info.start_station_id
        #     self.end_station_id = trip_info.end_station_id
        #     self.start_station_arrival = trip_info.origin_departure_time
        #     self.end_station_arrival = trip_info.dest_arrival_time
        # TRIP HAS A LOCAL TO EXPRESS OR EXP TO LOC TRANSFER
        if(isinstance(trip_info, Train)):
            # print('TRAIN', trip_info)
            self.train_id = trip_info.trip_id
            self.train = trip_info
            self.start_station_arrival = trip_info.arrival_time(start_gtfs)
            self.end_station_arrival = trip_info.arrival_time(end_gtfs)
        # LOCAL EXPRESS
        else:
            # print('ti',trip_info)
            self.train_id = trip_info['train_id']
            self.train = trip_info['train']
            self.start_station_id = trip_info['start_station_id']
            self.end_station_id = trip_info['end_station_id']
            self.start_station_arrival = trip_info['start_station_arrival']
            self.end_station_arrival = trip_info['end_station_arrival']
            # if 'first_six_trains' in trip_info:
            #     self.first_six_trains = trip_info['first_six_trains']
    def __repr__(self):
        # datetime.fromtimestamp(train['start_station_arrival']).strftime('%-I:%M')
        start_time_readable = datetime.fromtimestamp(self.start_station_arrival).strftime('%-I:%M')
        end_time_readable = datetime.fromtimestamp(self.end_station_arrival).strftime('%-I:%M')
        return f'<TripSequenceElement {self.train_id} from {self.start_station_id, start_time_readable} to {self.end_station_id, end_time_readable} >'

class ArrivalsForStation:

    def __init__(self, gtfs_stop_id):
        # get endpoint for route that station is on
        self.station = Station.query.filter(Station.gtfs_stop_id == gtfs_stop_id).first()
        # self.routes = self.station.daytime_routes.split()
        self.north_direction_label = self.station.north_direction_label
        self.south_direction_label = self.station.south_direction_label
        self.station_endpoints = modules_classes.get_endpoints_for_station(self.station.station_endpoints)
        # print('ss', self.station_endpoints)

        gtfs_trains_for_station = []
        for endpoint in self.station_endpoints:
            feed = gtfs_realtime_pb2.FeedMessage()
            response = requests.get(endpoint)
            feed.ParseFromString(response.content)
            gtfs_trains_for_station.append(feed)

        self.trains_for_station = modules_classes.get_station_arrival_times(gtfs_trains_for_station, gtfs_stop_id)
        self.n_bound_arrivals = self.trains_for_station['n_bound_arrivals']
        self.s_bound_arrivals = self.trains_for_station['s_bound_arrivals']

        self.arrivals_for_react = {
            "north_direction_label" : self.north_direction_label,
            "south_direction_label" : self.south_direction_label,
            "n_bound_arrivals" : [n_bound_arrival['route'] + " " + datetime.fromtimestamp(n_bound_arrival['arrival_time']).strftime('%-I:%M') for n_bound_arrival in self.n_bound_arrivals][0:3],
            "s_bound_arrivals" : [s_bound_arrival['route'] + " " + datetime.fromtimestamp(s_bound_arrival['arrival_time']).strftime('%-I:%M') for s_bound_arrival in self.s_bound_arrivals][0:3]
        }
        
    def __repr__(self):
        return f'<ArrivalsForStation>'

if __name__ == "__main__":
    with app.app_context():

        pass
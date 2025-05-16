from datetime import datetime
import math
from Classes import  FilteredTrains, TripSequenceElement, TripError
import pprint

current_time = datetime.now()
current_time_int = int(math.ceil(current_time.timestamp()))

# def filtered_trains_to_trip_sequence_element_or_trip_error(filtered_trains):
#     trip_sequence = []
#     # FilteredTrains returns nothing, a TripError object is created and stored in Filterdty
#     if filtered_trains.trip_error_obj:
#         trip_sequence.append(filtered_trains.trip_error_obj)
#     elif (filtered_trains.local_express_seq):
#         for train in filtered_trains.local_express_seq:
#             print('im in this func')
#             tse = TripSequenceElement(train)
#             trip_sequence.append(tse)
#     elif (filtered_trains.best_train):
#         tse = TripSequenceElement(filtered_trains.best_train)
#         trip_sequence.append(tse)
#     return trip_sequence

# def train_to_trip_sequence_element_or_trip_error_2(filtered_trains, sorted_train_obj_list=None):
#     trip_sequence = []
#     # FilteredTrains returns nothing, a TripError object is created and stored in Filterdty
#     if filtered_trains.trip_error_obj:
#         trip_sequence.append(filtered_trains.trip_error_obj)
#     elif (filtered_trains.local_express_seq):
#         for train in filtered_trains.local_express_seq:
#             tse = TripSequenceElement(train)
#             trip_sequence.append(tse)
#     elif (filtered_trains.best_train ):
#         tse = TripSequenceElement(filtered_trains.best_train)
#         trip_sequence.append(tse)
#     return trip_sequence

# def find_fastest_trip_or_return_error(possible_trip_sequences):
#     fastest_trip = None
#     error_trip = None
#     # Find fasted trip sequence in possible trip sequences array.
#     for trip in possible_trip_sequences:
#         if isinstance(trip[-1], TripSequenceElement):
#             if fastest_trip == None: 
#                 fastest_trip = trip
#             elif trip[-1].end_station_arrival < fastest_trip[-1].end_station_arrival:
#                 fastest_trip = trip
#         elif isinstance(trip[-1], TripError):
#             error_trip = trip
#     if fastest_trip:  
#         return fastest_trip
#     elif error_trip:
#         return error_trip

# Build a trip sequence on a multi leg trip   
# Not currently working if the second leg of the trip requires a local to express transfer
# def handle_trip_with_transfer_btw_lines(train_data_obj, journey_obj):
#     # all possible trips for multiple transfer stations
#     possible_trip_sequences = []
#     for transfer_obj in journey_obj.transfer_info_obj_array:
        
#         start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
#         end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
#         trip_sequence = [] 

#         leg_one_filtered_trains = FilteredTrains(train_data_obj, train_data_obj.start_station_id, start_terminus_gtfs_id, current_time_int)
#         # print(leg_one_filtered_trains.best_train.sorted_trains)
#         trip_sequence = filtered_trains_to_trip_sequence_element_or_trip_error(leg_one_filtered_trains)
#         print('htrs ts', trip_sequence)
#         if isinstance(trip_sequence[0],TripSequenceElement):
#             leg_two_filtered_trains = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id, leg_one_filtered_trains.best_train.dest_arrival_time)
#             leg_2_trip_sequence_element = filtered_trains_to_trip_sequence_element_or_trip_error(leg_two_filtered_trains)

#             for trip_seq in leg_2_trip_sequence_element:
#                 trip_sequence.append(trip_seq)
#         possible_trip_sequences.append(trip_sequence)
#     # print('pts', possible_trip_sequences)
#     return find_fastest_trip_or_return_error(possible_trip_sequences)

def build_sequences_with_transfer_btw_lines(train_data_obj, journey_obj):

    start_station_id = journey_obj.start_station.gtfs_stop_id
    end_station_id = journey_obj.end_station.gtfs_stop_id
    all_possible_ts_pairs = []

    for transfer_obj in journey_obj.transfer_info_obj_array:
        start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
        end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
        leg_one_sorted_train_obj_list = []
        leg_two_sorted_train_obj_list = []
       
        leg_one_filtered_trains = FilteredTrains(train_data_obj, train_data_obj.start_station_id, start_terminus_gtfs_id, current_time_int)
        # if the first leg has no trains serving both stations, create and return an error object in the trip seq
        # else sort the trains by arrival at destination
        if (leg_one_filtered_trains.trip_error_obj != None):
            all_possible_ts_pairs.append([leg_one_filtered_trains.trip_error_obj])
            return all_possible_ts_pairs
        else:
            leg_one_sorted_train_obj_list = leg_one_filtered_trains.train_objects_sorted_by_dest_arrival
        
        leg_two_filtered_trains = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id, current_time_int)

        if (leg_one_sorted_train_obj_list) and (leg_two_filtered_trains.trip_error_obj != None):
            # DO I NEED TO MAKE A PAIR FOR EVERY TRAIN EVEN THOUGH THE TRIP WONT WORK?
            for leg_one_train in leg_one_sorted_train_obj_list:
                ts_pair = []
                leg_one_trip_sequence = TripSequenceElement(leg_one_train['train'], start_station_id, start_terminus_gtfs_id)
                ts_pair.append(leg_one_trip_sequence)
                ts_pair.append(leg_two_filtered_trains.trip_error_obj)
                all_possible_ts_pairs.append(ts_pair)
            # sorted_ts_with_second_leg_trip_error = sorted(all_possible_ts_pairs, key = lambda ts_pair : ts_pair[0].start_station_arrival)
            # print(sorted_ts_with_second_leg_trip_error)
            return all_possible_ts_pairs
        else:
            leg_two_sorted_train_obj_list = leg_two_filtered_trains.train_objects_sorted_by_dest_arrival


        
        transfer_time = 180
        buffer_for_start_time = 30
        # USEFULL PRINT STATEMENT
        print('lens', len(leg_one_sorted_train_obj_list), len(leg_one_sorted_train_obj_list))
        ts_pairs_for_one_route = []
        count = 0
        # STILL NEED TO FIGURE OUT WHY LIST IS SHORT FOR CERTAIN TRIPS
        if leg_one_sorted_train_obj_list:
            for leg_one_train_obj in leg_one_sorted_train_obj_list:
                ts_pair = []
  
                if ((leg_one_train_obj['origin_departure_time']) >= (current_time_int + buffer_for_start_time)):
                    ts_pair.append(TripSequenceElement(leg_one_train_obj['train'], start_station_id, start_terminus_gtfs_id))
                    
                    if leg_two_sorted_train_obj_list:
                        i = 0
                        found = False
                        while ((found == False) and i < (len(leg_two_sorted_train_obj_list))):
                            
                            leg_two_train_obj = leg_two_sorted_train_obj_list[i]
                            
                            if ((leg_one_train_obj['dest_arrival_time'] + transfer_time) <= (leg_two_train_obj['origin_departure_time'])):
                                ts_pair.append(TripSequenceElement(leg_two_train_obj['train'], end_origin_gtfs_id, end_station_id))
                                count += 1
                      
                                ts_pairs_for_one_route.append(ts_pair)
                                found = True
                            else:
                                i += 1

    for pair in ts_pairs_for_one_route:
        all_possible_ts_pairs.append(pair)
    
    sorted_ts_pairs = sorted(all_possible_ts_pairs, key = lambda ts_pair : ts_pair[1].end_station_arrival)
    # print(count)
    return sorted_ts_pairs


def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequences = []
    if (journey_obj.shared_stations):
        # print('im here')
        # FILTERED TRAINS PASSED TO FUNCTION
        trip_sequence = build_sequences_with_transfer_btw_lines(train_data_obj, journey_obj)
        for ts_pair in trip_sequence:
            trip_sequences.append(ts_pair)
    elif (journey_obj.local_express):
        # NEED TO DEDUPE SORTED TRAINS
        local_express_trip = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id, current_time_int)
        # print('let')
        # pprint.pp(local_express_trip.local_express_seq)
        
        # print(len(local_express_trip.local_express_seq))
        # DO I NEED TO TURN THESE INTO <TRAIN> OBJS?
        for pair in local_express_trip.local_express_seq_2:
            # print('pair',pair)
            trip_sequence = []
            if len(pair) == 2:
                trip_sequence.append(TripSequenceElement(pair[0]['train'], pair[0]['start_station_id'], pair[0]['end_station_id']))
                trip_sequence.append(TripSequenceElement(pair[1]['train'], pair[1]['start_station_id'], pair[1]['end_station_id']))
            elif len(pair) == 1:
                trip_sequence.append(TripSequenceElement(pair[0]['train'], pair[0]['start_station_id'], pair[0]['end_station_id']))
            trip_sequences.append(trip_sequence)
        #     for train in pair:
        #         tse = TripSequenceElement(train)
        #         trip_sequence.append(tse)
        # trip_sequences.append(trip_sequence)
    else:
        filtered_trains_one_leg = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id, current_time_int)
        start_gtfs_id = train_data_obj.start_station_id
        end_gtfs_id = train_data_obj.end_station_id
        if filtered_trains_one_leg.trip_error_obj:
            trip_sequences.append([filtered_trains_one_leg.trip_error_obj])
        else:
            for train in filtered_trains_one_leg.train_objects_sorted_by_dest_arrival:
                trip_sequence = []
                tse = TripSequenceElement(train['train'], start_gtfs_id, end_gtfs_id)
                trip_sequence.append(tse)
                trip_sequences.append(trip_sequence)
    # print('ts',trip_sequences)
    return trip_sequences


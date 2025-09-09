from datetime import datetime
import math
from Classes import  FilteredTrains, TripSequenceElement, TripError
import pprint

current_time = datetime.now()
current_time_int = int(math.ceil(current_time.timestamp()))

# clinton washington c to coney island should be through j street but is not? 
# why is this not working? 
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
        # if the first leg has no trains serving both stations (error obj), create and return an error object in the trip seq
        # else sort the trains by arrival at destination
        if (leg_one_filtered_trains.trip_error_obj != None):
            all_possible_ts_pairs.append([leg_one_filtered_trains.trip_error_obj])
            return all_possible_ts_pairs
        else:
            leg_one_sorted_train_obj_list = leg_one_filtered_trains.train_objects_sorted_by_dest_arrival
        
        leg_two_filtered_trains = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id, current_time_int)
        # WHAT IS GOING ON HERE? 
        if (leg_one_sorted_train_obj_list) and (leg_two_filtered_trains.trip_error_obj != None):
            for leg_one_train in leg_one_sorted_train_obj_list:
                ts_pair = []
                leg_one_trip_sequence = TripSequenceElement(leg_one_train['train'], start_station_id, start_terminus_gtfs_id)
                ts_pair.append(leg_one_trip_sequence)
                ts_pair.append(leg_two_filtered_trains.trip_error_obj)
                all_possible_ts_pairs.append(ts_pair)
            return all_possible_ts_pairs
        else:
            leg_two_sorted_train_obj_list = leg_two_filtered_trains.train_objects_sorted_by_dest_arrival


        
        # transfer_time = 120
        from models import TransferTimes
        transfer_time = TransferTimes.query.filter(TransferTimes.from_stop_id == start_station_id and TransferTimes.to_stop_id == end_station_id).first().min_transfer_time
        # print('ntt', new_transfer_time)
        buffer_for_start_time = 30
        # USEFULL PRINT STATEMENT
        # print('lens', len(leg_one_sorted_train_obj_list), len(leg_one_sorted_train_obj_list))

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
    # pprint.pp(sorted_ts_pairs)
    # for pair in sorted_ts_pairs:
    #     pprint.pprint('sorted tspairs', sorted_ts_pairs)
    return sorted_ts_pairs


def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequences = []
    # IF TRIP HAS TRANSFER
    
    if (journey_obj.shared_stations):
        # print('jo shared stat', journey_obj.shared_stations)
        # FILTERED TRAINS PASSED TO FUNCTION
        trip_sequence = build_sequences_with_transfer_btw_lines(train_data_obj, journey_obj)

        for ts_pair in trip_sequence:
            trip_sequences.append(ts_pair)
    
    # IF TRIP REQUIRES TRANSFER AT ANY STATION FROM LOC TO EXP OR EXP TO LOC
    elif (journey_obj.local_express):
       
        local_express_trip = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id, current_time_int)
        # EXAMINE OPTION WHERE ONE TRAIN IS FASTER THAN LOCAL EXPRESS TRANSFER
        for pair in local_express_trip.local_express_seq_2:
            trip_sequence = []
            if len(pair) == 2:
                trip_sequence.append(TripSequenceElement(pair[0]['train'], pair[0]['start_station_id'], pair[0]['end_station_id']))
                trip_sequence.append(TripSequenceElement(pair[1]['train'], pair[1]['start_station_id'], pair[1]['end_station_id']))
            elif len(pair) == 1:
                trip_sequence.append(TripSequenceElement(pair[0]['train'], pair[0]['start_station_id'], pair[0]['end_station_id']))
            trip_sequences.append(trip_sequence)
    # IF TRIP IS ON THE SAME LINE AND DOES NOT REQIRE TRANSFER
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
    # print('tseqs', trip_sequences)
    return trip_sequences


from datetime import datetime
from Classes import  FilteredTrains, SortedTrains
import inspect
import pprint
current_time = datetime.now()

# if FilteredTrains obj (leg) has train info, the trains are sorted and set to info_for_trip_sequence
# if leg has TripError object instead, then that is set to info_for_trip_sequence
def return_sorted_trains_or_trip_error(leg_filtered_trains, start_station_id, end_station_id, time=(round(current_time.timestamp()))):
    info_for_trip_sequence = None
    # LEFT OFF HERE, need to get error passed to trip sequence, getting close...
    if (leg_filtered_trains.train_obj_array != None):
        sorted_trains = SortedTrains(leg_filtered_trains.train_obj_array, start_station_id, end_station_id, time)
        info_for_trip_sequence = sorted_trains
    elif (leg_filtered_trains.trip_error_obj != None):
        info_for_trip_sequence = leg_filtered_trains.trip_error_obj
    return info_for_trip_sequence

# WORKING BUT COULD USE REFACTORING AND DOCUMENTATION
# STRANGELY WORKS FOR LOCAL TO EXPRESS? MIGHT NEED TO CHECK IN ON THIS...
# Ok for two stations but kind of repetitive for lots of them
def handle_multi_leg_trip(train_data_obj, journey_obj):
    # print('tioa', journey_obj.transfer_info_obj_array)
    trip_sequences = []
    for transfer_obj in journey_obj.transfer_info_obj_array:
        start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
        end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
        trip_sequence = [] 
        leg_one_filtered_trains = FilteredTrains(train_data_obj, train_data_obj.start_station_id, start_terminus_gtfs_id)
        # print('l1', leg_one_filtered_trains)
        trip_sequence.append(return_sorted_trains_or_trip_error(leg_one_filtered_trains, train_data_obj.start_station_id, start_terminus_gtfs_id))

        if isinstance(trip_sequence[0],SortedTrains):
            leg_two = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id)
            # print('l2', leg_two)
            trip_sequence.append(return_sorted_trains_or_trip_error(leg_two, end_origin_gtfs_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120))
        else:
            pass
        trip_sequences.append(trip_sequence)
    
    fastest_trip = None
    error_trip = None
    for trip in trip_sequences:
        # trip[-1] is the second sorted trains obj, with the arrival at destination
        if isinstance(trip[-1], SortedTrains):
            if fastest_trip == None:
                fastest_trip = trip
            elif trip[-1].dest_arrival_time < fastest_trip[-1].dest_arrival_time:
                fastest_trip = trip
        else:
            error_trip = trip
    
    if fastest_trip:  
        return fastest_trip
    elif error_trip:
        return error_trip

def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    # an express to local trip or vice versa would not have shared stations, but would still require a transfer. 
    if journey_obj.shared_stations == []:
        leg = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id)
        trip_sequence = [return_sorted_trains_or_trip_error(leg, train_data_obj.start_station_id, train_data_obj.end_station_id)]
        # print('ts', trip_sequence[0].first_train_id)
    elif (journey_obj.local_express):
        
    else:
        trip_sequence = handle_multi_leg_trip(train_data_obj, journey_obj)
    return trip_sequence


from datetime import datetime
from Classes import  FilteredTrains, SortedTrains
import inspect
import pprint
current_time = datetime.now()

# if FilteredTrains obj (leg) has train info, the trains are sorted and set to info_for_trip_sequence
# if leg has TripError object instead, then that is set to info_for_trip_sequence
def return_sorted_trains_or_trip_error(leg_info, start_station_id, end_station_id, time=(round(current_time.timestamp()))):
    info_for_trip_sequence = None
    # LEFT OFF HERE, need to get error passed to trip sequence, getting close...
    if (leg_info.train_obj_array != None):
        sorted_trains = SortedTrains(leg_info.train_obj_array, start_station_id, end_station_id, time)
        info_for_trip_sequence = sorted_trains
    elif (leg_info.trip_error_obj != None):
        info_for_trip_sequence = leg_info.trip_error_obj
    return info_for_trip_sequence

# WORKING BUT COULD USE REFACTORING AND DOCUMENTATION
def handle_multi_leg_trip(train_data_obj, journey_obj):
    print('tioa', journey_obj.transfer_info_obj_array)
    trip_sequences = []
    for transfer_obj in journey_obj.transfer_info_obj_array:
        start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
        end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
        trip_sequence = [] 
        leg_one = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, start_terminus_gtfs_id)
        print('l1', leg_one)
        trip_sequence.append(return_sorted_trains_or_trip_error(leg_one, train_data_obj.start_station_id, start_terminus_gtfs_id))

        if isinstance(trip_sequence[0],SortedTrains):
            leg_two = FilteredTrains(train_data_obj.all_train_data, end_origin_gtfs_id, train_data_obj.end_station_id)
            print('l2', leg_two)
            trip_sequence.append(return_sorted_trains_or_trip_error(leg_two, end_origin_gtfs_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120))
        else:
            return trip_sequences[0]
        trip_sequences.append(trip_sequence)
        # print('trip sequence', trip_sequence)
    pprint.pp(trip_sequences)
    fastest_trip = None
    for trip in trip_sequences:
        print(trip[-1].dest_arrival_time)
        if fastest_trip == None:
            fastest_trip = trip
        elif trip[-1].dest_arrival_time < fastest_trip[-1].dest_arrival_time:
            fastest_trip = trip
    print('fastest', fastest_trip)
        
    return fastest_trip

def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    # an express to local trip or vice versa would not have shared stations, but would still require a transfer. 
    if journey_obj.shared_stations == []:
        leg = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.end_station_id)
        trip_sequence = [return_sorted_trains_or_trip_error(leg, train_data_obj.start_station_id, train_data_obj.end_station_id)]
    else:
        trip_sequence = handle_multi_leg_trip(train_data_obj, journey_obj)
    return trip_sequence


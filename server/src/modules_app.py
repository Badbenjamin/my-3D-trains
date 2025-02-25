from datetime import datetime
from Classes import  FilteredTrains, SortedTrains
current_time = datetime.now()

# if FilteredTrains obj (leg) has train info, the trains are sorted and set to info_for_trip_sequence
# if leg has TripError object instead, then that is set to info_for_trip_sequence
def return_sorted_trains_or_trip_error(leg_info, start_station_id, end_station_id, time=(round(current_time.timestamp()))):
    info_for_trip_sequence = None
    print('leginf', leg_info.train_obj_array[0])
    # LEFT OFF HERE, need to get error passed to trip sequence, getting close...
    if (leg_info.train_obj_array != None):
        
        sorted_trains = SortedTrains(leg_info.train_obj_array, start_station_id, end_station_id, time)
        print('sorted trains', sorted_trains)
        info_for_trip_sequence = sorted_trains
    elif (leg_info.trip_error_obj != None):
        info_for_trip_sequence = leg_info
        print('leg info error', leg_info)
    print('ifts', info_for_trip_sequence)
    return info_for_trip_sequence

def handle_multi_leg_trip(train_data_obj):
    
    trip_sequence = []
    leg_one = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.start_station_terminus_id)
    trip_sequence.append(return_sorted_trains_or_trip_error(leg_one, train_data_obj.start_station_id, train_data_obj.start_station_terminus_id))
    # trip_sequence[0] == error obj, check_station_service?
    # print('ts type' type)
    leg_two = FilteredTrains(train_data_obj.all_train_data, train_data_obj.end_station_origin_id, train_data_obj.end_station_id)
    trip_sequence.append(return_sorted_trains_or_trip_error(leg_two, train_data_obj.end_station_origin_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120))
    return trip_sequence

def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    if journey_obj.shared_stations == []:
        leg = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.end_station_id)
        # print('leg', leg)
        trip_sequence = return_sorted_trains_or_trip_error(leg, train_data_obj)
    else:
        trip_sequence = handle_multi_leg_trip(train_data_obj)
        # leg_one = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.start_station_terminus_id)
        # print('leg-one', leg_one)
        # trip_sequence.append(check_train_or_error(leg_one, train_data_obj))
        # leg_two = FilteredTrains(train_data_obj.all_train_data, train_data_obj.end_station_origin_id, train_data_obj.end_station_id)
        # trip_sequence.append(check_train_or_error(leg_two, train_data_obj, trip_sequence[0].dest_arrival_time + 120))
    print('ts', trip_sequence)
    return trip_sequence


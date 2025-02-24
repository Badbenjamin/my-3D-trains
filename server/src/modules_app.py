from Classes import  FilteredTrains, SortedTrains

def check_train_or_error(leg_info, train_data_obj):
    info_for_trip_sequence = None
    print('leg info', leg_info)
    # LEFT OFF HERE, need to get error passed to trip sequence, getting close...
    if (leg_info.train_obj_array):
        sorted_trains = SortedTrains(leg_info.train_obj_array, train_data_obj.start_station_id, train_data_obj.end_station_id)
        info_for_trip_sequence = sorted_trains
    elif (leg_info.trip_error_obj):
        info_for_trip_sequence = leg_info
    print('ifts', info_for_trip_sequence)
    return info_for_trip_sequence

def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    if journey_obj.shared_stations == []:
        leg = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.end_station_id)
        # print('leg', leg)
        trip_sequence.append(check_train_or_error(leg, train_data_obj))
    else:
        leg_one = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.start_station_terminus_id)
        trip_sequence.append(check_train_or_error(leg_one, train_data_obj))
        leg_two = FilteredTrains(train_data_obj.all_train_data, train_data_obj.end_station_origin_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120)
        trip_sequence.append(check_train_or_error(leg_two, train_data_obj))
    print('ts', trip_sequence)
    return trip_sequence


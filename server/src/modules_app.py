from Classes import  FilteredTrains, SortedTrains, TripError


def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    if journey_obj.shared_stations == []:
        train_objs = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.end_station_id)
        if (train_objs.train_obj_array):
            sorted_trains = SortedTrains(train_objs.train_obj_array, train_data_obj.start_station_id, train_data_obj.end_station_id)
            trip_sequence.append(sorted_trains)
        else:
            # pass trip error to trip sequence
            error = TripError(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.end_station_id)
            trip_sequence.append(error)
    else:
        leg_one = FilteredTrains(train_data_obj.all_train_data, train_data_obj.start_station_id, train_data_obj.start_station_terminus_id)
        trip_sequence.append(leg_one)
        leg_two = FilteredTrains(train_data_obj.all_train_data, train_data_obj.end_station_origin_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120)
        trip_sequence.append(leg_two)
    print('ts', trip_sequence)
    return trip_sequence


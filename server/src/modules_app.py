from datetime import datetime
import math
from Classes import  FilteredTrains, TripSequenceElement, TripError

current_time = datetime.now()
current_time_int = int(math.ceil(current_time.timestamp()))

def filtered_trains_to_trip_sequence_element_or_trip_error(filtered_trains):
    trip_sequence = []
    # FilteredTrains returns nothing, a TripError object is created and stored in Filterdty
    if filtered_trains.trip_error_obj:
        trip_sequence.append(filtered_trains.trip_error_obj)
    elif (filtered_trains.local_express_seq):
        for train in filtered_trains.local_express_seq:
            tse = TripSequenceElement(train)
            trip_sequence.append(tse)
    elif (filtered_trains.best_train):
        tse = TripSequenceElement(filtered_trains.best_train)
        trip_sequence.append(tse)
    return trip_sequence

def find_fastest_trip_or_return_error(possible_trip_sequences):
    fastest_trip = None
    error_trip = None
    # Find fasted trip sequence in possible trip sequences array.
    for trip in possible_trip_sequences:
        if isinstance(trip[-1], TripSequenceElement):
            if fastest_trip == None: 
                fastest_trip = trip
            elif trip[-1].end_station_arrival < fastest_trip[-1].end_station_arrival:
                fastest_trip = trip
        elif isinstance(trip[-1], TripError):
            error_trip = trip
    if fastest_trip:  
        return fastest_trip
    elif error_trip:
        return error_trip

# Build a trip sequence on a multi leg trip   
# Not currently working if the second leg of the trip requires a local to express transfer
def handle_trip_with_transfer_btw_lines(train_data_obj, journey_obj):
    # all possible trips for multiple transfer stations
    possible_trip_sequences = []
    for transfer_obj in journey_obj.transfer_info_obj_array:
        
        start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
        end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
        trip_sequence = [] 

        leg_one_filtered_trains = FilteredTrains(train_data_obj, train_data_obj.start_station_id, start_terminus_gtfs_id, current_time_int)
        trip_sequence = filtered_trains_to_trip_sequence_element_or_trip_error(leg_one_filtered_trains)
        
        if isinstance(trip_sequence[0],TripSequenceElement):
            leg_two_filtered_trains = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id, leg_one_filtered_trains.best_train.dest_arrival_time)
            leg_2_trip_sequence_element = filtered_trains_to_trip_sequence_element_or_trip_error(leg_two_filtered_trains)

            for trip_seq in leg_2_trip_sequence_element:
                trip_sequence.append(trip_seq)
        possible_trip_sequences.append(trip_sequence)

    return find_fastest_trip_or_return_error(possible_trip_sequences)


def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    if (journey_obj.shared_stations):
        trip_sequence = handle_trip_with_transfer_btw_lines(train_data_obj, journey_obj)
    else:
        leg = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id, current_time_int)
        
        trip_sequence = filtered_trains_to_trip_sequence_element_or_trip_error(leg)
    print('ts',trip_sequence)
    return trip_sequence


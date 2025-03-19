from datetime import datetime
from Classes import  FilteredTrains, BestTrain, TripSequenceElement, TripError
import inspect
import pprint
current_time = datetime.now()

# if FilteredTrains obj (leg) has train info, the trains are sorted and set to info_for_trip_sequence
# if leg has TripError object instead, then that is set to info_for_trip_sequence
def return_sorted_trains_or_trip_error(leg_filtered_trains, start_station_id, end_station_id, time=(round(current_time.timestamp()))):
    info_for_trip_sequence = None
    # LEFT OFF HERE, need to get error passed to trip sequence, getting close...
    if (leg_filtered_trains.train_obj_array != None):
        sorted_trains = BestTrain(leg_filtered_trains.train_obj_array, start_station_id, end_station_id, time)
        info_for_trip_sequence = sorted_trains
    elif (leg_filtered_trains.trip_error_obj != None):
        info_for_trip_sequence = leg_filtered_trains.trip_error_obj
    return info_for_trip_sequence

# WORKING BUT COULD USE REFACTORING AND DOCUMENTATION
# STRANGELY WORKS FOR LOCAL TO EXPRESS? MIGHT NEED TO CHECK IN ON THIS...
# Ok for two stations but kind of repetitive for lots of them
def handle_multi_leg_trip(train_data_obj, journey_obj):
    # CHECK ALL POSSIBLE TRANSFER STATIONS AND THEN RETURN ONE WITH EARLIEST ARRIVAL
    trip_sequences = []
    print('toa', journey_obj.transfer_info_obj_array)
    for transfer_obj in journey_obj.transfer_info_obj_array:
        start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
        end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
        trip_sequence = [] 
        leg_one_filtered_trains = FilteredTrains(train_data_obj, train_data_obj.start_station_id, start_terminus_gtfs_id)
        trip_sequence.append(return_sorted_trains_or_trip_error(leg_one_filtered_trains, train_data_obj.start_station_id, start_terminus_gtfs_id))
        # LEFT OFF HERE. WHAT DO I DO WITH ERROR?
        if isinstance(trip_sequence[0],BestTrain):
            leg_two = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id)
            trip_sequence.append(return_sorted_trains_or_trip_error(leg_two, end_origin_gtfs_id, train_data_obj.end_station_id, trip_sequence[0].dest_arrival_time + 120))
        
        trip_sequences.append(trip_sequence)
    
    fastest_trip = None
    error_trip = None
    print('trp sequenses', trip_sequences)
    for trip in trip_sequences:
        # trip[-1] is the second sorted trains obj, with the arrival at destination
        if isinstance(trip[-1], BestTrain):
            if fastest_trip == None: 
                fastest_trip = trip
            elif trip[-1].dest_arrival_time < fastest_trip[-1].dest_arrival_time:
                fastest_trip = trip
        elif isinstance(trip[-1], TripError):
            error_trip = trip
    
    if fastest_trip:  
        return fastest_trip
    elif error_trip:
        return error_trip

def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    # no shared stations means that the trip is on the same line and does not need a local/express transfer
    if journey_obj.shared_stations == [] and not journey_obj.local_express:
        print('1 single leg trip')
        leg = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id)
        # RETURN BEST TRAIN OR TRIP ERROR?
        pre_trip_sequence = [return_sorted_trains_or_trip_error(leg, train_data_obj.start_station_id, train_data_obj.end_station_id)]
        for pre_trip_seq_element in pre_trip_sequence:
            if isinstance(pre_trip_seq_element, TripError):
                trip_sequence.append(pre_trip_seq_element)
            # print('ptse', pre_trip_seq_element)
            elif isinstance(pre_trip_seq_element, BestTrain):
                tse = TripSequenceElement(pre_trip_seq_element)
                trip_sequence.append(tse)
    elif (journey_obj.local_express):
        print('2 local exp trip')
        local_express_trip = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id)
        # print('le_trip', local_express_trip)
        pre_trip_sequence = local_express_trip.local_express_seq
        print('pts', pre_trip_sequence)
        # ERROR OBJ?
        if pre_trip_sequence:
            for pre_trip_seq_element in pre_trip_sequence:
                tse = TripSequenceElement(pre_trip_seq_element)
                trip_sequence.append(tse)
        else:
            le_error = TripError(
                train_data= train_data_obj.all_train_data,
                start_station_id= train_data_obj.start_station_id,
                end_station_id= train_data_obj.end_station_id
            )
            trip_sequence.append(le_error)
    else:
        print('3 multi leg trip')
        pre_trip_sequence = handle_multi_leg_trip(train_data_obj, journey_obj)
        print('mlt pretripseq', pre_trip_sequence)
        # What about TripError element?
        for pre_trip_seq_element in pre_trip_sequence:
            if isinstance(pre_trip_seq_element, TripError):
                trip_sequence.append(pre_trip_seq_element)
            elif isinstance(pre_trip_seq_element, BestTrain):
                tse = TripSequenceElement(pre_trip_seq_element)
                trip_sequence.append(tse)
       
    print('ts', trip_sequence)
    return trip_sequence


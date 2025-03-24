from datetime import datetime
from Classes import  FilteredTrains, BestTrain, TripSequenceElement, TripError
import inspect
import pprint
current_time = datetime.now()

def filtered_trains_to_trip_sequence(filtered_trains):
    print('i worked')
    trip_sequence = []
    if filtered_trains.trip_error_obj:
        trip_sequence.append(filtered_trains.trip_error_obj)
    elif (filtered_trains.local_express_seq):
        
        for train in filtered_trains.local_express_seq:
            print('train', train)
            if isinstance(train, TripError):
                trip_sequence.append(train)
            else:
                tse = TripSequenceElement(train)
                trip_sequence.append(tse)
    elif (filtered_trains.best_train):
        tse = TripSequenceElement(filtered_trains.best_train)
        trip_sequence.append(tse)
    return trip_sequence
    
def handle_multi_leg_trip(train_data_obj, journey_obj):
    trip_sequences = []
    
    for transfer_obj in journey_obj.transfer_info_obj_array:
        
        start_terminus_gtfs_id = transfer_obj['start_term'].gtfs_stop_id
        end_origin_gtfs_id = transfer_obj['end_origin'].gtfs_stop_id
        trip_sequence = [] 
        leg_one_filtered_trains = FilteredTrains(train_data_obj, train_data_obj.start_station_id, start_terminus_gtfs_id)
        trip_sequence = filtered_trains_to_trip_sequence(leg_one_filtered_trains)
        
        if isinstance(trip_sequence[0],TripSequenceElement):
            # print('inside pt2')
            leg_two_filtered_trains = FilteredTrains(train_data_obj, end_origin_gtfs_id, train_data_obj.end_station_id, leg_one_filtered_trains.best_train.dest_arrival_time)
            print('l2ft', leg_two_filtered_trains)
            leg_2_trip_seq = filtered_trains_to_trip_sequence(leg_two_filtered_trains)
            for trip_seq in leg_2_trip_seq:
                trip_sequence.append(trip_seq)
        trip_sequences.append(trip_sequence)

    fastest_trip = None
    error_trip = None
    print('trp seqs', trip_sequences)
    for trip in trip_sequences:
        # trip[-1] is the second sorted trains obj, with the arrival at destination
        if isinstance(trip[-1], TripSequenceElement):
            if fastest_trip == None: 
                fastest_trip = trip
            elif trip[-1].end_station_arrival < fastest_trip[-1].end_station_arrival:
                fastest_trip = trip
        elif isinstance(trip[-1], TripError):
            error_trip = trip
    print('123',fastest_trip,error_trip)
    if fastest_trip:  
        return fastest_trip
    elif error_trip:
        return error_trip

    

def build_trip_sequence(journey_obj, train_data_obj):
    trip_sequence = []
    print('jo ss', journey_obj.shared_stations)
    # no shared stations means that the trip is on the same line and does not need a local/express transfer
    if journey_obj.shared_stations == [] and not journey_obj.local_express:
        print('1 single leg trip')
        leg = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id)
        trip_sequence = filtered_trains_to_trip_sequence(leg)
        print('slts', trip_sequence)
    elif (journey_obj.local_express) and journey_obj.shared_stations == []:
        print('2 local exp trip')
        local_express_trip = FilteredTrains(train_data_obj, train_data_obj.start_station_id, train_data_obj.end_station_id)
        print('le trip', local_express_trip)
        trip_sequence = filtered_trains_to_trip_sequence(local_express_trip)
        print('le trip ts', trip_sequence)
    elif (journey_obj.shared_stations):
        print('multi leg trip')
        trip_sequence = handle_multi_leg_trip(train_data_obj, journey_obj)
        
       
    print('ts', trip_sequence)
    return trip_sequence


from config import app
from datetime import datetime
from models import Station
from Classes import Journey, TrainData, FormattedTrainData, ArrivalsForStation
import modules_app



ct = datetime.now()



# takes input from journey planner, returns train or trains going from start to end station
@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
# start and end station id are not gtfs ids but just ids from the id column in the Stations table. 
def plan_trip(start_station_id, end_station_id):
    # new_journey contains endpoints for start and end stations, and calculates a transfer if applicable.
    new_journey = Journey(start_station_id, end_station_id)
    # show error if more than one transfer is needed
    if (len(new_journey.shared_stations)==0 and (new_journey.journey_info_obj['on_same_colored_line'] == False) and (new_journey.journey_info_obj['start_shares_routes_with_end'] == False)):
        trip_planner_error_obj = {
            "start_station_name" : new_journey.start_station.stop_name,
            "start_station_gtfs_id" : new_journey.start_station.gtfs_stop_id,
            "end_station_name" : new_journey.end_station.stop_name,
            "end_station_gtfs_id" : new_journey.end_station.gtfs_stop_id,
            "start_station_routes" : new_journey.start_station.daytime_routes.split(),
            "end_station_routes" : new_journey.end_station.daytime_routes.split(),
        }
        return {"trip_planner_error" : trip_planner_error_obj}
    # CONTINUE WITH BUILDING TRIP SEQUENCES
    else :
        # new_train_data takes the info from new_journey and uses it to make requests from the relevant MTA API route endpoints.
        # it contains the JSON train data from the realtime gtfs feed. 
        new_train_data = TrainData(new_journey)
        # trip_sequence is an array that contains either a TripSequenceElement object or a TripError object.
        trip_sequences = modules_app.build_trip_sequence(new_journey, new_train_data)
        # FormattedTrainData class takes our trip sequence (one or two trips), and converts the first arriving train to a dict, which is sent to client. 
        return FormattedTrainData(trip_sequences).trip_sequences_for_react, 200

# get names and routes (and gtfs id) for react-select search bar in journey planner
@app.route('/api/stations')
def get_all_stations():
    stations = Station.query.all()
    station_list = []
    complex_ids = []
    for station in stations:
        station_obj = {
        "name" : station.stop_name,
        "id" : station.id,
        "gtfs_stop_id" : station.gtfs_stop_id,
        "daytime_routes" : station.daytime_routes,
        "complex_id" : station.complex_id,
        "complex" : False
        }
        complex_ids.append(station.complex_id)
        station_list.append(station_obj)
    complex_list = [complex_id for complex_id in complex_ids if complex_ids.count(complex_id)>1]
    final_station_list = []
    for station in station_list:
        if station['complex_id'] in complex_list:
            station['complex'] = True
        final_station_list.append(station)

    return station_list, 200

# get station names for HTML text on map
# this request occurs in the Station component in the client. 
@app.route('/api/stationname/<string:gtfs_id>')

def get_station_name(gtfs_id):
    station = Station.query.filter(Station.gtfs_stop_id == gtfs_id).first()
    if station:
        return {"name" : station.stop_name, "daytime_routes" : station.daytime_routes, "id" : station.id, "gtfs_stop_id" : station.gtfs_stop_id}, 200
    else:
        return {"error" : "error"}, 500 

@app.route('/api/arrivals/<string:gtfs_id>')
def get_arrivals(gtfs_id):
    stationInfo = ArrivalsForStation(gtfs_id)
    return stationInfo.arrivals_for_react

# get train locations DO LATER
@app.route('/api/trainlocations')
def get_train_locations():
    pass

if __name__ == '__main__':
    app.run(debug=False)
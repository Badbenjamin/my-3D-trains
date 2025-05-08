from config import app
from datetime import datetime
from models import Station
from Classes import Journey, TrainData, FormattedTrainData, ArrivalsForStation
# import modules
import modules_app
import pprint

ct = datetime.now()

# takes input from journey planner, returns train or trains going from start to end station
@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
# start and end station id are not gtfs ids but just ids from the id column in the Stations table. 
def plan_trip(start_station_id, end_station_id):
    
    # new_journey contains endpoints for start and end stations, and calculates a transfer if applicable.
    new_journey = Journey(start_station_id, end_station_id)
    # new_train_data takes the info from new_journey and uses it to make requests from the relevant MTA API route endpoints.
    # it contains the JSON train data from the realtime gtfs feed. 
    new_train_data = TrainData(new_journey)
    # trip_sequence is an array that contains either a TripSequenceElement object or a TripError object.
    trip_sequences = modules_app.build_trip_sequence(new_journey, new_train_data)
    # print('ts1')
    # pprint.pp(trip_sequences[0])
    # FormattedTrainData class takes our trip sequence (one or two trips), and converts the first arriving train to a dict, which is sent to client. 
    return FormattedTrainData(trip_sequences).trip_sequences_for_react, 200

# get names and routes (and gtfs id) for react-select search bar in journey planner
@app.route('/api/stations')
def get_all_stations():
    stations = Station.query.all()
    station_list = []
    for station in stations:
        station_obj = {
        "name" : station.stop_name,
        "id" : station.id,
        "gtfs_stop_id" : station.gtfs_stop_id,
        "daytime_routes" : station.daytime_routes
        }
        station_list.append(station_obj)
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

# get train locations 
@app.route('/api/trainlocations')
def get_train_locations():
    pass

# @app.route('/api/allstationsinfo')
# def get_all_stations_info():
#     stations = 
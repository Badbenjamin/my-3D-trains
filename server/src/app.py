from config import app
from datetime import datetime
from models import Station
from Objects import Journey, TrainData, SortedTrains, FormattedTrainData
import modules

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
    # trip_sequence is each train of our trip after it has been filtered for station, direction, currenty running, and soonest arrival time at dest station. 
    # FilteredTrains class produces objects that convert JSON train data into Train class objects.
    trip_sequence = []
    if new_journey.shared_stations == []:
        trip_sequence.append(SortedTrains(new_train_data.all_train_data, new_train_data.start_station_id, new_train_data.end_station_id))
    else:
        trip_sequence.append(SortedTrains(new_train_data.all_train_data, new_train_data.start_station_id, new_train_data.start_station_terminus_id))
        trip_sequence.append(SortedTrains(new_train_data.all_train_data, new_train_data.end_station_origin_id, new_train_data.end_station_id, trip_sequence[0].dest_arrival_time + 120))
    
    #  HOW DOES IT GET THE FIRST TRAIN?
    return FormattedTrainData(trip_sequence).trains_for_react, 200

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
    print(gtfs_id)
    station = Station.query.filter(Station.gtfs_stop_id == gtfs_id).first()
    return {"name" : station.stop_name, "daytime_routes" : station.daytime_routes}, 200

# get train locations 
@app.route('/api/trainlocations')
def get_train_locations():
    pass
from config import app
from datetime import datetime
from models import Station
from Objects import Journey, TrainData, TripSchedule, FormattedTrainData
import modules

ct = datetime.now()

# takes input from journey planner, returns train or trains going from start to end station
@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
def plan_trip(start_station_id, end_station_id):
    # print('ids',start_station_id, end_station_id)
    new_journey = Journey(start_station_id, end_station_id)
    new_train_data = TrainData(new_journey)
    trip_sequence = []
    # eventually i'd like to replace this with a loop for trips with more than one transfer
    if new_journey.shared_stations == []:
        trip_sequence.append(TripSchedule(new_train_data.all_train_data, new_train_data.start_station_id, new_train_data.end_station_id))
    else:
        trip_sequence.append(TripSchedule(new_train_data.all_train_data, new_train_data.start_station_id, new_train_data.start_station_terminus_id))
        trip_sequence.append(TripSchedule(new_train_data.all_train_data, new_train_data.end_station_origin_id, new_train_data.end_station_id, trip_sequence[0].dest_arrival_time + 120))
    
        
    return FormattedTrainData(trip_sequence).trains_for_react, 200

# get names and routes (and gtfs id) for search bar in journey planner
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
@app.route('/api/stationname/<string:gtfs_id>')
def get_station_name(gtfs_id):
    print(gtfs_id)
    station = Station.query.filter(Station.gtfs_stop_id == gtfs_id).first()
    return {"name" : station.stop_name, "daytime_routes" : station.daytime_routes}, 200

# get train locations 
@app.route('/api/trainlocations')
def get_train_locations():
    pass
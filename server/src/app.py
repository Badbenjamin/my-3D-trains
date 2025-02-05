from config import app
from datetime import datetime
from models import Station
from Objects import Journey, TrainData, TripSchedule

ct = datetime.now()

# takes input from journey planner, returns train or trains going from start to end station
@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
def plan_trip(start_station_id, end_station_id):
    # print('ids',start_station_id, end_station_id)
    new_journey = Journey(start_station_id, end_station_id)
    new_train_data = TrainData(new_journey)
    # print('traindata', new_train_data.all_train_data)
    # fork here for multi leg trips?
    # if new_train_data.shared_stations == None:
    new_schedule = TripSchedule(new_train_data.all_train_data, new_train_data.start_station_id, new_train_data.end_station_id)
    # else:

    return new_schedule.format_for_react(), 200

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
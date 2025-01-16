from config import app
from datetime import datetime
from models import Station
from Objects import Journey, TrainData

ct = datetime.now()

# takes input from journey planner, returns train or trains going from start to end station
@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
def plan_trip(start_station_id, end_station_id):
    new_journey = Journey(start_station_id, end_station_id)
    new_data = TrainData(new_journey)
    return new_data.format_for_react(), 200

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
    station = Station.query.filter(Station.gtfs_stop_id == gtfs_id).first()
    return {"name" : station.stop_name, "daytime_routes" : station.daytime_routes}, 200

# get train locations 
@app.route('/api/trainlocations')
def get_train_locations():
    pass
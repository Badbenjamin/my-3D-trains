from flask import session, request


from config import app, db

import pprint
import requests
from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2
import json


# from Station import Station
# from Endpoint import Endpoint
# from StationEndpoint import StationEndpoint
# from Rider import Rider

from models import Station, Endpoint, StationEndpoint, Rider, Commute
from Objects import Journey, TrainData, Train, Stop



ct = datetime.now()

@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
def plan_trip(start_station_id, end_station_id):
    new_journey = Journey(start_station_id, end_station_id)
    new_data = TrainData(new_journey)
    return new_data.format_for_react(new_journey), 200

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

@app.route('/api/stationname/<string:gtfs_id>')
def get_station_name(gtfs_id):
    # print(gtfs_id)
    station = Station.query.filter(Station.gtfs_stop_id == gtfs_id).first()
    # print(station.stop_name)
    return {"name" : station.stop_name, "daytime_routes" : station.daytime_routes}, 200
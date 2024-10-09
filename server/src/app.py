from flask import session, request


from config import app, db

import pprint
import requests
from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2


# from Station import Station
# from Endpoint import Endpoint
# from StationEndpoint import StationEndpoint
# from Rider import Rider

from models import Station, Endpoint, StationEndpoint, Rider, Commute
from Objects import Journey



ct = datetime.now()

@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
def plan_trip(start_station_id, end_station_id):
    new_journey = Journey(start_station_id, end_station_id)
    print(new_journey.start_station)
    print(new_journey.end_station)
    # return new_journey.start_station.to_dict(), 200
    return {'start' : new_journey.start_station.stop_name, 'end' : new_journey.end_station.stop_name }, 200
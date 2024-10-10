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
from Objects import Journey, TrainData, Train, Stop



ct = datetime.now()

@app.route('/api/plan_trip/<string:start_station_id>/<string:end_station_id>')
def plan_trip(start_station_id, end_station_id):
    new_journey = Journey(start_station_id, end_station_id)
    new_data = TrainData(new_journey)
    return new_data.format_for_react(new_journey), 200
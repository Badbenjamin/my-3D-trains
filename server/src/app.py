from config import app
from flask import session, request


from config import app, db

import pprint
import requests
from datetime import datetime, timedelta
from google.transit import gtfs_realtime_pb2

ct = datetime.now()
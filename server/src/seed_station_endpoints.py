from StationEndpoint import StationEndpoint
from Station import Station
from Endpoint import Endpoint

from config import db, app

def add_station_endpoints():
    all_stations = Station.query.all()
    station_endpoints = []
    for station in all_stations:
        for station_route in station.daytime_routes.split():
            endpoints = Endpoint.query.all()
            for endpoint in endpoints[:-1]:
                if station_route in endpoint.lines:
                    # print(station.id, station_route, endpoint.id)
                    station_endpoint = StationEndpoint(
                        route = station_route,
                        station_name = station.stop_name,
                        stations = station,
                        endpoints = endpoint
                    )
                    station_endpoints.append(station_endpoint)
    # pprint.pprint(station_endpoints)
    db.session.add_all(station_endpoints)
    db.session.commit()


            # print(station, route, endpoints)

with app.app_context():
    add_station_endpoints()
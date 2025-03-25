from models import Station, Endpoint, StationEndpoint


from config import db, app

def add_station_endpoints():

    StationEndpoint.query.delete()
    all_stations = Station.query.all()
    endpoints = Endpoint.query.all()
    station_endpoints = []
    for station in all_stations:
        for station_route in station.daytime_routes.split():
            
            for endpoint in endpoints[:-1]:
                if station_route in endpoint.lines:
                    station_endpoint = StationEndpoint(
                        route = station_route,
                        station_name = station.stop_name,
                        station = station,
                        endpoint = endpoint
                    )
                    station_endpoints.append(station_endpoint)
    db.session.add_all(station_endpoints)
    db.session.commit()

with app.app_context():
    add_station_endpoints()
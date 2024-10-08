from models import Station
from config import app, db
import csv

with app.app_context():
    print('adding stations...')
    stations=[]

    def csv_to_db(csv_file):
        with open(csv_file, mode='r') as file:
            csvFile = csv.reader(file)
            for lines in csvFile:
                station = Station(
                    gtfs_stop_id = lines[0],
                    station_id = lines[1],
                    complex_id = lines[2],
                    division = lines[3],
                    line = lines[4],
                    stop_name = lines[5],
                    borough = lines[6],
                    cbd = lines[7],
                    daytime_routes = lines[8],
                    structure = lines[9],
                    gtfs_latitude = lines[10],
                    gtfs_longitude = lines[11],
                    north_direction_label = lines[12],
                    south_direction_label = lines[13],
                )
                stations.append(station)
    csv_to_db('subway_files/MTA_Subway_Stations_20240906.csv')
    db.session.add_all(stations[1:])
    db.session.commit()



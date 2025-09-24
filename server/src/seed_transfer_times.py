from models import TransferTimes
from config import app, db
import csv

with app.app_context():
    print('adding transfer times...')
    transfer_times=[]

    def csv_to_db(csv_file):
        with open(csv_file, mode='r') as file:
            csvFile = csv.reader(file)
            for lines in csvFile:
                transfer_time = TransferTimes(
                    from_stop_id = lines[0],
                    to_stop_id = lines[1],
                    min_transfer_time = lines[3],
                )
                transfer_times.append(transfer_time)
    csv_to_db('subway_files/transfers_csv.csv')
    db.session.add_all(transfer_times[1:])
    db.session.commit()
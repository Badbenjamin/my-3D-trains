from models import CommuteTime
from Commute import Commute
import datetime

from config import app, db

def add_commute_times():

    c1 = Commute.query.filter(Commute.id == 1).first()
    c2 = Commute.query.filter(Commute.id == 2).first()

    commute_time1 = CommuteTime(
        commute = c1,
        start_time = datetime.datetime.now(),
        arrival_time = datetime.datetime.now()
    )

    commute_time2 = CommuteTime(
        commute = c1,
        start_time = datetime.datetime.now(),
        arrival_time = datetime.datetime.now()
    )

    commute_time3 = CommuteTime(
        commute = c2,
        start_time = datetime.datetime.now(),
        arrival_time = datetime.datetime.now()
    )

    commute_times = [commute_time1, commute_time2, commute_time3]
    db.session.add_all(commute_times)
    db.session.commit()

with app.app_context():
    add_commute_times()

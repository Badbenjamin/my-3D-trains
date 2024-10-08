

from models import Station, Rider
from Commute import Commute

from config import db, app

def add_commutes():

    rider1 = Rider.query.first()
    start_point = Station.query.filter(Station.id == 1).first()
    end_point = Station.query.filter(Station.id == 11).first()

    commute1 = Commute(
        rider = rider1,
        start_station = start_point,
        end_station = end_point,
        name = "work"
    )

    rider2 = Rider.query.filter(Rider.id == 9).first()
    start_point2 = Station.query.filter(Station.id == 125).first()
    end_point2 = Station.query.filter(Station.id == 129).first()

    commute2 = Commute(
        rider = rider1,
        start_station = start_point2,
        end_station = end_point2,
        name = "club"
    )

    commutes = [commute1, commute2]
    db.session.add_all(commutes)
    db.session.commit()


with app.app_context():
    add_commutes()


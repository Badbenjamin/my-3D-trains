from Rider import Rider
from Station import Station

from config import db, app

def add_riders():
    
    # Rider.query.delete()

    tommy = Rider(
    username = "TommyTrains",
    password_hash = "trains123",
    fav_subway_activity = "Listening to loud music.",

    station = Station.query.first()
    
    )
    print(tommy.station)

    sally = Rider(
    username = "SallySevenTrain",
    password_hash = "trains123",
    fav_subway_activity = "Fighting with boyfriend.",

    station = Station.query.first()
    )

    sammy = Rider(
    username = "SammySubway",
    password_hash = "trains123",
    fav_subway_activity = "Smoking cigs.",

    station = Station.query.first()
    )
    print('riders')
    riders = [tommy, sally, sammy]
    db.session.add_all(riders)
    db.session.commit()

with app.app_context():
    add_riders()
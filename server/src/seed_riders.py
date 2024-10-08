# from Rider import Rider
# from Station import Station

from models import Rider, Station

from config import db, app

def add_riders():
    
    # Rider.query.delete()
    tommy_station = Station.query.first()
    tommy = Rider(
    username = "TommyTrains",
    password_hash = "trains123",
    fav_subway_activity = "Listening to loud music.",
    email = "Tommy@trainmail.com",

    station = tommy_station
    
    )
    print(tommy.station)

    sally_station = Station.query.first()
    sally = Rider(
    username = "SallySevenTrain",
    password_hash = "trains123",
    fav_subway_activity = "Fighting with boyfriend.",
    email = "Sally@trainmail.com",

    station = sally_station
    )

    sammy_station = Station.query.first()
    sammy = Rider(
    username = "SammySubway",
    password_hash = "trains123",
    fav_subway_activity = "Smoking cigs.",
    email = "Sammy@trainmail.com",

    station = sammy_station
    )
    print('riders')
    riders = [tommy, sally, sammy]
    db.session.add_all(riders)
    db.session.commit()

with app.app_context():
    add_riders()
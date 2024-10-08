from models import Endpoint
from config import app, db


def add_endpoints():

    ace = Endpoint(
        lines = "ACE",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace"
    )

    g = Endpoint(
        lines = "G",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g"
    )

    nqrw = Endpoint(
        lines = "NQRW",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw"
    )

    one234567 = Endpoint(
        lines = "1234567",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs"
    )

    bdfm = Endpoint(
        lines = "BDFM",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm"
    )

    jz = Endpoint(
        lines = "JZ",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz"
    )

    l = Endpoint(
        lines = "L",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l"
    )

    sir = Endpoint(
        lines = "SIR",
        endpoint = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si"
    )

    endpoints = [ace, g, nqrw, one234567, bdfm, jz, l, sir]
    db.session.add_all(endpoints)
    db.session.commit()

if __name__== "__main__":
    with app.app_context():
        add_endpoints()
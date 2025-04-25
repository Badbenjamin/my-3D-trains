import './Component.css'


function LegInfo({leg}){

        // console.log(tripInfo)

    return(
        <div className="leg-info-grid-cointainer">
            <div className="start-station-info">
                <div className="top">{leg.start_station}</div>
                <div className="middle">{leg.direction_label} {leg.route}</div>
                <div className="bottom">Departs {leg.start_station_departure}</div><>{leg.first_six_trains}</>
            </div>
            <div className="middle-info">
                <div className="top">{leg.number_of_stops} Stops</div>
                <div className="middle">→</div>
                <div className="bottom">{leg.trip_time} Minutes</div>
            </div>
            <div className="end-station-info">
                <div className="top">{leg.end_station}</div>
                <div className="middle">Arrives {leg.end_station_arrival}</div>
                {/* <div className="bottom">transfer or destination</div> */}
            </div>
        </div>
    )
}

export default LegInfo
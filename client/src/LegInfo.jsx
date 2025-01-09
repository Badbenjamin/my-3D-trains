import './Component.css'


function LegInfo({tripInfo}){

        // console.log(tripInfo)

    return(
        <div className="leg-info-grid-cointainer">
            <div className="start-station-info">
                <div className="top">{tripInfo.start_station}</div>
                <div className="middle">{tripInfo.direction_label} Bound {tripInfo.route}</div>
                <div className="bottom">Departs {tripInfo.start_station_arrival}</div>
            </div>
            <div className="middle-info">
                <div className="top">{tripInfo.number_of_stops} Stops</div>
                <div className="middle">→</div>
                <div className="bottom">{tripInfo.trip_time} Minutes</div>
            </div>
            <div className="end-station-info">
                <div className="top">{tripInfo.end_station}</div>
                <div className="middle">Arrives {tripInfo.end_station_arrival}</div>
                {/* <div className="bottom">transfer or destination</div> */}
            </div>
        </div>
    )
}

export default LegInfo
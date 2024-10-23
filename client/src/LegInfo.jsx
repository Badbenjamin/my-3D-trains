import './Component.css'


function LegInfo({tripInfo}){

        console.log(tripInfo)

    return(
        <div className="leg-info-grid-cointainer">
            <div className="start-station-info">
                <div className="top">{tripInfo[0].start_station}</div>
                <div className="middle">{tripInfo[0].direction_label} Bound {tripInfo[0].route}</div>
                <div className="bottom">Departs {tripInfo[0].start_station_arrival.slice(10,-3)}</div>
            </div>
            <div className="middle-info">
                <div className="top">{tripInfo[0].number_of_stops} Stops</div>
                <div className="middle">→</div>
                <div className="bottom">{tripInfo[0].trip_time} Minutes</div>
            </div>
            <div className="end-station-info">
                <div className="top">{tripInfo[0].end_station}</div>
                <div className="middle">Arrives {tripInfo[0].end_station_arrival.slice(10,-3)}</div>
                {/* <div className="bottom">transfer or destination</div> */}
            </div>
        </div>
    )
}

export default LegInfo
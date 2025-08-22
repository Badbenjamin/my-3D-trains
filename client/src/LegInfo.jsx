import './Component.css'


function LegInfo({leg}){
    console.log('l', leg)

    let routeIcon = <img className='route_icon_leg_info' src={`../public/ICONS/${leg.route}.png`}/>
    return(
        <div className="leg-info-grid-cointainer">
            <div className="start-station-info">
                <div className="top">{leg.start_station}</div>
                <div className="middle">{leg.direction_label} {routeIcon}</div>
                <div className="bottom">Departs {leg.start_station_departure}</div><>{leg.first_six_trains}</>
            </div>
            <div className="middle-info">
                <div className="top">{leg.number_of_stops} Stops</div>
                <div className="middle">→</div>
                <div className="bottom">{leg.trip_time} Minutes</div>
            </div>
            <div className="end-station-info">
                <div className="top">{leg.end_station}</div>
                <div className="middle">t or d</div>
                <div className="bottom">Arrives {leg.end_station_arrival}</div>
            </div>
        </div>
    )
}

export default LegInfo
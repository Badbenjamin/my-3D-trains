import './Component.css'


function LegInfo({leg, type}){
    console.log('l', leg, type)

    let routeIcon = <img className='route_icon_leg_info' src={`../public/ICONS/${leg.route}.png`}/>
    if (type == 'single-leg'){
        return(
            // OLD
            // <div className="leg-info-grid-cointainer">
            //     <div className="start-station-info">
            //         <div className="top">{leg.start_station}</div>
            //         <div className="middle">{leg.direction_label} {routeIcon}</div>
                    // <div className="bottom">Departs {leg.start_station_departure}</div><>{leg.first_six_trains}</>
            //     </div>
            //     <div className="middle-info">
            //         <div className="top">{leg.number_of_stops} Stops</div>
            //         <div className="middle">→</div>
            //         <div className="bottom">{leg.trip_time} Minutes</div>
            //     </div>
            //     <div className="end-station-info">
            //         <div className="top">{leg.end_station}</div>
            //         <div className="middle">t or d</div>
            //         <div className="bottom">Arrives {leg.end_station_arrival}</div>
            //     </div>
            // </div>
            <div>
                <div className="start-station-info">
                    <div className="station">{leg.start_station}</div>
                    <div className="direction">{leg.direction_label} {routeIcon}</div>
                    <span className="time">Departs {leg.start_station_departure}</span>
                </div>
                <div className="middle-info">
                    <div className='arrow-icon'>⬇</div>
                    <div className="number-of-stops">{leg.number_of_stops} Stops</div>
                    <div className="trip-time">{leg.trip_time} Minutes</div>
                </div>
                <div className="end-station-info">
                    <div className="station">{leg.end_station}</div>
                    <span className="time">Arrives {leg.end_station_arrival}</span>
                </div>
            </div>
        )
    }
    
}

export default LegInfo
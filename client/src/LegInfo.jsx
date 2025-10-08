import './Component.css'


function LegInfo({leg, type}){

    let departureTime = new Date(leg.start_station_departure_ts * 1000)
    let departureTimeString = departureTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    })

    let arrivalTime = new Date(leg.end_station_arrival_ts * 1000)
    let arrivalTimeString = arrivalTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    })
 
 
    let routeIcon = <img className='route_icon_leg_info' src={`../ICONS/${leg.route}.png`}/>
    if (type == 'single-leg'){
        return(
            <div>
                <div className="start-station-info">
                    <div className="station">{leg.start_station}</div>
                    <div className="direction">{leg.direction_label} {routeIcon}</div>
                    <span className="time">Departs {departureTimeString}</span>
                </div>
                <div className="middle-info">
                    <div className='arrow-icon'>⬇</div>
                    <div className='stops-and-time'>
                        <div className="number-of-stops">{leg.number_of_stops} Stops</div>
                        <div className="trip-time">{leg.trip_time} Minutes</div>
                    </div>
                </div>
                <div className="end-station-info">
                    <div className="station">{leg.end_station}</div>
                    <span className="time">Arrives {arrivalTimeString}</span>
                </div>
                <hr width="100%" size="2"/>
            </div>
        )
    } else if (type === 'first-leg'){
        return(
            <div>
                <div className="start-station-info">
                    <div className="station">{leg.start_station}</div>
                    <div className="direction">{leg.direction_label} {routeIcon}</div>
                    <span className="time">Departs {departureTimeString}</span>
                </div>
                <div className="middle-info">
                    <div className='arrow-icon'>⬇</div>
                    <div className='stops-and-time'>
                        <div className="number-of-stops">{leg.number_of_stops} Stops</div>
                        <div className="trip-time">{leg.trip_time} Minutes</div>
                    </div>
                </div>
                <div className="end-station-info">
                    <div className="station">{leg.end_station}</div>
                    <span className="time">Arrives {arrivalTimeString}</span>
                </div>
                <hr width="100%" size="2"/>
                <div className="transfer-info">
                    <span >Transfer: {leg.transfer_time / 60} Minutes</span>
                </div>
                <hr width="100%" size="2"/>
            </div>
        )
    } else if (type === 'second-leg'){
        return(
            <div>
                <div className="start-station-info">
                    <div className="station">{leg.start_station}</div>
                    <div className="direction">{leg.direction_label} {routeIcon}</div>
                    <span className="time">Departs {departureTimeString}</span>
                </div>
                <div className="middle-info">
                    <div className='arrow-icon'>⬇</div>
                    <div className='stops-and-time'>
                        <div className="number-of-stops">{leg.number_of_stops} Stops</div>
                        <div className="trip-time">{leg.trip_time} Minutes</div>
                    </div>
                </div>
                <div className="end-station-info">
                    <div className="station">{leg.end_station}</div>
                    <span className="time">Arrives {arrivalTimeString}</span>
                </div>
                <hr width="100%" size="2"/>
            </div>
        )
    }
    
}

export default LegInfo
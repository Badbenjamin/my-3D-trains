import './Component.css'
import TripInfo from './TripInfo'


function ErrorInfo({leg}){
    console.log('error leg', leg)


    return(
        // <div className="leg-info-grid-cointainer">
        //     <div className="start-station-info">
        //         <div className="top">{leg.start_station_name}</div>
        //         {/* <div className="middle">{tripInfo.direction_label} Bound {tripInfo.route}</div> */}
        //         <div className="bottom">{leg.start_station_service ? '' : 'NOT IN SERVICE'}</div>
        //         <div className="bottom">{leg.start_north_bound_service ? <></> : 'No ' + leg.start_north_direction_label + ' departures'}</div>
        //         <div className="bottom">{leg.start_south_bound_service ? <></> : 'No ' + leg.start_south_direction_label + ' departures'}</div>
        //     </div>
        //     <div className="middle-info">
        //         {/* <div className="top">{tripInfo.number_of_stops} Stops</div> */}
        //         <div className="middle">→</div>
        //         <div className="bottom">{leg.station_to_station_service ? '' : 'NO TRAINS BETWEEN STATIONS'}</div>
        //     </div>
        //     <div className="end-station-info">
        //         <div className="top">{leg.end_station_name}</div>
        //         {/* <div className="middle">Arrives {tripInfo.end_station_arrival}</div> */}
        //         <div className="bottom">{leg.end_station_service ? '' : 'NOT IN SERVICE'}</div>
        //         <div className="bottom">{leg.end_north_bound_service ? <></> : 'No ' + leg.end_north_direction_label + ' arrivals'}</div>
        //         <div className="bottom">{leg.end_south_bound_service ? <></> : 'No ' + leg.end_south_direction_label + ' arrivals'}</div>
        //     </div>
        // </div>


        <div>
                <div className="start-station-info">
                    <div className="station">{leg.start_station_name}</div>
                    {/* <div className="direction">{leg.direction_label} {routeIcon}</div>
                    <span className="time">Departs {leg.start_station_departure}</span> */}
                </div>
                <div className="middle-info">
                    <div className='arrow-icon'>⬇</div>
                    <div className='stops-and-time'>
                        {/* <div className="number-of-stops">{leg.number_of_stops} Stops</div>
                        <div className="trip-time">{leg.trip_time} Minutes</div> */}
                    </div>
                </div>
                <div className="end-station-info">
                    <div className="station">{leg.end_station_name}</div>
                    {/* <span className="time">Arrives {leg.end_station_arrival}</span> */}
                </div>
                {/* <hr width="100%" size="2"/> */}
            </div>
    )
}

export default ErrorInfo
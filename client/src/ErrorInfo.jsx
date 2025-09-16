import './Component.css'
import TripInfo from './TripInfo'


function ErrorInfo({leg}){

    return(
        <div className="leg-info-grid-cointainer">
            <div className="start-station-info">
                <div className="top">{leg.start_station_name}</div>
                {/* <div className="middle">{tripInfo.direction_label} Bound {tripInfo.route}</div> */}
                <div className="bottom">{leg.start_station_service ? '' : 'NOT IN SERVICE'}</div>
                <div className="bottom">{leg.start_north_bound_service ? <></> : 'No ' + leg.start_north_direction_label + ' departures'}</div>
                <div className="bottom">{leg.start_south_bound_service ? <></> : 'No ' + leg.start_south_direction_label + ' departures'}</div>
            </div>
            <div className="middle-info">
                {/* <div className="top">{tripInfo.number_of_stops} Stops</div> */}
                <div className="middle">→</div>
                <div className="bottom">{leg.station_to_station_service ? '' : 'NO TRAINS BETWEEN STATIONS'}</div>
            </div>
            <div className="end-station-info">
                <div className="top">{leg.end_station_name}</div>
                {/* <div className="middle">Arrives {tripInfo.end_station_arrival}</div> */}
                <div className="bottom">{leg.end_station_service ? '' : 'NOT IN SERVICE'}</div>
                <div className="bottom">{leg.end_north_bound_service ? <></> : 'No ' + leg.end_north_direction_label + ' arrivals'}</div>
                <div className="bottom">{leg.end_south_bound_service ? <></> : 'No ' + leg.end_south_direction_label + ' arrivals'}</div>
            </div>
        </div>
    )
}

export default ErrorInfo
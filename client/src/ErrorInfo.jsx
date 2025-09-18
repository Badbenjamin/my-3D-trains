import './Component.css'
import TripInfo from './TripInfo'
import { findSharedRoutes, findPlatformClosure } from './ModularFunctions'

function ErrorInfo({leg}){
    console.log('error leg', leg)

    let sharedRoutes = findSharedRoutes(leg)
   

    let routesNotLeavingStartNorth = findPlatformClosure(leg, sharedRoutes, 'start', 'north')
    // console.log(routesNotLeavingStartNorth)
    let routesNotLeavingStartSouth = findPlatformClosure(leg, sharedRoutes, 'start', 'south')

    let routesNotArrivingAtDestNorth = findPlatformClosure(leg, sharedRoutes, 'end', 'north')
    let routesNotArrivingAtDestSouth = findPlatformClosure(leg, sharedRoutes, 'end', 'south')

    let routesNotLeavingStartNorthLogos = routesNotLeavingStartNorth.map((route)=>{
        return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
    })

    let routesNotLeavingStartSouthLogos = routesNotLeavingStartSouth.map((route)=>{
        return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
    })

    let routesNotArrivingAtDestNorthLogos = routesNotArrivingAtDestNorth.map((route)=>{
        return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
    })

    let routesNotArrivingAtDestSouthLogos = routesNotArrivingAtDestSouth.map((route)=>{
        return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
    })

    let startStationRouteLogos = leg.start_station_routes.map((route)=>{
        return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
    })

    let endStationRouteLogos = leg.end_station_routes.map((route)=>{
        return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
    })
    

    

    // IF START STATION ERROR, RETURN THIS
    if (routesNotLeavingStartNorth.length > 0 || routesNotLeavingStartSouth.length > 0){
        console.log('start error', routesNotLeavingStartNorth, routesNotLeavingStartSouth)
        console.log('start error end', routesNotArrivingAtDestNorth, routesNotArrivingAtDestSouth)
        return(
            <div>
                    <div className="start-station-info">
                        <div className="station">{leg.start_station_name}{startStationRouteLogos}</div>
                        <span className='direction'>
                            {(routesNotLeavingStartNorth.length > 0)? <>{leg.start_north_direction_label}{routesNotLeavingStartNorthLogos}</>  : <></>}
                            {(routesNotLeavingStartSouth.length > 0)? <>{leg.start_south_direction_label}{routesNotLeavingStartSouthLogos}</>  : <></>}
                        </span>
                        <span className='error-highlight'>Plaftorm closed. </span>
                    </div>
                    <div className="middle-info">
                        <div className='x-icon'>X</div>
                        {/* <div>No trains traveling between stations.</div> */}
                    </div>
                    <div className="end-station-info">
                        <div className="station">{leg.end_station_name}{endStationRouteLogos}</div>
                        <span className='direction'>
                            No trains arriving from origin. 
                        </span>
                    </div>
                    {/* <hr width="100%" size="2"/> */}
                </div>
            )
    } else if (routesNotArrivingAtDestNorth.length > 0 || routesNotArrivingAtDestSouth.length > 0){
        console.log('end error',routesNotArrivingAtDestNorth, routesNotArrivingAtDestSouth )
        return(
            <div>
                    <div className="start-station-info">
                        <div className="station">{leg.start_station_name}{startStationRouteLogos}</div>
                        <span className='direction'>
                            {(routesNotArrivingAtDestNorth.length > 0)? <>{leg.start_north_direction_label}{routesNotArrivingAtDestNorthLogos}</>  : <></>}
                            {(routesNotArrivingAtDestSouth.length > 0)? <>{leg.start_south_direction_label}{routesNotArrivingAtDestSouthLogos}</>  : <></>}
                        </span>
                        <span className='direction' > trains don't serve destination.</span>
                    </div>
                    <div className="middle-info">
                        <div className='x-icon'>X</div>
                    </div>
                    <div className="end-station-info">
                        <div className="station">{leg.end_station_name}{endStationRouteLogos}</div>
                        <span className='direction' >
                            {(routesNotArrivingAtDestNorth.length > 0)? <>{leg.end_north_direction_label}{routesNotArrivingAtDestNorthLogos}</>  : <></>}
                            {(routesNotArrivingAtDestSouth.length > 0)? <>{leg.end_south_direction_label}{routesNotArrivingAtDestSouthLogos}</>  : <></>}
                        </span>
                        {/* <br></br> */}
                        <span className='error-highlight' > Plaftorm closed. </span>
                    </div>
                    {/* <hr width="100%" size="2"/> */}
                </div>
            )
    }
    // ELSE IF END STATION ERROR, RETURN THIS
    
}

export default ErrorInfo
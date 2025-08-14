import { Html, Line } from "@react-three/drei"
import { useState, useEffect } from "react"
import * as THREE from "three"

export default function RouteTooltip({stationInfo, name, position}){

    const [startStatonInfo, setStartStationInfo] = useState(null)
    const [endStationInfo, setEndStationInfo] = useState(null)
    const [transferStationInfo, setTransferStationInfo] = useState({
        "first_station" : null,
        "second_station" : null
    })
    const [startErrorInfo, setStartErrorInfo] = useState(null)
    const [endErrorInfo, setEndErrorInfo] = useState(null)

    // stationInfo is info passed from server to geometry, then combined with text in stationsTracksAndText
    // types of tooltip info to display are start, end, transfer, errorStart, errorEnd, and errorTransfer
    useEffect(()=>{
        // create start info to display
        if(stationInfo.type == "start"){
            setStartStationInfo((prevInfo)=>{
                let newInfo = {...prevInfo}


                let arrivalTime = new Date(stationInfo.arrival * 1000)
                let mainArrivalTimeString = arrivalTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })

                let departureTime = new Date(stationInfo.departure * 1000)
                let mainDepartureTimeString = departureTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })

                newInfo = {
                    "arrival_ts" : stationInfo.arrival,
                    "departure_ts" : stationInfo.departure,
                    "arrival_string" : mainArrivalTimeString,
                    "departure_string" : mainDepartureTimeString,
                    "direction_label" : stationInfo.direction_label,
                    "route" : stationInfo.route,
                    "stop_id" : stationInfo.stopId,
                    "type" : stationInfo.type,
                    "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.route}.png`}/>
                }
                return newInfo
            })
        // create end info to display
        } else if (stationInfo.type == "end"){
            setEndStationInfo((prevInfo)=>{
                let newInfo = {...prevInfo}
                let arrivalTime = new Date(stationInfo.arrival * 1000)
                let mainArrivalTimeString = arrivalTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })

                let departureTime = new Date(stationInfo.departure * 1000)
                let mainDepartureTimeString = departureTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })

                newInfo = {
                    "arrival_ts" : stationInfo.arrival,
                    "departure_ts" : stationInfo.departure,
                    "arrival_string" : mainArrivalTimeString,
                    "departure_string" : mainDepartureTimeString,
                    "direction_label" : stationInfo.direction_label,
                    "route" : stationInfo.route,
                    "stop_id" : stationInfo.stopId,
                    "type" : stationInfo.type,
                    "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.route}.png`}/>
                }
                return newInfo
            })
    // transfer is a little more complex
    // because of hashmaps, the order of the transfer has been lost
    // it must be re constructed by ordering the transfers by arrival time
    } else if (stationInfo.type === "transfer"){
        // construct ordered objects based on arrival and departure times
        
        // BRANCH FOR SUCCESSFUL TRANSFER
        if (stationInfo.second_transfer_info[0]?.type != 'errorTransfer'){

            setTransferStationInfo((prevInfo)=>{
                let newInfo = {...prevInfo}
    
                let firstStationObject = {}
                let secondStationObject = {}
    
                let firstArrivalTime = new Date(stationInfo.arrival * 1000)
                let firstArrivalTimeString = firstArrivalTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })
    
                let firstDepartureTime = new Date(stationInfo.departure * 1000)
                let firstDepartureTimeString = firstDepartureTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })
                
                let secondArrivalTime = new Date(stationInfo.second_transfer_info[0].arrival * 1000)
                let secondArrivalTimeString = secondArrivalTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })
    
                let secondDepartureTime = new Date(stationInfo.second_transfer_info[0].departure * 1000)
                let secondDepartureTimeString = secondDepartureTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })
    
                if (stationInfo.arrival < stationInfo.second_transfer_info[0].arrival){
    
                    firstStationObject =  {
                        "arrival_ts" : stationInfo.arrival,
                        "departure_ts" : stationInfo.departure,
                        "arrival_string" : firstArrivalTimeString,
                        "departure_string" : firstDepartureTimeString,
                        "direction_label" : stationInfo.direction_label,
                        "route" : stationInfo.route,
                        "stop_id" : stationInfo.stopId,
                        "type" : stationInfo.type,
                        "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.route}.png`}/>
                    }
    
                    secondStationObject = {
                        "arrival_ts" : stationInfo.second_transfer_info[0].arrival,
                        "departure_ts" : stationInfo.second_transfer_info[0].departure,
                        "arrival_string" : secondArrivalTimeString,
                        "departure_string" : secondDepartureTimeString,
                        "direction_label" : stationInfo.second_transfer_info[0].direction_label,
                        "route" : stationInfo.second_transfer_info[0].route,
                        "stop_id" : stationInfo.second_transfer_info[0].stopId,
                        "type" : stationInfo.second_transfer_info[0].type,
                        "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.second_transfer_info[0].route}.png`}/>
                    }
                } else if ((stationInfo.arrival > stationInfo.second_transfer_info[0].arrival)){
   
                    secondStationObject =  {
                        "arrival_ts" : stationInfo.arrival,
                        "departure_ts" : stationInfo.departure,
                        "arrival_string" : firstArrivalTimeString,
                        "departure_string" : firstDepartureTimeString,
                        "direction_label" : stationInfo.direction_label,
                        "route" : stationInfo.route,
                        "stop_id" : stationInfo.stopId,
                        "type" : stationInfo.type,
                        "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.route}.png`}/>
                    }
    
                    firstStationObject = {
                        "arrival_ts" : stationInfo.second_transfer_info[0].arrival,
                        "departure_ts" : stationInfo.second_transfer_info[0].departure,
                        "arrival_string" : secondArrivalTimeString,
                        "departure_string" : secondDepartureTimeString,
                        "direction_label" : stationInfo.second_transfer_info[0].direction_label,
                        "route" : stationInfo.second_transfer_info[0].route,
                        "stop_id" : stationInfo.second_transfer_info[0].stopId,
                        "type" : stationInfo.second_transfer_info[0].type,
                        "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.second_transfer_info[0].route}.png`}/>
                    }
                }
    
                return {
                    'first_station' : firstStationObject, 
                    'second_station' : secondStationObject
                }
            })
            // BRANCH WHEN SECOND LEG IS AN ERROR
            // there shouldnt be a transfer if first leg is an error
            // SECOND LEG OF ROUTE IS ALWAYS WHERE ERROR WILL BE
        } else  {
            setTransferStationInfo(()=>{

                let firstStationObject = {}
                // SECOND LEG IS HTML COMPONENT

                let firstArrivalTime = new Date(stationInfo.arrival * 1000)
                let firstArrivalTimeString = firstArrivalTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })
    
                let firstDepartureTime = new Date(stationInfo.departure * 1000)
                let firstDepartureTimeString = firstDepartureTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                })
                firstStationObject =  {
                    "arrival_ts" : stationInfo.arrival,
                    "departure_ts" : stationInfo.departure,
                    "arrival_string" : firstArrivalTimeString,
                    "departure_string" : firstDepartureTimeString,
                    "direction_label" : stationInfo.direction_label,
                    "route" : stationInfo.route,
                    "stop_id" : stationInfo.stopId,
                    "type" : stationInfo.type,
                    "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.route}.png`}/>
                }

                // DISPLAY ERROR FOR SECOND LEG
                // ROUTES (DAYTIME) THAT RUN BETWEEN ORIGIN AND DESINATION
                let sharedRoutes = []
                for (let route of stationInfo.second_transfer_info[0].start_station_routes){
                    if (stationInfo.second_transfer_info[0].end_station_routes.includes(route)){
                        sharedRoutes.push(route)
                    }
                }

                 // START STATION HAS PLATFORM CLOSURE
                 //  THESE ROUTES ARE NOT LEAVING ORIGIN
                 let routesNotLeavingStartNorth = []
                 let routesNotLeavingStartSouth = []
                 for (let route of sharedRoutes){
                     if (!(stationInfo.second_transfer_info[0].start_station_current_routes_north.includes(route))){
                         routesNotLeavingStartNorth.push(route)
                     } 
                     if (!(stationInfo.second_transfer_info[0].start_station_current_routes_south.includes(route))){
                         routesNotLeavingStartSouth.push(route)
                     }
                 }
 
                 let routesNotLeavingStartNorthLogos = routesNotLeavingStartNorth.map((route)=>{
                     return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
                 })
 
                 let routesNotLeavingStartSouthLogos = routesNotLeavingStartSouth.map((route)=>{
                     return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
                 })

                // START STATION IN SERVICE, END STATION HAS PLATFORM CLOSURE
                let routesNotArrivingAtDestNorth = []
                let routesNotArrivingAtDestSouth = []
                for (let route of sharedRoutes){
                    if (!(stationInfo.second_transfer_info[0].end_station_current_routes_north.includes(route))){
                        routesNotArrivingAtDestNorth.push(route)
                    } 
                    if (!(stationInfo.second_transfer_info[0].end_station_current_routes_south.includes(route))){
                        routesNotArrivingAtDestSouth.push(route)
                    }
                }
        
                let routesNotArrivingAtDestNorthLogos = routesNotArrivingAtDestNorth.map((route)=>{
                    return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
                })

                let routesNotArrivingAtDestSouthLogos = routesNotArrivingAtDestSouth.map((route)=>{
                    return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
                })

                let secondStationErrorHtml = null
                // station is out of service in one or more directoins, trains from start cant arrive at dest
                if ((routesNotLeavingStartNorth.length > 0) || (routesNotLeavingStartSouth.length > 0)){
                    let errorHtml = <div>
                                        <div>PLATFORM CLOSURE</div>
                                        <div>
                                        {(routesNotLeavingStartNorth.length > 0)? <>NO {stationInfo.second_transfer_info[0].north_direction_label} {routesNotLeavingStartNorthLogos} DEPARTURES</>  : <></>}
                                        <br></br>
                                        {(routesNotLeavingStartSouth.length > 0)? <>NO {stationInfo.second_transfer_info[0].south_direction_label} {routesNotLeavingStartSouthLogos} DEPARTURES</>  : <></>}
                                        </div>
                                    </div>
                    secondStationErrorHtml =  errorHtml
                } else if (((routesNotArrivingAtDestNorth.length > 0) || (routesNotArrivingAtDestSouth.length > 0))){
                        // Trains belonging to the shared routes between stations do not arrive at one or more platform of desination
                        let errorHtml = <div>
                                            <div>STOPS SKIPPED</div>
                                            <div>
                                                {(routesNotArrivingAtDestNorth.length > 0)? <>{stationInfo.second_transfer_info[0].north_direction_label} {routesNotArrivingAtDestNorthLogos}not serving destination</>  : <></>}
                                                <br></br>
                                                {(routesNotArrivingAtDestSouth.length > 0)? <>{stationInfo.second_transfer_info[0].south_direction_label} {routesNotArrivingAtDestSouthLogos}not serving destination</>  : <></>}
                                            </div>
                                        </div>
                        secondStationErrorHtml =  errorHtml
                    } 
                // this is sloppy. maybe convert everything into HTML components in the future
                return {
                    'first_station' : firstStationObject, 
                    'second_station' : {'errorHtml' :secondStationErrorHtml , 'type' : 'errorTransfer'}
                }
            })

        }
        
        // IF ERROR AT START OR END STATION, THESE WILL DISPLAY
    } else if ((stationInfo.type === "errorStart")){
        console.log('errorStart')
        setStartErrorInfo(()=>{

            // THESE ARE THE ROUTES SHARED BETWEEN START AND END STATIONS
            // might have to figure out reroutes and nighttime changes, these are daytime routes
            let sharedRoutes = []
            for (let route of stationInfo.start_station_routes){
                if (stationInfo.end_station_routes.includes(route)){
                    sharedRoutes.push(route)
                }
            }
            let sharedRouteLogos = sharedRoutes.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            // START STATION HAS PLATFORM CLOSURE
            // if sharedRoute NOT IN start_station_current_routes, push to RoutesNotLeavingDirection array
            let routesNotLeavingStartNorth = []
            let routesNotLeavingStartSouth = []
            for (let route of sharedRoutes){
                if (!(stationInfo.start_station_current_routes_north.includes(route))){
                    routesNotLeavingStartNorth.push(route)
                } 
                if (!(stationInfo.start_station_current_routes_south.includes(route))){
                    routesNotLeavingStartSouth.push(route)
                }
            }

            let routesNotLeavingStartNorthLogos = routesNotLeavingStartNorth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            let routesNotLeavingStartSouthLogos = routesNotLeavingStartSouth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            // WHAT ROUTES FROM START STATION WON'T ARRIVE AT END STATION?
            let routesNotArrivingAtDestNorth = []
            let routesNotArrivingAtDestSouth = []
            for (let route of sharedRoutes){
                // if shared route NOT IN  end station N or S arrivals, push to routesNotArrivingAtDest N or S
                if (!(stationInfo.end_station_current_routes_north.includes(route))){
                    routesNotArrivingAtDestNorth.push(route)
                } 
                if (!(stationInfo.end_station_current_routes_south.includes(route))){
                    routesNotArrivingAtDestSouth.push(route)
                }
            }
       
            let routesNotArrivingAtDestNorthLogos = routesNotArrivingAtDestNorth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            let routesNotArrivingAtDestSouthLogos = routesNotArrivingAtDestSouth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            // Normal schedule routes served by start station
            let startStationRouteLogos = stationInfo.start_station_routes.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            // station is out of service in one or more directoins, trains from start cant arrive at dest
            if ((routesNotLeavingStartNorth.length > 0) || (routesNotLeavingStartSouth.length > 0)){
                let errorHtml = <div className="route-info-html">
                                    <div>{name}{startStationRouteLogos}PLATFORM CLOSURE</div>
                                    <div>
                                    {(routesNotLeavingStartNorth.length > 0)? <>NO {stationInfo.north_direction_label} {routesNotLeavingStartNorthLogos} DEPARTURES</>  : <></>}
                                    <br></br>
                                    {(routesNotLeavingStartSouth.length > 0)? <>NO {stationInfo.south_direction_label} {routesNotLeavingStartSouthLogos} DEPARTURES</>  : <></>}
                                    </div>
                                </div>
                return errorHtml
            } else if (((routesNotArrivingAtDestNorth.length > 0) || (routesNotArrivingAtDestSouth.length > 0))){
                    // Trains belonging to the shared routes between stations do not arrive at one or more platform of desination
                    let errorHtml = <div className="route-info-html">
                                        <div>{name}{startStationRouteLogos}STOPS SKIPPED</div>
                                        <div>
                                            {(routesNotArrivingAtDestNorth.length > 0)? <>{stationInfo.north_direction_label} {routesNotArrivingAtDestNorthLogos}not serving destination</>  : <></>}
                                            <br></br>
                                            {(routesNotArrivingAtDestSouth.length > 0)? <>{stationInfo.south_direction_label} {routesNotArrivingAtDestSouthLogos}not serving destination</>  : <></>}
                                        </div>
                                    </div>
                    return errorHtml
                } 
        })
        // END STATION ERROR
    } else if ((stationInfo.type === "errorEnd")) {
        setEndErrorInfo(()=>{

            // ROUTES SHARED BETWEEN START AND END STATION
            let sharedRoutes = []
            for (let route of stationInfo.start_station_routes){
                if (stationInfo.end_station_routes.includes(route)){
                    sharedRoutes.push(route)
                }
            }
            
            let sharedRouteLogos = sharedRoutes.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            // START STATION HAS PLATFORM CLOSURE, NO TRAINS ARRIVING AT DEST
            let routesNotLeavingStartNorth = []
            let routesNotLeavingStartSouth = []
            for (let route of sharedRoutes){
                if (!(stationInfo.start_station_current_routes_north.includes(route))){
                    routesNotLeavingStartNorth.push(route)
                } 
                if (!(stationInfo.start_station_current_routes_south.includes(route))){
                    routesNotLeavingStartSouth.push(route)
                }
            }

            let routesNotLeavingStartNorthLogos = routesNotLeavingStartNorth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            let routesNotLeavingStartSouthLogos = routesNotLeavingStartSouth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            // START STATION IN SERVICE, END STATION HAS PLATFORM CLOSURE
            let routesNotArrivingAtDestNorth = []
            let routesNotArrivingAtDestSouth = []
            for (let route of sharedRoutes){
                if (!(stationInfo.end_station_current_routes_north.includes(route))){
                    routesNotArrivingAtDestNorth.push(route)
                } 
                if (!(stationInfo.end_station_current_routes_south.includes(route))){
                    routesNotArrivingAtDestSouth.push(route)
                }
            }
            
            let routesNotArrivingAtDestNorthLogos = routesNotArrivingAtDestNorth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            let routesNotArrivingAtDestSouthLogos = routesNotArrivingAtDestSouth.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            let endStationRouteLogos = stationInfo.end_station_routes.map((route)=>{
                return <img className="route_icon_route_tt"   src={`../public/ICONS/${route}.png`}/>
            })

            
            

            // START STATION HAS CLOSURES, DISPLAY ROUTES NOT SERVING DEST
            if (((routesNotLeavingStartNorth.length > 0) || (routesNotLeavingStartSouth.length > 0))){
                let errorHtml = <div className="route-info-html">
                                    <div>{name}{endStationRouteLogos}</div>
                                    <div>
                                        {(routesNotLeavingStartNorth.length > 0)? <>no {routesNotLeavingStartNorthLogos} trains arriving from origin</>  : <></>}
                                        <br></br>
                                        {(routesNotLeavingStartSouth.length > 0)? <>no {routesNotLeavingStartSouthLogos} trains arriving from origin</>  : <></>}
                                    </div>
                                </div>
                return errorHtml
            } else if ((routesNotArrivingAtDestNorth.length > 0) || (routesNotArrivingAtDestSouth.length > 0)){
                    // ARRIVAL STATION HAS PLATFORM CLOSURE, DISPLAY ROUTES SKIPPING STATION 
                    let errorHtml = <div className="route-info-html">
                                        <div>{name}{endStationRouteLogos} SERVICE ALERT</div>
                                        <div>
                                        {(routesNotArrivingAtDestNorth.length > 0)? <>{stationInfo.north_direction_label} {routesNotArrivingAtDestNorthLogos} Platform Closed2</>  : <></>}
                                        {/* {(routesNotLeavingStartNorth.length > 0)? <>no {stationInfo.north_direction_label} {routesNotLeavingStartNorthLogos} trains arriving at station</>  : <></>} */}
                                        <br></br>
                                        {(routesNotArrivingAtDestSouth.length > 0)? <>{stationInfo.south_direction_label} {routesNotArrivingAtDestSouthLogos} Platform Closed</>  : <></>}
                                        {/* {(routesNotLeavingStartSouth.length > 0)? <>no {stationInfo.south_direction_label} {routesNotLeavingStartSouthLogos} trains arriving at station</>  : <></>} */}
                                        </div>
                                    </div>
                    return errorHtml
                }
            })
        }

    },[stationInfo])

    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)

      // line for tooltip. make variable according to cam position in future. 
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500

    // START (NO ERROR) TOOLTIP DISPLAY
    if (startStatonInfo != null){
        return(
            <>
                <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                    <div className="route-info-html">
                       <div>{"depart "}{name}</div>
                       <div>{"on "}{startStatonInfo.direction_label}{startStatonInfo.routeIcon}</div>
                       <div>{"at"}{startStatonInfo.departure_string}</div>
                    </div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    // END (NO ERROR) TOOLTIP DISPLAY
    } else if ((endStationInfo != null)){
        return(
            <>
                <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                    <div className="route-info-html">
                        <div>{"arrive at "}{name}</div>
                       {/* <div>{"on "}{endStationInfo.direction_label}{endStationInfo.routeIcon}</div> */}
                       <div>{"at"}{endStationInfo.arrival_string}</div>
                    </div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
        // SUCCSESFUL TRANSFER (NO ERROR) TOOLTIP DISPLAY
    } else if ((transferStationInfo.first_station && transferStationInfo.second_station) && (transferStationInfo.second_station.type != 'errorTransfer')){
        return(
            <>
                <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                    <div className="route-info-html">
                        <div>transfer</div>
                       <div> arrive at {name} {transferStationInfo.first_station.routeIcon} platform at {transferStationInfo.first_station.arrival_string}</div>
                       <div> transfer to {transferStationInfo.second_station.direction_label} {transferStationInfo.second_station.routeIcon} at {transferStationInfo.second_station.departure_string}</div>
                    </div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
        // TRANSFER WITH ERROR TOOLTIP DISPLAY
        // need to make second statin work with new HTML obj? 
    } else if((transferStationInfo.first_station && transferStationInfo.second_station) && (transferStationInfo.second_station.type === 'errorTransfer')){
        return(
            <>
                <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                    <div className="route-info-html">
                       <div> arrive at {name}  platform on {transferStationInfo.first_station.routeIcon} at {transferStationInfo.first_station.arrival_string}</div>
                       {transferStationInfo.second_station.errorHtml}
                    </div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    } else if (startErrorInfo != null){
        return(
            <>
            <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                {startErrorInfo}
            </Html>
            <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    } else if (endErrorInfo != null){

        return(
            <>
            <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                {endErrorInfo}
            </Html>
            <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    }
}
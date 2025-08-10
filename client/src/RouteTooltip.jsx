import { Html, Line } from "@react-three/drei"
import { useState, useEffect } from "react"
import * as THREE from "three"
import TripInfo from "./TripInfo"

export default function RouteTooltip({stationInfo, name, position}){
    // where do I get name from, how can I get name of transfer? 
    // console.log('si rttt', stationInfo)
    // THESE COULD ALL JUST BE ONE I THINK???
    const [startStatonInfo, setStartStationInfo] = useState(null)
    const [endStationInfo, setEndStationInfo] = useState(null)
    const [transferStationInfo, setTransferStationInfo] = useState({
        "first_station" : null,
        "second_station" : null
    })
    // console.log('trans inf', transferStationInfo)
    const [errorInfo, setErrorInfo] = useState({})

    useEffect(()=>{
        console.log('si type', stationInfo.type)
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
        } else if (stationInfo.type == "end"){
            console.log('end')
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
    } else if (stationInfo.type === "transfer"){
        // construct ordered objects based on arrival and departure times
        console.log('transfer')
        console.log(stationInfo.second_transfer_info)
        
        // BRANCH FOR SUCCESSFUL TRANSFER
        console.log('error',stationInfo )
        if (stationInfo.second_transfer_info[0].type != 'errorTransfer'){
            console.log('sucsessful transfer')
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
                
                // if (stationInfo.second_transfer_info[0].arrival && stationInfo.second_transfer_info[0].departure){
                //     console.log('is this a trip error error?')
                //     return
                // }
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
                    // is this my error branch? 
                    console.log('bug here with error and transfer? ')
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
        } else  {
            console.log('second station info error transfer branch')
            setTransferStationInfo(()=>{

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
                console.log('route icon', stationInfo.route)
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

                console.log(stationInfo.second_transfer_info[0])
                secondStationObject = {
                    "north_bound_service" : stationInfo.second_transfer_info[0].north_bound_service,
                    "south_bound_service" : stationInfo.second_transfer_info[0].south_bound_service,
                    "station_to_station_service" : stationInfo.second_transfer_info[0].station_to_station_service,
                    "north_direction_label" : stationInfo.second_transfer_info[0].north_direction_label,
                    "south_direction_label" : stationInfo.second_transfer_info[0].south_direction_label,
                    'start_station_routes' : stationInfo.second_transfer_info[0].start_station_routes,
                    "stopId" : stationInfo.second_transfer_info[0].stopId,
                    "type" : stationInfo.second_transfer_info[0].type,
                    // how to find correct route icon for trip? not matching currently just using first
                    "routeIcon" : <img className="route_icon_route_tt"   src={`../public/ICONS/${stationInfo.second_transfer_info[0].start_station_routes[0]}.png`}/>
                }

                // console.log(firstArrivalTimeString, firstDepartureTimeString)
                return {
                    'first_station' : firstStationObject, 
                    'second_station' : secondStationObject
                }
            })

        }
        
        // GET THESE TO WORK
    } else if ((stationInfo.type === "errorStart") || (stationInfo.type === "errorEnd")){
        console.log('start or end error')
        setErrorInfo(()=>{
            // start or end
            let errorObject = {
                "complete_service" : (stationInfo.north_bound_service) && (stationInfo.south_bound_service),
                "trains_between_stations" : stationInfo.station_to_station_service,
                "north_bound_service" : null,
                "south_bound_service" : null,
                "type" : stationInfo.type
            
            }

            console.log('nb', stationInfo.north_bound_service)
            
            if (!(stationInfo.north_bound_service)){
                errorObject['north_bound_service'] = false
            } 
            if (!(stationInfo.south_bound_service)){
                errorObject['south_bound_service'] = false
            } 
            if ((stationInfo.north_bound_service)){
                errorObject['north_bound_service'] = true
            } 
            if ((stationInfo.south_bound_service)){
                errorObject['south_bound_service'] = true
            }

            


           

            console.log('di',errorObject)
            setErrorInfo(errorObject)
        })
    } else {
        console.log('route tooltip error')
    }

    },[stationInfo])

    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)

      // line for tooltip. make variable according to cam position in future. 
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500


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
        // SUCCSESFUL TRANSFER
    } else if ((transferStationInfo.first_station && transferStationInfo.second_station) && (transferStationInfo.second_station.type != 'errorTransfer')){
        console.log(transferStationInfo)
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
        // TRANSFER WITH ERROR 
    } else if((transferStationInfo.first_station && transferStationInfo.second_station) && (transferStationInfo.second_station.type === 'errorTransfer')){
        // console.log('trans error', transferStationInfo.first_station.routeIcon)
        console.log(transferStationInfo)
        return(
            <>
                <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                    <div className="route-info-html">
                       <div> arrive at {name}  platform on {transferStationInfo.first_station.routeIcon} at {transferStationInfo.first_station.arrival_string}</div>
                       <div> ERROR {transferStationInfo.second_station.routeIcon}</div>
                       <div>{!(transferStationInfo.station_to_station_service) ? "station  out of service" : ""}</div>
                       <div>{!(transferStationInfo.north_bound_service) ? "no north  trains" : ""}</div>
                       <div>{!(transferStationInfo.south_bound_service) ? "no south trains" : ""}</div>
                    </div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    } else if (errorInfo){
        console.log('si error return', errorInfo)
        return(
            <>
            <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                <div className="route-info-html">
                   <div>{name}</div>
                   <div>
                        {errorInfo.complete_service ? <>station in service</> : 
                        !(errorInfo.north_bound_service) ? <>no {stationInfo.north_direction_label} platform {(stationInfo.type === "errorStart") ? "departures" : (stationInfo.type === "errorEnd") ? "arrivals" : ""}</> : 
                        !(errorInfo.south_bound_service) ? <>no {stationInfo.south_direction_label} platform {(stationInfo.type === "errorStart") ? "departures" : (stationInfo.type === "errorEnd") ? "arrivals" : ""}</> : <></>
                        // !(errorInfo.trains_between_stations) ? <>no trains running between stations</> : <>trains running between stations</> ? <>NO SERVICE</> : <>IN SERVICE</>
                        }
                   </div>
                   <div>{(errorInfo.station_to_station_service)? "TRAINS RUNNING BTW STATIONS" : "TRAINS NOT RUNNING BTW STATIONS"}</div>
                </div>
            </Html>
            <Line points={[position, tooltipPosition]} lineWidth={2}/>
        </>
        )

    }
    
}
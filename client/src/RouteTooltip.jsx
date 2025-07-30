import { Html, Line } from "@react-three/drei"
import { useState, useEffect } from "react"
import * as THREE from "three"

export default function RouteTooltip({stationInfo, name, position}){
    // console.log('si rtt', stationInfo)
    // where do I get name from, how can I get name of transfer? 

    const [startStatonInfo, setStartStationInfo] = useState({})
    const [endStationInfo, setEndStationInfo] = useState({})
    const [transferStationInfo, setTransferStationInfo] = useState({
        "first_station" : null,
        "second_station" : null
    })

    if (transferStationInfo.first_station){
        console.log('tsi', transferStationInfo)
    }
    
    useEffect(()=>{
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
    } else if (stationInfo.type == "transfer"){
        // construct ordered objects based on arrival and departure times
       
        setTransferStationInfo((prevInfo)=>{
            console.log('pi', prevInfo)
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


            console.log('transtationinfo',stationInfo)
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
            } else {
                console.log('second station first')
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
        
    }

    },[stationInfo])
    // console.log(primaryStatonInfo)
    // const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)

      // line for tooltip. make variable according to cam position in future. 
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500

    // const routeLogo = <img className="route_icon"   src={`../public/ICONS/${stationInfo.route}.png`}/>

    // let arrivalTime = Date(stationInfo.arrivalTime)
    // let arrivalTimeDate = new Date(arrivalTime)
    //             // console.log(typeof arrivalTimeDate)
    // let mainArrivalTimeString = arrivalTimeDate.toLocaleTimeString('en-US', { 
    //     hour: 'numeric', 
    //     minute: '2-digit',
    //     hour12: true 
    // })
    
    // let arrivalTime = Date(stationInfo.arrivalTime)
    // let arrivalTimeDate = new Date(arrivalTime)
    // // console.log(typeof arrivalTimeDate)
    // mainArrivalTimeString = arrivalTimeDate.toLocaleTimeString('en-US', { 
    //     hour: 'numeric', 
    //     minute: '2-digit',
    //     hour12: true 
    // })
    // let departureTime = Date(stationInfo.departureTime)
    // let departureTimeDate = new Date(departureTime)
    // mainDepartureTimeString = departureTimeDate.toLocaleTimeString('en-US', { 
    //     hour: 'numeric', 
    //     minute: '2-digit',
    //     hour12: true 
    // });
  

    


    // if (stationInfo)

    if (stationInfo.type == "start"){
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
    } else if ((stationInfo.type == "end")){
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
    } else if (stationInfo.type == "transfer" && (transferStationInfo.first_station && transferStationInfo.second_station)){
        return(
            <>
                <Html wrapperClass="route-info-tooltip" position={tooltipPosition} center={true} distanceFactor={5}>
                    <div className="route-info-html">
                       <div> arrive at {name} {transferStationInfo.first_station.routeIcon} platform at {transferStationInfo.first_station.arrival_string}</div>
                       <div> transfer to {transferStationInfo.second_station.direction_label} {transferStationInfo.second_station.routeIcon} at {transferStationInfo.second_station.departure_string}</div>
                    </div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    }
    
}
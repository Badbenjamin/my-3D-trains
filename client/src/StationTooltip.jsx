import { Html, Line } from "@react-three/drei"
import { useState, useEffect } from "react"
import * as THREE from "three"

import './App.css'

export default function StationToolTip({stopId, position, name, daytime_routes, retrieveStationId, clearTooltip}){
    let [arrivalInfo, setArrivalInfo] = useState({})
    let [northArrivals, setNorthArrivals] = useState([])
    let [southArrivals, setSouthArrivals] = useState([])
    useEffect(()=>{
        fetch(`http://127.0.0.1:5555/api/arrivals/${stopId}`)
                .then(response => response.json())
                .then(newArrivals => {setArrivalInfo(newArrivals)})

    }, [])

    let iconImageArray = [];
    daytime_routes.split(" ").map((route)=>{
            iconImageArray.push(<img className="route_icon_complex" src={`../public/ICONS/${route}.png`}/>)
    })
  
    function handleXClick(stopId){
        clearTooltip(stopId, "stopId")
    }

    // DUPLICATE FUNCTION IN COMPLEX TOOLTIP!!!
    function buildArrivals(arrivalObjectArray){
        let imgTimePairs =[]
        if (arrivalObjectArray) {
            for (const arrivalObject of arrivalObjectArray){
                let imgTimePair = <div className="icon-time-pair">
                                     <img className="tooltip_route_icon" src={`../public/ICONS/${arrivalObject["route"]}.png`} />
                                     <div>{arrivalObject['time']}</div>
                                  </div>
                imgTimePairs.push(imgTimePair)
            }
        }
        return imgTimePairs
    }
    

    useEffect(()=>{
       northArrivals = buildArrivals(arrivalInfo.n_bound_arrivals)
       setNorthArrivals(northArrivals)
       southArrivals = buildArrivals(arrivalInfo.s_bound_arrivals)
       setSouthArrivals(southArrivals)
    }, [arrivalInfo])
    
    // line for tooltip. make variable according to cam position in future. 
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500

    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)
 
    // origin or destination click invokes callback func retrieveStationId from app.jsx
    // this is passed down to search elements to display the station
    // passed down from app.jsx to journeyplanner, sets journey stations for fetch request 
    function handleSetStationClick(id, startOrEnd){
        retrieveStationId(id, startOrEnd)
    }

    if (!arrivalInfo){
        return(
            <Html position={position}>
                <div className="station-tooltip">
                    LOADIN!!!
                </div>
            </Html>
        )
    } else if (arrivalInfo && northArrivals && southArrivals){
        return (
        <>
             <Html
                key={stopId}
                as="div"
                wrapperClass="station-tooltip"
                position={tooltipPosition}
                distanceFactor={5}
                center={true}
            >
                <div  className="station-html">
                    <button className="x-button" onClick={()=>{(handleXClick(stopId))}} >X</button>
                    <h2 className="station-html-text">{name}{iconImageArray} </h2>
                    <div className="arrivals-html">
                        {arrivalInfo.north_direction_label}
                        {northArrivals}
                        {arrivalInfo.south_direction_label}
                        {southArrivals}
                    </div>
                    
                    <button onClick={()=>handleSetStationClick(stopId, "start")}>ORIGIN</button>
                    <button onClick={()=>handleSetStationClick(stopId, "end")}>DESTINATION</button>
                </div>
            </Html>
            <Line points={[position, tooltipPosition]} lineWidth={2}/>
        </>
           
         
        
        )
    }

}
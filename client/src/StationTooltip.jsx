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
            iconImageArray.push(<img className="route_icon_complex" src={`../ICONS/${route}.png`}/>)
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
                                     <img className="tooltip_route_icon" src={`../ICONS/${arrivalObject["route"]}.png`} />
                                     <div> {arrivalObject['time']}, </div>
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

    if (Object.keys(arrivalInfo).length === 0){
        return(
            <Html wrapperClass="station-tooltip" position={tooltipPosition} distanceFactor={7} center={true}>
                <div className="station-html">
                    <h2 className="station-html-text">{name}{iconImageArray} </h2>
                </div>
                <hr width="100%" size="2"/>
                <div className="set-as">
                    {/* <div>Set as</div> */}
                    <button className="origin-dest-btn" onClick={()=>handleSetStationClick(stopId, "start")}>ORIGIN</button>
                    <button className="origin-dest-btn" onClick={()=>handleSetStationClick(stopId, "end")}>DESTINATION</button>
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
                distanceFactor={7}
                center={true}
            >
                <div  className="station-html">
                    <button className="x-button" onClick={()=>{(handleXClick(stopId))}} >X</button>
                    <h2 className="station-html-text">{name}{iconImageArray} </h2>
                    <hr width="100%" size="2"/>
                    <div >
                        <div className="arrivals-name">{arrivalInfo.north_direction_label}</div>
                        <div className="arrivals-html">{northArrivals.length > 0 ? northArrivals : <div className="error-highlight">PLATFORM CLOSED</div>}</div>
                        <hr></hr>
                        <div className="arrivals-name">{arrivalInfo.south_direction_label}</div>
                        <div className="arrivals-html">{southArrivals.length > 0 ? southArrivals : <div className="error-highlight">PLATFORM CLOSED</div>}</div>
                    </div>
                    <hr width="100%" size="2"/>
                    <div className="set-as">
                        {/* <div>Set as</div> */}
                        <button className="origin-dest-btn" onClick={()=>handleSetStationClick(stopId, "start")}>ORIGIN</button>
                        <button className="origin-dest-btn" onClick={()=>handleSetStationClick(stopId, "end")}>DESTINATION</button>
                    </div>
                    
                    
                </div>
            </Html>
            <Line points={[position, tooltipPosition]} lineWidth={2}/>
        </>
           
         
        
        )
    } 

}
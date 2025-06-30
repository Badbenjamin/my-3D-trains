import { Html, Line } from "@react-three/drei"
import { useEffect, useState } from "react"
import * as THREE from "three"

import './App.css'

export default function ComplexTooltip({complexStationRouteIdObjs, averagePosition, complexId, clearTooltip, retrieveStationId}){
    const [complexOrStation, setComplexOrStation] = useState("complex")
    let [northArrivals, setNorthArrivals] = useState([])
    let [southArrivals, setSouthArrivals] = useState([])
    const [stationInfo, setStationInfo] = useState({})
    console.log('si', stationInfo)
    // need to bring up stationTooltip, or something like it, when a route is clicked. 
    console.log(complexStationRouteIdObjs)
    function handleClick(gtfsStopId){
        fetch(`http://127.0.0.1:5555/api/arrivals/${gtfsStopId}`)
                .then(response => response.json())
                .then(newStationInfo => {setStationInfo(newStationInfo)})
        console.log('station info', stationInfo)
        setComplexOrStation("station")
        
    }

    function buildArrivals(arrivalObjectArray){
        let imgTimePairs =[]
        if (arrivalObjectArray) {
            for (const arrivalObject of arrivalObjectArray){
                console.log(arrivalObject['route'])
                let imgTimePair = <div className="icon-time-pair">
                                     <img className="tooltip_route_icon" src={`../public/ICONS/${arrivalObject["route"]}.png`} />
                                     <div>{arrivalObject['time']}</div>
                                  </div>
                imgTimePairs.push(imgTimePair)
            }
        }
        return imgTimePairs
    }

    function handleBackClick(){
        setStationInfo({})
        setComplexOrStation('complex')
    }

    useEffect(()=>{
        northArrivals = buildArrivals(stationInfo.n_bound_arrivals)
        console.log(northArrivals)
        setNorthArrivals(northArrivals)
        southArrivals = buildArrivals(stationInfo.s_bound_arrivals)
        setSouthArrivals(southArrivals)

        

    }, [stationInfo])
    console.log('station info', stationInfo)
    
     // line for tooltip. make variable according to cam position in future. 
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500;

    const tooltipPosition = new THREE.Vector3(averagePosition.x, averagePosition.y + 2, averagePosition.z);

    const stationAndRoutesButtonArray = []
    complexStationRouteIdObjs.map((stationObj)=>{
        let iconImageArray = [];
        stationObj.routes.split(" ").map((route)=>{
            iconImageArray.push(<img className="route_icon_complex" src={`../public/ICONS/${route}.png`}/>)
        })
        
        let stationInfoButton = <button onClick={()=>{handleClick(stationObj.gtfs_stop_id)}} className="station-routes-button">{stationObj.name}{iconImageArray}</button>
        stationAndRoutesButtonArray.push(stationInfoButton)
    })

    function handleXClick(complexId){
        console.log('cid', complexId)
        clearTooltip(complexId, "complexId");
    }

    function handleSetStationClick(id, startOrEnd){
        console.log('set click', id, startOrEnd)
        retrieveStationId(id, startOrEnd);
    }

    if (complexOrStation === "complex"){
        return(
            <>
                 <Html
                    key={complexId}
                    as="div"
                    wrapperClass="complex-tooltip"
                    position={tooltipPosition}
                    distanceFactor={5}
                    center={true}
                >
                    <button onClick={()=>{handleXClick(complexId)}}>X</button>
                    
                    <div  className="complex-tooltip-html">
                       {stationAndRoutesButtonArray}
                    </div>
                </Html>
                <Line points={[averagePosition, tooltipPosition]} lineWidth={2}/>
            </>
        )
    } else if ((complexOrStation === "station")  && (stationInfo != {})){
        return(
            <>
                {/* <>station</> */}
                 <Html
                key={stationInfo.gtfs_stop_id}
                as="div"
                wrapperClass="station-tooltip"
                position={tooltipPosition}
                distanceFactor={5}
                center={true}
            >
                <div  className="station-html">
                    {/* <button className="x-button" onClick={()=>{(handleXClick(stopId))}} >X</button> MODIFY FUNCTION TO WORK WITH COMPLEX ID TOO */}
                    <button onClick={handleBackClick}>BACK</button>
                    <button onClick={()=>{handleXClick(complexId)}}>X</button>
                    <h2 className="station-html-text">{stationInfo.stop_name} </h2>
                    <div className="arrivals-html">
                        {stationInfo.north_direction_label}
                        {northArrivals}
                        {stationInfo.south_direction_label}
                        {southArrivals}
                    </div>
                    
                    <button onClick={()=>handleSetStationClick(stationInfo.gtfs_stop_id, "start")}>ORIGIN</button>
                    <button onClick={()=>handleSetStationClick(stationInfo.gtfs_stop_id, "end")}>DESTINATION</button>
                </div>
            </Html>
            <Line points={[averagePosition, tooltipPosition]} lineWidth={2}/>
            </>
        )
    }
    
}
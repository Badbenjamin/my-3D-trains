import { Html, Line } from "@react-three/drei"
import { useEffect, useState } from "react"
import * as THREE from "three"

import './App.css'

export default function ComplexTooltip({complexStationRouteIdObjs, averagePosition, complexId, clearTooltip, retrieveStationId}){
    const [complexOrStation, setComplexOrStation] = useState("complex")
    let [northArrivals, setNorthArrivals] = useState([])
    let [southArrivals, setSouthArrivals] = useState([])
    const [stationInfo, setStationInfo] = useState({})
    

    // tooltip displays routes until a route is clicked, then it changes to a station info tooltip
    function handleClick(gtfsStopId){
        fetch(`/api/arrivals/${gtfsStopId}`)
                .then(response => response.json())
                .then(newStationInfo => {setStationInfo(newStationInfo)})
        setComplexOrStation("station")     
    }

    function buildArrivals(arrivalObjectArray){
        let imgTimePairs =[]
        if (arrivalObjectArray) {
            for (const arrivalObject of arrivalObjectArray){
                let imgTimePair = <div className="icon-time-pair">
                                     <img className="tooltip_route_icon" src={`../ICONS/${arrivalObject["route"]}.png`} />
                                     <div>{arrivalObject['time']}</div>
                                  </div>
                imgTimePairs.push(imgTimePair)
            }
        }
        return imgTimePairs
    }

    // set station back to complex and clear stationInfo
    function handleBackClick(){
        setStationInfo({})
        setComplexOrStation('complex')
    }

    // route click triggers fetch, when fetch updates stationInfo, the arrivals are updated
    useEffect(()=>{
        northArrivals = buildArrivals(stationInfo.n_bound_arrivals)
        setNorthArrivals(northArrivals)
        southArrivals = buildArrivals(stationInfo.s_bound_arrivals)
        setSouthArrivals(southArrivals)
    }, [stationInfo])
    
     // line for tooltip
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500;

    const tooltipPosition = new THREE.Vector3(averagePosition.x, averagePosition.y + 2, averagePosition.z);

    // build the buttons that display the routes of the complex
    const stationAndRoutesButtonArray = []
    complexStationRouteIdObjs.map((stationObj)=>{
        let iconImageArray = [];
        stationObj.routes.split(" ").map((route)=>{
            iconImageArray.push(<img className="route_icon_complex" src={`../ICONS/${route}.png`}/>)
        })
        
        let stationInfoButton = <button className="complex-button" onClick={()=>{handleClick(stationObj.gtfs_stop_id)}}>{stationObj.name}{iconImageArray}</button>
        stationAndRoutesButtonArray.push(stationInfoButton)
    })

    // remove tooltip with x click
    function handleXClick(complexId){
        clearTooltip(complexId, "complexId");
    }

    // set station as start or end
    function handleSetStationClick(id, startOrEnd){
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
                    <div  className="complex-tooltip-html">
                    <button className="x-button" onClick={()=>{handleXClick(complexId)}}>X</button>
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
                    <button className="back-button" onClick={handleBackClick}>BACK</button>
                    <button className="x-button" onClick={()=>{handleXClick(complexId)}}>X</button>
                    <h2 className="station-html-text">{stationInfo.stop_name} </h2>
                    <hr width="100%" size="2"/>
                    <div >
                        <div className="arrivals-name">{stationInfo.north_direction_label}</div>
                        <div className="arrivals-html">{northArrivals}</div>
                        <hr></hr>
                        <div className="arrivals-name">{stationInfo.south_direction_label}</div>
                        <div className="arrivals-html">{southArrivals}</div>
                    </div>
                    <hr width="100%" size="2"/>
                    <div className="set-as">
                        {/* <div>Set as</div> */}
                        <button className="origin-dest-btn" onClick={()=>handleSetStationClick(stationInfo.gtfs_stop_id, "start")}>ORIGIN</button>
                        <button className="origin-dest-btn" onClick={()=>handleSetStationClick(stationInfo.gtfs_stop_id, "end")}>DESTINATION</button>
                    </div>
                </div>
            </Html>
            <Line points={[averagePosition, tooltipPosition]} lineWidth={2}/>
            </>
        )
    }
    
}
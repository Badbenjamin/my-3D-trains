import { Html } from "@react-three/drei";
import { useState } from "react";

export default function ComplexText({handleComplexClick,stationInTripArray, tripInProgressArray, stationInfoArray, averagePosition, names, routes, status, alphaLevel, complexId, complexStationRouteIdObjs, size, clearTooltip}){
    const [tooltipStatus, setTooltipStatus] = useState(false)
     // COULD ALSO CONTROL MAX/MIN WIDTH WITH SIZE?
    let sizeInPx = size.toString()+"px"
    let iconSizeInPx = (size + 3).toString()+"px"
    let widthInPx = (size * 10).toString()+"px"
    let widthInPxForIconArray = (size * 7).toString()+"px"

    let tripInProgress = false
    for (let tripStatus of tripInProgressArray){
        if (tripStatus == true){
            tripInProgress = true
        }
    }

    let complexInTrip = false
    for (let stationInTrip of stationInTripArray){
        if (stationInTrip == true){
            complexInTrip = true
        }
    }
    // console.log(complexInTrip)
    // console.log( stationInfoArray)
    // console.log(widthInPx)
    let iconImageArray = []
    routes.map((routesArray)=>{
        // routesArray is array of arrays
        for (let routes of routesArray){
            // routes is sub array containing routes
            for (let route of routes){
                // route is each route
                if (route != " "){
                    iconImageArray.push(<img className="route_icon" style={{width: iconSizeInPx, height : iconSizeInPx}} src={`../public/ICONS/${route}.png`}/>);
                }
            }
        }
    })

    function handleClick(){
        
        if (!tooltipStatus){
            handleComplexClick(complexStationRouteIdObjs, averagePosition, complexId);
            setTooltipStatus(!tooltipStatus)
        } else {
            clearTooltip(complexId, 'complexId')
            setTooltipStatus(!tooltipStatus)
        }
    }
    return(
        <>
            {(!tripInProgress || complexInTrip) ? <Html key={complexId} style={{opacity : alphaLevel}} wrapperClass="complex_label" distanceFactor={7} center={true} position={averagePosition}>
                <button onClick={handleClick} style={{fontSize: sizeInPx, inlineSize : widthInPx}} className="complex-html-button-text">
                    <div className="station-text-name">
                        {names[0]}
                    </div>
                    <div className="icon-image-array" style={{inlineSize : widthInPxForIconArray}}>
                        {iconImageArray}
                    </div>
                </button>
                </Html> : <></>}
        </>
    )
}
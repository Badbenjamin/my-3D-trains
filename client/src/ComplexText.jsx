import { Html } from "@react-three/drei";
import { useState } from "react";

export default function ComplexText({handleComplexClick, complexTextDisplay, averagePosition, names, routes, statusArray, alphaLevel, complexId, complexStationRouteIdObjs, size, clearTooltip}){
    const [tooltipStatus, setTooltipStatus] = useState(false)
    // state or var?
    // const [displayStatus, setDisplayStatus] = useState(true)
     // COULD ALSO CONTROL MAX/MIN WIDTH WITH SIZE?
    let sizeInPx = size.toString()+"px"
    let iconSizeInPx = (size + 3).toString()+"px"
    let widthInPx = (size * 10).toString()+"px"
    let widthInPxForIconArray = (size * 7).toString()+"px"
    // console.log('sa', statusArray)
    let geometryDisplay = false
   
    // text display dependent on visibility of geometries
    // if one geometry in the complex of stations is visible, then the complex text should be visible 
    for (let status of statusArray){
        // console.log(status)
        if (status.camAlpha == false){
            alphaLevel = 1.0
        } else {
            alphaLevel = alphaLevel
        }
        if (status.geometryDisplay == true){
            geometryDisplay = true
        }
    }
  
  
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
            {(complexTextDisplay && geometryDisplay)? <Html key={complexId} style={{opacity : alphaLevel}} wrapperClass="complex_label" distanceFactor={7} center={true} position={averagePosition}>
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
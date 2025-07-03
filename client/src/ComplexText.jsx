import { Html } from "@react-three/drei";
import { useState } from "react";

export default function ComplexText({handleComplexClick, averagePosition, names, routes, status, alphaLevel, complexId, complexStationRouteIdObjs, size, clearTooltip}){
    const [tooltipStatus, setTooltipStatus] = useState(false)

    let sizeInPx = size.toString()+"px"
    let iconImageArray = []
    routes.map((routesArray)=>{
        // routesArray is array of arrays
        for (let routes of routesArray){
            // routes is sub array containing routes
            for (let route of routes){
                // route is each route
                if (route != " "){
                    iconImageArray.push(<img className="route_icon" style={{width: size, height : sizeInPx}} src={`../public/ICONS/${route}.png`}/>);
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
            {status ? <Html key={complexId} style={{opacity : alphaLevel}} wrapperClass="complex_label" distanceFactor={6} center={true} position={averagePosition}>
                <button onClick={handleClick} style={{fontSize: sizeInPx}} className="complex-html-button-text">
                    <div className="station-text-name">
                        {names[0]}
                    </div>
                    <div className="icon-image-array">
                        {iconImageArray}
                    </div>
                    
                    </button>
                </Html> : <></>}
        </>
    )
}
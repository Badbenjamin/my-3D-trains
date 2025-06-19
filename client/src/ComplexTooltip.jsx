import { Html, Line } from "@react-three/drei"
import * as THREE from "three"

import './App.css'

export default function ComplexTooltip({complexStationRouteIdObjs, averagePosition}){

    console.log('stations complex tt', complexStationRouteIdObjs);
    
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
        
        let stationInfoButton = <button className="station-routes-button">{stationObj.name}{iconImageArray}</button>
        stationAndRoutesButtonArray.push(stationInfoButton)
    })

    return(
        <>
             <Html
                key={"jabroni"}
                as="div"
                wrapperClass="complex-tooltip"
                position={tooltipPosition}
                distanceFactor={5}
                center={true}
            >
                <div  className="complex-tooltip-html">
                   {stationAndRoutesButtonArray}
                </div>
            </Html>
            <Line points={[averagePosition, tooltipPosition]} lineWidth={2}/>
        </>
    )
}
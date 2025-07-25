import { Html, Line } from "@react-three/drei"
import * as THREE from "three"

export default function RouteTooltip({stationInfo, name, position}){
    // console.log('si rtt', stationInfo)

    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)

      // line for tooltip. make variable according to cam position in future. 
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500

    if (stationInfo)

    if (stationInfo.type == "start"){
        return(
            <>
                <Html wrapperClass="station-tooltip" position={tooltipPosition} center={true}>
                    <div>{name}</div>
                    <div>{stationInfo.type}</div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    } else if ((stationInfo.type == "end")){
        return(
            <>
                <Html wrapperClass="station-tooltip" position={tooltipPosition} center={true}>
                    <div>{name}</div>
                    <div>{stationInfo.type}</div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    } else if (stationInfo.type == "transfer"){
        return(
            <>
                <Html wrapperClass="station-tooltip" position={tooltipPosition} center={true}>
                    <div>{name}</div>
                    <div>{stationInfo.type}</div>
                </Html>
                <Line points={[position, tooltipPosition]} lineWidth={2}/>
            </>
        )
    }
    
}
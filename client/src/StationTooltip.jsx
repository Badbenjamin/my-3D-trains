import { Html, Line } from "@react-three/drei"
import { useState, useEffect } from "react"
import * as THREE from "three"
// import { Line } from "@react-three/drei"

// add props?
export default function StationToolTip({stopId, position, name}){
    let [arrivalInfo, setArrivalInfo] = useState({})

    useEffect(()=>{
        fetch(`http://127.0.0.1:5555/api/arrivals/${stopId}`)
                .then(response => response.json())
                .then(newArrivals => {setArrivalInfo(newArrivals)})

    }, [])

    console.log('ai',arrivalInfo)
  
  
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500

    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)
    const points = []
    points.push(position)
    points.push(tooltipPosition)
    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );

    console.log(lineGeometry)

    // const tooltipLine = <Line points={[position, tooltipPosition]}/>

    if (!arrivalInfo){
        return(
            <Html position={position}>
                <div className="station-tooltip">
                    LOADIN!!!
                </div>
            </Html>
        )
    } else if (arrivalInfo){
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
                    <button className="x-button" onClick={console.log('xclick')}>X</button>
                    <h2 className="station-html-text">{name + " " + "icons"}</h2>
                    <div className="arrivals-html">
                        <div>{arrivalInfo.north_direction_label + ": " + arrivalInfo.n_bound_arrivals}</div>
                        <div>{arrivalInfo.south_direction_label + ": " + arrivalInfo.s_bound_arrivals}</div>
                    </div>
                    <button onClick={()=>handleSetStationClick(stationInfoObject.id, "start")}>ORIGIN</button>
                    <button onClick={()=>handleSetStationClick(stationInfoObject.id, "end")}>DESTINATION</button>
                    {/* {tooltipLine} */}
                </div>
                
                {/* <line geometry={lineGeometry} material={lineMaterial} linewidth={10.0}>
                            <lineBasicMaterial />
                </line> */}
                
            </Html>
            <Line points={[position, tooltipPosition]}/>
        </>
           
         
        
        )
    }

}
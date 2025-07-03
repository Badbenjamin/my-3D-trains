import { Html, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useState } from "react";



import './App.css'

export default function StationText({handleStationClick, position, daytime_routes, name, status, gtfs_stop_id, alphaLevel, size, clearTooltip}){
    const [tooltipStatus, setTooltipStatus] = useState(false)
    let sizeInPx = size.toString()+"px"
    // COULD ALSO CONTROL MAX/MIN WIDTH WITH SIZE?
   
    let iconImageArray = []
    daytime_routes.split(" ").map((route)=>{
        iconImageArray.push(<img className="route_icon" style={{width: sizeInPx, height : sizeInPx}}  src={`../public/ICONS/${route}.png`}/>)
    })

    // console.log(iconImageArray)

    function handleClick(e){
        if (!tooltipStatus){
            handleStationClick(gtfs_stop_id, name, position, daytime_routes)
            setTooltipStatus(!tooltipStatus)
        } else {
            clearTooltip(gtfs_stop_id, 'stopId')
            setTooltipStatus(!tooltipStatus)
        }
        
    }

    useFrame((state, delta)=>{
    })

    // console.log(iconImageArray)
    return(
        <>
            {status ? <Html key={gtfs_stop_id} style={{opacity : alphaLevel}} wrapperClass="station_label" distanceFactor={5} center={true} position={position}>
                {<button className="station-html-button-text" style={{fontSize: sizeInPx}} onClick={handleClick}>
                        <div className="station-text-name">
                            {name}
                        </div>
                        <div className="icon-image-array">
                            {iconImageArray}
                        </div>
                    </button>}
            </Html> : <></>}
        </>
    )
}
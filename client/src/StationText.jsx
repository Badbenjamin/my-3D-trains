import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import './App.css'

export default function StationText({handleStationClick, position, daytime_routes, name, status, gtfs_stop_id, alphaLevel}){
    // console.log('dist sta', distance)

    let opacityLevel = alphaLevel

    function handleClick(e){
        handleStationClick(gtfs_stop_id)
    }

    useFrame((state, delta)=>{
    })
    return(
        <>
            {status ? <Html style={{opacity : alphaLevel}} wrapperClass="station_label" distanceFactor={5} center={true} position={position}>{<button className="station-html-button-text" onClick={handleClick}>{name + " " + daytime_routes}</button>}</Html> : <></>}
        </>
    )
}
import { Html, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";


import A from '../public/ICONS/A.png';

import './App.css'

export default function StationText({handleStationClick, position, daytime_routes, name, status, gtfs_stop_id, alphaLevel}){
    // console.log('dist sta', distance)

    let iconImage = <Image url={A}/>
    console.log(A)
    // let opacityLevel = alphaLevel

    function handleClick(e){
        handleStationClick(gtfs_stop_id)
    }

    useFrame((state, delta)=>{
    })
    return(
        <>
            {/* {iconImage} */}
            {status ? <Html style={{opacity : alphaLevel}} wrapperClass="station_label" distanceFactor={5} center={true} position={position}>{<button className="station-html-button-text" onClick={handleClick}>
                {name + " " + daytime_routes}</button>}
                <img className="route_icon" src={A}/>
                </Html> : <></>}
            {/* {<Html position={position}>
                <img className="route_icon" src={A}/>
            </Html>} */}
        </>
    )
}
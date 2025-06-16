import { Html, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";



import './App.css'

export default function StationText({handleStationClick, position, daytime_routes, name, status, gtfs_stop_id, alphaLevel}){


    let iconImageArray = []
    daytime_routes.split(" ").map((route)=>{
        iconImageArray.push(<img className="route_icon" src={`../public/ICONS/${route}.png`}/>)
    })

    // console.log(iconImageArray)

    function handleClick(e){
        handleStationClick(gtfs_stop_id, name, position, daytime_routes)
    }

    useFrame((state, delta)=>{
    })

    // console.log(iconImageArray)
    return(
        <>
            {status ? <Html key={gtfs_stop_id} style={{opacity : alphaLevel}} wrapperClass="station_label" distanceFactor={5} center={true} position={position}>
                {<button className="station-html-button-text" onClick={handleClick}>{name}{iconImageArray}</button>}
            </Html> : <></>}
        </>
    )
}
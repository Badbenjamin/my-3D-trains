import { Html, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";



import './App.css'

export default function StationText({handleStationClick, position, daytime_routes, name, status, gtfs_stop_id, alphaLevel}){
    console.log('alpha station', alphaLevel)

    let iconImageArray = []
    let routesArray = daytime_routes.split(" ").map((route)=>{
        iconImageArray.push(<img className="route_icon" src={`../public/ICONS/${route}.png`}/>)
    })



    function handleClick(e){
        handleStationClick(gtfs_stop_id)
    }

    useFrame((state, delta)=>{
    })
    return(
        <>
            {status ? <Html style={{opacity : alphaLevel}} wrapperClass="station_label" distanceFactor={5} center={true} position={position}>
                {<button className="station-html-button-text" onClick={handleClick}>{name}{iconImageArray}</button>}
            </Html> : <></>}
        </>
    )
}
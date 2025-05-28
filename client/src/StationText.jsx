import { Html, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";


import A from '../public/ICONS/A.png';
import C from '../public/ICONS/C.png';
import E from '../public/ICONS/E.png';

import One from '../public/ICONS/1.png';
import Two from '../public/ICONS/2.png';
import Three from '../public/ICONS/3.png';

import Four from '../public/ICONS/4.png';
import Five from '../public/ICONS/5.png';
import Six from '../public/ICONS/6.png';

import Seven from '../public/ICONS/7.png';

import B from '../public/ICONS/B.png';
import D from '../public/ICONS/D.png';
import F from '../public/ICONS/F.png';
import M from '../public/ICONS/M.png';

import J from '../public/ICONS/J.png';
import Z from '../public/ICONS/Z.png';

import L from '../public/ICONS/L.png';

import './App.css'

export default function StationText({handleStationClick, position, daytime_routes, name, status, gtfs_stop_id, alphaLevel}){
    console.log('dist sta', daytime_routes)

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
            {/* {iconImage} */}
            {status ? <Html style={{opacity : alphaLevel}} wrapperClass="station_label" distanceFactor={5} center={true} position={position}>{<button className="station-html-button-text" onClick={handleClick}>
                {name}</button>}
                {/* <img className="route_icon" src={A}/> */}
                {iconImageArray}
                </Html> : <></>}
            {/* {<Html position={position}> */}
                {/* <img className="route_icon" src={A}/> */}
                {/* {array} */}
            {/* </Html>} */}
        </>
    )
}
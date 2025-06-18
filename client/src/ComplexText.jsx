import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three"

export default function ComplexText({handleComplexClick, averagePosition, names, routes, status, alphaLevel, complexId}){
    // console.log('ct routes', routes)

    let iconImageArray = []
    routes.map((routesArray)=>{
        // routesArray is array of arrays
        for (let routes of routesArray){
            // routes is sub array containing routes
            for (let route of routes){
                // route is each route
                if (route != " "){
                    iconImageArray.push(<img className="route_icon" src={`../public/ICONS/${route}.png`}/>)
                }
                
            }
            
        }
       
    })

    function handleClick(){
        handleComplexClick(complexId, routes)
    }
    return(
        <>
            {status ? <Html style={{opacity : alphaLevel}} wrapperClass="complex_label" distanceFactor={6} center={true} position={averagePosition}>
                <button onClick={handleClick} className="complex-html-button-text">{names[0]}{iconImageArray}</button>
                </Html> : <></>}
        </>
    )
}
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three"

export default function ComplexText({averagePosition, names, routes, status, alphaLevel}){
    // console.log(names)
    console.log('alpha complex', alphaLevel)
    // alphaLevel = 1.0
    // function avereragePosition(positionsArray){
    //     let xTotal = 0
    //     let yTotal= 0
    //     let zTotal = 0
    //     for (let pos of positionsArray){
    //         xTotal += pos.x
    //         yTotal += pos.y
    //         zTotal += pos.z
    //     }
    //     // console.log(xArray,yArray,zArray)
    //     let xAv = xTotal/positionsArray.length
    //     let yAv = yTotal/positionsArray.length
    //     let zAv = zTotal/positionsArray.length
    //     // console.log(xAv)
    //     return new THREE.Vector3(xAv, yAv, zAv)
    // }
    // let averagePosition = avereragePosition(positions)
    // console.log(positions[0], averagePosition)

    // useFrame((state, delta)=>{
    // })

    let iconImageArray = []
    let routesArray = routes.map((route)=>{
        iconImageArray.push(<img className="route_icon" src={`../public/ICONS/${route}.png`}/>)
    })

    function handleClick(){
        console.log('clickeeed')
    }
    return(
        <>
            {status ? <Html style={{opacity : alphaLevel}} wrapperClass="complex_label" distanceFactor={6} center={true} position={averagePosition}>
                <button onClick={handleClick} className="complex-html-button-text">{names[0]}{iconImageArray}</button>
                </Html> : <></>}
        </>
    )
}
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three"

export default function ComplexText({positions, names, routes,status}){

    // console.log(positions, names, routes)

    function avereragePosition(positionsArray){
        let xTotal = 0
        let yTotal= 0
        let zTotal = 0
        for (let pos of positionsArray){
            xTotal += pos.x
            yTotal += pos.y
            zTotal += pos.z
        }
        // console.log(xArray,yArray,zArray)
        let xAv = xTotal/positionsArray.length
        let yAv = yTotal/positionsArray.length
        let zAv = zTotal/positionsArray.length
        // console.log(xAv)
        return new THREE.Vector3(xAv, yAv, zAv)
    }
    let averagePosition = avereragePosition(positions)
    console.log(positions[0], averagePosition)
    // useFrame((state, delta)=>{
    // })
    return(
        <>
            {status ? <Html  wrapperClass="complex_label" distanceFactor={5} center={true} position={averagePosition}>{names[0] + " " + routes}</Html> : <></>}
        </>
    )
}
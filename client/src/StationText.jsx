import { Html } from "@react-three/drei";
import { useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function StationText({position, text, status}){
    // const [displayStatus, setDisplayStatus] = useState(false)
    // status = true
    // console.log(distance)
    // useEffect(()=>{
    //     // setDisplayStatus(status)
    //     // console.log('d',distance)
    // },[distance])
    // console.log('cam dist', cameraPosition)

    // function findDistance(point1, point2){
    //     let x1 = point1["x"]
    //     let y1 = point1['y']
    //     let z1 = point1['z']
      
    //     let x2 = point2['x']
    //     let y2 = point2['y']
    //     let z2 = point2['z']
      
    //     let result = Math.sqrt(((x2-x1)**2) + ((y2-y1)**2) + ((z2-z1)**2))
    //     return result
    //   }

    // let distance = Math.round(findDistance(position, cameraPosition) * 100) / 100
    // console.log(status)


    useFrame((state, delta)=>{
        // console.log('cam dist', cameraDistance)
    })
    return(
        <>
            {status ? <Html  wrapperClass="station_label" distanceFactor={5} center={true} position={position}>{text}</Html> : <></>}
        </>
    )
}
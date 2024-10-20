import { useFrame} from "@react-three/fiber"
import { useRef } from 'react'
import { Suspense } from "react"

import * as THREE from 'three'
import './index.css'

import PlaceHolder from "./Placeholder"
import LinesAndMap from "./LinesAndMap"

function SubwayMap(){

    
    const torusRef = useRef()
    const cubeRef = useRef()

    const clock = new THREE.Clock()
    
    

    useFrame((state, delta) => {
        // const elapsedTime = clock.getElapsedTime()
        // // console.log(elapsedTime)
        // torusRef.current.rotation.y += delta
        // cubeRef.current.position.y = Math.sin(elapsedTime) * 4
    })

    return( 
        <>
            <Suspense fallback={<PlaceHolder position-y={0.5} scale = {[1,1,1]}/>}>
                {/* <ambientLight/> */}
                <LinesAndMap/>
            </Suspense>
        </>
        
    )
}

export default SubwayMap
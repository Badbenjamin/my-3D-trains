import { useFrame} from "@react-three/fiber"
import { useRef } from 'react'
import { Suspense } from "react"

import * as THREE from 'three'
import './index.css'

import PlaceHolder from "./Placeholder"
import LinesAndMap from "./LinesAndMap"

function SubwayMap(){

    const redRef = useRef()
    const blueRef = useRef()
    const greenRef = useRef()

      useFrame((state, delta) =>
            {
                const angle = state.clock.elapsedTime
                
                redRef.current.position.x = Math.sin(angle /1.2) * 25
                redRef.current.position.z = Math.cos(angle/ 1.2) * 25

                blueRef.current.position.x = Math.sin(angle/2)  * 25
                blueRef.current.position.z = Math.cos(angle/2) * 25

                greenRef.current.position.x = Math.sin(angle/1.5) * 25
                greenRef.current.position.z = Math.cos(angle/1.5) * 25
    
            })
    
    return( 
        <>
            <Suspense fallback={<PlaceHolder position-y={0.5} scale = {[1,1,1]}/>}>
                <ambientLight intensity={.08}/>
                <pointLight ref={redRef} intensity={2000} color={'pink'} position={[0,50,0]}/>
                <pointLight ref={blueRef} intensity={3000} color={'blue'} position={[0,50,0]}/>
                <pointLight ref={greenRef} intensity={5000} color={'green'} position={[0,50,0]}/>
                <LinesAndMap/>
            </Suspense>
        </>
        
    )
}

export default SubwayMap
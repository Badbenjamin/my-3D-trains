import {Perf} from 'r3f-perf'
import {MapControls, Sphere} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useOutletContext } from 'react-router-dom'
import * as THREE from "three"



import StationsTracksAndText from "./StationsTracksAndText"
import Map from "./Map"
import { getByteLength } from 'three/src/extras/TextureUtils.js'
import { useRef, useEffect, useState } from 'react'


// MAYBE CALL THIS ENVIRONMENT OR SOMETHING
function LinesAndMap(){
    const ref = useRef()
    const {vectorPosition, setVectorPositon} = useOutletContext()
   

    // MAP CONTROLLS IN THIS COMPONENT, SO CAMERA POSITION DETERMINED HERE AND PASSED DOWN
    useFrame((state, delta) => {
        let newVectorPosition = {...vectorPosition}
        if (ref.current){
            
            newVectorPosition = ref.current.object.position
            setVectorPositon(newVectorPosition)
        }
    })


    
    return(
        <>
            {/* <Perf position="bottom-right" /> */}
            <MapControls ref={ref} maxDistance={200} minDistance={1} maxPolarAngle={0.99} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[1,2,1]} intenstity={3.5}/>
            <Sphere args={[700, 32, 32]}  material={new THREE.MeshStandardMaterial({ color: new THREE.Color('black'), transparent: false, side: THREE.DoubleSide })}/>
            <Map/>
            <StationsTracksAndText  vectorPosition={vectorPosition}/>
        </>
    )
}

export default LinesAndMap
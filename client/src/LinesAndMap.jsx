import {Perf} from 'r3f-perf'
import {MapControls, Sky, CameraControls} from '@react-three/drei'
// import { useThree } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
// import { Camera } from 'three'
import { useOutletContext } from 'react-router-dom'

// import { mapControls } from 'three/addons/controls/OrbitControls.js';

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
    // console.log('t', ref.current.object)

    
    return(
        <>
            <Perf position="top-left" />
            <MapControls ref={ref} maxDistance={200} minDistance={1} maxPolarAngle={0.99} />
            
             {/* {mapControls} */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[1,2,3]} intenstity={1.5}/>
            <Sky/>
            <Map/>
            <StationsTracksAndText  vectorPosition={vectorPosition}/>
        </>
    )
}

export default LinesAndMap
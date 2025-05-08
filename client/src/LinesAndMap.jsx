import {Perf} from 'r3f-perf'
import {MapControls, Sky, CameraControls} from '@react-three/drei'
// import { useThree } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
// import { Camera } from 'three'
import { useOutletContext } from 'react-router-dom'

// import { mapControls } from 'three/addons/controls/OrbitControls.js';

import StationsAndTracks from "./StationsAndTracks"
import Map from "./Map"
import { getByteLength } from 'three/src/extras/TextureUtils.js'
import { useRef, useEffect, useState } from 'react'

function LinesAndMap(){
    const ref = useRef()
    const {vectorPosition, setVectorPositon} = useOutletContext()
   
    // const [vectorPosition, setVectorPositon] = useState({})
    // const [change, setChange] = 
    // const cam = 
    // const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

    // const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
//    const MyCamera =<CameraControls makeDefault />

    // useEffect(()=>{
    //     // let newVectorPosition = {...vectorPosition}
    //     if (ref.current){
    //         setVectorPositon(ref.current.object.position)
    //     }
    // },[vectorPosition])

    // console.log('vp', vectorPosition)
    

    // const mapControls = <MapControls ref={ref} maxDistance={100} minDistance={1} maxPolarAngle={0.99} enableDamping={true}/>
    // console.log('ref', ref)
    // if (ref.current){
    //     console.log(ref.current.object.position)
    // }
    // const camera = mapControls
    // console.log('cam', camera)
    // let getDistance = mapControls.getDistance()
    // console.log('dist',getDistance)

    // NOT SURE IF THIS WORKS
    
    // console.log(camera.position)
    // useEffect(()=>{
        
    //     if (ref.current){
    //         console.log('position', camera)
    //         console.log('dist', getDistance)
    //     }
    // },[])

    // let pos = {}
    useFrame((state, delta) => {
        let newVectorPosition = {...vectorPosition}
        if (ref.current){
            newVectorPosition = ref.current.object.position
            // pos = newVectorPosition
            // let newVectorPosition = {ref.current.object.position}
            // console.log(ref.current.object.position)
            setVectorPositon(newVectorPosition)
            // console.log(vectorPosition)
            // console.log('vp', vectorPosition)
        }
    })
    // console.log('p', vectorPosition)

    
    return(
        <>
            {/* <Perf position="top-left" /> */}
            <MapControls ref={ref} maxDistance={200} minDistance={1} maxPolarAngle={0.99} />
            
             {/* {mapControls} */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[1,2,3]} intenstity={1.5}/>
            <Sky/>
            <Map/>
            <StationsAndTracks vectorPosition={vectorPosition}/>
        </>
    )
}

export default LinesAndMap
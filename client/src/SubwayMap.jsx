import { useFrame} from "@react-three/fiber"
import { useRef } from 'react'
import {MapControls, Html} from '@react-three/drei'
import {Perf} from 'r3f-perf'
import * as THREE from 'three'
import './index.css'
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'



function SubwayMap(){

    const map = useLoader(GLTFLoader, './subway_map.glb')
    console.log(map)
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
            <Perf position="top-left" />
            <MapControls/>
            <ambientLight intensity={1.5} />
            <primitive object={map.scene}/>
            {/* <mesh ref={torusRef} >
                <torusKnotGeometry args={[1, 0.4, 64, 8]} />
                <meshNormalMaterial />
                <Html distanceFactor={8} wrapperClass="label" position={[1,1,1]}>TorusKnot</Html>
            </mesh>
            <mesh ref={cubeRef} >
                <boxGeometry />
                <meshNormalMaterial />
                <Html distanceFactor={8}  wrapperClass="label" position={[1,1,1]}>Cube</Html>
            </mesh> */}
            
        </>
        
    )
}

export default SubwayMap
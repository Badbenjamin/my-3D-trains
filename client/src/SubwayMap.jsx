import { useFrame, extend, useThree } from "@react-three/fiber"
import { useRef } from 'react'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

extend({OrbitControls}) 

function SubwayMap(){

    const {camera, gl} = useThree()
    const cubeRef = useRef()



    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta
    })

    return(
        <>
            <orbitControls args={[camera, gl.domElement]}/>
            <mesh ref={cubeRef} >
                <torusKnotGeometry args={[1, 0.4, 64, 8]} />
                <meshNormalMaterial />
            </mesh>
        </>
        
    )
}

export default SubwayMap
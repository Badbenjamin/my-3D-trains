import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {Perf} from 'r3f-perf'
import {MapControls, Html} from '@react-three/drei'

function Model(){

    const map = useLoader(
        GLTFLoader,
         './subway_map_v3.glb',
        )
    console.log(map)
    return(
        <>
            <Perf position="top-left" />
            <MapControls/>
            <ambientLight intensity={1.5} />
            <primitive object={map.scene}/>
        </>
    )
}

export default Model
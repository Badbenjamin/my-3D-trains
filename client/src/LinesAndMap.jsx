import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {Perf} from 'r3f-perf'
import {MapControls, Html, useGLTF} from '@react-three/drei'

import GLine from "./G_Line"
import G_Line_Procedural from "./G_Line_Procedural"
import Map from "./Map"

function LinesAndMap(){

    // const map = useGLTF('./public/subway_map_v3.glb')
    // console.log(map)
    return(
        <>
            <Perf position="top-left" />
            <MapControls/>
            <ambientLight intensity={1.5} />
            <Map/>
            {/* <GLine/> */}
            <Map/>
            <G_Line_Procedural/>
            {/* <primitive object={map.scene}/> */}
        </>
    )
}

export default LinesAndMap
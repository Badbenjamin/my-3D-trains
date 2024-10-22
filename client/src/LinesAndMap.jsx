import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {Perf} from 'r3f-perf'
import {MapControls, Html, useGLTF, Sky} from '@react-three/drei'

import GLine from "./G_Line"
import Map from "./Map"
// import { G_Line_Stations } from "./old/G_Line_Stations"

function LinesAndMap(){
    
    // const map = useGLTF('./public/subway_map_v3.glb')
    // console.log(map)
    return(
        <>
            {/* <Perf position="top-left" /> */}
            <MapControls/>
            <ambientLight intensity={1.5} />
            <directionalLight position={[1,2,3]} intenstity={1.5}/>
            <Sky/>
            <Map/>
            {/* <G_Line_Stations/> */}
            <GLine />
            {/* <Map/> */}
            {/* <G_Line_Procedural/> */}
            {/* <primitive object={map.scene}/> */}
        </>
    )
}

export default LinesAndMap
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
// import { nodeArray } from 'three/webgpu'

function G_Line_Procedural(){
    
    const map = useGLTF('./public/subway_map_v4.glb')
    // console.log(map.nodes['01_Court_Sq_G'])
    for (const key in map.nodes){
        // console.log(map.nodes[key])
        // console.log(key)
    }
    return(
        <></>
    )
}

export default G_Line_Procedural
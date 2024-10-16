import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
// import { nodeArray } from 'three/webgpu'

function G_Line_Procedural(){

    const map = useGLTF('./public/subway_map_v4.glb')
    Object.keys(map.nodes).forEach(key => {
        console.log(key)
    })
    
    return(
        <></>
    )
}

export default G_Line_Procedural
import React, { useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
// import { nodeArray } from 'three/webgpu'

function G_Line_Procedural(){
    
    const G = useGLTF('./public/subway_map_just_G.glb')
    // console.log(map.nodes['01_Court_Sq_G'])
    // for (const key in map.nodes){
    //     // console.log(map.nodes[key])
    //     console.log(key)
    // }
    return(
        <>
            <primitive object={G.scene}/>
        </>
    )
}

export default G_Line_Procedural
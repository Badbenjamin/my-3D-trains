import React, { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
// import { nodeArray } from 'three/webgpu'

import Station from './Station'

function G_Line_Procedural(){
    const [gLineStationsArray, setGLineStationsArray] = useState([])
    
    const G = useGLTF('./public/subway_map_just_G_stations.glb')
    // console.log(G.nodes['01_Court_Sq_G'])
    // console.log(G)

    const stationRef = useRef()

    const newGLineStationsArray = [...gLineStationsArray]
    for (const mesh in G.nodes){
        // console.log(G.nodes[mesh])
        if (G.nodes[mesh].type === "Mesh"){
            gLineStationsArray.push(<Station ref={stationRef}  props={G.nodes[mesh]} />)
        }
        

    }
    
    useEffect(()=>{
        setGLineStationsArray(newGLineStationsArray)
        // console.log(gLineStationsArray)
        for (const station of gLineStationsArray){
            // console.log(station)
        }
    },[])

    console.log(gLineStationsArray[0])


    // const stationItem = G.nodes.map(node => {
    //     <Station props={props}/>
    // })



    // console.log(G.nodes)
    return(
        <>
            {/* needs to return a scene object */}
            {/* <primitive object={G.scene}/> */}
            {/* <Station/> */}
            
        </>
    )
}

export default G_Line_Procedural
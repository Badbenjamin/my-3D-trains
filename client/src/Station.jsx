import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { Html } from "@react-three/drei"

import './App.css'

function Station( {setStatus, status, nodes, materials, mesh}){

   
        const materialName = Object.keys(materials)
        const stationRef = useRef()

        const [readableName, setReadableName] = useState("")

        // console.log(status['status'])
    
     
        const red = new THREE.MeshBasicMaterial({color:'red'})
        // emmissive?
        const blue = new THREE.MeshBasicMaterial({color:'blue'})
        
        // const newBlue = <meshBasicMaterial color={'blue'} emmisive={'blue'} emmissiveIntesity={4}/>
        const newName = mesh['name']
        const newGeometry = nodes[newName].geometry
        const newMaterial = materials[materialName[0]]
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
        
       
        let color = newMaterial
        // let 
       
        if (status['status']){
            color = blue
        }
     
        useEffect(()=>{
            if (newName.length < 5 ){
                fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
                .then(response => response.json())
                .then(decodedName => {setReadableName(decodedName.name)})
                console.log('fetch')
            }
        }, [])

    return(
        <group>
            <mesh       
                //   onClick={handleClick}   
                  ref={stationRef}
                  name={newName}
                  castShadow={newCastShadow}
                  receiveShadow={newRecieveShadow}
                  geometry={newGeometry}
                  material={color}
                  position={newPosition}
                  rotation={newRotation}
                  scale={newScale}
                  
            />
                {newName.length < 5 ?<Html wrapperClass="station_label" distanceFactor={10} position={newPosition}>{readableName}</Html>: <></>}
        </group>
        
    )
}

export default Station
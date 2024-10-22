import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { Html } from "@react-three/drei"


function Station( {setStatus, status, nodes, materials, mesh}){

   
        const materialName = Object.keys(materials)
        const stationRef = useRef()

        console.log(status['status'])
    
     
        const red = new THREE.MeshBasicMaterial({color:'red'})
        // emmissive?
        const blue = new THREE.MeshBasicMaterial({color:'blue', emmisive: 'purple', emmissiveintesity: 10})
        const newName = mesh['name']
        const newGeometry = nodes[newName].geometry
        const newMaterial = materials[materialName[0]]
        const newCastShadow = mesh['castShadow']
        const newRecieveShadow = mesh['recieveShadow']
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
        
       
        let color = newMaterial
       
        if (status['status']){
            color = blue
        }
     
       

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
                <Html distanceFactor={10} position={newPosition}>{newName}</Html>
        </group>
        
    )
}

export default Station
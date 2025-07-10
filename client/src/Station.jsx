import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"
import { Line } from "@react-three/drei"



import './App.css'
import { useFrame } from "@react-three/fiber"
// import { is } from "@react-three/fiber/dist/declarations/src/core/utils"

function Station( { status, mesh, index}){
        // console.log(status, mesh.name)
        let stationRef = useRef()

        const selectedMaterial = new THREE.MeshStandardMaterial()
        selectedMaterial.color =  new THREE.Color('white')
        
        const newName = mesh.name
        const newGeometry = mesh.geometry
        const newMaterial =  mesh.material;
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = mesh.position
        const newRotation = mesh.rotation
        const newScale = mesh.scale


        const [isWhite, setIsWhite] = useState(false)
        let color = !isWhite ? newMaterial : selectedMaterial

        // animation loop triggered when selecteds
        // useFrame(({clock})=>{
    
        //     let elapsedTime = clock.getElapsedTime()
        //     // console.log(elapsedTime)
        //     if (status['status']){
        //         if (Math.round(currentTime) % 2 == 0){
        //             setIsWhite(true)
        //         } else {
        //             setIsWhite(false)
        //         }
        //     }
           
            
        // })
    if (status["display"]){
        return(
            <group>
                <mesh       
                      ref={stationRef[index]}
                      name={newName}
                      castShadow={newCastShadow}
                      receiveShadow={newRecieveShadow}
                      geometry={newGeometry}
                      material={color}
                      position={newPosition}
                      rotation={newRotation}
                      scale={newScale}
                      
                />
            </group>
        )
    } else {
        return(
            <></>
        )
    }
    
}

export default Station
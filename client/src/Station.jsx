import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"

import './App.css'
import { useFrame } from "@react-three/fiber"
// import { is } from "@react-three/fiber/dist/declarations/src/core/utils"

function Station( { status, materials, mesh, index, getStationCode, id}){

        const [readableName, setReadableName] = useState("")
        const [displayName, setDisplayName] = useState(false)
        let stationRef = useRef()

        const selectedMaterial = new THREE.MeshStandardMaterial()
        selectedMaterial.color =  new THREE.Color('white')

        // const cube = new THREE.BoxGeometry()
        // const cubeMat = newThree.MeshStandardMaterial()
        // cubeMat.color = new THREE.Color('black')
        
        
        const newName = mesh.name
        const newGeometry = mesh.geometry
        const newMaterial =  mesh.material;
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = mesh.position
        const newRotation = mesh.rotation
        const newScale = mesh.scale
       
        // do i need this state or can I just have a variable?
        const [isWhite, setIsWhite] = useState(false)
        let color = !isWhite ? newMaterial : selectedMaterial
        
        useFrame(({clock})=>{
            // setIsWhite(true)
            let a = clock.getElapsedTime()
            if (status['status']){
                if (Math.round(a) % 2 == 0){
                    setIsWhite(true)
                } else {
                    setIsWhite(false)
                }
            }
           
            
        })
     
        // Get Station Names for HTML text
        // useEffect(()=>{
        //     if (newName.length < 5 ){
        //         fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
        //         .then(response => response.json())
        //         .then(decodedName => {setReadableName(decodedName.name + " " + decodedName.daytime_routes), console.log(newName)})
        //         .catch((error)=>{console.log(error, newName)})
        //     }
        // }, [])

        function handleClick(){
            getStationCode(newName)
        }

        

    return(
        <group>
            <mesh       
                  onClick={handleClick}   
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
                {<Html wrapperClass="station_label" distanceFactor={10} position={newPosition}>{readableName}</Html>}
        </group>
    )
}

export default Station
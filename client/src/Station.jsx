import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"

import './App.css'

function Station( { status, nodes, materials, mesh, index}){

        const materialName = Object.keys(materials)
        let stationRef = useRef()

        const [readableName, setReadableName] = useState("")

        const blue = new THREE.MeshBasicMaterial({color:'blue'})
        
        const newName = mesh['name']
        const newGeometry = nodes[newName].geometry
        // CHANGE THIS FOR OTHER LINES!
        const newMaterial =  mesh['name'][0] !== "7" ? materials[materialName[0]] : materials[materialName[2]];
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
       
        let color = newMaterial
     
        if (status['status']){
            color = blue
        }
        if (!status['status']){
            color = newMaterial
        }
     
        // Get Station Names for HTML text
        useEffect(()=>{
            if (newName.length < 5 ){
                fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
                .then(response => response.json())
                .then(decodedName => {setReadableName(decodedName.name + " " + decodedName.daytime_routes)})
                console.log('fetch')
            }
        }, [])

        function handleClick(){
            console.log("click")
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
                {newName.length < 5 ?<Html wrapperClass="station_label" distanceFactor={10} position={newPosition}>{readableName}</Html>: <></>}
        </group>
    )
}

export default Station
import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"

import './App.css'

function Station( { status, materials, mesh, index, getStationCode}){
        // console.log('mesh', mesh)
        // console.log("mat", materials)
        const materialName = Object.keys(materials)
        let stationRef = useRef()

        const [readableName, setReadableName] = useState("")

        const white = new THREE.MeshBasicMaterial({color:'white'})
        
        const newName = mesh['name']
        const newGeometry = mesh.geometry
        // CHANGE THIS FOR OTHER LINES!
        const newMaterial =  mesh['material'];
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
       
        let color = newMaterial

     
        if (status['status']){
            // setInterval(()=>{color = white, 1000})
            color = white
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
            }
        }, [])

        function handleClick(){
            // getStationCode(newName)
            console.log(newName)
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
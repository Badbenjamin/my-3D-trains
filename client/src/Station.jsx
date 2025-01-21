import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"

import './App.css'
import { useFrame } from "@react-three/fiber"
// import { is } from "@react-three/fiber/dist/declarations/src/core/utils"

function Station( { status, materials, mesh, index, getStationCode, id}){
        // console.log('mesh', mesh)
        // console.log("mat", materials)
        // const materialName = Object.keys(materials)
        // console.log(id)
        // let stationRef = useRef()

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
       
        // let color = newMaterial

        const [isWhite, setIsWhite] = useState(false)
        console.log('is white', isWhite)
        let color = !isWhite ? newMaterial : white
        
        // very odd
        // if i update code and save, it works
        // untill then it flips the color but does not change
        useEffect(()=>{
            if (status['status']){
                setInterval(()=>{
                    setIsWhite(!isWhite)
                }, 1000)
                // setIsWhite(isWhite)
            }
            if (!status['status']){
                setIsWhite(false)
            }
        }, [])
     
        // Get Station Names for HTML text
        useEffect(()=>{
            if (newName.length < 5 ){
                fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
                .then(response => response.json())
                .then(decodedName => {setReadableName(decodedName.name + " " + decodedName.daytime_routes)})
            }
        }, [])

        function handleClick(){
            // if (materialColor === white){
            //     setMaterialColor(newMaterial)
            // } else {
            //     setMaterialColor(white)
            // }
            console.log("click")
            setIsWhite(!isWhite)
        }

        

    return(
        <group>
            <mesh       
                //   onClick={handleClick}   
                //   ref={stationRef}
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
import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'
import { Html } from "@react-three/drei"

import './App.css'

function Station( {id, key,setStatus, status, nodes, materials, mesh, index}){

        // console.log(index)
        const materialName = Object.keys(materials)
        let stationRef = useRef()

        const [readableName, setReadableName] = useState("")

        // console.log(status['name'], status['status'], id)
    
     
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
       
        useFrame((state, delta) => {
             
            
        })
        if (status['status']){
            // console.log(newName, "i am true")
            color = blue
        }
        if (!status['status']){
            // console.log(newName, "i am false")
            color = newMaterial
        }
     
        // console.log(color)
        useEffect(()=>{
            if (newName.length < 5 ){
                fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
                .then(response => response.json())
                .then(decodedName => {setReadableName(decodedName.name)})
                console.log('fetch')
            }
        }, [])

        // stationRef = stationRef[index]
        function handleClick(){
            console.log("click")
            // stationRef.current.material.color.set(0.5,0.0,0.0)
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
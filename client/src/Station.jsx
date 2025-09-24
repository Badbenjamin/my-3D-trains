import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"
import { Line } from "@react-three/drei"

import RouteTooltip from "./RouteTooltip"


import './App.css'
import { useFrame } from "@react-three/fiber"

function Station( { tripInProgress, stationInTrip, stationInfo, mesh, index}){
  
    const [geometryDisplay, setGeometryDisplay] = useState(false)
    let stationRef = useRef()

    let selectedMaterial = new THREE.MeshStandardMaterial()
    selectedMaterial.color =  new THREE.Color('white')
    
    const newName = mesh.name
    const newGeometry = mesh.geometry
    let newMaterial =  mesh.material;
    const newCastShadow = true
    const newRecieveShadow = true
    const newPosition = mesh.position
    const newRotation = mesh.rotation
    const newScale = mesh.scale

    useEffect(()=>{
        if (tripInProgress && stationInTrip && stationInfo != null){
            setGeometryDisplay(true)
           } else if (tripInProgress && !stationInTrip && stationInfo === null){
            setGeometryDisplay(false)
           } else if (tripInProgress == false){
            setGeometryDisplay(true)
           }
    }, [])
       


        const [isWhite, setIsWhite] = useState(false)
        let color = !isWhite ? newMaterial : selectedMaterial

        // animation loop triggered when selecteds
        // useFrame(({clock})=>{
    
        // })
    if (geometryDisplay && stationInfo === null){
        return (
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
        // might get rid of this
    }  else if (geometryDisplay && stationInfo != null) {
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
                {/* <RouteTooltip name={newName} position={newPosition} stationInfo={stationInfo}/> */}
            </group>
         )
    }
    
}

export default Station
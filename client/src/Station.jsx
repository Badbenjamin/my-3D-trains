import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"
import { Line } from "@react-three/drei"



import './App.css'
import { useFrame } from "@react-three/fiber"
// import { is } from "@react-three/fiber/dist/declarations/src/core/utils"

function Station( { tripInProgress, stationInTrip, stationTripType, mesh, index}){
        console.log(tripInProgress, stationInTrip, stationTripType)
        // console.log(mesh.material)
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
        if (tripInProgress && stationInTrip && stationTripType === 'included'){
            console.log(newName)
            setGeometryDisplay(true)
            // newMaterial.wireframe = false
           } else if (tripInProgress && !stationInTrip && stationTripType === 'not in trip'){
            // newMaterial.wireframe = true
            // setGeometryDisplay(true)
            setGeometryDisplay(false)
           } else if (tripInProgress == false){
            setGeometryDisplay(true)
           }
    }, [])
       


        const [isWhite, setIsWhite] = useState(false)
        let color = !isWhite ? newMaterial : selectedMaterial

        // animation loop triggered when selecteds
        useFrame(({clock})=>{
    
            // let a = clock.getElapsedTime()
            // if (status['status']){
            //     if (Math.round(a) % 2 == 0){
            //         setIsWhite(true)
            //     } else {
            //         setIsWhite(false)
            //     }
            // }
           
            
        })
    if (geometryDisplay){
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
        
    }  else {
        return(
            <></>
         )
    }
    
}

export default Station
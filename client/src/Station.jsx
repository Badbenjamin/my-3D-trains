import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from 'three'


function Station({status, nodes, materials, mesh}){

    console.log(status['status'])
        // console.log(status)
        const materialName = Object.keys(materials)
        const stationRef = useRef()

        const red = new THREE.MeshBasicMaterial({color:'red'})
        const blue = new THREE.MeshBasicMaterial({color:'blue'})
        const [selected, setSelected] = useState(true)
        const [currentSelectedColor, setCurrentSelectedColor] = useState(materials[materialName[0]])

        
     
        
        const newName = mesh['name']
        const newGeometry = nodes[newName].geometry
        const newMaterial = materials[materialName[0]]
        const newCastShadow = mesh['castShadow']
        const newRecieveShadow = mesh['recieveShadow']
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
        // const newName = mesh['name']

        // selected = true
        let movement = 0
        let stationColor = materials[materialName[0]]
       
        // useFrame((state, delta)=>{
        //     if (status){
        //         movement = delta
        //         // color = {0.5,0.5,0.5}
        //         // stationRef.current.material.color.set(newColor)
        //     }
        //     stationRef.current.rotation.y += movement
        // })

        useEffect(()=>{
            if (status['status']){
                console.log("hi")
                // stationColor = red
                setCurrentSelectedColor(blue)
            }

        },[status])

        
       
        function handleClick(){
            console.log(selected)
            if (selected){
              setSelected(false)
              stationColor = red
              setCurrentSelectedColor(red)
              
          
            } else {
              setSelected(true)
              stationColor = newMaterial
              setCurrentSelectedColor(newMaterial)
            }
            
          
          
          }
       

    return(
        <mesh       
                  onClick={handleClick}   
                  ref={stationRef}
                  name={newName}
                  castShadow={newCastShadow}
                  receiveShadow={newRecieveShadow}
                  geometry={newGeometry}
                  material={currentSelectedColor}
                  position={newPosition}
                  rotation={newRotation}
                  scale={newScale}
                />
    )
}

export default Station
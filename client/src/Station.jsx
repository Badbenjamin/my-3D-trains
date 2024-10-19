import { useRef } from "react"
import { useFrame } from "@react-three/fiber"



function Station({statusArray, index, gClickHandler, status, nodes, materials, mesh}){
        // console.log(onClick)
        
        const materialName = Object.keys(materials)
        // console.log(materialName[0].toString())
        // console.log(refname)
        const stationRef = useRef()
        console.log(status)
        // console.log(index)
        
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
        let newColor = {isColor: true, r: 0.9051738381385803, g: 0, b: 0}
       
        useFrame((state, delta)=>{
            if (status){
                movement = delta
                // color = {0.5,0.5,0.5}
                // stationRef.current.material.color.set(newColor)
            }
            stationRef.current.rotation.y += movement
        })
       
        function handleClick(e){
            // console.log(index)
            // console.log(e.eventObject)
            gClickHandler(index)
        }
       

    return(
        <mesh       
                  onClick={handleClick}   
                  ref={stationRef}
                  name={newName}
                  castShadow={newCastShadow}
                  receiveShadow={newRecieveShadow}
                  geometry={newGeometry}
                  material={newMaterial}
                  position={newPosition}
                  rotation={newRotation}
                  scale={newScale}
                />
    )
}

export default Station
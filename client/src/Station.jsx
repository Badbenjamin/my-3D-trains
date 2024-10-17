import { useRef } from "react"
import { useFrame } from "@react-three/fiber"



function Station({props, nodes, materials, mesh, selected}){

        const materialName = Object.keys(materials)
        // console.log(materialName[0].toString())
        // console.log(refname)
        const stationRef = useRef()
        console.log(selected)
        
        const newName = mesh['name']
        const newGeometry = nodes[newName].geometry
        const newMaterial = materials[materialName[0]]
        const newCastShadow = mesh['castShadow']
        const newRecieveShadow = mesh['recieveShadow']
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
        // const newName = mesh['name']

        selected = true
        let movement = 0
        
       
        useFrame((state, delta)=>{
            if (selected){
                movement = delta
            }
            stationRef.current.rotation.y += movement
        })
       

    return(
        <mesh
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
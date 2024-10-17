
function Station({props, nodes, materials, mesh}){

        const materialName = Object.keys(materials)
        console.log(materialName[0].toString())
        
        const newName = mesh['name']
        const newGeometry = nodes[newName].geometry
        const newMaterial = materials[materialName[0]]
        const newCastShadow = mesh['castShadow']
        const newRecieveShadow = mesh['recieveShadow']
        const newPosition = mesh['position']
        const newRotation = mesh['rotation']
        const newScale = mesh['scale']
        // const newName = mesh['name']

    return(
        <mesh
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
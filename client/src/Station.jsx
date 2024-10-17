
function Station(props){

    console.log(props)
    return(
        <mesh
                  ref={stationRef}
                  name="01_Court_Sq_G"
                  castShadow
                  receiveShadow
                  geometry={nodes['01_Court_Sq_G'].geometry}
                  material={materials['Station_G.001']}
                  position={[5.799, 0.034, 10.29]}
                  rotation={[0, 0.401, 0]}
                  scale={0.2}
                />
    )
}
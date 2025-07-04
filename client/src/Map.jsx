import { useGLTF } from '@react-three/drei'

function Map(){
    const map = useGLTF('./public/subway_map_MAP_ONLY_5.24.glb')


    return(
        <>
            <primitive 
            castShadow={true}
            receiveShadow={true}
            object={map.scene}
            />
        </>     
    )
}

export default Map
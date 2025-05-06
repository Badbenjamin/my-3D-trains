import { useGLTF } from '@react-three/drei'

function Map(){
    const map = useGLTF('./public/subway_map_JUST_MAP_1.glb')


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
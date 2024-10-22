import { useGLTF } from '@react-three/drei'

function Map(){
    const map = useGLTF('./public/subway_map_just_map.glb')


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
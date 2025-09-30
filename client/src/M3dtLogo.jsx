import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function M3dtLogo(props) {
  const { nodes, materials } = useGLTF('/M3DT_LOGO_V2_9.24.glb')


  return (
    <>
        <pointLight intensity={40} color={'red'} position={[-1,0,5]} />
        <pointLight intensity={40} color={'blue'} position={[0,0,5]} />
        <pointLight intensity={40} color={'green'} position={[1,0,5]} />
        <group {...props} dispose={null}
        // rotation={[90, 90, 90]}
        position={[-3,-.2,2.2]}
        rotation-x={ 1.5}
        >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.M.geometry}
        material={materials.LOGO_WHITE}
        position={[-0.532, -0.004, -0.652]}
        rotation={[-Math.PI, 0, -Math.PI]}
        scale={-1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['3'].geometry}
        material={materials.LOGO_WHITE}
        position={[2.566, -0.004, -0.39]}
        rotation={[0, 1.511, 0]}
        scale={[-0.771, -0.72, -0.755]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.D.geometry}
        material={materials.LOGO_WHITE}
        position={[4.664, 0, -0.409]}
        scale={[1.009, 0.975, 1.083]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T.geometry}
        material={materials.LOGO_WHITE}
        position={[7.155, 0, -1.109]}
        rotation={[-Math.PI, 0, -Math.PI]}
        scale={[-1.163, -1, -1.115]}
      />
    </group>
    </>

  )
}

useGLTF.preload('/M3DT_LOGO_V2_9.24.glb')
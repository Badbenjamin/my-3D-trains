import React from 'react'
import {useRef} from 'react'
import { Sphere, useGLTF} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function M3dtLogo(props) {

    const { nodes, materials } = useGLTF('/M3DT_LOGO_V2_9.24.glb')
    
    const redLightRef = useRef()
    const blueLightRef = useRef()
    const greenLightRef2 = useRef()

    const orbitRadius = 10;

    useFrame((state, delta) =>
        {
            const angle = state.clock.elapsedTime
            state.camera.position.x = Math.sin(angle) /5
            state.camera.position.y = Math.cos(angle) /5
            state.camera.lookAt(0, 0, 0)

            redLightRef.current.position.x = Math.sin(angle) * orbitRadius 
            redLightRef.current.position.y = Math.cos(angle) * orbitRadius 

            blueLightRef.current.position.z = Math.sin(angle) * orbitRadius
            blueLightRef.current.position.x = Math.cos(angle) * orbitRadius

            greenLightRef2.current.intensity = Math.sin(angle) + 50
  
        })

  return (
    <>
        <pointLight ref={redLightRef} intensity={70} color={'red'} position={[-1,0,9]} />
        <pointLight ref={blueLightRef} intensity={60} color={'blue'} position={[0,0,5]} />
        <pointLight ref={greenLightRef2} intensity={20} color={'green'} position={[1,0,5]} />
   
        <group {...props} dispose={null}
        // rotation={[90, 90, 90]}
        position={[-3,-.2,2.2]}
        rotation-x={ 1.55}
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
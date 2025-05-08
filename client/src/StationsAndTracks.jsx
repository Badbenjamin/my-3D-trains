
import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'


export default function StationsAndTracks({vectorPosition}) {
    // console.log('v3',vector3)
    const {stationArray} = useOutletContext()

   

    useFrame((state, delta) => {
      console.log('vecpos', vectorPosition)
  })
  

  if (stationArray == []){
    return(
        <>loading</>
    )
  }

  return (
    <group  dispose={null}>
        {stationArray}
    </group>
  )
}



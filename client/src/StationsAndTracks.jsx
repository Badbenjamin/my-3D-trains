
import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { Html } from "@react-three/drei"
import { useState } from 'react'


export default function StationsAndTracks({vectorPosition}) {
    // console.log('v3',vector3)
    const {stationArray} = useOutletContext()
    const [meshPosition, setMeshPostion] = useState([])
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtml, setStationHtml] = useState([])

useEffect(()=>{
      fetch(`http://127.0.0.1:5555/api/stations`)
      .then(response => response.json())
      .then(stationInfoObjectArray => {setStationInfoObjectArray(stationInfoObjectArray)})
},[])
  console.log('sioa',stationInfoObjectArray)

useEffect(()=>{
  
  if (stationInfoObjectArray && stationArray){
    // console.log('i work')
    // for (let i = 0; i < stationArray.length ; i++){
    //   let meshName = stationArray[i].props.mesh.name
    //   for (let j = 0; j < stationInfoObjectArray.length; j++){
    //     let stationName = stationInfoObjectArray[j].gtfs_stop_id
    //     console.log(stationName)
    //   }
    // }
    let stationInfoObject = {}
    for (let i = 0 ; i < stationInfoObjectArray.length; i++){
      stationInfoObject = {...stationInfoObject, [stationInfoObjectArray[i].gtfs_stop_id] : stationInfoObjectArray[i]}
    }
    console.log('sio2', stationInfoObject)

    let newHtmlArray = []
    for (let j = 0 ; j < stationArray.length; j++){
      
      if (stationArray[j].props.name.length < 5){
        if( stationArray[j].props.name in stationInfoObject){
          let newPosition = stationArray[j].props.mesh.position
          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          let newHtml = <Html  wrapperClass="station_label" distanceFactor={5} center={true} position={newPosition}>{newInfoObject.name+ " " + newInfoObject.daytime_routes}</Html>
          newHtmlArray.push(newHtml)
        }
      }
    }
    setStationHtml(newHtmlArray)
  }
},[stationInfoObjectArray])


let origin= {"x": 0, "y": 0, "z": 0}

function findDistance(point1, point2){
  let x1 = point1["x"]
  let y1 = point1['y']
  let z1 = point1['z']

  let x2 = point2['x']
  let y2 = point2['y']
  let z2 = point2['z']

  let result = Math.sqrt(((x2-x1)**2) + ((y2-y1)**2) + ((z2-z1)**2))
  return result
}

let p1 = {"x": 1, "y": 1, "z": 1}

// console.log('dist',findDistance(origin, p1))

// POSITION OF CAMERA
    useFrame((state, delta) => {
      // console.log('vecpos', vectorPosition)
      console.log('dist',findDistance(origin, vectorPosition))


  })

// console.log('ht', stationHtml)
  

  if (stationArray == []){
    return(
        <>loading</>
    )
  } else if (stationArray && !stationHtml){
    return (
      <group  dispose={null}>
          {stationArray}
      </group>
    )
  }else if (stationArray && stationHtml){
    return (
      <group  dispose={null}>
          {stationArray}
          {stationHtml}
      </group>
    )
  }

  
  
  
}



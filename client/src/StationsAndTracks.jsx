
import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
// import { Html } from "@react-three/drei"
import { useState } from 'react'


import StationText from './StationText'


export default function StationsAndTracks({vectorPosition}) {
    // console.log('v3',vector3)
    const {stationArray} = useOutletContext()
    // const [meshPosition, setMeshPostion] = useState([])
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    // const [positionArray, setPositionArray] = useState([])
    // const [cameraPosition, setCameraPosition] = useState({})
    // const [cameraDistance, setCameraDistance] = useState(0)
    const [cameraPosition, setCameraPosition] = useState({"x": 0, "y" : 0, "z" : 0})

let now = new Date()
let halfSec = Math.round(now.getTime()/1000)
// console.log(Math.floor(now.getTime()/10))
// console.log(halfSec)

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

useEffect(()=>{
      fetch(`http://127.0.0.1:5555/api/stations`)
      .then(response => response.json())
      .then(stationInfoObjectArray => {setStationInfoObjectArray(stationInfoObjectArray)})
},[])
  // console.log('sioa',stationInfoObjectArray)

  // COMBINE station info from DB with location info from map model
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
    // console.log('sio2', stationInfoObject)

    let newHtmlArray = []
    let newPositionArray =[]
    for (let j = 0 ; j < stationArray.length; j++){
      
      if (stationArray[j].props.name.length < 5){
        if( stationArray[j].props.name in stationInfoObject){
          let status = false
          let newPosition = stationArray[j].props.mesh.position
          // console.log(newPosition)
          // let distance = findDistance(newPosition, cameraPosition)
          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // let newHtml = <Html key={stationArray[j].props.name}  wrapperClass="station_label" distanceFactor={5} center={true} position={newPosition}>{newInfoObject.name+ " " + newInfoObject.daytime_routes}</Html>
          // VERSION???
          let newStationText = <StationText wrapperClass="station_label"  index={j} status={status} key={stationArray[j].props.name}  distanceFactor={5} center={true} position={newPosition} text={newInfoObject.name+ " " + newInfoObject.daytime_routes} />
          newHtmlArray.push(newStationText)
          // newPositionArray.push(newPosition)
        }
      }
    }
    setStationHtmlArray(newHtmlArray)
    // setPositionArray(newPositionArray)
  }
},[stationInfoObjectArray])


// console.log('shtml', stationHtmlArray)
// let origin= {"x": 0, "y": 0, "z": 0}



// let p1 = {"x": 1, "y": 1, "z": 1}



// POSITION OF CAMERA
    useFrame((state, delta) => {
      // console.log('vecpos', vectorPosition)
      // console.log('dist',findDistance(origin, vectorPosition))
      // USE ROUNDING TO ONLY CHANGE AT CERTAIN INTERVALS?
      // console.log('vp',vectorPosition)
      // let newCameraPosition = {...cameraPosition}
      // newCameraPosition = vectorPosition
      // setCameraPosition(newCameraPosition)
      // console.log('cploop',cameraPosition)

      // let newCameraDistance = Math.round(findDistance(p1, vectorPosition) * 100) / 100
      // setCameraDistance(newCameraDistance)
      
      // console.log('vp', vectorPosition.x)
      // console.log('delt', delta)
      // console.log(Date.now)
      // console.log(halfSec)
      let newCameraPosition = {...cameraPosition}
      newCameraPosition.x = Math.round(vectorPosition.x) 
      newCameraPosition.y = Math.round(vectorPosition.y) 
      newCameraPosition.z = Math.round(vectorPosition.z)  

      // only update with a real change in position!
      // console.log(cameraPosition, newCameraPosition)
      // console.log(cameraPosition !== newCameraPosition)
      if (newCameraPosition.x !== cameraPosition.x || newCameraPosition.y !== cameraPosition.y || newCameraPosition.z !== cameraPosition.z){
        setCameraPosition(newCameraPosition)
      }
      // setCameraPosition(
      //   cameraPosition["x"] = vectorPosition["x"],
      //   cameraPosition["y"]= vectorPosition["y"],
      //   cameraPosition["z"] = vectorPosition["z"]
      // )


  })
console.log('cp',cameraPosition)

// console.log(halfSec)
// necessary?

useEffect(()=>{
  // let count = 0
  // console.log('change')
  // let newStationHtml = stationHtmlArray.map((station)=>{
  //   console.log(station)
  // })
  console.log(halfSec)
  if (true){
    // console.log('change')
    let newStationHtml = [...stationHtmlArray]
    newStationHtml = stationHtmlArray.map((stationText)=>{
      if (findDistance(stationText.props.position, cameraPosition) < 17){
        // return <StationText status={true} />
        let status = true
        let newStationText = <StationText wrapperClass="station_label"  index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={5} center={true} position={stationText.props.position} text={stationText.props.text} />
        return newStationText
      } else {
        let status = false
        let newStationText = <StationText wrapperClass="station_label"  index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={5} center={true} position={stationText.props.position} text={stationText.props.text} />
        return newStationText
      }
    })
    setStationHtmlArray(newStationHtml)
  }
  // console.log('change')
  // console.log(vectorPosition)
  // HOW DO I UPDATE THE ITEMS IN THE ARRAY TO SEND CAMERA DISTANCE TO THEM?
  // let newStationHtmlArray = []
  // for (let i = 0; i < stationHtmlArray.length; i++){
  //   let newStationText = <StationText cameraPosition={cameraPosition}  />
  //   newStationHtmlArray.push(newStationText)
  // }
  // setStationHtmlArray(newStationHtmlArray)

  // let newPositionArray = positionArray.map((position)=>{
  //   return
  // })
  // console.log('pa', positionArray)
  // let newStationHtmlArray = stationHtmlArray.map((station)=>{
  //   console.log(station.props.distance)
  // })


}, [cameraPosition])
  

  if (stationArray == []){
    return(
        <>loading</>
    )
  } else if (stationArray && !stationHtmlArray){
    return (
      <group  dispose={null}>
          {stationArray}
      </group>
    )
  }else if (stationArray && stationHtmlArray){
    return (
      <group  dispose={null}>
          {stationArray}
          {stationHtmlArray}
      </group>
    )
  }

  
  
  
}




import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from "three"
// import { Html } from "@react-three/drei"
// import { Line } from "@react-three/drei"
// import { Line } from '@react-three/drei'


import StationText from './StationText'
import ComplexText from './ComplexText'
import StationToolTip from './StationTooltip'



export default function StationsTracksAndText({vectorPosition}) {
    const {stationArray} = useOutletContext()
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    const [complexHtmlArray, setComplexHtmlArray] = useState([])
    const [toolTipArray, setToolTipArray] = useState([].slice(0,2))
    // const [lineArray, setLineArray] = useState([])
    const [cameraPosition, setCameraPosition] = useState({"x": 0, "y" : 0, "z" : 0})




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

// 
useEffect(()=>{
      fetch(`http://127.0.0.1:5555/api/stations`)
      .then(response => response.json())
      .then(stationInfoObjectArray => {setStationInfoObjectArray(stationInfoObjectArray)})
},[])
  // console.log('sioa',stationInfoObjectArray)

// THIS SHOULD BRING UP TOOLTIP
function handleStationClick(stopId, name, position, daytime_routes){
  // console.log(iconImageArray)
  let newTooltip = <StationToolTip key={name} stopId={stopId} position={position} name={name} daytime_routes={daytime_routes}/>

  
  setToolTipArray(prev => {
    const updated = [newTooltip, ...prev]
    return updated.slice(0,2)
  })


}
// console.log('tta', toolTipArray)
function handleComplexClick(complexId){
  console.log(complexId)
}

  // COMBINE station info from DB with location info from map model to display HTML text on map
useEffect(()=>{
  
  if (stationInfoObjectArray && stationArray){

    // This is the station information returned from the call to the backend
    // an object is created with gtfs Id as the key, and info from the DB as the value
    let stationInfoObject = {}
    for (let i = 0 ; i < stationInfoObjectArray.length; i++){
      stationInfoObject = {...stationInfoObject, [stationInfoObjectArray[i].gtfs_stop_id] : stationInfoObjectArray[i]}
    }
   
    // stationArray is the array of meshes from the blender model, containing position
    // stationHtmlArray will contain <StationText/> elements that will display info above each station
    // we are combining the position of the mesh from the blender model with the information for the station from the backend
    let newStationHtmlArray = []
    // this might not be needed
    let newComplexHtmlArray = []
    let newTooltipArray = []
    let complexObject = {}
    let count = 0
    // loop through meshes 
    // maybe this is the issue?
    for (let j = 0 ; j < stationArray.length; j++){
   
      if (stationArray[j].props.name.length < 5){
        // if name is in stationInfoObject as key, and is not a complex, create <StationText> and push to stationHtmlArray
        if( stationArray[j].props.name in stationInfoObject && !stationInfoObject[stationArray[j].props.name].complex){
          let status = false
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
        
          // VERSION???
          let newStationText = <StationText handleStationClick={handleStationClick} wrapperClass="station_label"  index={j} status={status} key={stationArray[j].props.name}  distanceFactor={8} center={true} position={newPosition} name={newInfoObject.name} daytime_routes={newInfoObject.daytime_routes} gtfs_stop_id={newInfoObject.gtfs_stop_id} alphaLevel={1}/>
          newStationHtmlArray.push(newStationText)

          // if complex = True, create key in complexObject from complex_id and add values to key
          // I WANT TO CREATE NEW KEY VALUE PAIRS WHEN NOT IN DICT, BUT ADD TO VALUES WHEN KEY IS IN DICT
        } else if ( stationArray[j].props.name in stationInfoObject && stationInfoObject[stationArray[j].props.name].complex){
    
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
     
          if (Object.keys(complexObject).length === 0 || !(complexObject.hasOwnProperty(newInfoObject.complex_id))){
 
            
            complexObject[newInfoObject.complex_id] = {
                "complex_id" : newInfoObject.complex_id,
                "daytime_routes" : newInfoObject.daytime_routes.split(" "),
                "gtfs_stop_ids" : [newInfoObject.gtfs_stop_id],
                "positions" : [newPosition],
                "stop_names" : [newInfoObject.name],
                // "count" : count
            } 
          } else {

            let routes = complexObject[newInfoObject.complex_id]['daytime_routes']
            let newRoutes = newInfoObject.daytime_routes.split(" ")
            let concatRoutes = routes.concat(newRoutes)
            complexObject[newInfoObject.complex_id]['daytime_routes'] = concatRoutes

            let stopIds = complexObject[newInfoObject.complex_id]['gtfs_stop_ids']
            let newStopId = newInfoObject.gtfs_stop_id
            stopIds.push(newStopId)

            let positions = complexObject[newInfoObject.complex_id]['positions']
            let nextNewPosition = newPosition
            positions.push(nextNewPosition)
           
            let stopNames = complexObject[newInfoObject.complex_id]['stop_names']
            let newStopName = newInfoObject.name
            stopNames.push(newStopName)
          }
          
      
        }
      }
    }
    // console.log(complexObject)
    let i = 0
    for (let complex in complexObject){
      let status = true
      i += 1
      
      // let complexPositionsArray = complexObject[complex].positions

      function avereragePosition(positionsArray){
        let xTotal = 0
        let yTotal= 0
        let zTotal = 0
        for (let pos of positionsArray){
            xTotal += pos.x
            yTotal += pos.y
            zTotal += pos.z
        }
        // console.log(xArray,yArray,zArray)
        let xAv = xTotal/positionsArray.length
        let yAv = yTotal/positionsArray.length
        let zAv = zTotal/positionsArray.length
        // console.log(xAv)
        return new THREE.Vector3(xAv, yAv, zAv)
      }
      let averagePosition = avereragePosition(complexObject[complex].positions)
      // console.log('cid', complexObject[complex].complex_id)
      let newComplexText = <ComplexText handleComplexClick={handleComplexClick} complexId={complexObject[complex].complex_id} wrapperClass="station_label"  index={i} status={status} key={complexObject[complex].complex_id}  distanceFactor={8} center={true} routes={complexObject[complex].daytime_routes} averagePosition={averagePosition} names={complexObject[complex].stop_names} alphaLevel={0} />
      newComplexHtmlArray.push(newComplexText)
    }
    setStationHtmlArray(newStationHtmlArray)
    setComplexHtmlArray(newComplexHtmlArray)
  }
},[stationInfoObjectArray])


// POSITION OF CAMERA
    useFrame((state, delta) => {

      let newCameraPosition = {...cameraPosition}
      newCameraPosition.x = Math.round(vectorPosition.x) 
      newCameraPosition.y = Math.round(vectorPosition.y) 
      newCameraPosition.z = Math.round(vectorPosition.z)  

      if (newCameraPosition.x !== cameraPosition.x || newCameraPosition.y !== cameraPosition.y || newCameraPosition.z !== cameraPosition.z){
        setCameraPosition(newCameraPosition)
      }
  })

// check camera distance to fade in/out station html text
useEffect(()=>{

  let newStationHtmlArray = [...stationHtmlArray]
  let updatedStationHtml = newStationHtmlArray.map((stationText)=>{
    if (findDistance(stationText.props.position, cameraPosition) <= 20){
      let distance = findDistance(stationText.props.position, cameraPosition)
      
      let alphaLevel = 0
      if (distance <= 20 && distance >= 15){
        alphaLevel = Math.abs((distance - 20) / (20 - 15))
      } else {
        alphaLevel = 1
      }
     
      let status = true
      let newStationText = <StationText handleStationClick={handleStationClick} wrapperClass="station_label"  index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={8} center={true} position={stationText.props.position} name={stationText.props.name} daytime_routes={stationText.props.daytime_routes} gtfs_stop_id={stationText.props.gtfs_stop_id} alphaLevel={alphaLevel} />
      return newStationText
    } else {
      let status = false
      let newStationText = <StationText handleStationClick={handleStationClick} wrapperClass="station_label"  index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={8} center={true} position={stationText.props.position} name={stationText.props.name} daytime_routes={stationText.props.daytime_routes} gtfs_stop_id={stationText.props.gtfs_stop_id} alphaLevel={1} />
      return newStationText
    }
  })
  setStationHtmlArray(updatedStationHtml)
  
  let newComplexHtmlArray = [...complexHtmlArray]
  let updatedComplexHtmlArray = newComplexHtmlArray.map((complexText, i)=>{
  //  console.log(complexText.props)
    if (findDistance(complexText.props.averagePosition, cameraPosition) <= 40){
      let distance = findDistance(complexText.props.averagePosition, cameraPosition)
      let alphaLevel = 0
      if (distance <= 40 && distance >= 30){
        
        alphaLevel = Math.abs((distance - 40) / (40-30))
      } else {
        alphaLevel = 1
      }
      let status = true
      let newComplexText = <ComplexText handleComplexClick={handleComplexClick} wrapperClass="station_label" complexId={complexText.props.complexId.toString()} index={i} status={status} key={complexText.props.complex_id}  distanceFactor={8} center={true} routes={complexText.props.routes} averagePosition={complexText.props.averagePosition} names={complexText.props.names} alphaLevel={alphaLevel} />
      return newComplexText
    } else {
      let status = false
      let newComplexText = <ComplexText handleComplexClick={handleComplexClick} wrapperClass="station_label" complexId={complexText.props.complexId.toString()} index={i} status={status} key={complexText.props.complex_id}  distanceFactor={8} center={true} routes={complexText.props.routes} averagePosition={complexText.props.averagePosition} names={complexText.props.names} alphaLevel={1} />
      return newComplexText
    }
  })
  setComplexHtmlArray(updatedComplexHtmlArray)

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
  }else if (stationArray && stationHtmlArray && complexHtmlArray){
    return (
      <group  dispose={null}>
          {stationArray}
          {stationHtmlArray}
          {complexHtmlArray}
          {toolTipArray}
          {/* {lineArray} */}
      </group>
    )
  }

  
  
  
}



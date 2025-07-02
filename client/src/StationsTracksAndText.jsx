
import React, { useEffect, cloneElement} from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from "three"
// import { useOutletContext } from "react-router-dom";
// import { Html } from "@react-three/drei"
// import { Line } from "@react-three/drei"
// import { Line } from '@react-three/drei'


import StationText from './StationText'
import ComplexText from './ComplexText'
import StationToolTip from './StationTooltip'
import ComplexTooltip from './ComplexTooltip'

import { findDistance } from './ModularFunctions'


export default function StationsTracksAndText({vectorPosition}) {
    const {stationArray, retrieveStationId} = useOutletContext()
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    const [complexHtmlArray, setComplexHtmlArray] = useState([])
    const [toolTipArray, setToolTipArray] = useState([].slice(0,2))
    // STILL HAVING KEY PROBLEMS WITH COMPLEXTEXT AND STATIONTEXT
    const [versionForKey, setVersionForKey] = useState(0)
  
    const [cameraPosition, setCameraPosition] = useState({"x": 0, "y" : 0, "z" : 0})
 
// function findDistance(point1, point2){
//     let x1 = point1["x"]
//     let y1 = point1['y']
//     let z1 = point1['z']
  
//     let x2 = point2['x']
//     let y2 = point2['y']
//     let z2 = point2['z']
  
//     let result = Math.sqrt(((x2-x1)**2) + ((y2-y1)**2) + ((z2-z1)**2))
//     return result
//   }

// Fetch to get data for stations, array of objects with info
useEffect(()=>{
      fetch(`http://127.0.0.1:5555/api/stations`)
      .then(response => response.json())
      .then(stationInfoObjectArray => {setStationInfoObjectArray(stationInfoObjectArray)})
},[])

// CREATE STATION TOOLTIP IF IT DOESN'T ALREADY EXIST
function handleStationClick(stopId, name, position, daytime_routes){

  let newStationTooltip = <StationToolTip key={name + versionForKey} clearTooltip={clearTooltip} retrieveStationId={retrieveStationId} stopId={stopId} position={position} name={name} daytime_routes={daytime_routes}/>;
  setVersionForKey(versionForKey + 1);

  setToolTipArray(prevTooltipArray => {
    let alreadyInArray = false
    prevTooltipArray.map((tooltip)=>{
        if (tooltip.props.stopId == stopId){
          alreadyInArray = true
        } 
      })

    if (alreadyInArray) {
      return [...prevTooltipArray]
    } else {
      const updatedTooltipArray = [newStationTooltip, ...prevTooltipArray]
      return updatedTooltipArray.slice(0,2)
    }
  });
}

// CREATE COMPLEX TOOLTIP IF ITS NOT ALREADY IN TTARRAY
function handleComplexClick(complexStationRouteIdObjs, averagePosition, complexId){

  let newComplexTooltip = <ComplexTooltip key={complexId + versionForKey} clearTooltip={clearTooltip} retrieveStationId={retrieveStationId} complexId={complexId} complexStationRouteIdObjs={complexStationRouteIdObjs} averagePosition={averagePosition}/>
  setVersionForKey(versionForKey + 1)

  setToolTipArray(prevTooltipArray => {
    let alreadyInArray = false
    prevTooltipArray.map((tooltip)=>{
        if (tooltip.props.complexId == complexId){
          alreadyInArray = true
        } 
      })

    if (alreadyInArray) {
      return [...prevTooltipArray]
    } else {
      const updatedTooltipArray = [newComplexTooltip, ...prevTooltipArray]
      return updatedTooltipArray.slice(0,2)
    }
  })
}

// REMOVE TOOLTIP WITH X CLICK (only return tts that don't match the id provided by button click)
function clearTooltip(id, type){
  if (type === "stopId"){
    setToolTipArray(prevArray => {
      console.log('id2', id)
      return prevArray.filter((tooltip)=>{
        if (tooltip.props.stopId != id){
          return tooltip
        }
      })
    })
  } else if (type === "complexId"){
    console.log('complexid')
    setToolTipArray(prevArray => {
      return prevArray.filter((tooltip)=>{
        if (tooltip.props.complexId != id){
          return tooltip
        }
      })
    })
  }
  
}

  // COMBINE station info from DB with location info from map model to display HTML text on map
  // THINK ABOUT HOW TO GET SMALL TEXT WHEN STATIONS ARE CLOSE!!!
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
    // let newTooltipArray = []
    let complexObject = {}
    // let localVersionForKey = versionForKey
    
      
    // loop through meshes to get position, combine with info from fetch
    for (let j = 0 ; j < stationArray.length; j++){
      // filter out track names for now
      if (stationArray[j].props.name.length < 5){
        // if name is in stationInfoObject as key, and is not a complex, create <StationText> and push to stationHtmlArray
        if( stationArray[j].props.name in stationInfoObject && !stationInfoObject[stationArray[j].props.name].complex){
          let status = false
          let newPosition = stationArray[j].props.mesh.position
          // console.log('st pos', newPosition)
          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // default size for text and route icons
          let size = 40
          // VERSION???
          
          // loop through positions and find dist to closest other station
          let distToClosestStation = null
          stationArray.map((otherStation)=>{
            if ((otherStation.props.name.length < 5) && (otherStation.props.name != stationArray[j].props.name)){
              
              let distance = findDistance(otherStation.props.mesh.position, newPosition)
              if (distToClosestStation == null){
                distToClosestStation = distance
              } else if (distance < distToClosestStation){
                distToClosestStation = distance
              }
            }
          })
          // set size of text and icons for station text
          if (distToClosestStation < 0.6 && distToClosestStation > 0.3){
            size = 30
          } else if (distToClosestStation < 0.3){
            size = 15
          } 

          let newStationText = <StationText handleStationClick={handleStationClick} size={size}  wrapperClass="station_label"  index={j} status={status} key={stationArray[j].props.name}  distanceFactor={8} center={true} position={newPosition} name={newInfoObject.name} daytime_routes={newInfoObject.daytime_routes} gtfs_stop_id={newInfoObject.gtfs_stop_id} alphaLevel={1}/>
          newStationHtmlArray.push(newStationText)

          // if complex = True, create key in complexObject from complex_id and add values to key
          // need to make array of daytime routes, to send to tooltip when clicked
        } else if ( stationArray[j].props.name in stationInfoObject && stationInfoObject[stationArray[j].props.name].complex){
    
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
     
          if (Object.keys(complexObject).length === 0 || !(complexObject.hasOwnProperty(newInfoObject.complex_id))){
 
            
            complexObject[newInfoObject.complex_id] = {
                "complex_id" : newInfoObject.complex_id,
                // "daytime_routes" : newInfoObject.daytime_routes.split(" "),
                "daytime_routes" : [[newInfoObject.daytime_routes]],
                "gtfs_stop_ids" : [newInfoObject.gtfs_stop_id],
                "positions" : [newPosition],
                "stop_names" : [newInfoObject.name],
                "name_route_combo_obj_array" : [{
                  "name" : newInfoObject.name,
                  "routes" : newInfoObject.daytime_routes,
                  "gtfs_stop_id" :newInfoObject.gtfs_stop_id
                }]
                // "count" : count
            } 
          } else {
            complexObject[newInfoObject.complex_id]['daytime_routes'].push([newInfoObject.daytime_routes])

            // name route combos, might only need this after all
            complexObject[newInfoObject.complex_id]['name_route_combo_obj_array'].push({
                  "name" : newInfoObject.name,
                  "routes" : newInfoObject.daytime_routes,
                  "gtfs_stop_id" :newInfoObject.gtfs_stop_id
            })

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
    

    let i = 0
    for (let complex in complexObject){
      let status = true
      i += 1

      function avereragePosition(positionsArray){
        let xTotal = 0
        let yTotal= 0
        let zTotal = 0
        for (let pos of positionsArray){
            xTotal += pos.x
            yTotal += pos.y
            zTotal += pos.z
        }
        let xAv = xTotal/positionsArray.length
        let yAv = yTotal/positionsArray.length
        let zAv = zTotal/positionsArray.length
        return new THREE.Vector3(xAv, yAv, zAv)
      }
      let averagePosition = avereragePosition(complexObject[complex].positions)
      
      // where should I put the compare positions function loop to get all stations and average complex positions? Average position is calculated independently of mesh positons like the previous station text size function. 
     
      // console.log(complexKey)

      
      // let distToClosestStationComplex = null
      // stationArray.map((otherStation)=>{
      //   if ((otherStation.props.name.length < 5) && (otherStation.props.name != stationArray[j].props.name)){
          
      //     let distance = findDistance(otherStation.props.mesh.position, newPosition)
      //     if (distToClosestStation == null){
      //       distToClosestStation = distance
      //     } else if (distance < distToClosestStation){
      //       distToClosestStation = distance
      //     }
      //   }
      // })
      // // set size of text and icons for station text
      // if (distToClosestStation < 0.6){
      //   size = 20
      // } else if (distToClosestStation < 0.3){
      //   size = 15
      // } 
      let newComplexText = <ComplexText key={complexObject[complex].complexId} handleComplexClick={handleComplexClick} size={40} complexStationRouteIdObjs={complexObject[complex].name_route_combo_obj_array} complexId={complexObject[complex].complex_id} wrapperClass="station_label"  index={i} status={status} distanceFactor={8} center={true} routes={complexObject[complex].daytime_routes} averagePosition={averagePosition} names={complexObject[complex].stop_names} alphaLevel={0} />
   
      newComplexHtmlArray.push(newComplexText)

      // COMPARE POSITIONS AND RESIZE IF OVERLAPPING
      // let complexAndStationArray = newStationHtmlArray.concat(newComplexHtmlArray)
      // let distanceToClosestStationComplex = null
      // complexAndStationArray.map((complexOrStation)=>{
        
      //   if (complexOrStation.props.complexId){
      //     console.log(complexOrStation.props.complexId)
      //   }
      // })

    }
    // resize complexText here
    let stationHtmlAndComplexHtmlArray = newStationHtmlArray.concat(newComplexHtmlArray)
    let newComplexHtmlArrayWithSize = newComplexHtmlArray.map((currentComplex)=>{
      let distToClosestStationComplex = null
      stationHtmlAndComplexHtmlArray.map((complexOrStation)=>{
        // console.log(complexOrStation.props)
        if (complexOrStation.props.averagePosition && (complexOrStation.props.complexId != currentComplex.props.complexId)){
          let distance = findDistance(complexOrStation.props.averagePosition, currentComplex.props.averagePosition)
          if (distToClosestStationComplex == null){
            distToClosestStationComplex = distance
          } else if (distance < distToClosestStationComplex) {
            distToClosestStationComplex = distance
          }
        } else if (complexOrStation.props.position){
          let distance = findDistance(complexOrStation.props.position, currentComplex.props.averagePosition)
          if (distToClosestStationComplex == null){
            distToClosestStationComplex = distance
          } else if (distance < distToClosestStationComplex) {
            distToClosestStationComplex = distance
          }
        }
      })
      console.log(currentComplex.props.size)

      // LEFT OFF HERE, MAYBE JUST MAKE NEW COMPONENT? CLONE IS ANNOYING
      if (distToClosestStationComplex < 1 && distToClosestStationComplex > 0.6){
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 30})
        // newComplexHtmlComponent.props.size = 20
        return newComplexHtmlComponent
      } else if (distToClosestStationComplex < 0.6){
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 20})
        // newComplexHtmlComponent.props.size = 15
        return newComplexHtmlComponent
      } else {
        return currentComplex
      }
    })
    setStationHtmlArray(newStationHtmlArray)
    setComplexHtmlArray(newComplexHtmlArrayWithSize)
    // setVersionForKey(localVersionForKey)
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
      let newStationText = <StationText handleStationClick={handleStationClick} wrapperClass="station_label" size={stationText.props.size} index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={8} center={true} position={stationText.props.position} name={stationText.props.name} daytime_routes={stationText.props.daytime_routes} gtfs_stop_id={stationText.props.gtfs_stop_id} alphaLevel={alphaLevel} />
      return newStationText
    } else {
      let status = false
      let newStationText = <StationText handleStationClick={handleStationClick} wrapperClass="station_label" size={stationText.props.size} index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={8} center={true} position={stationText.props.position} name={stationText.props.name} daytime_routes={stationText.props.daytime_routes} gtfs_stop_id={stationText.props.gtfs_stop_id} alphaLevel={1} />
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
      // issue with complex station routes and ids array
      let status = true
      let newComplexText = <ComplexText handleComplexClick={handleComplexClick}  wrapperClass="station_label" size={complexText.props.size} complexStationRouteIdObjs={complexText.props.complexStationRouteIdObjs} complexId={complexText.props.complexId.toString()} index={i} status={status} key={complexText.props.complex_id}  distanceFactor={8} center={true} routes={complexText.props.routes} averagePosition={complexText.props.averagePosition} names={complexText.props.names} alphaLevel={alphaLevel} />
      return newComplexText
    } else {
      let status = false
      let newComplexText = <ComplexText handleComplexClick={handleComplexClick}  wrapperClass="station_label" size={complexText.props.size} complexStationRouteIdObjs={complexText.props.complexStationRouteIdObjs} complexId={complexText.props.complexId.toString()} index={i} status={status} key={complexText.props.complex_id}  distanceFactor={8} center={true} routes={complexText.props.routes} averagePosition={complexText.props.averagePosition} names={complexText.props.names} alphaLevel={1} />
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




import React, { useEffect} from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from "three"

import StationText from './StationText'
import ComplexText from './ComplexText'
import StationToolTip from './StationTooltip'
import ComplexTooltip from './ComplexTooltip'

import { findDistance } from './ModularFunctions'


export default function StationsTracksAndText({vectorPosition}) {
    const {stationArray, retrieveStationId, stationsData} = useOutletContext()
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    const [complexHtmlArray, setComplexHtmlArray] = useState([])
    // USE THIS LATER FOR ROUTE HIGHLIGHTING
    // const [tripInfoHtmlArray, setTripInfoHtmlArray] = useState([])
    const [toolTipArray, setToolTipArray] = useState([].slice(0,2))
    const [versionForKey, setVersionForKey] = useState(0)
    const [cameraPosition, setCameraPosition] = useState({"x": 0, "y" : 0, "z" : 0})

// Fetch to get data for stations, array of objects with info
// ASYNC ISSUE?
useEffect(()=>{
  setStationInfoObjectArray(stationsData)
},[stationsData])

// CREATE STATION TOOLTIP IF IT DOESN'T ALREADY EXIST
function handleStationClick(stopId, name, position, daytime_routes){

  let newStationTooltip = <StationToolTip key={name + versionForKey} clearTooltip={clearTooltip} retrieveStationId={retrieveStationId} stopId={stopId} position={position} name={name} daytime_routes={daytime_routes}/>;
  
  
  setVersionForKey((prevVersion)=>{
    return prevVersion += 1
  });

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
  setVersionForKey((prevVersion)=>{
    return prevVersion += 1
  })

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
      return prevArray.filter((tooltip)=>{
        if (tooltip.props.stopId != id){
          return tooltip
        }
      })
    })
  } else if (type === "complexId"){
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
  // why does this fail to produce text sometimes? 
useEffect(()=>{
  if (stationInfoObjectArray.length > 0 && stationArray.length > 0){

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
    let newComplexHtmlArray = []
    let complexObject = {}
    
    // loop through meshes to get position, combine with info from fetch, create Html text overlay
    for (let j = 0 ; j < stationArray.length; j++){
      // filter out track names for now
      if (stationArray[j].props.name.length < 5){
        // if name is in stationInfoObject as key, and is not a complex, create <StationText> and push to stationHtmlArray
        if( stationArray[j].props.name in stationInfoObject && !stationInfoObject[stationArray[j].props.name].complex){
          // let status = false
          let displayStatus = stationArray[j].props.status.geometryDisplay
          let tripInProgress = stationArray[j].props.status.tripInProgress
          
          let textDisplayStatus = false
          let camAlpha = true

          if (tripInProgress == true && displayStatus == true){
            textDisplayStatus = true,
            camAlpha = false
          }

          if (displayStatus = true){
            textDisplayStatus = true
            camAlpha = true
          }

          if (displayStatus == false){
            textDisplayStatus = false
            camAlpha = false
          }

          let newPosition = stationArray[j].props.mesh.position
          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // default size for text and route icons
          let size = 25
          // let displayStatus = stationArray[j].props.status.geometryDisplay
          // if (displayStatus == true){

          // }
          // loop through positions and find dist to closest other station
          // THIS IS DONE WHILE CREATING STATIONTEXT COMPONENTS BECAUSE WE HAVE ACCESS TO STATION POSITIONS, COMPLEX IS DONE AFTERWARDS
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
          if (distToClosestStation < 0.6 && distToClosestStation >= 0.5){
            size = 20
          } else if (distToClosestStation < 0.5 && distToClosestStation > 0.3){
            size = 15
          } else if (distToClosestStation < 0.3){
            size = 10
          } 
          // console.log('stat status', status)
          let newStationText = <StationText handleStationClick={handleStationClick} clearTooltip={clearTooltip} size={size}  wrapperClass="station_label"  index={j} textDisplayStatus={textDisplayStatus} camAlpha={camAlpha} key={stationArray[j].props.name}  distanceFactor={8} center={true} position={newPosition} name={newInfoObject.name} daytime_routes={newInfoObject.daytime_routes} gtfs_stop_id={newInfoObject.gtfs_stop_id} alphaLevel={1}/>
          newStationHtmlArray.push(newStationText)
         
          // if the station name exists in the stationInfoObject & complex = True, create key in complexObject from complex_id and add values to key
        } else if ( stationArray[j].props.name in stationInfoObject && stationInfoObject[stationArray[j].props.name].complex){
          let geometryStatus = stationArray[j].props.status
          // console.log(geometryStatus)
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
     
          // if its the first complexText being added to the complexObject
          // OR if the newInfoObject does not have a matching complex_id in it, we create a new key value pair in the complexObject
          if (Object.keys(complexObject).length === 0 || !(complexObject.hasOwnProperty(newInfoObject.complex_id))){
 
            // need to add status to this. probably an array

            complexObject[newInfoObject.complex_id] = {
                "complex_id" : newInfoObject.complex_id,
                // "daytime_routes" : newInfoObject.daytime_routes.split(" "),
                "daytime_routes" : [[newInfoObject.daytime_routes]],
                "gtfs_stop_ids" : [newInfoObject.gtfs_stop_id],
                "status_array" : [geometryStatus],
                "positions" : [newPosition],
                "stop_names" : [newInfoObject.name],
                "name_route_combo_obj_array" : [{
                  "name" : newInfoObject.name,
                  "routes" : newInfoObject.daytime_routes,
                  "gtfs_stop_id" :newInfoObject.gtfs_stop_id
                }]
            } 
          // if the complexId already exists as a key in the complexObject, we condense the info of the new
          // station (part of the complex), into the value of the existing complexId key
          } else {
            complexObject[newInfoObject.complex_id]['daytime_routes'].push([newInfoObject.daytime_routes])

            // name route combos, might only need this after all
            complexObject[newInfoObject.complex_id]['name_route_combo_obj_array'].push({
                  "name" : newInfoObject.name,
                  "routes" : newInfoObject.daytime_routes,
                  "gtfs_stop_id" :newInfoObject.gtfs_stop_id
            })

            complexObject[newInfoObject.complex_id]['status_array'].push(geometryStatus)

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
    
    // COMPLEXES HAVE BEEN CONDESNED INTO AN OBJECT WITH COMPLEXIDS AS KEYS
    // LOOP THROUGH OBJECT KEYS AND CREATE AN ARRAY OF REACT COMPONENTS WITH COMPLEX PROPS
    for (let complex in complexObject){
      // let status = true
      // console.log(complexObject[complex])
      // console.log(complexObject[complex])
      let complexTextDisplay = false

      // find the average position of the stations in the complex to place the complex text
      function avereragePosition(positionsArray){
        let xTotal = 0;
        let yTotal= 0;
        let zTotal = 0;
        for (let pos of positionsArray){
            xTotal += pos.x;
            yTotal += pos.y;
            zTotal += pos.z;
        }
        let xAv = xTotal/positionsArray.length;
        let yAv = yTotal/positionsArray.length;
        let zAv = zTotal/positionsArray.length;
        return new THREE.Vector3(xAv, yAv, zAv);
      };
      let averagePosition = avereragePosition(complexObject[complex].positions);

      let newComplexText = <ComplexText complexTextDisplay = {complexTextDisplay} key={complexObject[complex].complex_id.toString()} handleComplexClick={handleComplexClick} clearTooltip={clearTooltip} size={30} complexStationRouteIdObjs={complexObject[complex].name_route_combo_obj_array} complexId={complexObject[complex].complex_id} wrapperClass="station_label" statusArray={complexObject[complex].status_array} distanceFactor={8} center={true} routes={complexObject[complex].daytime_routes} averagePosition={averagePosition} names={complexObject[complex].stop_names} alphaLevel={0} />

      newComplexHtmlArray.push(newComplexText);
    }
    // for each complex in complexHtmlArray, loop thorugh all complexes and stations and find distance to closest stationText or complexText
    // then assign size to complexText
    let stationHtmlAndComplexHtmlArray = newStationHtmlArray.concat(newComplexHtmlArray)
    let newComplexHtmlArrayWithSize = newComplexHtmlArray.map((currentComplex)=>{
      let distToClosestStationComplex = null
      stationHtmlAndComplexHtmlArray.map((complexOrStation)=>{
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


      // CONTROL COMPLEX TEXT SIZE BASED ON DISTANCE TO CLOSEST STATIONTEXT OR COMPLEXTEXT
      if (distToClosestStationComplex >= 1.5){
        return currentComplex;
      } else if (distToClosestStationComplex < 1.5 && distToClosestStationComplex >= 1){
        let newKey = currentComplex.props.complexId.toString() + " " + versionForKey.toString()
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 25, key : newKey});
        setVersionForKey((prevVersion)=>{
          return prevVersion += 1
        })
        return newComplexHtmlComponent;
      } else if (distToClosestStationComplex < 1 && distToClosestStationComplex >= 0.5) {
        let newKey = currentComplex.props.complexId.toString() + " " + versionForKey.toString()
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 20, key : newKey});
        setVersionForKey((prevVersion)=>{
          return prevVersion += 1
        })
        return newComplexHtmlComponent;
      } else if (distToClosestStationComplex < 0.5){
        let newKey = currentComplex.props.complexId.toString() + " " + versionForKey.toString()
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 15, key : newKey});
        setVersionForKey((prevVersion)=>{
          return prevVersion += 1
        })
        return newComplexHtmlComponent
      }
    })
    setStationHtmlArray(newStationHtmlArray)
    setComplexHtmlArray(newComplexHtmlArrayWithSize)
    console.log('worked')
  } else {
    console.log('error')
  }
  
},[stationInfoObjectArray, stationArray])


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

// check camera distance to fade in/out station html text and switch status on or off
// will status have to be modified for route highlighting in future?
// problem with generating unique key
useEffect(()=>{
  
  let newStationHtmlArray = [...stationHtmlArray]
  let updatedStationHtml = newStationHtmlArray.map((stationText)=>{
    let alphaLevel = 0
    if (findDistance(stationText.props.position, cameraPosition) <= 30){
      let distance = findDistance(stationText.props.position, cameraPosition)
      if (distance <= 30 && distance >= 20){
        alphaLevel = Math.abs((distance - 30) / (30 - 20));
      } else {
        alphaLevel = 1;
      }
      // console.log(stationText.textDisplayStatus.textDisplay)
      let stationTextClone = React.cloneElement(stationText, {textDisplayStatus : true, alphaLevel : alphaLevel});
      return stationTextClone
    } else {
      let stationTextClone = React.cloneElement(stationText, {textDisplayStatus  : false});
      return stationTextClone;
    }
  })
  setStationHtmlArray(updatedStationHtml);
  
  let newComplexHtmlArray = [...complexHtmlArray];
  let updatedComplexHtmlArray = newComplexHtmlArray.map((complexText, i)=>{
  //  console.log(complexText.props)
    let alphaLevel = 0
    if (findDistance(complexText.props.averagePosition, cameraPosition) <= 30){
      let distance = findDistance(complexText.props.averagePosition, cameraPosition)
      if (distance <= 30 && distance >= 20){
        alphaLevel = Math.abs((distance - 30) / (30-20))
      } else {
        alphaLevel = 1
      }
      let complexTextClone = React.cloneElement(complexText, {complexTextDisplay : true, alphaLevel : alphaLevel})
      return complexTextClone
    } else {
      let complexTextClone = React.cloneElement(complexText, {complexTextDisplay : false})
      return complexTextClone
    }
  })
  setComplexHtmlArray(updatedComplexHtmlArray)
}, [cameraPosition])
  console.log(stationHtmlArray)
// RETURN COMPONENT 
  if (stationArray == [] && stationInfoObjectArray == []){
    return(
        <>loading</>
    )
  } else if (stationArray.length === 0 && stationInfoObjectArray.length === 0){
    return (
      <group  dispose={null}>
          {stationArray}
      </group>
    )
  }else if (stationArray.length > 0 && stationHtmlArray.length > 0 && complexHtmlArray.length > 0){
    return (
      <group  dispose={null}>
          {stationArray}
          {stationHtmlArray}
          {complexHtmlArray}
          {toolTipArray}
      </group>
    )
  } else {
    return <>error</>
  }
}



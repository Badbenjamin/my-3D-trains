
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
    // COULD I COMBINE STATION AND COMPLEX ARRAY? MAYBE LATER...
    // const [htmlButtonArray, setHtmlButtonArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    const [complexHtmlArray, setComplexHtmlArray] = useState([])
    // USE THIS LATER FOR ROUTE HIGHLIGHTING
    // const [tripInfoHtmlArray, setTripInfoHtmlArray] = useState([])
    const [toolTipArray, setToolTipArray] = useState([].slice(0,2))
    // STILL HAVING KEY PROBLEMS WITH COMPLEXTEXT AND STATIONTEXT
    const [versionForKey, setVersionForKey] = useState(0)
    const [cameraPosition, setCameraPosition] = useState({"x": 0, "y" : 0, "z" : 0})
 

// Fetch to get data for stations, array of objects with info
useEffect(()=>{
      fetch(`http://127.0.0.1:5555/api/stations`)
      .then(response => response.json())
      .then(stationInfoObjectArray => {setStationInfoObjectArray(stationInfoObjectArray)})
},[])

// CREATE STATION TOOLTIP IF IT DOESN'T ALREADY EXIST
function handleStationClick(stopId, name, position, daytime_routes){

  let newStationTooltip = <StationToolTip key={name + versionForKey} clearTooltip={clearTooltip} retrieveStationId={retrieveStationId} stopId={stopId} position={position} name={name} daytime_routes={daytime_routes}/>;
  
  
  setVersionForKey((prevVersion)=>{
    return prevVersion + 1
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
    return prevVersion + 1
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
    let newComplexHtmlArray = []
    let complexObject = {}
    
    // loop through meshes to get position, combine with info from fetch, create Html text overlay
    for (let j = 0 ; j < stationArray.length; j++){
      // filter out track names for now
      if (stationArray[j].props.name.length < 5){
        // if name is in stationInfoObject as key, and is not a complex, create <StationText> and push to stationHtmlArray
        if( stationArray[j].props.name in stationInfoObject && !stationInfoObject[stationArray[j].props.name].complex){
          let status = false
          let newPosition = stationArray[j].props.mesh.position
          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // default size for text and route icons
          let size = 35
          
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
          if (distToClosestStation < 0.6 && distToClosestStation >= 0.4){
            size = 25
          } else if (distToClosestStation < 0.4){
            size = 17
          } 

          let newStationText = <StationText handleStationClick={handleStationClick} clearTooltip={clearTooltip} size={size}  wrapperClass="station_label"  index={j} status={status} key={stationArray[j].props.name + versionForKey}  distanceFactor={8} center={true} position={newPosition} name={newInfoObject.name} daytime_routes={newInfoObject.daytime_routes} gtfs_stop_id={newInfoObject.gtfs_stop_id} alphaLevel={1}/>
          newStationHtmlArray.push(newStationText)
          setVersionForKey((prevVersion)=>{
            return prevVersion + 1
          })

          // if the station name exists in the stationInfoObject & complex = True, create key in complexObject from complex_id and add values to key
        } else if ( stationArray[j].props.name in stationInfoObject && stationInfoObject[stationArray[j].props.name].complex){
    
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
     
          // if its the first complexText being added to the complexObject
          // OR if the newInfoObject does not have a matching complex_id in it, we create a new key value pair in the complexObject
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
      let status = true

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
  
      let newComplexText = <ComplexText key={complexObject[complex].complex_id.toString() + " " + versionForKey.toString()} handleComplexClick={handleComplexClick} clearTooltip={clearTooltip} size={35} complexStationRouteIdObjs={complexObject[complex].name_route_combo_obj_array} complexId={complexObject[complex].complex_id} wrapperClass="station_label" status={status} distanceFactor={8} center={true} routes={complexObject[complex].daytime_routes} averagePosition={averagePosition} names={complexObject[complex].stop_names} alphaLevel={0} />
      setVersionForKey((prevVersion)=>{
        return prevVersion + 1
      })
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
      console.log(distToClosestStationComplex)
      // CONTROL ALPHA LEVEL BASED ON DIST FROM CAM
      if (distToClosestStationComplex >= 1.5){
        return currentComplex;
      } else if (distToClosestStationComplex < 1.5 && distToClosestStationComplex >= 1){
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 25});
        return newComplexHtmlComponent;
      } else if (distToClosestStationComplex < 1 && distToClosestStationComplex >= 0.5) {
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 20});
        return newComplexHtmlComponent;
      } else if (distToClosestStationComplex < 0.5){
        let newComplexHtmlComponent = React.cloneElement(currentComplex, {size : 10});
        return newComplexHtmlComponent
      }
    })
    setStationHtmlArray(newStationHtmlArray)
    setComplexHtmlArray(newComplexHtmlArrayWithSize)

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

// check camera distance to fade in/out station html text and switch status on or off
// will status have to be modified for route highlighting in future?
// problem with generating unique key
useEffect(()=>{
  
  let newStationHtmlArray = [...stationHtmlArray]
  let updatedStationHtml = newStationHtmlArray.map((stationText)=>{
    let alphaLevel = 0
    if (findDistance(stationText.props.position, cameraPosition) <= 20){
      let distance = findDistance(stationText.props.position, cameraPosition)
      if (distance <= 20 && distance >= 15){
        alphaLevel = Math.abs((distance - 20) / (20 - 15));
      } else {
        alphaLevel = 1;
      }
      let stationTextClone = React.cloneElement(stationText, {status : true, alphaLevel : alphaLevel});
      return stationTextClone;
    } else {
      let stationTextClone = React.cloneElement(stationText, {status : false, alphaLevel : alphaLevel});
      return stationTextClone;
    }
  })
  setStationHtmlArray(updatedStationHtml);
  
  let newComplexHtmlArray = [...complexHtmlArray];
  let updatedComplexHtmlArray = newComplexHtmlArray.map((complexText, i)=>{
  //  console.log(complexText.props)
    let alphaLevel = 0
    if (findDistance(complexText.props.averagePosition, cameraPosition) <= 40){
      let distance = findDistance(complexText.props.averagePosition, cameraPosition)
      // let alphaLevel = 0
      if (distance <= 40 && distance >= 30){
        alphaLevel = Math.abs((distance - 40) / (40-30))
      } else {
        alphaLevel = 1
      }
      let complexTextClone = React.cloneElement(complexText, {status : true, alphaLevel : alphaLevel})
      return complexTextClone
    } else {
      let complexTextClone = React.cloneElement(complexText, {status : false, alphaLevel : alphaLevel})
      return complexTextClone
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
      </group>
    )
  }

  
  
  
}




import React, { useEffect, cloneElement} from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import * as THREE from "three"

import StationText from './StationText'
import ComplexText from './ComplexText'
import StationToolTip from './StationTooltip'
import ComplexTooltip from './ComplexTooltip'
import RouteTooltip from './RouteTooltip'


import { findDistance } from './ModularFunctions'


export default function StationsTracksAndText({vectorPosition}) {
    const {stationArray, retrieveStationId} = useOutletContext()
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    const [complexHtmlArray, setComplexHtmlArray] = useState([])
    const [toolTipArray, setToolTipArray] = useState([].slice(0,2))
    const [routeInfoArray, setRouteInfoArray] = useState([])
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

// CREATE COMPLEX TOOLTIP IF ITS NOT ALREADY IN TOOLTIPARRAY
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
};

  // COMBINE station geometries (stationArray) with stationInfoObjectArray, which is info from stations db table
  // this will imbue our geometries with info that can be turned into text (map text, tooltips, route tts for trip in prog)
  // stationInfo prop of station geometry in stationArray contains info about particular station in trip
  // 
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
    let newRouteInfoHtmlArray = []
    let complexObject = {}
    
    // loop through meshes to get position, combine with info from fetch, create Html text overlay
    for (let j = 0 ; j < stationArray.length; j++){
      // filter out track names for now, just stations (eg G22)
      if (stationArray[j].props.name.length < 5){
        
        // ROUTE TOOLTIP CREATION
        // stationInfo prop contains information about each station in relation to the current trip
        // tripInfo returned from backend is used to find stations involved in trip
        // that info is passed to the geometries, then here, it is used to create RouteTooltips
        // RTTs display trip info in text within the 3D map canvas
        if(stationArray[j].props.stationInfo && ((stationArray[j].props.stationInfo.type == 'start')||(stationArray[j].props.stationInfo.type == 'end')||(stationArray[j].props.stationInfo.type == 'transfer')||(stationArray[j].props.stationInfo.type == 'errorStart')||(stationArray[j].props.stationInfo.type == 'errorEnd')||(stationArray[j].props.stationInfo.type == 'errorTransfer'))){

          let keyforRouteInfo = stationInfoObject[stationArray[j].props.name].name.toString() + versionForKey.toString()
          let newRouteTooltip = <RouteTooltip key={keyforRouteInfo} name={stationInfoObject[stationArray[j].props.name].name} position={stationArray[j].props.mesh.position} stationInfo={stationArray[j].props.stationInfo}/>
          newRouteInfoHtmlArray.push(newRouteTooltip)
          setVersionForKey((prevVersion)=>{
            return prevVersion += 1
          })
        }

        // STATION TEXT CREATION
        // if name is in stationInfoObject as key, and is not a complex, create <StationText> and push to stationHtmlArray
        if( stationArray[j].props.name in stationInfoObject && !stationInfoObject[stationArray[j].props.name].complex){
          let newPosition = stationArray[j].props.mesh.position
          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // default size for text and route icons
          let size = 25
          
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
          // pass station geometry stationInfo to stationText for conditional rendering
          let newStationText = <StationText handleStationClick={handleStationClick} clearTooltip={clearTooltip} size={size}  wrapperClass="station_label"  index={j} tripInProgress={stationArray[j].props.tripInProgress} stationIntrip={stationArray[j].props.stationInTrip} stationInfo = {stationArray[j].props.stationInfo} key={stationArray[j].props.name}  distanceFactor={8} center={true} position={newPosition} name={newInfoObject.name} daytime_routes={newInfoObject.daytime_routes} gtfs_stop_id={newInfoObject.gtfs_stop_id} alphaLevel={1}/>
          newStationHtmlArray.push(newStationText)

          // THIS BRANCH HANDLES STATIONS IN COMPLEXES
          // STATIONS IN COMPLEXES ARE CONDENSED INTO COMPLEXOBJECT KEY VALUE PAIRS
          // if the station name exists in the stationInfoObject & complex = True, create key in complexObject from complex_id and add values to key
        } else if ( stationArray[j].props.name in stationInfoObject && stationInfoObject[stationArray[j].props.name].complex){

          let newPosition = stationArray[j].props.mesh.position
          let newInfoObject = stationInfoObject[stationArray[j].props.name]

          // if its the first complexText being added to the complexObject
          // OR if the newInfoObject does not have a matching complex_id in it, we create a new key value pair in the complexObject
          if (Object.keys(complexObject).length === 0 || !(complexObject.hasOwnProperty(newInfoObject.complex_id))){

            complexObject[newInfoObject.complex_id] = {
                "complex_id" : newInfoObject.complex_id,
                "daytime_routes" : [[newInfoObject.daytime_routes]],
                "gtfs_stop_ids" : [newInfoObject.gtfs_stop_id],
                "positions" : [newPosition],
                "stop_names" : [newInfoObject.name],
                "station_in_trip_array" : [stationArray[j].props.stationInTrip],
                "trip_in_progress_array" : [stationArray[j].props.tripInProgress],
                "station_info_array" : [stationArray[j].props.stationInfo],
                // name should be tied to other info
               
                "name_route_combo_obj_array" : [{
                  "name" : newInfoObject.name,
                  "routes" : newInfoObject.daytime_routes,
                  "gtfs_stop_id" :newInfoObject.gtfs_stop_id
                }]
            } 
          // if the station's complexId already exists as a key in the complexObject, we condense the info of the new
          // station (part of the complex), into the value of the existing complexId key
          } else {
            console.log('complex object push')
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

            let stationInTrip = stationArray[j].props.stationInTrip
            complexObject[newInfoObject.complex_id]['station_in_trip_array'].push(stationInTrip)

            let tripInProgress = stationArray[j].props.tripInProgress
            complexObject[newInfoObject.complex_id]['trip_in_progress_array'].push(tripInProgress)

            let stationInfo = stationArray[j].props.stationInfo
            complexObject[newInfoObject.complex_id]['station_info_array'].push(stationInfo)
          }
        }
      }
    }
    
    // COMPLEXES HAVE BEEN CONDESNED INTO AN OBJECT WITH COMPLEXIDS AS KEYS
    // LOOP THROUGH OBJECT KEYS AND CREATE AN ARRAY OF REACT COMPONENTS WITH COMPLEX PROPS
    for (let complex in complexObject){

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
      // how to pass all stationInfo to complexText component for rendering? 
      let newComplexText = <ComplexText key={complexObject[complex].complex_id.toString()}
                           handleComplexClick={handleComplexClick} clearTooltip={clearTooltip} 
                           size={35} 
                           complexStationRouteIdObjs={complexObject[complex].name_route_combo_obj_array} 
                           complexId={complexObject[complex].complex_id} 
                           stationInTripArray= {complexObject[complex].station_in_trip_array}
                           tripInProgressArray = {complexObject[complex].trip_in_progress_array}
                           stationInfoArray = {complexObject[complex].station_info_array}
                           wrapperClass="station_label" 
                          //  status={status}
                           distanceFactor={8} 
                           center={true} 
                           routes={complexObject[complex].daytime_routes} 
                           averagePosition={averagePosition} 
                           names={complexObject[complex].stop_names} 
                           alphaLevel={0} />

        // If the station is involved in the current trip, we push it to the newRouteInfoHtmlArray
        // this is used to set the routeInfoArray, or our routetooltips
        if(complexObject[complex].stationInTrip){
          console.log('complex tooltip?')
          // need to modify this to work with complex info
          let newRouteTooltip = <RouteTooltip name={"complex"} position={averagePosition} stationInfo={complexObject[complex].name_arrival_info_combo_array}/>
          newRouteInfoHtmlArray.push(newRouteTooltip)
        }

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
      // IDEALLY THIS WOULD BE ON A SCALE INSTEAD OF JUST THREE OPTIONS
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


    // CREATE OUR ROUTE TOOLTIPS 
    let routeInfoHtmlArrayObj = {}
    for (let routeInfo of newRouteInfoHtmlArray){
      // add key value pair (key = type, value = info). 
      // start, end, transfer tooltips
      if (Object.keys(routeInfoHtmlArrayObj).length === 0 || !(routeInfo.props.stationInfo.type in routeInfoHtmlArrayObj)){
        routeInfoHtmlArrayObj[routeInfo.props.stationInfo.type] = routeInfo
        
      // if key exists in routeInfoHtmlArray obj (should only be transfer, since there would be 2 per trip)
      // then the info is pushed to the kv transfer pair that already exists
      } else if ((routeInfo.props.stationInfo.type in routeInfoHtmlArrayObj) && (routeInfo.props.stationInfo.type === "transfer")) {
        routeInfoHtmlArrayObj[routeInfo.props.stationInfo.type].props.stationInfo.second_transfer_info.push(routeInfo.props.stationInfo)
      }
    }
    // turn the obj into a list
    let condensedRouteInfoArray = []
    for (let routeInfo in routeInfoHtmlArrayObj){
      condensedRouteInfoArray.push(routeInfoHtmlArrayObj[routeInfo])
    }
   
    setRouteInfoArray(condensedRouteInfoArray)
  }
  // Clear stationTooltips when trip is in progress
  setToolTipArray([])
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
      let stationTextClone = React.cloneElement(stationText, { alphaLevel : alphaLevel});
      return stationTextClone
    } else {
      let stationTextClone = React.cloneElement(stationText, { alphaLevel : alphaLevel});
      return stationTextClone;
    }
  })
  setStationHtmlArray(updatedStationHtml);
  
  let newComplexHtmlArray = [...complexHtmlArray];
  let updatedComplexHtmlArray = newComplexHtmlArray.map((complexText, i)=>{
    let alphaLevel = 0
    if (findDistance(complexText.props.averagePosition, cameraPosition) <= 30){
      let distance = findDistance(complexText.props.averagePosition, cameraPosition)
      if (distance <= 30 && distance >= 20){
        alphaLevel = Math.abs((distance - 30) / (30-20))
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
  
// RETURN COMPONENT 
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
          {routeInfoArray}
          {/* {(errorPopup === null) ? <></> : errorPopup} */}
      </group>
    )
  }
}




import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'


import StationText from './StationText'
import ComplexText from './ComplexText'


export default function StationsAndTracks({vectorPosition}) {
    const {stationArray} = useOutletContext()
    const [stationInfoObjectArray, setStationInfoObjectArray] = useState([])
    const [stationHtmlArray, setStationHtmlArray] = useState([])
    const [complexHtmlArray, setComplexHtmlArray] = useState([])
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

useEffect(()=>{
      fetch(`http://127.0.0.1:5555/api/stations`)
      .then(response => response.json())
      .then(stationInfoObjectArray => {setStationInfoObjectArray(stationInfoObjectArray)})
},[])
  // console.log('sioa',stationInfoObjectArray)

  // COMBINE station info from DB with location info from map model to display HTML text on map
useEffect(()=>{
  
  if (stationInfoObjectArray && stationArray){

    // This is the station information returned from the call to the backend
    // an object is created with gtfs Id as the key, and info from the DB as the value
    let stationInfoObject = {}
    for (let i = 0 ; i < stationInfoObjectArray.length; i++){
      stationInfoObject = {...stationInfoObject, [stationInfoObjectArray[i].gtfs_stop_id] : stationInfoObjectArray[i]}
    }
    // console.log('sio', stationInfoObject)
    // stationArray is the array of meshes from the blender model, containing position
    // stationHtmlArray will contain <StationText/> elements that will display info above each station
    // we are combining the position of the mesh from the blender model with the information for the station from the backend
    let newStationHtmlArray = []
    // this might not be needed
    let newComplexHtmlArray = []
    let complexObject = {}
    let count = 0
    // loop through meshes 
    // maybe this is the issue?
    for (let j = 0 ; j < stationArray.length; j++){
      // console.log('co', complexObject)
      // console.log('info obj', stationInfoObject[stationArray[j].props.name])
      if (stationArray[j].props.name.length < 5){
        // if name is in stationInfoObject as key, and is not a complex, create <StationText> and push to stationHtmlArray
        if( stationArray[j].props.name in stationInfoObject && !stationInfoObject[stationArray[j].props.name].complex){
          let status = false
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // console.log('nio', newInfoObject.complex)
          // VERSION???
          let newStationText = <StationText wrapperClass="station_label"  index={j} status={status} key={stationArray[j].props.name}  distanceFactor={8} center={true} position={newPosition} text={newInfoObject.name+ " " + newInfoObject.daytime_routes} />
          newStationHtmlArray.push(newStationText)

          // if complex = True, create key in complexObject from complex_id and add values to key
          // I WANT TO CREATE NEW KEY VALUE PAIRS WHEN NOT IN DICT, BUT ADD TO VALUES WHEN KEY IS IN DICT
        } else if ( stationArray[j].props.name in stationInfoObject && stationInfoObject[stationArray[j].props.name].complex){
          // console.log('worked 1', complexObject, complexObject == {})
          // let status = true
          let newPosition = stationArray[j].props.mesh.position

          let newInfoObject = stationInfoObject[stationArray[j].props.name]
          // console.log(newInfoObject.complex_id)
          if (Object.keys(complexObject).length === 0 || !(complexObject.hasOwnProperty(newInfoObject.complex_id))){
            // console.log('worked 2', complexObject)
            
            complexObject[newInfoObject.complex_id] = {
                "complex_id" : newInfoObject.complex_id,
                "daytime_routes" : newInfoObject.daytime_routes.split(" "),
                "gtfs_stop_ids" : [newInfoObject.gtfs_stop_id],
                "positions" : [newPosition],
                "stop_names" : [newInfoObject.name],
                // "count" : count
            } 
          } else {
            // console.log(complexObject[newInfoObject.complex_id]['daytime_routes'])
            // console.log([newInfoObject.daytime_routes.split(" ")])
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
    console.log(complexObject)
    let i = 0
    for (let complex in complexObject){
      let status = true
      i += 1
      // console.log(complexObject[complex])
      let newComplexText = <ComplexText wrapperClass="station_label"  index={i} status={status} key={complexObject[complex].complex_id}  distanceFactor={8} center={true} routes={complexObject[complex].daytime_routes} positions={complexObject[complex].positions} names={complexObject[complex].stop_names} />
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

useEffect(()=>{

  if (true){
    let newStationHtml = [...stationHtmlArray]
    newStationHtml = stationHtmlArray.map((stationText)=>{
      if (findDistance(stationText.props.position, cameraPosition) < 16){
        let status = true
        let newStationText = <StationText wrapperClass="station_label"  index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={8} center={true} position={stationText.props.position} text={stationText.props.text} />
        return newStationText
      } else {
        let status = false
        let newStationText = <StationText wrapperClass="station_label"  index={stationText.props.index} status={status} key={stationText.props.key}  distanceFactor={8} center={true} position={stationText.props.position} text={stationText.props.text} />
        return newStationText
      }
    })
    setStationHtmlArray(newStationHtml)
  }

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
      </group>
    )
  }

  
  
  
}



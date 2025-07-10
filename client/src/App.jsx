import { Outlet } from 'react-router-dom'
import React, { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'
// import { useFrame } from '@react-three/fiber'




import './App.css'
// import Station from './Station'
import { getAllIds, createStatusObjectArray, createStationComponentsObj, updateStatusArray} from './ModularFunctions'


function App() {

  // load station and track model. destructure to nodes and materials to create Station component
  // nodes correspond to each geometry in the model
  // each node contains a mesh, which has the properties for that geometry 
  const { nodes, materials } = useGLTF('./subway_map_stations_tracks_1.glb')
  
  const [stations, setStations] = useState([])
  const [stationArray, setStationArray] = useState([])
  console.log('sa', stationArray)
  // DUPLICATES IN STATUS ARRAY? 
  // fix duplicates, see if errors occur
  // const [statusArray, setStatusArray] = useState([])
  // console.log(statusArray)
  const [version, setVersion] = useState(0)
  const [tripInfo, setTripInfo] = useState([])
  // console.log('ti',tripInfo)
  // THIS IS THE ARRAY OF TRAINS FOR CHOOSING THE NEXT TRAIN
  const [tripInfoIndex, setTripInfoIndex] = useState(0)
  const [stationIdStartAndEnd, setStationIdStartAndEnd] = useState({"startId" : null, "endId" : null})
  const [vectorPosition, setVectorPositon] = useState({})

  // get station info for trip planner  for station search. 
  useEffect(() => {
    // remove local host for deployment
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
  }, [])

    // THERE IS A BUG HERE (when tt is used to set waypoints after another trip has been planned)
    // This is triggered when ToolTip origin or dest button is clicked
  function retrieveStationId(id, startOrEnd) {

    setStationIdStartAndEnd(prevState => {
      const newStationIdStartOrEnd = { ...prevState };
      if (startOrEnd === "start") {
        newStationIdStartOrEnd['startId'] = id;
      } else if (startOrEnd === "end") {
        newStationIdStartOrEnd['endId'] = id;
      }
      return newStationIdStartOrEnd;
    });
  }


  // build stationArray of 3D station components for LinesAndMap
  // this useEffect creates Station objects for each geometry in our model
  // SPLIT INTO TRACKS AND STATIONS? 
  // CREATE A TRACK COMPONENT, WOULD HAVE SPECIAL ATTRIBUTES LIKE DURATION AND TRAIN POSITION
  useEffect(()=>{
    // newStatusArray is an array of objects with names of stations/meshes and a boolean to determine whether they are selected or not
    // contains duplicates because some stations are broken into two geometries. maybe there is a better way...
    // const newStatusArray = createStatusObjectArray(nodes)

    // newMapModelObj contains the info for all the station and track geometries in our scene
    const newMapModelObj = createStationComponentsObj(nodes, materials, retrieveStationId)
    
    // this loop populates newStationArray with meshes from our newMapModelObject
    const newStationArray = []
    for (const meshName in newMapModelObj){
      newStationArray.push(newMapModelObj[meshName])
      };
    // statusArray is set (should be all false, unselected)
    // setStatusArray(newStatusArray)
    // stationArray is set with our newly created Station components from newMapModelObject
    // console.log('nsa',newStationArray)
    setStationArray(newStationArray)
  }, [])

  // This useEffect listens for a change in tripInfoIndex. 
  // It takes the stations from ttrain schedule and creates an array of GTFS ids that will be passed to the selectStations function
  // selectStations takes an array of gtfs ids and uses it to change the status of the stations in stationArray.

  useEffect(()=>{
    // TAKE TRIPINFO, ACCESS TRIPINFOELEMENTS
    // ISOLATE STOPS (WITH INFO) BETWEEN START AND END STATION FOR EACH TSE
    // ADD THESE TO HASHMAP, WITH INFO, START OR END, ARRIVAL, TRANSFER, PASSTHROUGH
    // MAP STATION ARRAY, RETURNING ONLY STATIONS PRESENT IN HASHMAP
    // PASS DOWN STATION INFO TO TEXT LAYER, TO DISPLAY START, END, TRANSFER
    console.log('ti',tripInfo)
    // console.log('sa',stationArray)
    console.log('tii',tripInfoIndex)
    // isolate gtfs stop ids from each leg of trip
    let currentTrip = tripInfo[tripInfoIndex]
    console.log('ct', currentTrip)
    
    let selectedStationInfoObj = {}
    // stationId : {
    //    type: start
    //    arrival : 123345
    // }
    if ((currentTrip && currentTrip.length == 1) && tripInfo != []){
      for (let tripSequenceElement of currentTrip){
        const currentTripSchedule = tripSequenceElement.schedule
        const startStationId = tripSequenceElement.start_station_gtfs
        const endStationId = tripSequenceElement.end_station_gtfs
        console.log(tripSequenceElement)
        console.log(currentTripSchedule)

        const justStationIds = currentTripSchedule.map((station) => {
          return station['stop_id'].slice(0,3)
        })
      
      const startIndex = justStationIds.indexOf(startStationId)
      const endIndex = justStationIds.indexOf(endStationId)

      const startStop = currentTripSchedule[startIndex]
      const endStop = currentTripSchedule[endIndex]
      // console.log(currentTripSchedule.slice(startIndex, endIndex + 1))
      const stopsForLeg = currentTripSchedule.slice(startIndex, endIndex + 1)

      for (let stop of stopsForLeg){
        if (stop == startStop){
          // console.log(stop.stop_id.slice(0,3))
          selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
            "stopId" : stop.stop_id.slice(0,3),
            "arrival" : stop.arrival,
            "departure" : stop.departure, 
            "type" : "start"
          }
        }  else if (!(stop == startStop || stop == endStop)){
          selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
            "stopId" : stop.stop_id.slice(0,3),
            "arrival" : stop.arrival,
            "departure" : stop.departure, 
            "type" : "passthrough"
          }
        } else if (stop == endStop){
          selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
            "stopId" : stop.stop_id.slice(0,3),
            "arrival" : stop.arrival,
            "departure" : stop.departure, 
            "type" : "end"
          }
        }
      }
      console.log(selectedStationInfoObj)
      }
    } else if (currentTrip && currentTrip.length >= 1) {
      for (let tripSequenceElement of currentTrip){
        console.log('tse', tripSequenceElement)
      }
    }
    

    // map through stationArray and change status of stations that are present in ids from tripInfo
    if (tripInfo != [] && selectedStationInfoObj != {}){
      let newStationArray = stationArray.map((stationGeometry)=>{
        if (stationGeometry.props.name in selectedStationInfoObj){
          console.log(selectedStationInfoObj[stationGeometry.props.name].arrival)
          let newStationGeometry = React.cloneElement(stationGeometry, {status : {
            "display" : true,
            "type" : selectedStationInfoObj[stationGeometry.props.name].type,
            "arrival" : selectedStationInfoObj[stationGeometry.props.name].arrival,
            "departure" : selectedStationInfoObj[stationGeometry.props.name].departure,
            "gtfs_stop_id" : selectedStationInfoObj[stationGeometry.props.name].stopId
          }, key : selectedStationInfoObj[stationGeometry.props.name].stopId.toString() + version.toString()})
          setVersion((prevVersion)=>{
            return prevVersion += 1
          })
          console.log('nsg', newStationGeometry)
          return newStationGeometry
        } else {
          let newStationGeometry = React.cloneElement(stationGeometry, {status : {
            "display" : false,
            "type" : "not_in_trip",
            // "arrival" : selectedStationInfoObj[stationGeometry.props.name]['arrival'],
            // "departure" : selectedStationInfoObj[stationGeometry.props.name]['departure'],
            // "gtfs_stop_id" : selectedStationInfoObj[stationGeometry.props.name]['stopId']
          }, key : stationGeometry.props.name.toString() + version.toString()})
          setVersion((prevVersion)=>{
            return prevVersion += 1
          })
          return newStationGeometry
        }
      })

      console.log(tripInfo != [], tripInfo)
      if((tripInfo.length > 0)){
        setStationArray(newStationArray)
      }
    
    }
    

  }, [tripInfo, tripInfoIndex])

  // useEffect(()=>{
  //   // trip info contains trains, which contain schedules.
  //   // schedules are used to select meshes to be highlighted in our map.
  //   // if (tripInfo == []){
  //   //   return 
  //   // } else if (tripInfo[tripInfoIndex]) {
  //   //   let allIdsArray = []
  //   //   // Trigger some sort of animation change with errors?
  //   //   let allErrorsArray = []

  //   //   for (let leg of tripInfo[tripInfoIndex]){
  //   //     if(leg.schedule){
  //   //       for (let id of getAllIds(leg,statusArray)){
  //   //         allIdsArray.push(id)
  //   //       }
  //   //     } else {
  //   //       console.log('error')
  //   //       // allErrorsArray.push(leg.error)
  //   //     }
  //   //   }
      
  //   //   // version must update to change key and trigger re render
  //   //   // does version need to be saved in state?
  //   //   setVersion(version + 1)
      
  //   //   const newStatusArray = [...statusArray]
  //   //   // reset statuses to false 
  //   //   for (const status of newStatusArray){
  //   //     status['status'] = false
  //   //   }
        
  //   //   // set statusArray state to updated version
  //   //   setStatusArray(updateStatusArray(allIdsArray, newStatusArray))
    
  //     // alteredStationArray will contain stations with updated status.
  //   if (tripInfo == []){
  //     return
  //   } else {
  //     console.log(tripInfo)
  //   }
  //     const alteredStationArray = stationArray.map((station) => {
  //       const newStation = {...station}
  //       const newStationName = newStation['props']['name']
  //       let newStationStatus = newStation['props']['status']['status']
          
  //       // IMPORTANT TO UPDATE KEY TO TRIGGER RE RENDER
  //       // look for match between station gtfs id and gtfs id's in statusArray
  //       for (const status of newStatusArray){
  //           newStationStatus = status['status']
  //           newStation['key'] =  String(newStationName + version)
  //           // newStation['id'] = String(newStationName + version)
  //         }
  //       return newStation
  //     })
  //     setStationArray(alteredStationArray)
  //   // }
  // }, [tripInfoIndex])

  // THIS HAPPENS FIRST, THEN TRIPINFOINDEX
  // useEffect(()=>{
  //   if (tripInfo == []){
  //     return 
  //   } else if (tripInfo[tripInfoIndex]) {
  //     let allIdsArray = []
  //     // Trigger some sort of animation change with errors?
  //     let allErrorsArray = []

  //     for (let leg of tripInfo[tripInfoIndex]){
  //       if(leg.schedule){
  //         for (let id of getAllIds(leg,statusArray)){
  //           allIdsArray.push(id)
  //         }
  //       } else {
  //         console.log('error')
  //         // allErrorsArray.push(leg.error)
  //       }
  //     }
      
  //     // version must update to change key and trigger re render
  //     // does version need to be saved in state?
  //     // setVersion(version + 1)
      
  //     // const newStatusArray = [...statusArray]
  //     // // reset statuses to false 
  //     // for (const status of newStatusArray){
  //     //   status['status'] = false
  //     // }
        
  //     // // set statusArray state to updated version
  //     // setStatusArray(updateStatusArray(allIdsArray, newStatusArray))
    
  //     // alteredStationArray will contain stations with updated status.
  //     const alteredStationArray = stationArray.map((station) => {
  //       const newStation = {...station}
  //       const newStationName = newStation['props']['name']
  //       let newStationStatus = newStation['props']['status']['status']
          
  //       // IMPORTANT TO UPDATE KEY TO TRIGGER RE RENDER
  //       // look for match between station gtfs id and gtfs id's in statusArray
  //       for (const status of newStatusArray){
  //           newStationStatus = status['status']
  //           newStation['key'] =  String(newStationName + version)
  //           // newStation['id'] = String(newStationName + version)
  //         }
  //       return newStation
  //     })
  //     setStationArray(alteredStationArray)
  //   }

  //   setTripInfoIndex(0)
  // }, [tripInfo])
  
  if (!nodes || stationArray == []){
    return (
      <>loading</>
    )
  }
 
  return (
    <>
      {/* <h2>MY 3D TRAINS</h2> */}
      {/* <NavBar/> */}
      <Outlet context={{
        stations : stations, 
        version : version, 
        setVersion : setVersion, 
        tripInfoIndex: tripInfoIndex,
        setTripInfoIndex : setTripInfoIndex,
        // statusArray : statusArray, 
        // setStatusArray : setStatusArray, 
        stationArray : stationArray, 
        setStationArray : setStationArray,
        nodes : nodes,
        materials : materials,
        // trip info array passed down
        tripInfo : tripInfo,
        setTripInfo : setTripInfo,
        stationIdStartAndEnd : stationIdStartAndEnd,
        // retrieveId : retrieveId
        vectorPosition : vectorPosition,
        setVectorPositon : setVectorPositon,
        retrieveStationId : retrieveStationId
        }}/>
    </>
  )
}

useGLTF.preload('./public/subway_map_G_7.glb')
export default App

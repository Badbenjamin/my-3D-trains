import { Outlet } from 'react-router-dom'
import React, { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'
// import { useFrame } from '@react-three/fiber'




import './App.css'
// import Station from './Station'
import { getAllIds, createStationComponentsObj} from './ModularFunctions'


function App() {

  // load station and track model. destructure to nodes and materials to create Station component
  // nodes correspond to each geometry in the model
  // each node contains a mesh, which has the properties for that geometry 
  const { nodes, materials } = useGLTF('./subway_map_Map_stations_7_24.glb')
  
  const [stations, setStations] = useState([])
  const [stationArray, setStationArray] = useState([])

  const [version, setVersion] = useState(0)
  const [tripInfo, setTripInfo] = useState([])
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
    setStationIdStartAndEnd((prevState )=> {
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
  useEffect(()=>{
    // newStatusArray is an array of objects with names of stations/meshes and a boolean to determine whether they are selected or not
    // const newStatusArray = createStatusObjectArray(nodes)
    // newMapModelObj contains the info for all the station and track geometries in our scene
    const newMapModelObj = createStationComponentsObj(nodes, materials, retrieveStationId)
    // this loop populates newStationArray with meshes from our newMapModelObject
    const newStationArray = [...stationArray]
    for (const station in newMapModelObj){
      newStationArray.push(newMapModelObj[station])
      };
    // statusArray is set (should be all false, unselected)
    // setStatusArray(newStatusArray)
    // stationArray is set with our newly created Station components from newMapModelObject
    setStationArray(newStationArray)
  }, [])

  // This useEffect listens for a change in tripInfo. 
  // It takes the stations from ttrain schedule and creates an array of GTFS ids that will be passed to the selectStations function
  // selectStations takes an array of gtfs ids and uses it to change the status of the stations in stationArray.
  useEffect(()=>{
    let currentTrip = tripInfo[tripInfoIndex]
    let selectedStationInfoObj = {}
   
    // ad else branch for error
    if (currentTrip && tripInfo.length > 0){
      let startStopId = currentTrip[0].start_station_gtfs
      let endStopId = currentTrip[currentTrip.length - 1].end_station_gtfs
      // each TripSequenceElement is a leg of a trip on one train
      for (let tripSequenceElement of currentTrip){
        console.log('tse', tripSequenceElement)
        const currentTripSchedule = tripSequenceElement.schedule
        const startStationId = tripSequenceElement.start_station_gtfs
        const endStationId = tripSequenceElement.end_station_gtfs
        console.log('cts',currentTripSchedule)
        // ERROR WHEN STATION NOT IN SERVICE!!!
        const justStationIds = currentTripSchedule.map((station) => {
          return station['stop_id'].slice(0,3)
        })
      
        const startIndex = justStationIds.indexOf(startStationId)
        const endIndex = justStationIds.indexOf(endStationId)

        const startStop = currentTripSchedule[startIndex]
        const endStop = currentTripSchedule[endIndex]
        const stopsForLeg = currentTripSchedule.slice(startIndex, endIndex + 1)

        // loop through all stops of a leg
        // keep track of what TSE we are on? 
        for (let stop of stopsForLeg){
          // start stop
          // console.log(selectedStationInfoObj[stop.stop_id.slice(0,3)] in selectedStationInfoObj)
          // console.log(tripSequenceElement)
          if (stop.stop_id.slice(0,3) == startStopId){
            selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
              "stopId" : stop.stop_id.slice(0,3),
              "arrival" : stop.arrival,
              "departure" : stop.departure, 
              "type" : "start",
              "direction_label" : tripSequenceElement.direction_label,
              "route" : tripSequenceElement.route
            } 
          } else if (stop.stop_id.slice(0,3) == endStopId){
            selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
              "stopId" : stop.stop_id.slice(0,3),
              "arrival" : stop.arrival,
              "departure" : stop.departure, 
              "type" : "end",
              "direction_label" : tripSequenceElement.direction_label,
              "route" : tripSequenceElement.route
            }
          }  else if (!(stop.stop_id.slice(0,3) in selectedStationInfoObj) && ((stop.stop_id.slice(0,3) != startStopId || stop.stop_id.slice(0,3) != endStopId) && (stop.stop_id.slice(0,3) == stopsForLeg[0].stop_id.slice(0,3) || stop.stop_id.slice(0,3) == stopsForLeg[stopsForLeg.length -1].stop_id.slice(0,3)))){
            // key overwritten for LtoE transfer because its the same station. 
            // console.log(stop.stop_id.slice(0,3))
            selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
              "stopId" : stop.stop_id.slice(0,3),
              "arrival" : stop.arrival,
              "departure" : stop.departure, 
              "type" : "transfer",
              "second_transfer_info" : [],
              "direction_label" : tripSequenceElement.direction_label,
              "route" : tripSequenceElement.route
            }
          } else if ((stop.stop_id.slice(0,3) in selectedStationInfoObj) && ((stop.stop_id.slice(0,3) != startStopId || stop.stop_id.slice(0,3) != endStopId) && (stop.stop_id.slice(0,3) == stopsForLeg[0].stop_id.slice(0,3) || stop.stop_id.slice(0,3) == stopsForLeg[stopsForLeg.length -1].stop_id.slice(0,3)))){
            // console.log('worked')
            selectedStationInfoObj[stop.stop_id.slice(0,3)].second_transfer_info.push({
              "stopId" : stop.stop_id.slice(0,3),
              "arrival" : stop.arrival,
              "departure" : stop.departure, 
              "type" : "transfer",
              "direction_label" : tripSequenceElement.direction_label,
              "route" : tripSequenceElement.route
            })
          } else if ((stop.stop_id.slice(0,3) != startStopId || stop.stop_id.slice(0,3) != endStopId) && (stop.stop_id.slice(0,3) != stopsForLeg[0].stop_id.slice(0,3) && stop.stop_id.slice(0,3) != stopsForLeg[stopsForLeg.length -1].stop_id.slice(0,3))){
            selectedStationInfoObj[stop.stop_id.slice(0,3)] = {
              "stopId" : stop.stop_id.slice(0,3),
              "arrival" : stop.arrival,
              "departure" : stop.departure, 
              "type" : "passthrough",
              "direction_label" : tripSequenceElement.direction_label,
              "route" : tripSequenceElement.route
            }
          }
        }  
      }
    }

    console.log('sso', selectedStationInfoObj)
    
    // update this to current props
    // START, END, WAYPOINT, NOT IN TRIP
    // map through stationArray and change status of stations that are present in ids from tripInfo
    if (tripInfo != [] && selectedStationInfoObj != {}){
      let newStationArray = stationArray.map((stationGeometry)=>{
        if (stationGeometry.props.name in selectedStationInfoObj){
          let newStationGeometry = React.cloneElement(stationGeometry, {tripInProgress : true, stationInTrip : true, stationInfo : selectedStationInfoObj[stationGeometry.props.name], key : stationGeometry.props.name.toString() + version.toString()})
          setVersion((prevVersion)=>{
            return prevVersion += 1
          })
          return newStationGeometry
        } else {
          let newStationGeometry = React.cloneElement(stationGeometry, {tripInProgress : true, stationInTrip : false, stationInfo : null, key : stationGeometry.props.name.toString() + version.toString()})
          setVersion((prevVersion)=>{
            return prevVersion += 1
          })
          return newStationGeometry
        }
      })

      // console.log(tripInfo != [], tripInfo)
      if((tripInfo.length > 0)){
        setStationArray(newStationArray)
      }
    
    }
  }, [tripInfo, tripInfoIndex])

  function clearTripInfo(){
    // loop through stationArray, reset all stations to default
    let resetStationArray = stationArray.map((stationGeometry)=>{
      let newStation = React.cloneElement(stationGeometry, { 
        key : stationGeometry.props.name.toString() + version.toString(),
        tripInProgress : false,
        stationInTrip : null ,
        stationInfo : null
        })
      setVersion((prevVersion)=>{
        return prevVersion += 1
      })
      return newStation
    })
    // reset tripInfo
    setStationArray(resetStationArray)
    setTripInfo([])
    setTripInfoIndex(0)
    setStationIdStartAndEnd({"startId" : null, "endId" : null})
    // make sure search bar is cleared (probably in component, not here)
  }
  
  if (!nodes || !stationArray){
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
        stationArray : stationArray, 
        setStationArray : setStationArray,
        nodes : nodes,
        materials : materials,
        // trip info array passed down
        tripInfo : tripInfo,
        setTripInfo : setTripInfo,
        stationIdStartAndEnd : stationIdStartAndEnd,
        setStationIdStartAndEnd, setStationIdStartAndEnd,
        vectorPosition : vectorPosition,
        setVectorPositon : setVectorPositon,
        retrieveStationId : retrieveStationId,
        clearTripInfo : clearTripInfo
        }}/>
    </>
  )
}

useGLTF.preload('./public/subway_map_G_7.glb')
export default App

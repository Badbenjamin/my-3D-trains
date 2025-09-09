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
  const { nodes, materials } = useGLTF('./subway_map_TRACK_STATIONS_ONLY_8.25.glb')

  const [stations, setStations] = useState([])
  const [stationArray, setStationArray] = useState([])
  const [version, setVersion] = useState(0)
  const [tripInfo, setTripInfo] = useState([])
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
    // newMapModelObj contains the info for all the station and track geometries in our scene
    const newMapModelObj = createStationComponentsObj(nodes, materials, retrieveStationId)
    // this loop populates newStationArray with meshes from our newMapModelObject
    const newStationArray = [...stationArray]
    for (const station in newMapModelObj){
      newStationArray.push(newMapModelObj[station])
      };
    // statusArray is set (should be all false, unselected)
    // stationArray is set with our newly created Station components from newMapModelObject
    setStationArray(newStationArray)
  }, [])

  // This useEffect listens for a change in tripInfo. Also TripInfoIndex. 
  // It takes the stations from tripInfo train schedule (or tripError), adds them to SelectedStationInfoObj, 
  // then SSInfoObj is used to add stationInfo to the r3F station geometries/components. 
  useEffect(()=>{
    let currentTrip = tripInfo[tripInfoIndex]
    console.log('ti', tripInfo[tripInfoIndex])
    let selectedStationInfoObj = {}
   
    // are there any instances where an impossible trip returns an empty tripInfo vs one with a TripError? 
    if (currentTrip && tripInfo.length > 0){
      let startStopId = currentTrip[0].start_station_gtfs
      let endStopId = currentTrip[currentTrip.length - 1].end_station_gtfs
      // each TripSequenceElement is a leg of a trip on one train
      for (let tripSequenceElement of currentTrip){
        const currentTripSchedule = tripSequenceElement.schedule
        const startStationId = tripSequenceElement.start_station_gtfs
        const endStationId = tripSequenceElement.end_station_gtfs
        let justStationIds = []
        let errorElementObject = null
        if (currentTripSchedule){
          justStationIds = currentTripSchedule.map((station) => {
            return station['stop_id'].slice(0,3)
          })
          // TRIP ERROR BRANCH!!!
        } else {
          errorElementObject = tripSequenceElement
          // justStationIds.push(tripSequenceElement['start_station_gtfs'])
          // justStationIds.push(tripSequenceElement['end_station_gtfs'])
        }

        // take all stops from each train's schedule
        // remove all stops not involved in user's trip
        let startIndex = null
        let endIndex = null
        let startStop = null
        let endStop = null
        let stopsForLeg = null
        if (justStationIds.length > 0){
          startIndex = justStationIds.indexOf(startStationId)
          endIndex = justStationIds.indexOf(endStationId)
          startStop = currentTripSchedule[startIndex]
          endStop = currentTripSchedule[endIndex]
          stopsForLeg = currentTripSchedule.slice(startIndex, endIndex + 1)
        }
        

        // loop through all stops of a leg
        // create stationInfo object key value pair for all stations involved in trip
        // This branch executes for valid tripSequenceElements with stops and info, not tripErrorElements
        if (stopsForLeg != null){
          for (let stop of stopsForLeg){
            
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
          // TURN ERROR INFO INTO SELECTEDSTATIONINFOOBJ INFO
        }   else if ((errorElementObject != null)){
          // if key not in selcectedStationInfoObj and gtfs id matches start id, add start station key value pair to object
          // START ERROR 
          if (!(errorElementObject.start_station_gtfs in selectedStationInfoObj) && errorElementObject.start_station_gtfs === startStopId){
            selectedStationInfoObj[errorElementObject.start_station_gtfs] ={
              "stopId" : errorElementObject.start_station_gtfs,
              "north_bound_service" : errorElementObject.start_north_bound_service,
              "south_bound_service" : errorElementObject.start_south_bound_service,
              "north_direction_label" : errorElementObject.start_north_direction_label,
              "south_direction_label" : errorElementObject.start_south_direction_label,
              "station_to_station_service" : errorElementObject.station_to_station_service,
              "start_station_routes" : errorElementObject.start_station_routes,
              'end_station_routes' : errorElementObject.end_station_routes,
              "type" : "errorStart",

              "start_station_current_routes_north" : errorElementObject.start_station_current_routes_north,
              "start_station_current_routes_south" : errorElementObject.start_station_current_routes_south,
              "end_station_current_routes_north" : errorElementObject.end_station_current_routes_north,
              "end_station_current_routes_south" : errorElementObject.end_station_current_routes_south,
            };
          };

          // if gtfs_stop_id is not start or end gtfs, it must be a transfer
          // find the transfer in the selectedStationINfoObj, and push this to the second_transfer_info array
          // there will only be a transfer if the first leg of the trip is not an error, and the second is
          // TRANSFER ERROR
          if ((errorElementObject.start_station_gtfs != startStopId || errorElementObject.end_station_gtfs != endStopId)){
            for (let selectedStation in selectedStationInfoObj){
              if (selectedStationInfoObj[selectedStation].type === 'transfer'){
                selectedStationInfoObj[selectedStation].second_transfer_info.push({
                  "stopId" : errorElementObject.start_station_gtfs,
                  "north_bound_service" : errorElementObject.start_north_bound_service,
                  "south_bound_service" : errorElementObject.start_south_bound_service,
                  "north_direction_label" : errorElementObject.start_north_direction_label,
                  "south_direction_label" : errorElementObject.start_south_direction_label,
                  "station_to_station_service" : errorElementObject.station_to_station_service,
                  "start_station_routes" : errorElementObject.start_station_routes,
                  'end_station_routes' : errorElementObject.end_station_routes,
                  "type" : "errorTransfer",

                  "start_station_current_routes_north" : errorElementObject.start_station_current_routes_north,
                  "start_station_current_routes_south" : errorElementObject.start_station_current_routes_south,
                  "end_station_current_routes_north" : errorElementObject.end_station_current_routes_north,
                  "end_station_current_routes_south" : errorElementObject.end_station_current_routes_south,
                });
              }
            }
            
          }; 
          // if gtfs_stop_id == endStopId then add this to the selectedStationInfoObj 
          // END ERROR
          if (!(errorElementObject.end_station_gtfs in selectedStationInfoObj) && errorElementObject.end_station_gtfs === endStopId){
            selectedStationInfoObj[errorElementObject.end_station_gtfs] ={
              "stopId" : errorElementObject.end_station_gtfs,
              "north_bound_service" : errorElementObject.end_north_bound_service,
              "south_bound_service" : errorElementObject.end_south_bound_service,
              "north_direction_label" : errorElementObject.end_north_direction_label,
              "south_direction_label" : errorElementObject.end_south_direction_label,
              "station_to_station_service" : errorElementObject.station_to_station_service,
              "start_station_routes" : errorElementObject.start_station_routes,
              "end_station_routes" : errorElementObject.end_station_routes,
              "type" : "errorEnd",

              "start_station_current_routes_north" : errorElementObject.start_station_current_routes_north,
              "start_station_current_routes_south" : errorElementObject.start_station_current_routes_south,
              "end_station_current_routes_north" : errorElementObject.end_station_current_routes_north,
              "end_station_current_routes_south" : errorElementObject.end_station_current_routes_south,
            }
          };

          
        }
      }
      
    } else {
      // NO TRIP INFO RETURNED, NO ERRORS, MAYBE CREATE DIALOGE POPUP?
      console.log('trip info empty')
      return
    }
    // CREATE NEW STATION ARRAY WITH INFO FROM USER'S TRIP (tripInfo)
    // map through stationArray and change status of stations that are present in ids from tripInfo
    // selcetedStationInfoObj contains info for stations involved in trip, whether, start, end, transfer, passthrough, errorStart, errorEnd, or errorTransfer
    // all stations involved in a trip will have stationInfo prop containing thesir info
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
    setStationArray(resetStationArray)
    setTripInfo([])
    setTripInfoIndex(0)
    setStationIdStartAndEnd({"startId" : null, "endId" : null})
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

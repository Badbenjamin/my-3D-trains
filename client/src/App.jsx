import { Outlet } from 'react-router-dom'
import { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'




import './App.css'
import Station from './Station'
import { getAllIds, createStatusObjectArray, createStationComponentsObj, updateStatusArray, getStationCode} from './ModularFunctions'


function App() {

  // load station and track model. destructure to nodes and materials to create Station component
  // nodes correspond to each geometry in the model
  // each node contains a mesh, which has the properties for that geometry 
  const { nodes, materials } = useGLTF('./subway_map_stations_tracks_1.glb')
  
  const [stations, setStations] = useState([])
  const [stationArray, setStationArray] = useState([])
  const [statusArray, setStatusArray] = useState([])
  const [version, setVersion] = useState(0)
  const [tripInfo, setTripInfo] = useState([])
  const [tripInfoIndex, setTripInfoIndex] = useState(0)
  const [stationIdStartAndEnd, setStationIdStartAndEnd] = useState({"startId" : null, "endId" : null})
  const [vectorPosition, setVectorPositon] = useState({})
  console.log('sid start and end', stationIdStartAndEnd)
  // console.log('sa', statusArray)

  // get station info for trip planner  for station search. 
  useEffect(() => {
    // remove local host for deployment
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
  }, [])

    // look into how this is used 
    // This is triggered when ToolTip origin or dest button is clicked
  function retrieveStationId(id, startOrEnd) {
    console.log('rsid func', id, startOrEnd)
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
  
  // console.log('start or end',stationIdStartAndEnd)

  // useEffect(()=>{
  //   setStationIdStartAndEnd(stationIdStartOrEnd['startId'])
  // }, [stationIdStartAndEnd])

  // build stationArray of 3D station components for LinesAndMap
  // this useEffect creates Station objects for each geometry in our model
  useEffect(()=>{
    // newStatusArray is an array of objects with names of stations/meshes and a boolean to determine whether they are selected or not
    const newStatusArray = createStatusObjectArray(nodes)
    // newMapModelObj contains the info for all the station and track geometries in our scene
    const newMapModelObj = createStationComponentsObj(nodes, materials, newStatusArray, retrieveStationId)
    // this loop populates newStationArray with meshes from our newMapModelObject
    const newStationArray = [...stationArray]
    for (const station in newMapModelObj){
      newStationArray.push(newMapModelObj[station])
      };
    // statusArray is set (should be all false, unselected)
    setStatusArray(newStatusArray)
    // stationArray is set with our newly created Station components from newMapModelObject
    setStationArray(newStationArray)
  }, [])

  // This useEffect listens for a change in tripInfo. 
  // It takes the stations from ttrain schedule and creates an array of GTFS ids that will be passed to the selectStations function
  // selectStations takes an array of gtfs ids and uses it to change the status of the stations in stationArray.

  useEffect(()=>{
    console.log('ti',tripInfo[tripInfoIndex])
    // trip info contains trains, which contain schedules.
    // schedules are used to select meshes to be highlighted in our map.
    if (tripInfo == []){
      return 
      // added [0] to deal with list?
    } else if (tripInfo[tripInfoIndex]) {
      console.log('worked')
      let allIdsArray = []
      // Trigger some sort of animation change with errors?
      let allErrorsArray = []

      for (let leg of tripInfo[tripInfoIndex]){
        if(leg.schedule){
          for (let id of getAllIds(leg,statusArray)){
            allIdsArray.push(id)
          }
        } else {
          console.log('error')
          // allErrorsArray.push(leg.error)
        }
      }
      
      // version must update to change key and trigger re render
      // does version need to be saved in state?
      setVersion(version + 1)
      
      const newStatusArray = [...statusArray]
      // reset statuses to false 
      for (const status of newStatusArray){
        status['status'] = false
      }
        
      // set statusArray state to updated version
      setStatusArray(updateStatusArray(allIdsArray, newStatusArray))
    
      // alteredStationArray will contain stations with updated status.
      const alteredStationArray = stationArray.map((station) => {
        const newStation = {...station}
        const newStationName = newStation['props']['name']
        let newStationStatus = newStation['props']['status']['status']
          
        // IMPORTANT TO UPDATE KEY TO TRIGGER RE RENDER
        // look for match between station gtfs id and gtfs id's in statusArray
        for (const status of newStatusArray){
            newStationStatus = status['status']
            newStation['key'] =  String(newStationName + version)
            // newStation['id'] = String(newStationName + version)
          }
        return newStation
      })
      console.log('asa', alteredStationArray)
      setStationArray(alteredStationArray)
    }
  }, [tripInfoIndex])

  useEffect(()=>{
    if (tripInfo == []){
      return 
      // added [0] to deal with list?
    } else if (tripInfo[tripInfoIndex]) {
      console.log('worked')
      let allIdsArray = []
      // Trigger some sort of animation change with errors?
      let allErrorsArray = []

      for (let leg of tripInfo[tripInfoIndex]){
        if(leg.schedule){
          for (let id of getAllIds(leg,statusArray)){
            allIdsArray.push(id)
          }
        } else {
          console.log('error')
          // allErrorsArray.push(leg.error)
        }
      }
      
      // version must update to change key and trigger re render
      // does version need to be saved in state?
      setVersion(version + 1)
      
      const newStatusArray = [...statusArray]
      // reset statuses to false 
      for (const status of newStatusArray){
        status['status'] = false
      }
        
      // set statusArray state to updated version
      setStatusArray(updateStatusArray(allIdsArray, newStatusArray))
    
      // alteredStationArray will contain stations with updated status.
      const alteredStationArray = stationArray.map((station) => {
        const newStation = {...station}
        const newStationName = newStation['props']['name']
        let newStationStatus = newStation['props']['status']['status']
          
        // IMPORTANT TO UPDATE KEY TO TRIGGER RE RENDER
        // look for match between station gtfs id and gtfs id's in statusArray
        for (const status of newStatusArray){
            newStationStatus = status['status']
            newStation['key'] =  String(newStationName + version)
            // newStation['id'] = String(newStationName + version)
          }
        return newStation
      })
      console.log('asa', alteredStationArray)
      setStationArray(alteredStationArray)
    }

    setTripInfoIndex(0)
  }, [tripInfo])

          // console.log('vp', vectorPosition)
          
      


  // function retrieveId(id, startOrEnd){
  //    console.log(id, startOrEnd)
  //   }
  // console.log(typeof(retrieveId))

  // let retrieveId = "STRING"
  
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
        statusArray : statusArray, 
        setStatusArray : setStatusArray, 
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

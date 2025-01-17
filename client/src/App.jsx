import { Outlet } from 'react-router-dom'
import { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'


import './App.css'
import Station from './Station'
import { getAllIds, createStatusObjectArray, createStationComponentsObj } from './ModularFunctions'


function App() {

  // load station and track model. destructure to nodes and materials to create Station component
  // nodes correspond to each geometry in the model
  // each node contains a mesh, which has the properties for that geometry 
  const { nodes, materials } = useGLTF('./public/subway_map_G_7.glb')

  const [stations, setStations] = useState([])
  const [stationArray, setStationArray] = useState([])
  const [statusArray, setStatusArray] = useState([])
  const [version, setVersion] = useState(0)
  const [tripInfo, setTripInfo] = useState([])
  
  // get station info for trip planner for station search. 
  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
  }, [])

  // build stationArray of 3D station components for LinesAndMap
  // this useEffect creates Station objects for each geometry in our model
  // basically, we loop through our model and create Station components (with status attatched), and store them in our mapModelObject.
  // then we loop 
  useEffect(()=>{
    
    // newStatusArray is an array of objects with names of stations/meshes and a boolean to determine whether they are selected or not
    const newStatusArray = createStatusObjectArray(nodes)
    // newMapModelObj contains the info for all the station and track geometries in our scene
    const newMapModelObj = createStationComponentsObj(nodes, materials, newStatusArray)
  
    // this loop populates stationArray with meshes
    // Do I need this or could I just use the object instead of an array?
    // I think that I loop through the array to create compnents in another component. 
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
  // CHECK ON THIS TOMORROW. 
  useEffect(()=>{
    // trip info contains trains, which contain schedules
    if (tripInfo == []){
      return 
    } else if (tripInfo[0]?.schedule){
      let allIdsArray = []
      if (tripInfo.length == 1){
        allIdsArray = getAllIds(tripInfo[0], statusArray);
      } else if (tripInfo.length == 2){
        allIdsArray = getAllIds(tripInfo[0], statusArray).concat(getAllIds(tripInfo[1], statusArray));
      }
      
      // put this function here for scope to local variables
      // examine whether or not I can move this to ModularFunctions
      function selectStations(selectedIdArray){
        // version must update to change key and trigger re render
        function updateVersion(){
            setVersion(version + 1)
        }
        updateVersion()
        
        const newStatusArray = [...statusArray]
        
        // reset statuses to false 
        for (const status of newStatusArray){
          status['status'] = false
        }
        
        // if station is included in array of stations in trip, set station or track status to true
        for (const name of selectedIdArray){
            for (const status of newStatusArray){
                // for station meshes
                if (name === status['name']){
                    status['status'] = true
                // for track meshes
                } else if (name === status['name'].slice(0,4)){
                  status['status'] = true
                } 
            }
        }
        setStatusArray(newStatusArray)
    
        // alteredStationArray will contain stations with updated status.
        const alteredStationArray = stationArray.map((station, i) => {
  
            const newStation = {...station}
            const newStationName = newStation['props']['name']
            let newStationStatus = newStation['props']['status']['status']
            
            // IMPORTANT TO UPDATE KEY TO TRIGGER RE RENDER
            // look for match between station gtfs id and gtfs id's in statusArray
            for (const status of newStatusArray){
              newStationStatus = status['status']
              newStation['key'] =  String(newStationName + version)
              newStation['id'] = String(newStationName + version)
            }
            return newStation
        })
        setStationArray(alteredStationArray)
      }
      selectStations(allIdsArray)
    }
  }, [tripInfo])

  if (!nodes || !stationArray){
    return (
      <>loading</>
    )
  }
 
  return (
    <>
      <h2>MY 3D TRAINS</h2>
      {/* <NavBar/> */}
      <Outlet context={{
        stations : stations, 
        version : version, 
        setVersion : setVersion, 
        statusArray : statusArray, 
        setStatusArray : setStatusArray, 
        stationArray : stationArray, 
        setStationArray : setStationArray,
        nodes : nodes,
        materials : materials,
        tripInfo : tripInfo,
        setTripInfo : setTripInfo,
        }}/>
    </>
  )
}

useGLTF.preload('./public/subway_map_G_7.glb')
export default App

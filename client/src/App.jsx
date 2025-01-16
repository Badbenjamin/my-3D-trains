import { Outlet } from 'react-router-dom'
import { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'


import './App.css'
import Station from './Station'
import { getAllIds, } from './ModularFunctions'


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
  // console.log("app trip info", tripInfo)
  console.log("sta", stationArray)

  // get station info for trip planner for station search. 
  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
  }, [])

  // build stationArray of 3D station components for LinesAndMap
  // this useEffect creates Station objects for each geometry in our model
  useEffect(()=>{
    // newMapModelObj is an object that conains the info for all the 
    const newMapModelObj ={}
    // newStatusArray is an array of objects with names of stations/meshes and a boolean to determine whether they are selected or not
    const newStatusArray = []
    
    // this loop creates a status object for each mesh in nodes from our model import and pushes to newStatusArray
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            const status = {"name": nodes[mesh].name, "status": false}
            newStatusArray.push(status)   
        } 
      };
    
    // this loop creates Station components for every mesh in the nodes from our model import.
    // what are count and index doing here? Might be assigning a status from newStatusArray?
    let count = 0
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            let index = count 
            count += 1
            newMapModelObj[mesh] = <Station name={nodes[mesh].name} 
                                            status={newStatusArray[index]} 
                                            // index={[index]} 
                                            id={nodes[mesh].name} 
                                            key={nodes[mesh].name} 
                                            mesh={nodes[mesh]} 
                                            materials={materials}/>
            console.log("nmmo mesh",newMapModelObj[mesh])
        } 
        
      };

      // LEFT OFF HERE. WHAT IS GOING ON HERE?
    const newStationArray = [...stationArray]
    for (const station in newMapModelObj){
      if (!newStationArray.includes(station)){
          newStationArray.push(newMapModelObj[station])
      }
    };
    setStatusArray(newStatusArray)
    setStationArray(newStationArray)
    
  }, [])

  // This useEffect listens for a change in tripInfo. 
  // It takes the stations from ttrain schedule and creates an array of GTFS ids that will be passed to the selectStations function
  // selectStations takes an array of gtfs ids and uses it to change the status of the stations in stationArray.
  // I WILL NEED TO CLEAN THIS UP, PUT EVERYTHING INTO FUNCTIONS, AND REBUILD.
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

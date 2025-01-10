import { Outlet } from 'react-router-dom'
import { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'


import './App.css'
import Station from './Station'
import { getAllIds } from './ModularFunctions'


function App() {

  // load station and track model. destructure to nodes and materials to create Station component
  const { nodes, materials } = useGLTF('./public/subway_map_G_7.glb')

  const [stations, setStations] = useState([])
  const [stationArray, setStationArray] = useState([])
  const [statusArray, setStatusArray] = useState([])
  const [version, setVersion] = useState(0)
  const [tripInfo, setTripInfo] = useState([])
  console.log("app trip info", tripInfo)
  console.log("sa", statusArray)

  // get station info for trip planner for station search. 
  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
  }, [])

  // build stationArray of 3D station components for LinesAndMap
  useEffect(()=>{
    const newStationObj ={}
    const newStatusArray = []

    let count = 0
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            const status = {"name": nodes[mesh].name, "status": false}
            newStatusArray.push(status)   
        } 
      };
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            let index = count 
            count += 1
            newStationObj[mesh] = <Station name={nodes[mesh].name} status={newStatusArray[index]} index={[index]} id={nodes[mesh].name} key={nodes[mesh].name} nodes={nodes} mesh={nodes[mesh]} materials={materials}/>
        } 
      };
     const newStationArray = [...stationArray]

     for (const station in newStationObj){
        // why is station array an object?
        if (!newStationArray.includes(station)){
            newStationArray.push(newStationObj[station])
        }
     };
    setStatusArray(newStatusArray)
    setStationArray(newStationArray)
    
  }, [])

  // This useEffect listens for a change in tripInfo, which is an array of trains going from start station to end station, in order of closest destination arrival time. 
  // It takes the stations from the first train and creates an array of GTFS ids that will be passed to the selectStations function
  // selectStations takes an array of gtfs ids and uses it to change the status of the stations in stationArray.
  // ADD INDEX to be able to switch to next train, maybe as state?
  // I WILL NEED TO CLEAN THIS UP, PUT EVERYTHING INTO FUNCTIONS, AND REBUILD.
  useEffect(()=>{
    // trip info contains trains, which contain schedules
    console.log("tilen",tripInfo.length)
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
      {/* destructure the context later */}
      {/* <Outlet context={{stations : stations, version, setVersion, statusArray, setStatusArray, stationArray, setStationArray ,nodes, materials, tripInfo, setTripInfo}}/> */}
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

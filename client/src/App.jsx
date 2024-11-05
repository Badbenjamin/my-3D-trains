import { Outlet } from 'react-router-dom'
import { useState, useEffect} from 'react'
import { useGLTF } from '@react-three/drei'


import './App.css'
import Station from './Station'



function App() {

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

  // build stationArray for LinesAndMap
  // 
  useEffect(()=>{
    const newStationObj ={}
    const newStatusArray = []

    let count = 0
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            const status = {"name": nodes[mesh].name, "status": false}
            newStatusArray.push(status)
            
        } 
      }
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            let index = count 
            count += 1
            newStationObj[mesh] = <Station name={nodes[mesh].name} status={newStatusArray[index]} index={[index]} id={nodes[mesh].name} key={nodes[mesh].name} nodes={nodes} mesh={nodes[mesh]} materials={materials}/>
            
        } 
      }
     const newStationArray = [...stationArray]

     for (const station in newStationObj){
        // why is station array an object?
        if (!newStationArray.includes(station)){
            newStationArray.push(newStationObj[station])
        }
     }
    setStatusArray(newStatusArray)
    setStationArray(newStationArray)
    
  }, [])

  // This useEffect listens for a change in tripInfo, which is an array of trains going from start station to end station, in order of soonest arrival time. 
  // it creates new Station objects with status updated from statusArray. 
  // False keeps stations their natural color. True highlights the trip route. 
  // ADD INDEX to be able to switch to next train, maybe as state?
  console.log("SA", statusArray)
  useEffect(()=>{
    if (tripInfo == []){
      return 
    } else if (tripInfo[0]?.schedule){
      // tripInfo[0] is the first train to arrive at our chosen start station
      const currentTripSchedule = tripInfo[0].schedule
      const startStation = tripInfo[0].start_station_gtfs
      const endStation = tripInfo[0].end_station_gtfs
      // gtfs ids without N or S 
      const justStationIds = currentTripSchedule.map((station) => {
          return station['stop_id'].slice(0,3)
        })
      const startIndex = justStationIds.indexOf(startStation)
      const endIndex = justStationIds.indexOf(endStation)
      // Only stations between start statio and end station
      const selectedStationArray = justStationIds.slice(startIndex, endIndex + 1)
      const direction = tripInfo[0].schedule[0]['stop_id'].slice(3,4)
      
      // Only tracks between start station and end station
      const justTrackIds = selectedStationArray.map((stationId) => {
        const stationAndDirection = stationId + direction
   
        for (const status of statusArray){
          if (status['name'].includes(stationAndDirection)){
            return status['name']
          }
        }
      })
      
      // complete array of all meshes to be selected, stations + tracks
      const allIdsArray = selectedStationArray.concat(justTrackIds)
      
      // put this function here for scope to local variables
      function selectStations(array){
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
        
        // if station is included in array, set station or track status to true
        for (const name of array){
            for (const status of newStatusArray){
                
                if (name === status['name']){
                    status['status'] = true
                } else if (name === status['name'].slice(0,4)){
                  status['status'] = true
                } 
            }
        }
        setStatusArray(newStatusArray)
    
        const newStationArray = [...stationArray]
      
        const alteredStationArray = newStationArray.map((station, i) => {
  
            const newStation = {...station}
            const newStationName = newStation['props']['name']
            let newStationStatus = newStation['props']['status']['status']
            
            // IMPORTANT TO UPDATE KEY TO TRIGGER RE RENDER
            for (const status of newStatusArray){
                if (status['name'] === newStationName){
                    newStationStatus = status['status']
                    newStation['key'] =  String(newStationName + version)
                    newStation['id'] = String(newStationName + version)
                } else {
                    newStation['key'] = String(newStationName + version)
                    newStation['id'] = String(newStationName + version)
                }
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
      <Outlet context={[stations, version, setVersion, statusArray, setStatusArray, stationArray, setStationArray ,nodes, materials, tripInfo, setTripInfo]}/>
    </>
  )
}

useGLTF.preload('./public/subway_map_G_7.glb')
export default App

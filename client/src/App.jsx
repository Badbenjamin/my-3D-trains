import { Outlet } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'


import './App.css'
import MapExperience from './MapExperience'
import NavBar from './NavBar'
import Station from './Station'



function App() {

  const { nodes, materials } = useGLTF('./public/subway_map_just_G_Line_Stations+Tracks.glb')
  
  
  

  const [stations, setStations] = useState([])

  // from GLine, pass functions down!
  const [stationArray, setStationArray] = useState([])
  const [statusArray, setStatusArray] = useState([])
  const [version, setVersion] = useState(0)
  const [selectedMeshes, setSelectedMeshes] = useState([])
  const [tripInfo, setTripInfo] = useState([])

  console.log(tripInfo)

  // get station info for trip planner
  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
      console.log('fetch')
  }, [])

  // build stationArray for LinesAndMap
  useEffect(()=>{
    
    const newStationObj ={}
    const newStatusArray = []

    function setStatus(func){
        console.log(func)
    }

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
            newStationObj[mesh] = <Station setStatus={setStatus} name={nodes[mesh].name} status={newStatusArray[index]} index={[index]} key={nodes[mesh].name} nodes={nodes} mesh={nodes[mesh]} materials={materials}/>
            
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

  useEffect(()=>{
    console.log("trip_info", tripInfo)
    if (tripInfo == []){
      return 
    } else if (tripInfo[0]?.schedule){
      console.log(tripInfo[0])
      const currentTripSchedule = tripInfo[0].schedule
      const startStation = tripInfo[0].start_station_gtfs
      const endStation = tripInfo[0].end_station_gtfs
      const justStationIds = currentTripSchedule.map((station) => {
          return station['stop_id'].slice(0,3)
        })
      const startIndex = justStationIds.indexOf(startStation)
      const endIndex = justStationIds.indexOf(endStation)
      const stationArray = justStationIds.slice(startIndex, endIndex + 1)
      const direction = tripInfo[0].schedule[0]['stop_id'].slice(3,4)
      
      // need to add status['name'] to array if it contatns stationAndDirection
      console.log(statusArray)
      const justTrackIds = stationArray.map((stationId) => {
        const stationAndDirection = stationId + direction
        // use this variable to match to track mesh id
        console.log(stationAndDirection)
        for (const status of statusArray){
          if (status['name'].includes(stationAndDirection)){
            return status['name']
          }
        }
      })
      
      const allIdsArray = stationArray.concat(justTrackIds)
      selectStations(allIdsArray)
    }
  
  }, [tripInfo])

  function selectStations(array){
    function updateVersion(){
        setVersion(version + 1)
    }
    updateVersion()
    console.log(array)

    const newStatusArray = [...statusArray]
    for (const status of newStatusArray){
        status['status'] = false
    }
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
    // console.log(statusArray)
    const alteredStationArray = newStationArray.map((station, i) => {
        // console.log(station)
        const newStation = {...station}
        const newStationName = newStation['props']['name']
        let newStationStatus = newStation['props']['status']['status']
        for (const status of newStatusArray){
            if (status['name'] === newStationName){
                newStationStatus = status['status']
                console.log(newStation['key'])
                newStation['key'] =  version
            }
        }
        return newStation
    })
    setStationArray(alteredStationArray)
  }
  if (!nodes || !stationArray){
    return (
      <>loading</>
    )
  }
  // console.log(stations)
  return (
    <>
      <NavBar/>
      <Outlet context={[stations, version, setVersion, statusArray, setStatusArray, stationArray, setStationArray ,nodes, materials, tripInfo, setTripInfo]}/>
    </>
  )
}

useGLTF.preload('./public/subway_map_just_G_Line_Stations+Tracks.glb')
export default App

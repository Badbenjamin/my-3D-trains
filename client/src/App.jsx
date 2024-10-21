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

  console.log(stationArray)

  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
      console.log('fetch')
  }, [])

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
  if (!nodes || !stationArray){
    return (
      <>loading</>
    )
  }
  // console.log(stations)
  return (
    <>
      <NavBar/>
      <Outlet context={[stations, version, setVersion, statusArray, setStatusArray, stationArray, setStationArray ,nodes, materials]}/>
    </>
  )
}

useGLTF.preload('./public/subway_map_just_G_Line_Stations+Tracks.glb')
export default App

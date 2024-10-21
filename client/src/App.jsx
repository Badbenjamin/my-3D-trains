import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'


import './App.css'
import MapExperience from './MapExperience'
import NavBar from './NavBar'




function App() {
  const [stations, setStations] = useState([])

  useEffect(() => {
    fetch("http://127.0.0.1:5555/api/stations")
      .then(response => response.json())
      .then(stationsData => setStations(stationsData))
      console.log('fetch')
  }, [])

  // console.log(stations)
  return (
    <>
      <NavBar/>
      <Outlet context={[stations]}/>
    </>
  )
}

export default App

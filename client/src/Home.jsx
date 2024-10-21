import JourneyPlanner from "./JourneyPlanner"
import { useState, useEffect } from "react"

function Home() {
    const [stations, setStations] = useState([])

    useEffect(() => {
        fetch("http://127.0.0.1:5555/api/stations")
          .then(response => response.json())
          .then(stationsData => setStations(stationsData))
          console.log('fetch')
      }, [])


    return (
        <>
            <JourneyPlanner stations={stations}/>
        </>
    )
}

export default Home
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import './Component.css'
import StationSearch from "./StationSearch";
import TripInfo from "./TripInfo";



function JourneyPlanner() {
    
    const  [stations]  = useOutletContext()
    const [journeyStations, setJourneyStations] = useState([null, null])
    const [tripInfo, setTripInfo] = useState([])
    // console.log(stations)
    // console.log(journeyStations)
  
    function getStations(station, position){
        console.log(station.pos.position)
        const journey = [...journeyStations]
        if (station.pos.position === 'start'){
            journey[0] = station.value;
        } else if (station.pos.position == 'end'){
            journey[1] = station.value;
        }
        
    setJourneyStations(journey)
    }

    function planTrip(e){
        console.log(journeyStations)
        if (journeyStations[0] == null || journeyStations[1] == null){
            console.log('enter start and end stations')
        } else{
            fetch(`api/plan_trip/${journeyStations[0]}/${journeyStations[1]}`)
            .then(response => response.json())
            .then(stopData => setTripInfo(stopData))
        }
    }

    console.log(tripInfo)

    return (
        <div>
            {tripInfo[0] !== undefined ? <TripInfo tripInfo={tripInfo}/> : ""}
            <br></br>
            <div className='journey-planner'>
                <h2>Start Station</h2>
                <StationSearch stations={stations} getStations={getStations} position={"start"}/>
                <h2>End Station</h2>
                <StationSearch stations={stations} getStations={getStations} position={"end"}/>
                <br></br>
                <button onClick={planTrip}>Plan Trip</button>
            </div>
        </div>

    )
}

export default JourneyPlanner
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import './Component.css'
import StationSearch from "./StationSearch";
import TripInfo from "./TripInfo";



function JourneyPlanner() {

    const {tripInfo, stations, setTripInfo} = useOutletContext()
    
    const [journeyStations, setJourneyStations] = useState([null, null])
    
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
            console.log("fetching")
            fetch(`api/plan_trip/${journeyStations[0]}/${journeyStations[1]}`)
            .then(response => response.json())
            .then(stopData => setTripInfo(stopData))
        }
    }


    return (
        <div>
            <div className='journey-planner'>
                <StationSearch className='station_search' stations={stations} getStations={getStations} position={"start"}/>
                <StationSearch className='station_search' stations={stations} getStations={getStations} position={"end"}/>
                <br></br>
                <button className="plan-trip-button" onClick={planTrip}>Plan Trip</button>
            </div>
            {tripInfo != undefined ? <TripInfo className='trip-info' tripInfo={tripInfo}/> : ""}
        </div>

    )
}

export default JourneyPlanner
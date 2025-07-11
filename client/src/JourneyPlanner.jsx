import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import './Component.css'
import StationSearch from "./StationSearch";
import TripInfo from "./TripInfo";
import NextTrains from "./NextTrains";



function JourneyPlanner() {

    const {tripInfo, stations, setTripInfo, stationIdStartAndEnd, tripInfoIndex, setTripInfoIndex, clearTripInfo} = useOutletContext()
    const [journeyStations, setJourneyStations] = useState([null, null])
    
    // 
    function setStartOrEndStation(stationValue, position){
        const journey = [...journeyStations]
        if (position === 'start'){
            journey[0] = stationValue;
        } else if (position == 'end'){
            journey[1] = stationValue;
        }
    setJourneyStations(journey)
    }

    // stationIdStartAndEnd passed down from app.jsx
    // sets journeyStations, which are used in fetch to plan trip
    useEffect(()=>{
        let newJourney = [...journeyStations]
        newJourney[0] = stationIdStartAndEnd['startId']
        newJourney[1] = stationIdStartAndEnd['endId']
        setJourneyStations(newJourney)
    }, [stationIdStartAndEnd])

    function planTrip(e){
        if (journeyStations[0] == null || journeyStations[1] == null){
            console.log('enter start and end stations')
        } else{
            console.log("fetching")
            fetch(`api/plan_trip/${journeyStations[0]}/${journeyStations[1]}`)
            .then(response => response.json())
            .then(stopData => setTripInfo(stopData))
        }
    }

    function handleClearClick(){
        clearTripInfo()
    }


    return (
        <div>
            
            <div className='journey-planner'>
                <StationSearch className='station_search' stations={stations} setStartOrEndStation={setStartOrEndStation} stationId={stationIdStartAndEnd['startId']} position={"start"}/>
                <StationSearch className='station_search' stations={stations} setStartOrEndStation={setStartOrEndStation} stationId={stationIdStartAndEnd['endId']} position={"end"}/>
                <br></br>
                <button className="plan-trip-button" onClick={planTrip}>Plan Trip</button>
                <button className="plan-trip-button" onClick={handleClearClick}>Clear Trip</button>
            </div>
            {tripInfo[tripInfoIndex] != undefined ? <TripInfo className='trip-info' tripInfo={tripInfo} tripInfoIndex={tripInfoIndex}/> : ""}
            
            <NextTrains tripInfo={tripInfo} tripInfoIndex={tripInfoIndex} setTripInfoIndex={setTripInfoIndex}/>
            
        </div>

    )
}

export default JourneyPlanner
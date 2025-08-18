import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
// import './Component.css'
import './App.css'
import StationSearch from "./StationSearch";
import TripInfo from "./TripInfo";
import NextTrains from "./NextTrains";




function JourneyPlanner() {

    const {tripInfo, stations, setTripInfo, stationIdStartAndEnd, tripInfoIndex, setTripInfoIndex, clearTripInfo} = useOutletContext()
    const [journeyStations, setJourneyStations] = useState([null, null])
  
    // stationIdStartAndEnd is from app.jsx and is the tooltip set station
    function setStartOrEndStation(stationValue, position){
  
        setJourneyStations((prevJourney)=>{
            let newJourney = [...prevJourney]
            if (position == 'start'){
                newJourney[0] = stationValue;
            } else if (position == 'end'){
                newJourney[1] = stationValue;
            }
            return newJourney
        })
    }


    // FOR TT SET?
    // stationIdStartAndEnd passed down from app.jsx
    // sets journeyStations, which are used in fetch to plan trip
    useEffect(()=>{

        let newJourneyStations = [...journeyStations]

        if (stationIdStartAndEnd['startId']){
            newJourneyStations[0] = stationIdStartAndEnd['startId']
        }
        if (stationIdStartAndEnd['endId']){
            newJourneyStations[1] = stationIdStartAndEnd['endId']
        }
        setJourneyStations(newJourneyStations)
        // but how do I pass this down and make sure selected Option stays in sync?
    }, [stationIdStartAndEnd])

    function planTrip(e){
        if (journeyStations[0] == null || journeyStations[1] == null){
            console.log('enter start and end stations')
        } else{
            console.log("fetching")
            fetch(`api/plan_trip/${journeyStations[0]}/${journeyStations[1]}`)
            .then(response => response.json())
            .then(tripInfo => setTripInfo(tripInfo))
        }
        setTripInfoIndex(0)
    }

    function handleClearClick(){
        clearTripInfo()
        setJourneyStations((prevJourney)=>{
           return [null,null]
        })
        // clear complex TT, clear Station TT
        
    }

    function handleReverseClick(){
        setJourneyStations([journeyStations[1], journeyStations[0]])
    }


    return (
        <div className="journey-planner-and-trip-info-container">
            
            <div className='journey-planner'>
                {/* pass journeyStations down to stationSearch so that it knows when they have been cleared? */}
                <StationSearch className='station_search' journeyStations={journeyStations} stations={stations} setStartOrEndStation={setStartOrEndStation} stationId={stationIdStartAndEnd['startId']} position={"start"}/>
                <button className="plan-trip-button" onClick={handleReverseClick}>⮂</button>
                <StationSearch className='station_search' journeyStations={journeyStations} stations={stations} setStartOrEndStation={setStartOrEndStation} stationId={stationIdStartAndEnd['endId']} position={"end"}/>
                <br></br>
                <button className="plan-trip-button" onClick={planTrip}>Plan Trip</button>
                <button className="plan-trip-button" onClick={handleClearClick}>Clear Trip</button>
            </div>
            <div className="trip-info">
                {tripInfo[tripInfoIndex] != undefined ? <TripInfo className='trip-info' tripInfo={tripInfo} tripInfoIndex={tripInfoIndex}/> : ""}
                <NextTrains tripInfo={tripInfo} tripInfoIndex={tripInfoIndex} setTripInfoIndex={setTripInfoIndex}/>
            </div>
            
            
        </div>

    )
}

export default JourneyPlanner
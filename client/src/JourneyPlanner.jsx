import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import './Component.css'
import StationSearch from "./StationSearch";
import TripInfo from "./TripInfo";
import NextTrains from "./NextTrains";



function JourneyPlanner() {

    const {tripInfo, stations, setTripInfo, stationIdStartAndEnd, tripInfoIndex, setTripInfoIndex} = useOutletContext()
    //
    console.log('jp sid',stationIdStartAndEnd)
    // look if this is an "option" number and not a gtfs id
    const [journeyStations, setJourneyStations] = useState([null, null])
    console.log('js', journeyStations)
    
    function getStations(stationValue, position){
        console.log('get stations', stationValue, position)

        
        const journey = [...journeyStations]
        if (position === 'start'){
            journey[0] = stationValue;
        } else if (position == 'end'){
            journey[1] = stationValue;
        }
        console.log('journey', journey)
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

    // function handleNextTrainClick(){
    //     if (tripInfoIndex < tripInfo.length - 1){
    //         setTripInfoIndex(tripInfoIndex + 1)
    //     } 
        
    // }

    // function handlePrevTrainClick(){
    //     if (tripInfoIndex != 0){
    //         setTripInfoIndex(tripInfoIndex - 1)
    //     } 
        
    // }

    return (
        <div>
            
            <div className='journey-planner'>
                <StationSearch className='station_search' stations={stations} getStations={getStations} stationId={stationIdStartAndEnd['startId']} position={"start"}/>
                <StationSearch className='station_search' stations={stations} getStations={getStations} stationId={stationIdStartAndEnd['endId']} position={"end"}/>
                <br></br>
                <button className="plan-trip-button" onClick={planTrip}>Plan Trip</button>
            </div>
            {tripInfo[tripInfoIndex] != undefined ? <TripInfo className='trip-info' tripInfo={tripInfo} tripInfoIndex={tripInfoIndex}/> : ""}
            
            <NextTrains tripInfo={tripInfo} tripInfoIndex={tripInfoIndex} setTripInfoIndex={setTripInfoIndex}/>
            
        </div>

    )
}

export default JourneyPlanner
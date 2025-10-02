import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
// import './Component.css'
import './App.css'
import StationSearch from "./StationSearch";
import TripInfo from "./TripInfo";
import NextTrains from "./NextTrains";
import M3dtLogo from "./M3dtLogo";
import {Canvas} from '@react-three/fiber'




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
    console.log(tripInfo[tripInfoIndex])
    let tripError = false
    if (tripInfo[tripInfoIndex] != undefined){
        for (let leg of tripInfo[tripInfoIndex]){
            if ('trip_error' in leg){
                tripError = true
            } else {
                tripError = false
            }
        }
    }
    
    return (
        <div className="journey-planner-and-trip-info-container">
            <div className="m3dt-title">
                <Canvas className="logo-canvas" camera={{fov: 80}}>
                    <M3dtLogo/>
                </Canvas>
            </div>
            <hr width="100%" size="2"/>
            <div className='journey-planner'>
                <div className="station-search-container">
                    <StationSearch className='station_search' journeyStations={journeyStations} stations={stations} setStartOrEndStation={setStartOrEndStation} stationId={stationIdStartAndEnd['startId']} position={"start"}/>
                    <br></br>
                    <StationSearch className='station_search' journeyStations={journeyStations} stations={stations} setStartOrEndStation={setStartOrEndStation} stationId={stationIdStartAndEnd['endId']} position={"end"}/>
                </div>
                <div className="journey-planner-button-container">
                    <button className="reverse-stations-button" onClick={handleClearClick}>Clear</button>
                    <button className="reverse-stations-button" onClick={handleReverseClick}>⇅</button>
                    <button className="plan-trip-button" onClick={planTrip}>Go!</button>
                </div>
            </div>
            <div className="trip-info">
                {tripInfo[tripInfoIndex] != undefined ? <TripInfo className='trip-info' tripInfo={tripInfo} tripInfoIndex={tripInfoIndex}/> : ""}
                {tripError ? <></>:<NextTrains tripInfo={tripInfo} tripInfoIndex={tripInfoIndex} setTripInfoIndex={setTripInfoIndex}/>}
            </div>
            
            
        </div>

    )
}

export default JourneyPlanner
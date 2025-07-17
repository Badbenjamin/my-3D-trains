// import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from 'react-select'
import './Component.css'

function StationSearch({setStartOrEndStation, position, stations, stationId, journeyStations}) {
    console.log('js ',journeyStations)
    const [selectedOption, setSelectedOption] = useState(null)
    // console.log('selectedOption', selectedOption)
    useEffect(()=>{
        console.log('jsue',journeyStations)
        if (journeyStations[0] == null && journeyStations[1] == null){
            console.log('worked')
            setSelectedOption(null)
        }
    },[journeyStations])
    
    // STYLING FOR SEARCH
    const customStyles = {
        control : (provided) => ({
            ...provided,
            backgroundColor: 'white',
            fontWeight: 'bold',
            
        }),
        option: (provided, state) => ({
            ...provided,
            color: 'black',
            backgroundColor: state.isSelected ? 'lightblue' : 'white',
        }),
    }

    // when station is selected from search dropdown, selecedOption is set, and then setStartOrEndStation callback functio (from JourneyPlanner) is invoked with gtfs id and start or end
    const handleChange = (option) => {
        console.log('op', option)
        setSelectedOption(option);
        setStartOrEndStation(option.value, position)
    }

    const optionsArray = []

    for (const station of stations){
        // change value to equal gtfs stop id here and in classes.py
        // console.log(station.gtfs_stop_id)
        const stationObj = { value : station.gtfs_stop_id, label: `${station.name+" "+station.daytime_routes}`, pos: {position}};
        optionsArray.push(stationObj);
    }
    // console.log(optionsArray)

    // stationId from stationIdStartorEnd in JourneyPlanner, passed down from app.jsx
    // when stationID changes, which occurs with a tooltip origin or dest click, this sets the search componen to that station. 
    // loop through optionsArray to find the option that has the gtfs stop id 
    useEffect(()=>{
        let buttonSelectedStationObj = selectedOption
        for (const optionStation of optionsArray){
            if (stationId == optionStation.value){
                buttonSelectedStationObj = optionStation
            }
        }
        setSelectedOption(buttonSelectedStationObj)
        if (stationId != null){
            setStartOrEndStation(buttonSelectedStationObj, position)
        } else {
            console.log('else')
        }
        
    },[stationId])
    console.log('so',selectedOption)
    return (
        <div>
            <Select
                className="select"
                styles={customStyles}
                value={selectedOption}
                onChange={handleChange}
                options={optionsArray}
            />
        </div>
    )
}

export default StationSearch
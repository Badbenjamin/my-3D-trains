// import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from 'react-select'
import './App.css'

function StationSearch({setStartOrEndStation, position, stations, journeyStations}) {
    // journey stations is passed down

    const [selectedOption, setSelectedOption] = useState(null)
    // this should keep selectedOption in sync with a clear trip from JournPlanner
    // hoping it works for tooltip
    useEffect(()=>{
        if (journeyStations[0] == null && position == 'start'){
            setSelectedOption(null)
        } else if (position == 'start' && journeyStations[0] != null){
            // set selected option to station with same id
            for (const option of optionsArray){
                if (option.value == journeyStations[0]){
                    setSelectedOption(option)
                }
            }
        }

        if (journeyStations[1] == null && position == 'end'){
            setSelectedOption(null)
        } else if (position == 'end' && journeyStations[1] != null){
            // set selected option to station with same id
            for (const option of optionsArray){
                if (option.value == journeyStations[1]){
                    setSelectedOption(option)
                }
            }

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
        // this is the display
        setSelectedOption(option);
        // this cb func sends the info to JourneyPlanner, where it is used in a fetch. 
        setStartOrEndStation(option.value, position)
    }

    // dropdown seach options
    const optionsArray = []

    for (const station of stations){
        const stationObj = { value : station.gtfs_stop_id, label: `${station.name+" "+station.daytime_routes}`, pos: {position}};
        optionsArray.push(stationObj);
    }
   
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
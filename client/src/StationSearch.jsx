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
        input: (provided) => ({
            ...provided,
            color: 'white'
        }),
        control : (provided) => ({
            ...provided,
            backgroundColor: 'black',
            fontWeight: 'bold',
            width: '270px',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: '3px',
            borderRadius: '5px',
            fontSize: '15px',
            color: 'white',
            // padding: '2px',
        }),
        option: (provided, state) => ({
            ...provided,
            color: 'white',
            backgroundColor: state.isSelected ? 'black' : 'black',
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
        let routes = station.daytime_routes
        let routeIcons = routes.split(" ").map((route)=>{
            return <img className="route_icon_search"  src={`../public/ICONS/${route}.png`}/>
        })
        const stationObj = { value : station.gtfs_stop_id, label:`${station.name}`, routeIcons: routeIcons, pos: {position}};
        optionsArray.push(stationObj);
    }

    let placeholderText = null
    if (position == 'start'){
        placeholderText = "Start Station..."
    } else {
        placeholderText = "End Station..."
    }
   
    return (
        <div>
            <Select
                className="select"
                styles={customStyles}
                value={selectedOption}
                onChange={handleChange}
                options={optionsArray}
                placeholder = {placeholderText}
                formatOptionLabel={option =>(
                    <div style={{ color: 'white' }} >
                        <span >{option.label}</span>
                        <span>{option.routeIcons}</span>
                    </div>
                    
                )}
            />
        </div>
    )
}

export default StationSearch
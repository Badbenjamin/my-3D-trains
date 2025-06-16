// import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from 'react-select'
import './Component.css'

function StationSearch({getStations, position, stations, stationId}) {
    console.log('sid ',stations)
    const [selectedOption, setSelectedOption] = useState(null)
    // console.log('selectedOption', selectedOption)

    

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

    const handleChange = (option) => {
        console.log('op', option)
        setSelectedOption(option);
        getStations(option.value, position)
    }

    const optionsArray = []

    for (const station of stations){
        // change value to equal gtfs stop id here and in classes.py
        // console.log(station.gtfs_stop_id)
        const stationObj = { value : station.gtfs_stop_id, label: `${station.name+" "+station.daytime_routes}`, pos: {position}};
        optionsArray.push(stationObj);
    }
    // console.log(optionsArray)

    // wgat does this do?
    useEffect(()=>{
        let buttonSelectedStationObj = selectedOption
        for (const optionStation of optionsArray){
            if (stationId == optionStation.value){
                buttonSelectedStationObj = optionStation
            }
        }
        setSelectedOption(buttonSelectedStationObj)
        if (stationId != null){
            getStations(buttonSelectedStationObj, position)
        }
        
    },[stationId])

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
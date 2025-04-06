// import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from 'react-select'
import './Component.css'

function StationSearch({getStations, position, stations, stationId}) {
    console.log('sid',stationId)
    const [selectedOption, setSelectedOption] = useState(null)
    console.log('selectedOption', selectedOption)

    

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
        setSelectedOption(option);
        getStations(option, position)
    }

    const optionsArray = []

    for (const station of stations){
        const stationObj = { value : station.id, label: `${station.name+" "+station.daytime_routes}`, pos: {position}};
        optionsArray.push(stationObj);
    }
    // console.log(optionsArray)

    useEffect(()=>{
        let buttonSelectedStationObj = null
        for (const optionStation of optionsArray){
            if (stationId == optionStation.value){
                buttonSelectedStationObj = optionStation
            }
        }
        setSelectedOption(buttonSelectedStationObj)
        getStations(buttonSelectedStationObj, position)
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
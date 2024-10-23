// import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from 'react-select'
import './Component.css'

function StationSearch({getStations, position, stations}) {
    // console.log(stations)
    const [selectedOption, setSelectedOption] = useState(null)

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
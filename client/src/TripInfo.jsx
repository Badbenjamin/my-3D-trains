import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'
import { useState, useEffect } from 'react'

function TripInfo({tripInfo, tripInfoIndex}){
    // const [totalTimeDisplay, setTotalTimeDisplay] = useState(null)
    
    // COME BACK TO THIS WHACKY BULLSHIT LATER!!!!
    
    // console.log(tripInfo[tripInfoIndex], tripInfo)

    // look for tripError in tripinfo[tripInfoIndex]
    let tripError = false
    for (let leg of tripInfo[tripInfoIndex]){
        if ('trip_error' in leg){
            tripError = true
        } else {
            tripError = false
        }
    }
    console.log(tripError)

    let totalTimeDisplay = null
    if (tripError === true){
        totalTimeDisplay = <span className='error-highlight'>No trains between stations.</span>
    } else if (tripError === false){
        let totalTime = null
        if (tripInfo[tripInfoIndex].length > 1){
            totalTime = tripInfo[tripInfoIndex][1].end_station_arrival_ts - tripInfo[tripInfoIndex][0].start_station_departure_ts
        } else if (tripInfo[tripInfoIndex].length === 1){
            totalTime = tripInfo[tripInfoIndex][0].end_station_arrival_ts - tripInfo[tripInfoIndex][0].start_station_departure_ts
        }
        let totalTimeDisplayInt = Math.floor(totalTime / 60)
        totalTimeDisplay = <span>Total time: {totalTimeDisplayInt} min </span>
    }
    
    let newDisplayInfo = []
    if (tripInfo.length > 0){
        newDisplayInfo = tripInfo[tripInfoIndex].map((leg, i) =>{
            // this is a train with a scheudle
            if ('schedule' in leg){
                if (tripInfo[tripInfoIndex].length === 1){
                    return (
                        <>
                            <LegInfo key={leg.start_station}  className='leg-info' leg={leg} type={'single-leg'}/>
                        </>
                    )
                } else {
                    if (i === 0){
                        return (
                            <>
                                <LegInfo key={leg.start_station}  className='leg-info' leg={leg} type={'first-leg'}/>
                            </>
                        )
                    } else if (i === 1){
                        return (
                            <>
                                <LegInfo key={leg.start_station}  className='leg-info' leg={leg} type={'second-leg'}/>
                            </>
                        )
                    }
                }
                
            // this is a tripError 
            } else if ('start_station_service' in leg){
                return(
                    <>
                        <ErrorInfo key={leg.start_station_name} className='error-info' leg={leg}/>
                        <hr width="100%" size="2"/>
                    </>
                ) 
            }
        })
    } 

    // console.log(totalTimeDisplay !== NaN)
    return(
        <div>
            <div>{totalTimeDisplay}</div>
            <div className='leg-info-div'>
                 <hr width="100%" size="2"/>
                {tripInfo.length > 0 ? newDisplayInfo : <></> }
            </div>
        </div>
        
        
    )
}

export default TripInfo
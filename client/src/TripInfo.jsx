import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'
import { useState, useEffect } from 'react'

function TripInfo({tripInfo, tripInfoIndex}){
  
    let totalTime = null
    if (tripInfo[tripInfoIndex].length > 1){
        totalTime = tripInfo[tripInfoIndex][1].end_station_arrival_ts - tripInfo[tripInfoIndex][0].start_station_departure_ts
    } else {
        totalTime = tripInfo[tripInfoIndex][0].end_station_arrival_ts - tripInfo[tripInfoIndex][0].start_station_departure_ts
    } 
    let totalTimeDisplay =Math.floor(totalTime / 60)

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
                        <hr width="90%" size="2"/>
                    </>
                ) 
            }
        })
    } else if ("trip_planner_error" in tripInfo){
        console.log('error info', tripInfo['trip_planner_error'])
    } else {
        console.log('other error')
    }
  
    return(
        <div>
            <div>Total time: {totalTimeDisplay} min</div>
            <div className='leg-info-div'>
                 <hr width="100%" size="2"/>
                {tripInfo.length > 0 ? newDisplayInfo : <></> }
            </div>
        </div>
        
        
    )
}

export default TripInfo
import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'
import { useState, useEffect } from 'react'

function TripInfo({tripInfo, tripInfoIndex}){
    // const [displayInfo, setDisplayInfo] = useState([])

  
        let newDisplayInfo = []
        console.log(tripInfo.length > 0)
        if (tripInfo.length > 0){
            console.log('worked')
            newDisplayInfo = tripInfo[tripInfoIndex].map((leg) =>{
    
                if ('schedule' in leg){
                    return <LegInfo key={leg.start_station}  className='leg-info' leg={leg}/>
                } else if ('start_station_service' in leg){
                    return <ErrorInfo key={leg.start_station_name} className='error-info' leg={leg}/>
                }
            })
        } else if ("trip_planner_error" in tripInfo){
            console.log('error info', tripInfo['trip_planner_error'])
        } else {
            console.log('other error')
        }
  
    console.log('ti ti el', tripInfo)
    
    
    
  
    return(
        <div className='leg-info-div'>
            {tripInfo.length > 0 ? newDisplayInfo : <></> }
        </div>
        
    )
}

export default TripInfo
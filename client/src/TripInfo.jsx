import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'
import { useState, useEffect } from 'react'

function TripInfo({tripInfo, tripInfoIndex}){
    // const [displayInfo, setDisplayInfo] = useState([])
        console.log('tripINfo tripInfo', tripInfo[tripInfoIndex])
  
        let newDisplayInfo = []
        // console.log(tripInfo.length > 0)
        if (tripInfo.length > 0){
            console.log('tripInfo', tripInfo[tripInfoIndex])
            newDisplayInfo = tripInfo[tripInfoIndex].map((leg, i) =>{
                console.log('leg', leg)
                // this is a train with a scheudle
                if ('schedule' in leg){
                    if (tripInfo[tripInfoIndex].length === 1){
                        return (
                            <>
                                <LegInfo key={leg.start_station}  className='leg-info' leg={leg} type={'single-leg'}/>
                                {/* <hr width="90%" size="2"/> */}
                            </>
                        )
                    } else {
                        if (i === 0){
                            return (
                                <>
                                    <LegInfo key={leg.start_station}  className='leg-info' leg={leg} type={'first-leg'}/>
                                    {/* <hr width="90%" size="2"/> */}
                                </>
                            )
                        } else if (i === 1){
                            return (
                                <>
                                    <LegInfo key={leg.start_station}  className='leg-info' leg={leg} type={'second-leg'}/>
                                    {/* <hr width="90%" size="2"/> */}
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
  
    // console.log('ti ti el', tripInfo)
    
    
    
  
    return(
        <div>
            <div>Total time</div>
            <div className='leg-info-div'>
                 <hr width="90%" size="2"/>
                {tripInfo.length > 0 ? newDisplayInfo : <></> }
            </div>
        </div>
        
        
    )
}

export default TripInfo
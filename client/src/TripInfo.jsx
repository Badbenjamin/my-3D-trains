import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'

function TripInfo({tripInfo, tripInfoIndex}){

    console.log('ti ti el', tripInfo)
    const tripInformation = []
    if (tripInfo.lenth > 0){
        tripInformation = tripInfo[tripInfoIndex].map((leg) =>{

            if ('schedule' in leg){
                return <LegInfo key={leg.start_station}  className='leg-info' leg={leg}/>
            } else if ('start_station_service' in leg){
                return <ErrorInfo key={leg.start_station_name} className='error-info' leg={leg}/>
            }
        })
    } else if ("trip_planner_error" in tripInfo){
        console.log('error info', tripInfo['trip_planner_error'])
    }
    
  
    return(
        <div className='leg-info-div'>
            {tripInformation}
        </div>
        
    )
}

export default TripInfo
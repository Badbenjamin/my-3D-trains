import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'

function TripInfo({tripInfo}){

    console.log('ti', tripInfo)
    const tripInformation = tripInfo.map((leg) =>{
        console.log('leg', leg)
        if ('schedule' in leg){
            return <LegInfo key={leg.start_station}  className='leg-info' leg={leg}/>
        } else if ('start_station_service' in leg){
            return <ErrorInfo key={leg.start_station_name} className='error-info' leg={leg}/>
        }
    })
  
    return(
        <div className='leg-info-div'>
            {tripInformation}
        </div>
        
    )
}

export default TripInfo
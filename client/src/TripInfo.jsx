import './Component.css'
import LegInfo from './LegInfo'
import ErrorInfo from './ErrorInfo'

function TripInfo({tripInfo}){

    console.log('ti', tripInfo)
    const tripInformation = tripInfo.map((leg) =>{
        if ('schedule' in leg){
            return <LegInfo className='leg-info' leg={leg}/>
        } else if ('start_station_service' in leg){
            return <ErrorInfo className='error-info' leg={leg}/>
        }
    })
    // if (tripInfo.length === 1){
    //     return(
    //         <div className='leg-info-div'>
    //             <LegInfo className='leg-info' tripInfo={tripInfo[0]} />
    //         </div>
    //     )
    // } else if (tripInfo.length == 2) {
    //     return (
    //         <div className='leg-info-div'>
    //             <LegInfo className='leg-info' tripInfo={tripInfo[0]} />
    //             <LegInfo className='leg-info' tripInfo={tripInfo[1]} />
    //         </div>
    //     )
    // }
    

    return(
        <div className='leg-info-div'>
            {tripInformation}
        </div>
        
    )
}

export default TripInfo
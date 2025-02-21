import './Component.css'
import LegInfo from './LegInfo'

function TripInfo({tripInfo}){
    console.log(tripInfo[1])
    if (tripInfo.length === 1){
        return(
            <div className='leg-info-div'>
                <LegInfo className='leg-info' tripInfo={tripInfo[0]} />
            </div>
        )
    } else if (tripInfo.length == 2) {
        return (
            <div className='leg-info-div'>
                <LegInfo className='leg-info' tripInfo={tripInfo[0]} />
                <LegInfo className='leg-info' tripInfo={tripInfo[1]} />
            </div>
        )
    }


    return(
        <div className='leg-info-div'>
            <LegInfo className='leg-info' tripInfo={tripInfo} />
        </div>
        
    )
}

export default TripInfo
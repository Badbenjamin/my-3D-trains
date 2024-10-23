import './Component.css'
import LegInfo from './LegInfo'

function TripInfo({tripInfo}){

    return(
        <div className='leg-info-div'>
            <LegInfo className='leg-info' tripInfo={tripInfo} />
        </div>
        
    )
}

export default TripInfo
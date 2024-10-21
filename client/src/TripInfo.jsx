import './Component.css'
import LegInfo from './LegInfo'

function TripInfo({tripInfo}){

    return(
        <div className='leg-info-div'>
            <LegInfo tripInfo={tripInfo} />
        </div>
        
    )
}

export default TripInfo
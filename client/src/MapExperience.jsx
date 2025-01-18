import {Canvas} from '@react-three/fiber'
import SubwayMap from './SubwayMap'
import JourneyPlanner from './JourneyPlanner'
import TimeDate from './TimeDate'

function MapExpierience(){

    return(
        <>  
            <TimeDate/>
            <JourneyPlanner/>
            <Canvas>
                <SubwayMap />
            </Canvas>
        </>
    )
}

export default MapExpierience
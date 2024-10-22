import {Canvas} from '@react-three/fiber'
import SubwayMap from './SubwayMap'
import JourneyPlanner from './JourneyPlanner'




function MapExpierience(){

    return(
        <>
            <JourneyPlanner/>
            <Canvas>
                <SubwayMap />
            </Canvas>
            
        </>
    )
}

export default MapExpierience
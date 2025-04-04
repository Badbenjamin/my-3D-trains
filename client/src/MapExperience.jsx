import {Canvas} from '@react-three/fiber'
import SubwayMap from './SubwayMap'
import JourneyPlanner from './JourneyPlanner'
import TimeDate from './TimeDate'
import { Html } from "@react-three/drei"

function MapExpierience(){

    return(
        <>  
            <TimeDate/>
            <JourneyPlanner/>
            <Canvas>
                <SubwayMap />
                <Html/>
            </Canvas>
        </>
    )
}

export default MapExpierience
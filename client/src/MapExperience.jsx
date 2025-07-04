import {Canvas} from '@react-three/fiber'
import SubwayMap from './SubwayMap'
import JourneyPlanner from './JourneyPlanner'
import TimeDate from './TimeDate'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function MapExpierience(){
    // const ref = useRef

    // useFrame((state, delta) => {
    //     console.log('cam', camera)
    // })

    return(
        <>  
            {/* <TimeDate/> */}
            <JourneyPlanner/>
            <Canvas camera={{ fov: 90, position: [1, -120, .2] }}>
                <SubwayMap />
            </Canvas>
        </>
    )
}

export default MapExpierience
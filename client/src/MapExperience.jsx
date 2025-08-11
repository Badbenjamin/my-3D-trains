import {Canvas} from '@react-three/fiber'
import SubwayMap from './SubwayMap'
import JourneyPlanner from './JourneyPlanner'
// import TimeDate from './TimeDate'
// import { useFrame } from '@react-three/fiber'
import { useEffect, useState } from 'react'
// import { Html } from '@react-three/drei'
import { useOutletContext } from "react-router-dom";

import TripErrorModal from './TripErrorModal'

function MapExpierience(){
    const {tripInfo} = useOutletContext()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(()=>{
        if ('trip_planner_error' in tripInfo){
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }

    },[tripInfo])

    function closeModal (){
        setIsOpen(false)
    }


    return(
        <>  
            {/* <TimeDate/> */}
            <JourneyPlanner/>
            <TripErrorModal isOpen={isOpen} closeModal={closeModal}/>
            <Canvas camera={{ fov: 90, position: [1, -120, .2] }}>
                <SubwayMap />
            </Canvas>
        </>
    )
}

export default MapExpierience
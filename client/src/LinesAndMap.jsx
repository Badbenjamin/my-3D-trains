import {Perf} from 'r3f-perf'
import {MapControls, Sky} from '@react-three/drei'

import StationsAndTracks from "./StationsAndTracks"
import Map from "./Map"

function LinesAndMap(){


    
    return(
        <>
            {/* <Perf position="top-left" /> */}
            <MapControls maxDistance={100} minDistance={1} maxPolarAngle={0.99}/>
            <ambientLight intensity={1.5} />
            <directionalLight position={[1,2,3]} intenstity={1.5}/>
            <Sky/>
            <Map/>
            <StationsAndTracks />
        </>
    )
}

export default LinesAndMap
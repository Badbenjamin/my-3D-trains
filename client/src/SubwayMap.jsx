
import { Suspense } from "react"

import './index.css'

import PlaceHolder from "./Placeholder"
import LinesAndMap from "./LinesAndMap"

function SubwayMap(){

    return( 
        <>
            <Suspense fallback={<PlaceHolder position-y={0.5} scale = {[1,1,1]}/>}>
                <ambientLight intensity={.08}/>
                <LinesAndMap/>
            </Suspense>
        </>
        
    )
}

export default SubwayMap
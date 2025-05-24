import { Html } from "@react-three/drei"

// add props?
export default function StationToolTip(){
    // console.log('mp', mesh)
    // console.log('sio stt',stationInfoObject)
    const props = "station name"
    const newPosition = mesh.mesh.position
    console.log('im the text')
    console.log('np',newPosition.z)

    return(
        <Html
            key={mesh.uuid}
            as="div"
            wrapperClass="station-tooltip"
            position={tooltipPosition}
            distanceFactor={5}
            center={true}
            // occlude={true}
            
            >
            <div  className="station-html">
                <button className="x-button" onClick={handleHtmlClick}>X</button>
                <h2 className="station-html-text">{stationInfoObject.name + " " + stationInfoObject.daytime_routes}</h2>
                <div className="arrivals-html">
                    <div>{arrivalInfo.north_direction_label + ": " + arrivalInfo.n_bound_arrivals}</div>
                    <div>{arrivalInfo.south_direction_label + ": " + arrivalInfo.s_bound_arrivals}</div>
                </div>
                <button onClick={()=>handleSetStationClick(stationInfoObject.id, "start")}>ORIGIN</button>
                <button onClick={()=>handleSetStationClick(stationInfoObject.id, "end")}>DESTINATION</button>
            </div>
    </Html>
    )
}
import { Html } from "@react-three/drei"

export default function StationToolTip(mesh, stationInfoObject){
    console.log('mp', mesh)
    console.log('sio stt',stationInfoObject)
    const props = "station name"

    return(
        <Html
            key={mesh.uuid}
            as="div"
            wrapperClass="station-tooltip"
            position={mesh.mesh.position}
        >
            <div>
                <h2></h2>
                <button>set as start</button>
                <button>set as end</button>
            </div>
        </Html>
    )
}
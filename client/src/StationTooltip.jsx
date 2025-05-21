import { Html } from "@react-three/drei"

export default function StationToolTip(mesh, stationInfoObject){
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
            center={true}
            // className="station_tooltip"
            position={newPosition}

        >
            <div>
                <h2></h2>
                <button>set as start</button>
                <button>set as end</button>
            </div>
        </Html>
    )
}
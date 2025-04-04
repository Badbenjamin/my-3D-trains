import { Html } from "@react-three/drei"

export default function StationToolTip(mesh){
    console.log('mp', mesh)
    console.log('nn',mesh.mesh.name)
    const props = "station name"

    return(
        <Html
            key={mesh.name}
            as="div"
            wrapperClass="station-tooltip"
            position={mesh.mesh.position}
        >
            <div>
                <h2>{mesh.mesh.name}</h2>
                <button>set as start</button>
                <button>set as end</button>
            </div>
        </Html>
    )
}
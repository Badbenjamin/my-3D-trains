import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function StationText({position, text, status}){


    useFrame((state, delta)=>{
    })
    return(
        <>
            {status ? <Html  wrapperClass="station_label" distanceFactor={5} center={true} position={position}>{text}</Html> : <></>}
        </>
    )
}
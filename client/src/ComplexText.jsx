import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function ComplexText({positions, names, routes,status}){

    console.log(positions, names, routes)


    useFrame((state, delta)=>{
    })
    return(
        <>
            {status ? <Html  wrapperClass="complex_label" distanceFactor={5} center={true} position={positions[0]}>{names[0] + routes}</Html> : <></>}
        </>
    )
}
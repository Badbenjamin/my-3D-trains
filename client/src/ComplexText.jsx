import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function ComplexText({positions, names, routes,status}){

    // console.log(positions, names, routes)

    function avereragePosition(positionsArray){
        let xArray = []
        let yArray = []
        let zArray = []
        for (let pos of positionsArray){
            console.log(pos.z)
            xArray.push(pos.x)
            yArray.push(pos.y)
            zArray.push(pos.z)
        }
        console.log(xArray,yArray,zArray)
        let xAv = (xArray.reduce((accumulator, currentValue)=> accumulator + currentValue))/xArray.length
        let yAv = (yArray.reduce((accumulator, currentValue)=> accumulator + currentValue))/yArray.length
        let zAv = (xArray.reduce((accumulator, currentValue)=> accumulator + currentValue))/zArray.length
        // console.log(xAv)
        return {"x" : xAv, "y" : yAv, "z" : zAv}
    }
    // let averagePositions = avereragePosition(positions)

    // useFrame((state, delta)=>{
    // })
    return(
        <>
            {status ? <Html  wrapperClass="complex_label" distanceFactor={6} center={true} position={positions[0]}>{names[0] + " " + routes}</Html> : <></>}
        </>
    )
}
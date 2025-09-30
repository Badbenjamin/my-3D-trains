import M3dtLogo from "./M3dtLogo"
import { AmbientLight, PointLight } from "three"

export default function LogoScene(){


    return(
        <>  
            <PointLight position={[1,-0,5.2]} intensity={20} color="red"/>
            <PointLight position={[3,-0,5.2]} intensity={20} color="blue"/>
            <PointLight position={[-1,1,5.2]} intensity={40} color="green"/>
            <AmbientLight/>
            <M3dtLogo/>
        </>
    )
}
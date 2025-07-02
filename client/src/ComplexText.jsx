import { Html } from "@react-three/drei";

export default function ComplexText({handleComplexClick, averagePosition, names, routes, status, alphaLevel, complexId, complexStationRouteIdObjs, size}){

    let sizeInPx = size.toString()+"px"
    let iconImageArray = []
    routes.map((routesArray)=>{
        // routesArray is array of arrays
        for (let routes of routesArray){
            // routes is sub array containing routes
            for (let route of routes){
                // route is each route
                if (route != " "){
                    iconImageArray.push(<img className="route_icon" style={{width: size, height : size}} src={`../public/ICONS/${route}.png`}/>);
                }
            }
        }
    })

    function handleClick(){
        handleComplexClick(complexStationRouteIdObjs, averagePosition, complexId);
    }
    return(
        <>
            {status ? <Html key={complexId} style={{opacity : alphaLevel}} wrapperClass="complex_label" distanceFactor={6} center={true} position={averagePosition}>
                <button onClick={handleClick} style={{fontSize: size}} className="complex-html-button-text">{names[0]}{iconImageArray}</button>
                </Html> : <></>}
        </>
    )
}
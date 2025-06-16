import { Html, Line } from "@react-three/drei"
import { use } from "react"
import { useState, useEffect } from "react"
import * as THREE from "three"

// import { Line } from "@react-three/drei"


import './App.css'

// add props?
export default function StationToolTip({stopId, position, name, daytime_routes, retrieveStationId}){
    let [arrivalInfo, setArrivalInfo] = useState({})
    let [northArrivals, setNorthArrivals] = useState([])
    let [southArrivals, setSouthArrivals] = useState([])

    useEffect(()=>{
        fetch(`http://127.0.0.1:5555/api/arrivals/${stopId}`)
                .then(response => response.json())
                .then(newArrivals => {setArrivalInfo(newArrivals)})

    }, [])

    // console.log('rsid', retrieveStationId)

    let iconImageArray = []
    // daytime_routes.split(" ").map((route)=>{
    //     iconImageArray.push(<img className="route_icon" src={`../public/ICONS/${route}.png`}/>)
    // })
    function buildArrivals(arrivalObjectArray){
        // console.log(arrivalObjectArray)
        let imgTimePairs =[]
        if (arrivalObjectArray) {
            for (const arrivalObject of arrivalObjectArray){
                console.log(arrivalObject['route'])
                // let imgTimePair = <img className="route_icon" src={`../public/ICONS/${arrivalObject["route"]}.png`} />
                let imgTimePair = <div className="icon-time-pair">
                                     <img className="tooltip_route_icon" src={`../public/ICONS/${arrivalObject["route"]}.png`} />
                                     <div>{arrivalObject['time']}</div>
                                  </div>
                                   
                // let imgTimePair = 'boob'
                imgTimePairs.push(imgTimePair)
            }
        }
        
        return imgTimePairs
    }
    
    // let northArrivals = []
    // let southArrivals = []
    // let testArrivals = ['ho', 'ho', 'ho']

    useEffect(()=>{
       northArrivals = buildArrivals(arrivalInfo.n_bound_arrivals)
       console.log(northArrivals)
       setNorthArrivals(northArrivals)
       southArrivals = buildArrivals(arrivalInfo.s_bound_arrivals)
       setSouthArrivals(southArrivals)
    //    setNorthArrivals(newNorthArrivals)
    }, [arrivalInfo])
    
    

  
  
    const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
    lineMaterial.linewidth = 500

    const tooltipPosition = new THREE.Vector3(position.x, position.y + 2, position.z)
    // const points = []
    // points.push(position)
    // points.push(tooltipPosition)
    // const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );

    // console.log(lineGeometry)

    // const tooltipLine = <Line points={[position, tooltipPosition]}/>

    function handleSetStationClick(id, startOrEnd){
        console.log('tt set station',id, startOrEnd)
        retrieveStationId(id, startOrEnd)
        // setIsClicked(!isClicked)
        
    }

    if (!arrivalInfo){
        return(
            <Html position={position}>
                <div className="station-tooltip">
                    LOADIN!!!
                </div>
            </Html>
        )
    } else if (arrivalInfo && northArrivals && southArrivals){
        return (
        <>
             <Html
                key={stopId}
                as="div"
                wrapperClass="station-tooltip"
                position={tooltipPosition}
                distanceFactor={5}
                center={true}
            >
                <div  className="station-html">
                    <button className="x-button" >X</button>
                    <h2 className="station-html-text">{name + " " + iconImageArray}</h2>
                    <div className="arrivals-html">
                        {arrivalInfo.north_direction_label}
                        {northArrivals}
                        {arrivalInfo.south_direction_label}
                        {southArrivals}
                    </div>
                    
                    <button onClick={()=>handleSetStationClick(stopId, "start")}>ORIGIN</button>
                    <button onClick={()=>handleSetStationClick(stopId, "end")}>DESTINATION</button>
                    {/* {tooltipLine} */}
                </div>
                
                {/* <line geometry={lineGeometry} material={lineMaterial} linewidth={10.0}>
                            <lineBasicMaterial />
                </line> */}
                
            </Html>
            <Line points={[position, tooltipPosition]} lineWidth={2}/>
            {/* {northArrivals} */}
        </>
           
         
        
        )
    }

}
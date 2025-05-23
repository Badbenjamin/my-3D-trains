import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"
import { Line } from "@react-three/drei"



import './App.css'
import { useFrame } from "@react-three/fiber"
// import { is } from "@react-three/fiber/dist/declarations/src/core/utils"

function Station( { status, materials, mesh, index, getStationCode, id, retrieveStationId, vectorPosition}){
        // console.log('ret',typeof(retrieveStationId))
        const [stationInfoObject, setStationInfoObject] = useState({daytime_routes: '', gtfs_stop_id: '', id: 0, name: ''})
        // const [toolTipVersion, setToolTipVersion] = useState(0)
        // const [readableName, setReadableName] = useState("")
        // const [displayName, setDisplayName] = useState(false)
        const [isClicked, setIsClicked] = useState(false)
        const [arrivalInfo, setArrivalInfo] = useState({})
        let stationRef = useRef()
        // console.log('vp', vectorPosition)
        // let stt = <StationToolTip stationInfoObject={stationInfoObject} mesh={mesh}/>

        const selectedMaterial = new THREE.MeshStandardMaterial()
        selectedMaterial.color =  new THREE.Color('white')

        // const cube = new THREE.BoxGeometry()
        // const cubeMat = newThree.MeshStandardMaterial()
        // cubeMat.color = new THREE.Color('black')
        // console.log(mesh.position)
        
        const newName = mesh.name
        const newGeometry = mesh.geometry
        const newMaterial =  mesh.material;
        const newCastShadow = true
        const newRecieveShadow = true
        const newPosition = mesh.position
        const newRotation = mesh.rotation
        const newScale = mesh.scale

        const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color('white') } );
        lineMaterial.linewidth = 50

        const tooltipPosition = new THREE.Vector3(newPosition.x, newPosition.y + 2, newPosition.z)
        const points = []
        points.push(newPosition)
        points.push(tooltipPosition)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );

        const tooltipLine = <line geometry={lineGeometry} material={lineMaterial} linewidth={10.0}>
                         <lineBasicMaterial />
                     </line>
        // const line = new THREE.Line( lineGeometry, lineMaterial )
        // Scene.add(line)

        console.log('nptp', newPosition, tooltipPosition)

        // tooltipPosition.z = tooltipPosition.y + 1
        // console.log('ttp', tooltipPosition.y )

        // console.log('np', newPosition)
        // do i need this state or can I just have a variable?
        const [isWhite, setIsWhite] = useState(false)
        let color = !isWhite ? newMaterial : selectedMaterial

        function handleSetStationClick(id, startOrEnd){
            // console.log(id, startOrEnd)
            retrieveStationId(id, startOrEnd)
            setIsClicked(!isClicked)
            
        }

        function handleHtmlClick(){
            // console.log('clicked')
            setIsClicked(!isClicked)
        }

        // let stationHTML =   <Html
        //                         key={mesh.uuid}
        //                         as="div"
        //                         wrapperClass="station-tooltip"
        //                         position={tooltipPosition}
        //                         distanceFactor={5}
        //                         center={true}
        //                         // occlude={true}
                                
        //                     >
        //                         <div  className="station-html">
        //                             <button className="x-button" onClick={handleHtmlClick}>X</button>
        //                             <h2 className="station-html-text">{stationInfoObject.name + " " + stationInfoObject.daytime_routes}</h2>
        //                             <div className="arrivals-html">
        //                                 <div>{arrivalInfo.north_direction_label + ": " + arrivalInfo.n_bound_arrivals}</div>
        //                                 <div>{arrivalInfo.south_direction_label + ": " + arrivalInfo.s_bound_arrivals}</div>
        //                             </div>
        //                             <button onClick={()=>handleSetStationClick(stationInfoObject.id, "start")}>ORIGIN</button>
        //                             <button onClick={()=>handleSetStationClick(stationInfoObject.id, "end")}>DESTINATION</button>
        //                         </div>
        //                     </Html>
        
        useFrame(({clock})=>{
            // setIsWhite(true)
            let a = clock.getElapsedTime()
            if (status['status']){
                if (Math.round(a) % 2 == 0){
                    setIsWhite(true)
                } else {
                    setIsWhite(false)
                }
            }
           
            
        })
     
        // Get Station Names for HTML text
        useEffect(()=>{
            if (newName.length < 5 ){
                // console.log('nn', newName)
                fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
                .then(response => response.json())
                .then(stationInfoObject => {setStationInfoObject(stationInfoObject)})
                // .then(stationInfoObject => console.log(stationInfoObject))
                .catch((error)=>{console.log(error, newName)})
            }
            // setReadableName(stationInfoObject.name)
        }, [])
        // console.log('rn', readableName)
        // TOOLTIP WITH INFO AND ARRIVALS
        function handleClick(e){
            if (e.eventObject.name != "00_NYC_full_trackmap"){
                fetch(`http://127.0.0.1:5555/api/arrivals/${stationInfoObject.gtfs_stop_id}`)
                .then(response => response.json())
                .then(arrivals => {setArrivalInfo(arrivals)})
                .catch((error)=>{console.log(error, arrivals)})
                setIsClicked(!isClicked)

            }
        }

        // console.log('sio',stationInfoObject)
        // console.log(readableName)
    return(
        <group>
            <mesh       
                  onClick={handleClick}   
                  ref={stationRef[index]}
                  name={newName}
                  castShadow={newCastShadow}
                  receiveShadow={newRecieveShadow}
                  geometry={newGeometry}
                  material={color}
                  position={newPosition}
                  rotation={newRotation}
                  scale={newScale}
                  
            />
            
                {/* {<Html  wrapperClass="station_label" distanceFactor={5} center={true} position={newPosition}>{stationInfoObject.name+ " " + stationInfoObject.daytime_routes}</Html>} */}
                {!isClicked ? <></> : stationHTML}
                {!isClicked ? <></> : tooltipLine}
        </group>
    )
}

export default Station
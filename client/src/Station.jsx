import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { Html } from "@react-three/drei"


import './App.css'
import { useFrame } from "@react-three/fiber"
// import { is } from "@react-three/fiber/dist/declarations/src/core/utils"

function Station( { status, materials, mesh, index, getStationCode, id, retrieveStationId}){
        console.log('ret',typeof(retrieveStationId))
        const [stationInfoObject, setStationInfoObject] = useState({daytime_routes: 'blank', gtfs_stop_id: 'blank', id: 0, name: 'blank'})
        const [toolTipVersion, setToolTipVersion] = useState(0)
        const [readableName, setReadableName] = useState("")
        const [displayName, setDisplayName] = useState(false)
        const [isClicked, setIsClicked] = useState(false)
        let stationRef = useRef()
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
       
        // do i need this state or can I just have a variable?
        const [isWhite, setIsWhite] = useState(false)
        let color = !isWhite ? newMaterial : selectedMaterial

        function handleSetStationClick(id, startOrEnd){
            // console.log(id, startOrEnd)
            retrieveStationId(id, startOrEnd)
            
        }

        let stationHTML =   <Html
                                key={mesh.uuid}
                                as="div"
                                wrapperClass="station-tooltip"
                                position={newPosition}
                                distanceFactor={10}
                            >
                                <div className="station-html">
                                    <h2 className="station-html-text">{stationInfoObject.name + " " + stationInfoObject.daytime_routes}</h2>
                                    <button onClick={()=>handleSetStationClick(stationInfoObject.id, "start")}>set as start</button>
                                    <button onClick={()=>handleSetStationClick(stationInfoObject.id, "end")}>set as end</button>
                                </div>
                            </Html>
        
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
                fetch(`http://127.0.0.1:5555/api/stationname/${newName}`)
                .then(response => response.json())
                .then(stationInfoObject => {setStationInfoObject(stationInfoObject)})
                .catch((error)=>{console.log(error, newName)})
            }
        }, [])

        function handleClick(e){
            if (e.eventObject.name != "00_NYC_full_trackmap"){
                setIsClicked(!isClicked)
            }
        }

        // console.log('sio',stationInfoObject)
    
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
                {/* {<Html  wrapperClass="station_label" distanceFactor={10} position={newPosition}>{readableName}</Html>} */}
                {!isClicked ? <></> : stationHTML}
        </group>
    )
}

export default Station
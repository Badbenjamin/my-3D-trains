
import { useOutletContext } from 'react-router-dom'


export default function StationsAndTracks() {

    const {stationArray} = useOutletContext()

  if (stationArray == []){
    return(
        <>loading</>
    )
  }

  return (
    <group  dispose={null}>
        {stationArray}
    </group>
  )
}



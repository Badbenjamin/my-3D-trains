import './Component.css'
import { useEffect } from 'react'

export default function NextTrains({tripInfoIndex, tripInfo, setTripInfoIndex}){



    console.log('ntti',tripInfo)
    // let arrivalsButtons = []

    let arrivalsButtons = tripInfo.map((trip, index)=>{
      
        if (index != tripInfoIndex){
            return <button className='next-train-button' onClick={()=>{handleButtonClick(index)}}>{trip[0].route + " " + trip[0].start_station_departure + " "}</button>
        } else {
            return <button className='next-train-button-selected' onClick={()=>{handleButtonClick(index)}}>{trip[0].route + " " + trip[0].start_station_departure + " "}</button>
        }
        
        
    })
    // useEffect(()=>{
        
            
    //     })

    // }, [])

    function handleButtonClick(index){
        setTripInfoIndex(index)
    }

    

    // function handleNextTrainClick(){
    //     if (tripInfoIndex < tripInfo.length - 1){
    //         setTripInfoIndex(tripInfoIndex + 1)
    //     } 
        
    // }

    // function handlePrevTrainClick(){
    //     if (tripInfoIndex != 0){
    //         setTripInfoIndex(tripInfoIndex - 1)
    //     } 
        
    // }
    return(
        <div className="next-trains-bar">
            {/* <button onClick={handlePrevTrainClick}>PREV TRAIN</button> */}
            <div>{arrivalsButtons.slice(0,5)}</div>
            {/* <button onClick={handleNextTrainClick}>NEXT TRAIN</button> */}
        </div>
        
    )
}
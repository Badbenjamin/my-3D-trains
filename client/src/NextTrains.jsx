import './Component.css'

export default function NextTrains({tripInfoIndex, tripInfo, setTripInfoIndex}){

    let arrivalsButtons = []
    if (tripInfo.length != 0){
        arrivalsButtons = tripInfo.map((trip, index)=>{
            if (index != tripInfoIndex){
                return <button className='next-train-button' onClick={()=>{handleButtonClick(index)}}>{trip[0].route + " " + trip[0].start_station_departure + " "}</button>
            } else {
                return <button className='next-train-button-selected' onClick={()=>{handleButtonClick(index)}}>{trip[0].route + " " + trip[0].start_station_departure + " "}</button>
            }  
        })
    }
    

    function handleButtonClick(index){
        setTripInfoIndex(index)
    }

    if (tripInfo.length != 0){
        return(
            <div className="next-trains-bar">
                <div>{arrivalsButtons.slice(0,5)}</div>
            </div> 
        )
    } else {
        return(
            <></>
        )
    }
    
}
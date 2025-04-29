export default function NextTrains({tripInfoIndex, tripInfo, setTripInfoIndex}){

    console.log('ntti',tripInfo)

    function handleButtonClick(index){
        setTripInfoIndex(index)
    }

    let arrivalsButtons = tripInfo.map((trip, index)=>{
        return <button onClick={()=>{handleButtonClick(index)}}>{trip[0].route + " " + trip[0].start_station_departure + " " + index}</button>
    })

    function handleNextTrainClick(){
        if (tripInfoIndex < tripInfo.length - 1){
            setTripInfoIndex(tripInfoIndex + 1)
        } 
        
    }

    function handlePrevTrainClick(){
        if (tripInfoIndex != 0){
            setTripInfoIndex(tripInfoIndex - 1)
        } 
        
    }
    return(
        <div>
            <button onClick={handlePrevTrainClick}>PREV TRAIN</button>
            <p>{arrivalsButtons}</p>
            <button onClick={handleNextTrainClick}>NEXT TRAIN</button>
        </div>
        
    )
}
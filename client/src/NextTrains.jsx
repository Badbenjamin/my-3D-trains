import './Component.css'

export default function NextTrains({tripInfoIndex, tripInfo, setTripInfoIndex}){

    // console.log('depart', trip[0].start_station_departure, trip[0])

    let arrivalsButtons = []
    if (tripInfo.length > 0){
        arrivalsButtons = tripInfo.map((trip, index)=>{
            //  console.log('depart', trip[0].start_station_departure, trip[0])

            let departureTime = new Date(trip[0].start_station_departure_ts * 1000)
            let departureTimeString = departureTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }) 
            if (index != tripInfoIndex){
                return <button className='next-train-button' onClick={()=>{handleButtonClick(index)}}>{<img className="route_icon_next_train" src={`../ICONS/${trip[0].route}.png`}/>}{" " + departureTimeString + " "}</button>
            } else {
                return <button className='next-train-button-selected' onClick={()=>{handleButtonClick(index)}}>{<img className="route_icon_next_train" src={`../ICONS/${trip[0].route}.png`}/>}{" " + departureTimeString + " "}</button>
            }  
        })
    }
    

    function handleButtonClick(index){
        setTripInfoIndex(index)
    }

    
    return(
        <div className="next-trains-bar">
            <div>{(arrivalsButtons && arrivalsButtons[0]?.props.children != "undefined undefined ") ? arrivalsButtons.slice(0,5) : <></>}</div>
        </div> 
    )
}
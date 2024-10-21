import { useState, useEffect } from "react"

function TimeDate(){

    const [timeDate, setTimeDate] = useState(new Date())

    useEffect(()=>{

        let timer = setInterval(()=>setTimeDate(new Date()), 1000)

        return function clearnup() {
            clearInterval(timer)
        }
    });

    return(
        <p>NYC {timeDate.toLocaleTimeString()}</p>
    )
}

export default TimeDate
import Station from "./Station"

export  function getStationCode(name){
  console.log('name',name)
}
// takes a train (tripInfo) and statusArray as args, returns a list of station and track ids
// these are used to update the status array and highlight a route
export function getAllIds(tripInfo, statusArray){
    console.log('ti', tripInfo)
      const currentTripSchedule = tripInfo.schedule
      const startStation = tripInfo.start_station_gtfs
      const endStation = tripInfo.end_station_gtfs
      // gtfs ids without N or S 
      const justStationIds = currentTripSchedule.map((station) => {
          return station['stop_id'].slice(0,3)
        })
      const startIndex = justStationIds.indexOf(startStation)
      const endIndex = justStationIds.indexOf(endStation)
      // Only stations between start statio and end station
      const selectedStationArray = justStationIds.slice(startIndex, endIndex + 1)
      const direction = tripInfo.schedule[0]['stop_id'].slice(3,4)
      
      // Only tracks between start station and end station
      const justTrackIds = selectedStationArray.map((stationId) => {
        const stationAndDirection = stationId + direction
        for (const status of statusArray){
            if (status['name'].includes(stationAndDirection)){
              return status['name']
            }
          }
      })
      
      // complete array of all meshes to be selected, stations + tracks
      // this is the arg that gets passed to selectStations function
      const allIdsArray = selectedStationArray.concat(justTrackIds)
      console.log("allid in func", allIdsArray)
      return allIdsArray
}


// this function creates a status object for each mesh in nodes from our model import and pushes to newStatusArray
export function createStatusObjectArray(nodes){
  let newStatusArray = []
    for (const mesh in nodes){
      if (nodes[mesh].type === "Mesh"){
        console.log('mat', nodes[mesh].material)
        const status = {"name": nodes[mesh].name, "status": false}
        newStatusArray.push(status)   
    } 
  }
  return newStatusArray
}

export function createStationComponentsObj(nodes, materials, newStatusArray){
    // this loop creates Station components for every mesh in the nodes from our model import.
    // count and index are used to assign status from newStatusArray to each Station
    let newMapModelObj = {}
    let count = 0
    for (const mesh in nodes){
        if (nodes[mesh].type === "Mesh"){
            let index = count 
            count += 1
            // mesh (name of station) is used as key for mapModelObject
            newMapModelObj[mesh] = 
                <Station name={nodes[mesh].name} 
                      status={newStatusArray[index]}
                      id={nodes[mesh].name} 
                      key={nodes[mesh].name} 
                      mesh={nodes[mesh]} 
                      materials={materials}
                      getStationCode={getStationCode}/>
        } 
      };
    console.log("nmmo func", newMapModelObj)
    return newMapModelObj
}

// if station is included in array of stations in trip, set station or track status to true
// 
export function updateStatusArray(selectedIdArray, newStatusArray){
  let updatedStatusArray = [...newStatusArray]
  for (const name of selectedIdArray){
    for (const status of updatedStatusArray){
        // for station meshes
        if (name === status['name']){
            status['status'] = true
        // for track meshes
        } else if (name === status['name'].slice(0,4)){
          status['status'] = true
        } 
    }
  }
  return updatedStatusArray
}


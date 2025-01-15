
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

export function fillStatusArray(mesh, nodes){
    for (const mesh in nodes){
      if (nodes[mesh].type === "Mesh"){
          const status = {"name": nodes[mesh].name, "status": false}
          newStatusArray.push(status)   
      } 
    };
  }
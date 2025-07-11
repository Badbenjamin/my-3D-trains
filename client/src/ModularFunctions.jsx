import Station from "./Station"

// takes a train (tripInfo) and statusArray as args, returns a list of station and track ids
// these are used to update the status array and highlight a route
export function getAllIds(tripInfo, statusArray){
    // console.log('ti', tripInfo)
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
      console.log('selected station array', selectedStationArray)
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
      // const allIdsArray = selectedStationArray.concat(justTrackIds)
      // console.log("allid in func", allIdsArray)
      // JUST RETURNING SELECTED STATION ARRAY NO TRACK ARRAY RIGHT NOW
      return selectedStationArray
}


// this function creates a status object for each mesh in nodes from our model import and pushes to newStatusArray
// maybe have gtfs_id : t_or_f for easier lookup? 
// MAYBE I DONT EVEN NEED STATUS ARRAY AND CAN REPLACE IT WITH A PROP
export function createStatusObjectArray(nodes){
  let newStatusArray = []
  // let prevNameObj = {}
    for (const mesh in nodes){
      if (nodes[mesh].type === "Mesh" ){
        const status = {"name": nodes[mesh].name.slice(0,3), "status": false}
        newStatusArray.push(status) 
    } 
  }
  // console.log('pno', prevNameObj)
  return newStatusArray
}


export function createStationComponentsObj(nodes, materials,retrieveStationId){
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
                      status={{
                        "display" : true,
                        "disable_cam_alpha" : false,
                        "type" : null,
                        "arrival" : null,
                        "departure" : null,
                        "gtfs_stop_id" : null
                      }}
                      id={nodes[mesh].name} 
                      key={nodes[mesh].name} 
                      mesh={nodes[mesh]} 
                      materials={materials}
                      // getStationCode={getStationCode}
                      // maybe remove if this is in text component now
                      retrieveStationId = {retrieveStationId}
                      />
        } 
      };
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

export function findDistance(point1, point2){
  let x1 = point1["x"]
  let y1 = point1['y']
  let z1 = point1['z']

  let x2 = point2['x']
  let y2 = point2['y']
  let z2 = point2['z']

  let result = Math.sqrt(((x2-x1)**2) + ((y2-y1)**2) + ((z2-z1)**2))
  return result
}
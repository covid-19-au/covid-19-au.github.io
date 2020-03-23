import React, { useEffect, useState } from "react";

const flightNoRegex = /^[A-Za-z]{2}\d*$/;
const flightRouteRegex = /^[A-Za-z]*$/;
const flightDateArrivalRegex = /^\d{0,2}-{0,1}\d{2}-{0,1}\d{0,4}$/;


/**
 * A universal search function based on SearchBase
 * @param {Array} searchList: List of search keys
 * @param {string} type: Type of param includes path, flightNo, and dateArrival
 * @param {Array} searchBase: DataBase we perform the search
 * @returns {Array} list of matched flights
 */
function UniversalSearch(searchList, type, searchBase) {
  if(searchList.length ===0){
    return searchBase
  }
  let returnList = [];
  searchList.forEach(key=>{
    searchBase.forEach(item=>{
      if(item[type].toLowerCase().includes(key.toLowerCase())){
        returnList.push(item)
      }
    })
  })
  return returnList

}

/**
 * Search flight information according user's input
 * @param {String} searchKey keyword used as filter
 * @param {Array} flights List of flights to search
 * @returns {Array} list of matched flights
 */
function SearchFlights(searchKey, flights) {
  let tempResultList = [];
  let keyList = searchKey.split(" ");
  let flightNoKeyList = [];
  let routeKeyList = [];
  let dateArrivalKeyList = [];
  for (let i = 0; i < keyList.length; i++) {
    // ignore empty string
    if (keyList[i] === "") {
      continue;
    }
    if (keyList[i].match(flightNoRegex)) {
      flightNoKeyList.push(keyList[i]);
    } else if (keyList[i].match(flightRouteRegex)) {
      routeKeyList.push(keyList[i]);
    } else if (keyList[i].match(flightDateArrivalRegex)) {
      dateArrivalKeyList.push(keyList[i]);
    }
  }

  let flightNoResult = UniversalSearch(flightNoKeyList,'flightNo',flights);
  let routeKeyResult = UniversalSearch(routeKeyList,'path',flightNoResult);
  let dateArrivalKeyResult = UniversalSearch(dateArrivalKeyList,'dateArrival',routeKeyResult);

  //sort or return
  if(dateArrivalKeyResult.length===0||dateArrivalKeyResult.length===flights.length){
    return[]
  }
   return dateArrivalKeyResult.sort(function(a, b) {
        let arr = a.dateArrival.split("-");
        let dateA = new Date(parseInt(arr[2]), parseInt(arr[1]), parseInt(arr[0]));
        arr = b.dateArrival.split("-");

        let dateB = new Date(parseInt(arr[2]), parseInt(arr[1]), parseInt(arr[0]));
        return new Date(dateB) - new Date(dateA);
    });
}

/**
 * User can search using flight number
 * @param {JSON} flights flights information
 */
function Flights({ flights }) {
  // sort data first
  flights.sort(function(a, b) {
    let arr = a.dateArrival.split("-");
    let dateA = new Date(parseInt(arr[2]), parseInt(arr[1]), parseInt(arr[0]));
    arr = b.dateArrival.split("-");

    let dateB = new Date(parseInt(arr[2]), parseInt(arr[1]), parseInt(arr[0]));
    return new Date(dateB) - new Date(dateA);
  });

  const [flightResult, setFlightResult] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    if (searchKey !== "") {
      setFlightResult(flightResult => SearchFlights(searchKey, flights));
    }
  }, [searchKey]);

  let outputList = [];
  if (searchKey === "") {
    outputList = flights.slice(0 ,5);
  } else {
    outputList = flightResult;
  }
  // remove duplicate
  for (let i = 0; i < outputList.length; i++) {
    if (outputList[i] === outputList[i + 1]) {
      outputList.splice(i, 1);
    }
  }

  return (
    <div className="card">
      <h2>Flights</h2>
      <div className="centerContent">
        <div className="selfCenter standardWidth">
          <div className="searchArea">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Search</span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Enter flight number, route, arrival date"
                onChange={e => setSearchKey(e.target.value)}
              ></input>
            </div>
          </div>

          <div className="flightInfo header">
            <div className="area header">Flight No</div>
            <div className="area header">Airline</div>
            <div className="area header">Route</div>
            <div className="area header">Arrival</div>
            <div className="area header">Close Contact Row</div>
          </div>
          {outputList.length ? (
            outputList.map(flight => (
              <div className="flightInfo header">
                <div className="flightArea">{flight.flightNo}</div>
                <div className="flightArea">{flight.airline}</div>
                <div className="flightArea">{flight.path}</div>
                <div className="flightArea">{flight.dateArrival}</div>
                <div className="flightArea">{flight.closeContactRow}</div>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flights;

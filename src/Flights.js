import React, { useEffect, useState } from "react";

const flightNoRegex = /^[A-Za-z]{2}\d*$/;
const flightRouteRegex = /^[A-Za-z]*$/;
const flightDateArrivalRegex = /^\d{0,2}-{0,1}\d{2}-{0,1}\d{0,4}$/;

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

  for (let i = 0; i < flights.length; i++) {
    let flight = flights[i];
    let flightNo = flight.flightNo.toLowerCase();
    let route = flight.path.toLowerCase();
    let dateArrival = flight.dateArrival.toLowerCase();
    if (flightNoKeyList.length > 0) {
      // search using flight number
      for (let j = 0; j < flightNoKeyList.length; j++) {
        if (flightNo.includes(flightNoKeyList[j].toLowerCase())) {
          if (routeKeyList.length > 0) {
            // search using flight number and route
            for (let k = 0; k < routeKeyList.length; k++) {
              if (route.includes(routeKeyList[k].toLowerCase())) {
                if (dateArrivalKeyList.length > 0) {
                  // search using flight number, route and date arrival
                  for (let l = 0; l < dateArrivalKeyList.length; l++) {
                    if (
                      dateArrival.includes(dateArrivalKeyList[l].toLowerCase())
                    ) {
                      tempResultList.push(flight);
                    }
                  }
                } else {
                  tempResultList.push(flight);
                }
              }
            }
          } else if (dateArrivalKeyList.length > 0) {
            //search using flight number and date arrival
            for (let l = 0; l < dateArrivalKeyList.length; l++) {
              if (dateArrival.includes(dateArrivalKeyList[l].toLowerCase())) {
                tempResultList.push(flight);
              }
            }
          } else {
            tempResultList.push(flight);
          }
        }
      }
    } else if (routeKeyList.length > 0) {
      // search using flight route
      for (let k = 0; k < routeKeyList.length; k++) {
        if (route.includes(routeKeyList[k].toLowerCase())) {
          if (dateArrivalKeyList.length > 0) {
            // search using flight route and date arrival
            for (let l = 0; l < dateArrivalKeyList.length; l++) {
              if (dateArrival.includes(dateArrivalKeyList[l].toLowerCase())) {
                tempResultList.push(flight);
              }
            }
          } else {
            tempResultList.push(flight);
          }
        }
      }
    } else if (dateArrivalKeyList.length > 0) {
      // search using flight date arrival only
      for (let l = 0; l < dateArrivalKeyList.length; l++) {
        if (dateArrival.includes(dateArrivalKeyList[l].toLowerCase())) {
          tempResultList.push(flight);
        }
      }
    }
  }
  return tempResultList;
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

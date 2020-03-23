import React, { useEffect, useState } from "react";

/**
 * Search flight information using flight number as filter
 * @param {Stirng} flightNoKey flight number used as filter
 * @param {Array} flights all flights
 * @returns {Array} list of all matched flights
 */
function SearchByFlightNo(flightNoKey, flights) {
  let tempResultList = [];
  let flightNoKeyList = flightNoKey.split(" ");
  for (let i = 0; i < flights.length; i++) {
    let flight = flights[i];
    let flightNo = flight.flightNo.toLowerCase();
    for (let j = 0; j < flightNoKeyList.length; j++) {
      if (
        flightNo.includes(flightNoKeyList[j].toLowerCase().trim()) &&
        flightNoKeyList[j] !== ""
      ) {
        tempResultList.push(flight);
      }
    }
  }
  return tempResultList;
}

/**
 * Search flight information using flight number as filter
 * @param {Stirng} routeKey flight route used as filter
 * @param {Array} flights all flights
 * @returns {Array} list of all matched flights
 */
function SearchByRoute(routeKey, flights) {
  let tempResultList = [];
  let routeKeyList = routeKey.split(" ");
  for (let i = 0; i < flights.length; i++) {
    let flight = flights[i];
    let route = flight.path.toLowerCase();
    for (let j = 0; j < routeKeyList.length; j++) {
      if (
        route.includes(routeKeyList[j].toLowerCase().trim()) &&
        routeKeyList[j] !== ""
      ) {
        tempResultList.push(flight);
      }
    }
  }
  return tempResultList;
}

/**
 * Search flight information using flight number as filter
 * @param {Stirng} dateArrivalKey flight arrival date used as filter
 * @param {Array} flights all flights
 * @returns {Array} list of all matched flights
 */
function SearchByDateArrival(dateArrivalKey, flights) {
  let tempResultList = [];
  let dateArrivalKeyList = dateArrivalKey.split(" ");
  for (let i = 0; i < flights.length; i++) {
    let flight = flights[i];
    let dateArrival = flight.dateArrival.toLowerCase();
    for (let j = 0; j < dateArrivalKeyList.length; j++) {
      if (
        dateArrival.includes(dateArrivalKeyList[j].toLowerCase().trim()) &&
        dateArrivalKeyList !== ""
      ) {
        tempResultList.push(flight);
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
  const [flightNoKey, setFlightNoKey] = useState("");
  const [routeKey, setRouteKey] = useState("");
  const [dateArrivalKey, setDateArrivalKey] = useState("");

  useEffect(() => {
    let tempResultList = [];
    tempResultList = SearchByFlightNo(flightNoKey, flights);
    setFlightResult(flightResult => tempResultList);
  }, [flightNoKey]);

  useEffect(() => {
    let tempResultList = [];
    if (flightResult.length === 0) {
      tempResultList = SearchByRoute(routeKey, flights);
    } else {
      tempResultList = SearchByRoute(routeKey, flightResult);
    }

    setFlightResult(flightResult => tempResultList);
  }, [routeKey]);

  useEffect(() => {
    let tempResultList = [];
    if (flightResult.length === 0) {
      tempResultList = SearchByDateArrival(dateArrivalKey, flights);
    } else {
      tempResultList = SearchByDateArrival(dateArrivalKey, flightResult);
    }
    setFlightResult(flightResult => tempResultList);
  }, [dateArrivalKey]);

  let uniqueFlight = []; // remove duplicate object
  if (flightResult.length !== 0) {
    console.log("Complete sorting...\nRemoving duplicates ");
    for (var i = 0; i < flightResult.length; i++) {
      if (flightResult[i] !== flightResult[i + 1]) {
        uniqueFlight.push(flightResult[i]);
      }
    }
  }

  if (flightNoKey === "" && routeKey === "" && dateArrivalKey === "") {
    if (flightResult.length === 0) {
      uniqueFlight = flights.slice(0, 5);
    } else {
      uniqueFlight = flightResult.slice(0, 5);
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
                <span className="input-group-text">Flight Number: </span>
              </div>
              <input
                type="text"
                className="form-control"
                onChange={e => setFlightNoKey(e.target.value)}
              ></input>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Flight Route: </span>
              </div>
              <input
                type="text"
                className="form-control"
                onChange={e => setRouteKey(e.target.value)}
              ></input>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Arrival Date: </span>
              </div>
              <input
                type="text"
                className="form-control"
                onChange={e => setDateArrivalKey(e.target.value)}
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
          {uniqueFlight.length ? (
            uniqueFlight.map(flight => (
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

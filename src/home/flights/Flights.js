import React, { useEffect, useState } from "react";
import ReactGA from "react-ga";
import uuid from "react-uuid";
import Acknowledgement from "../../common/Acknowledgment"
// import i18n bundle
import i18next from '../../assets/translations/i18n';

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
  if (searchList.length === 0) {
    return searchBase
  }
  let returnList = [];
  searchList.forEach(key => {
    searchBase.forEach(item => {
      if (item[type].toLowerCase().includes(key.toLowerCase())) {
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
  ReactGA.event({ category: 'SearchFlights', action: "search", label: searchKey });
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

  let flightNoResult = UniversalSearch(flightNoKeyList, 'flightNo', flights);
  let routeKeyResult = UniversalSearch(routeKeyList, 'path', flightNoResult);
  let dateArrivalKeyResult = UniversalSearch(dateArrivalKeyList, 'dateArrival', routeKeyResult);

  //sort or return
  if (dateArrivalKeyResult.length === 0 || dateArrivalKeyResult.length === flights.length) {
    return []
  }
  return sortFlight(dateArrivalKeyResult);
}

/**
 * Sort flight from latest arrival date to oldest arrival date
 * @param {Array} flights list of flight need to be sorted
 */
function sortFlight(flights) {
  return flights.sort((a, b) => {
    let arr = a.dateArrival.split("-");
    let dateA = new Date(parseInt(arr[2]), parseInt(arr[1]) - 1, parseInt(arr[0]));
    arr = b.dateArrival.split("-");
    let dateB = new Date(parseInt(arr[2]), parseInt(arr[1]) - 1, parseInt(arr[0]));
    return dateB - dateA;
  })
}

/**
 * Method for formatting time into am/pm format
 * @param {Date} date date
 */
function ordinal_suffix_of(i) {
  var j = i % 10,
      k = i % 100;
  if (j == 1 && k != 11) {
      return i + "st";
  }
  if (j == 2 && k != 12) {
      return i + "nd";
  }
  if (j == 3 && k != 13) {
      return i + "rd";
  }
  return i + "th";
}

/**
 * Method for adding aria label for accessibility to flight row details
 * @param {JSON} flight flight information
 */
function getAriaLabelForFlight(flight) {
  var flightDateArrival = new Date(flight.dateArrival)
  var flightDateStr = ordinal_suffix_of(flightDateArrival.getDate()) + ' of '
  const month = flightDateArrival.toLocaleString('default', { month: 'long' });
  flightDateStr += month + ' ' + flightDateArrival.getFullYear()
  return `The close contact rows in Flight number ${flight.flightNo} of ${flight.airline} flying from ${flight.path} whose scheduled arrival date was ${flightDateStr} are ${flight.closeContactRow.split(",").join(",")}`
}

/**
 * User can search using flight number
 * @param {JSON} flights flights information
 */
function Flights({ flights }) {
  // sort data first
  flights = sortFlight(flights);

  const [flightResult, setFlightResult] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    if (searchKey !== "") {
      setFlightResult(flightResult => SearchFlights(searchKey, flights));
    }
  }, [searchKey]);

  let outputList = [];
  if (searchKey === "") {
    outputList = flights.slice(0, 5);
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

      <h2 style={{ display: "flex" }} aria-label="Flights with reported COVID 19 cases">{i18next.t("homePage:flights.title")}<div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
        <Acknowledgement>
        </Acknowledgement></div></h2>
      <div className="centerContent">
        <div role={"table"} className="selfCenter standardWidth">
          <div className="searchArea">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">{i18next.t("homePage:flights.searchButton")}</span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={i18next.t("homePage:flights.searchPlaceholder")}
                onChange={e => setSearchKey(e.target.value)}
              ></input>
            </div>
          </div>

          <div className="flightInfo header">
            <div className="area header">{i18next.t("homePage:flights.tableHeader1")}</div>
            <div className="area header">{i18next.t("homePage:flights.tableHeader2")}</div>
            <div className="area header">{i18next.t("homePage:flights.tableHeader3")}</div>
            <div className="area header">{i18next.t("homePage:flights.tableHeader4")}</div>
            <div className="area header">{i18next.t("homePage:flights.tableHeader5")}</div>
          </div>
          {outputList.length ? (
        outputList.map(flight => (
          <div role={"button"} aria-label={getAriaLabelForFlight(flight)} aria-describedby={getAriaLabelForFlight(flight)} className="flightInfo header" key={uuid()}>
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

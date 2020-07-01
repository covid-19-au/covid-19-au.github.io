import React, { useState } from "react";
import Tag from "./Tag";
import stateCaseData from "../data/stateCaseData";

import Acknowledgement from "../Acknowledgment";
import todayData from "../data/stateCaseData.json";
import previousData from "../data/state.json";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";

// import i18n bundle
import i18next from "../i18n";
import Grid from "@material-ui/core/Grid";

/**
 * Method for adding suffix to date
 * @param {int} i date
 */
function ordinal_suffix_of(i) {
  var j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}

/**
 * Method for formatting time into am/pm format
 * @param {Date} date date
 */
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + " " + minutes + " " + ampm;
  return strTime;
}

/**
 * Method for adding aria label to datetime of status update
 * @param {String} updatedTime update time for status information
 */
function getAriaLabelForUpdatedTime(updatedTime) {
  var timeElem = updatedTime.split(" ")[0].split(":");
  var dateElem = [];
  if (updatedTime.split(" ")[1].includes("/")) {
    dateElem = updatedTime.split(" ")[1].split("/");
  } else if (updatedTime.split(" ")[1].includes("-")) {
    dateElem = updatedTime.split(" ")[1].split("-");
  }
  var tempDate = new Date(
    dateElem[2],
    dateElem[1],
    dateElem[0],
    timeElem[0],
    timeElem[1]
  );
  const month = tempDate.toLocaleString("default", { month: "long" });
  return `Time in AEST, last updated at: ${ordinal_suffix_of(
    tempDate.getDate()
  )} of ${month} ${tempDate.getFullYear()} at ${formatAMPM(tempDate)}`;
}

function UpdatesToday() {
  const [update, setUpdate] = useState("No New Cases");

  const updateStates = [
    "Cases",
    "Deaths",
    "Recoveries",
    "Tested",
    "No New Cases",
  ];

  let currentView;

  if (update === "Cases") {
    currentView = 0;
  }

  if (update === "Deaths") {
    currentView = 1;
  }

  if (update === "Recoveries") {
    currentView = 2;
  }

  if (update === "Tested") {
    currentView = 3;
  }

  if (update === "No New Cases") {
    currentView = 4;
  }

  let today = new Date();
  let yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  let yesterdayKey =
    yesterday.getFullYear().toString() +
    "-" +
    parseInt(yesterday.getMonth() + 1).toString() +
    "-" +
    yesterday.getDate().toString();

  let yesterdayData = previousData[yesterdayKey];

  let stateUpdateStatus = {};
  let noNewCasesStreak = {};

  for (let state in yesterdayData) {
    stateUpdateStatus[state] = [false, false, false, false, false];

    //First index is check status for loop, second index is streak
    noNewCasesStreak[state] = [true, 0];
  }

  let todayDataObject = {};

  let values = todayData["values"];

  let i = 0;
  while (i < values.length) {
    let currentState = values[i][0];
    todayDataObject[currentState] = [];
    todayDataObject[currentState].push(values[i][1]);
    todayDataObject[currentState].push(values[i][2]);
    todayDataObject[currentState].push(values[i][3]);
    todayDataObject[currentState].push(values[i][4]);
    todayDataObject[currentState].push(values[i][8]);
    i = i + 1;
  }

  for (let state in stateUpdateStatus) {
    if (
      parseInt(todayDataObject[state][0]) !== parseInt(yesterdayData[state][0])
    ) {
      stateUpdateStatus[state][0] = true;
    }
    if (
      parseInt(todayDataObject[state][1]) !== parseInt(yesterdayData[state][1])
    ) {
      stateUpdateStatus[state][1] = true;
    }
    if (
      parseInt(todayDataObject[state][2]) !== parseInt(yesterdayData[state][2])
    ) {
      stateUpdateStatus[state][2] = true;
    }
    if (
      parseInt(todayDataObject[state][3]) !== parseInt(yesterdayData[state][3])
    ) {
      stateUpdateStatus[state][3] = true;
    }

    //This makes sure there is no increase in cases
    if (
      todayDataObject[state][4] === "true" &&
      parseInt(todayDataObject[state][0]) <= parseInt(yesterdayData[state][0])
    ) {
      stateUpdateStatus[state][4] = true;
    }
  }

  for (let state in noNewCasesStreak) {
    //Create keys for data for previous two days
    let date0 = new Date();
    let date1 = new Date(date0);
    date1.setDate(date1.getDate() - 1);
    let date2 = new Date(date1);
    date2.setDate(date2.getDate() - 1);
    let key1 =
      date1.getFullYear().toString() +
      "-" +
      parseInt(date1.getMonth() + 1).toString() +
      "-" +
      date1.getDate().toString();
    let key2 =
      date2.getFullYear().toString() +
      "-" +
      parseInt(date2.getMonth() + 1).toString() +
      "-" +
      date2.getDate().toString();

    let streakCount = 0;

    //While streak is true
    while (noNewCasesStreak[state][0]) {
      //Check if new cases on date 1 = new cases on date 2
      if (previousData[key1][state][0] <= previousData[key2][state][0]) {
        streakCount = streakCount + 1;

        //Set date 1 and date 2 back by one day
        date1.setDate(date1.getDate() - 1);
        date2.setDate(date2.getDate() - 1);

        key1 =
          date1.getFullYear().toString() +
          "-" +
          parseInt(date1.getMonth() + 1).toString() +
          "-" +
          date1.getDate().toString();
        key2 =
          date2.getFullYear().toString() +
          "-" +
          parseInt(date2.getMonth() + 1).toString() +
          "-" +
          date2.getDate().toString();
      } else {
        //Check if no new cases reported today
        if (stateUpdateStatus[state][4]) {
          streakCount = streakCount + 1;
          noNewCasesStreak[state][1] = streakCount;
          noNewCasesStreak[state][0] = false;
        }
        //If no new cases is false
        else {
          //Compare today data with yesterday data
          if (
            parseInt(todayDataObject[state][0]) <=
            parseInt(yesterdayData[state][0])
          ) {
            //Set streak if case number is unchanged
            noNewCasesStreak[state][1] = streakCount;
            noNewCasesStreak[state][0] = false;
          } else {
            //Set streak to 0 if case number has changed
            noNewCasesStreak[state][1] = 0;
            noNewCasesStreak[state][0] = false;
          }
        }
      }
    }
  }

  const fontSize = window.innerWidth > 767 ? "5rem" : "1rem";

  const switchStyles = [
    {
      //Cases
      color: "black",
      borderColor: "#ff603c",
      padding: "1px",
      zIndex: 10,
      outline: "none",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontSize: "80%",
      marginTop: "0.5rem",
      textTransform: "none",
    },
    {
      //Deaths
      color: "black",
      borderColor: "#c11700",
      padding: "1px",
      zIndex: 10,
      outline: "none",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontSize: "80%",
      marginTop: "0.5rem",
      textTransform: "none",
    },
    {
      //Recoveries
      color: "black",
      borderColor: "#00c177",
      padding: "1px",
      zIndex: 10,
      outline: "none",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontSize: "80%",
      marginTop: "0.5rem",
      textTransform: "none",
    },
    {
      //Tested
      color: "black",
      borderColor: "#007cf2",
      padding: "1px",
      zIndex: 10,
      outline: "none",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontSize: "80%",
      marginTop: "0.5rem",
      textTransform: "none",
    },
    {
      //No New Cases
      color: "black",
      borderColor: "#00c177",
      padding: "1px",
      zIndex: 10,
      outline: "none",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontSize: "80%",
      marginTop: "0.5rem",
      textTransform: "none",
    },
  ];

  const dataStyles = [
    {
      color: "#ff603c",
      padding: "0px",
      border: "none",
      zIndex: 10,
      backgroundColor: "#f2f4f4",
      fontWeight: "bold",
      fontSize: "80%",
    },
    {
      color: "#c11700",
      padding: "0px",
      border: "none",
      zIndex: 10,
      backgroundColor: "#f2f4f4",
      fontWeight: "bold",
      fontSize: "80%",
    },
    {
      color: "#00c177",
      padding: "0px",
      border: "none",
      zIndex: 10,
      backgroundColor: "#f2f4f4",
      fontWeight: "bold",
      fontSize: "80%",
    },
    {
      color: "#007cf2",
      padding: "0px",
      border: "none",
      zIndex: 10,
      backgroundColor: "#f2f4f4",
      fontWeight: "bold",
      fontSize: "80%",
    },
    {
      color: "#00c177",
      padding: "0px",
      border: "none",
      zIndex: 10,
      backgroundColor: "#f2f4f4",
      fontWeight: "bold",
      fontSize: "80%",
    },
  ];
  const inactiveStyles = {
    color: "#ccd1d1",
    padding: "0px",
    border: "none",
    backgroundColor: "#f2f4f4",
    fontSize: "80%",
  };

  const inactiveStylesSwitch = {
    color: "grey",
    borderColor: "#e3e3e3",
    padding: "1px",
    outline: "none",
    paddingLeft: "5px",
    paddingRight: "5px",
    fontSize: "80%",
    marginTop: "0.5rem",
    textTransform: "none",
    fontWeight: "normal",
  };

  const inactiveStylesStreak = {
    color: "#ccd1d1",
    padding: "0px",
    border: "none",
    backgroundColor: "#f2f4f4",
    fontSize: "80%",
  };

  const activeStylesStreak = {
    color: "#00c177",
    padding: "0px",
    border: "none",
    backgroundColor: "#f2f4f4",
    fontWeight: "bold",
    fontSize: "80%",
    textTransform: "none",
  };

  return (
    <div
      style={{
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
      className="dailyUpdateHeader"
    >
      {i18next.t("homePage:status.updateTitle")}{" "}
      <button
        className="hoverButton"
        data-toggle="tooltip"
        data-placement="bottom"
        data-html="true"
        title="<em>Highlighted states have updated selected data today. Click state for details.</em>"
      >
        <svg
          className="bi bi-question-circle"
          width="0.7em"
          height="0.7em"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
            clipRule="evenodd"
          />
          <path d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
        </svg>
      </button>{" "}
      : &nbsp;
      <ButtonGroup color="primary" aria-label="outlined primary button group">
        {updateStates.map((updateType, index) => (
          <Button
            style={
              updateType === update ? switchStyles[index] : inactiveStylesSwitch
            }
            onClick={() => setUpdate(updateType)}
            size="small"
            key={updateType}
          >
            {i18next.t("homePage:status." + updateType)}
          </Button>
        ))}
      </ButtonGroup>
      <ButtonGroup
        color="primary"
        aria-label="outlined primary button group"
        fullWidth={true}
        style={{ marginTop: "0.5rem" }}
      >
        {Object.keys(stateUpdateStatus).map((state, status) => (
          <Button
            href={("./state/" + state).toLowerCase()}
            style={
              stateUpdateStatus[state][currentView]
                ? dataStyles[currentView]
                : inactiveStyles
            }
            key={state}
          >
            {i18next.t("homePage:state." + state)}{" "}
          </Button>
        ))}
      </ButtonGroup>
      {currentView === 4 ? (
        <ButtonGroup
          color="primary"
          aria-label="outlined primary button group"
          fullWidth={true}
          style={{ marginTop: "0.5rem" }}
        >
          {Object.keys(stateUpdateStatus).map((state, status) => (
            <Button
              href={("./state/" + state).toLowerCase()}
              style={
                noNewCasesStreak[state][1] > 0
                  ? activeStylesStreak
                  : inactiveStylesStreak
              }
              key={state}
            >
              {noNewCasesStreak[state][1] == 0
                ? ""
                : noNewCasesStreak[state][1]}
            </Button>
          ))}
        </ButtonGroup>
      ) : (
        ""
      )}
      {currentView === 4 ? (
        <span
          className="due"
          style={{ fontSize: "80%", paddingTop: 0, marginLeft: 0, padding: 0 }}
        >
          *<strong>Consecutive </strong>days without new cases
        </span>
      ) : (
        ""
      )}
      {/*<p style={{ marginBottom: "5px", marginTop: "10px" }}>New Deaths:</p>
            <ButtonGroup color="primary" aria-label="outlined primary button group" style={{ buttonGroupStyles }} fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][1] ? deathActiveStyles : inactiveStyles}>{state}</Button>

                ))}
            </ButtonGroup>

            <p style={{ marginBottom: "5px", marginTop: "10px" }}>New Recoveries:</p>
            <ButtonGroup color="primary" aria-label="outlined primary button group" style={{ buttonGroupStyles }} fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][2] ? recoveredActiveStyles : inactiveStyles}>{state}</Button>

                ))}
            </ButtonGroup>

            <p style={{ marginBottom: "5px", marginTop: "10px" }}>New Tested:</p>
            <ButtonGroup color="primary" aria-label="outlined primary button group" style={{ buttonGroupStyles }} fullWidth="true" >

                {Object.keys(stateUpdateStatus).map((state, status) => (
                    <Button
                        href={("./state/" + state).toLowerCase()}
                        style={stateUpdateStatus[state][3] ? testedActiveStyles : inactiveStyles}>{state}</Button>

                ))}
                </ButtonGroup>*/}
    </div>
  );
}

export default function Stat({
  modifyTime,
  confirmedCount,
  suspectedCount,
  deadCount,
  curedCount,
  testedCount,
  name,
  quanguoTrendChart,
  hbFeiHbTrendChart,
  data,
  countryData,
  activeCount,
  hospitalCount,
  icuCount,
}) {
  let confCountIncrease = 0;
  let deadCountIncrease = 0;
  let curedCountIncrease = 0;
  let testedCountIncrease = 0;
  let activeCountIncrease = 0;
  let hospitalCountIncrease = 0;
  let icuCountIncrease = 0;
  if (data && countryData) {
    confirmedCount = 0;
    testedCount = 0;
    deadCount = 0;
    curedCount = 0;
    activeCount = 0;
    hospitalCount = 0;
    icuCount = 0;
    for (let i = 0; i < data.length; i++) {
      confirmedCount += parseInt(data[i][1]);
      deadCount += parseInt(data[i][2]);
      curedCount += parseInt(data[i][3]);
      activeCount += parseInt(data[i][5]);
      hospitalCount += parseInt(data[i][6]);
      icuCount += parseInt(data[i][7]);

      if (data[i][4] === "N/A") {
        //do nothing
      } else {
        testedCount += parseInt(data[i][4]);
      }
    }
    let lastTotal =
      countryData[
        Object.keys(countryData)[Object.keys(countryData).length - 1]
      ];
    confCountIncrease = confirmedCount - lastTotal[0];
    deadCountIncrease = deadCount - lastTotal[2];
    curedCountIncrease = curedCount - lastTotal[1];
    testedCountIncrease = testedCount - lastTotal[4];
    activeCountIncrease = activeCount - lastTotal[5];
    hospitalCountIncrease = hospitalCount - lastTotal[6];
    icuCountIncrease = icuCount - lastTotal[7];
  } else {
    confirmedCount = 0;
    deadCount = 0;
    curedCount = 0;
    testedCount = 0;
    activeCount = 0;
    hospitalCount = 0;
    icuCount = 0;
  }

  return (
    <div className="card">
      <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">
        {i18next.t("homePage:status.title")}
        {name ? `· ${name}` : false}
        <div
          style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}
        >
          <Acknowledgement></Acknowledgement>
        </div>
      </h2>

      <Grid
        container
        spacing={1}
        justify="center"
        wrap="wrap"
        style={{ padding: "5px" }}
      >
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={confirmedCount}
            fColor={"#ff603c"}
            increased={confCountIncrease}
            typeOfCases={"Confirmed"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>All confirmed cases of COVID-19 so far, including deaths and recoveries.</em>"
            >
              {i18next.t("homePage:status.confirm")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3} style={{ width: "50px" }}>
          {/*<Tag number={suspectedCount || '-'}>*/}
          {/*疑似*/}
          {/*</Tag>*/}
          <Tag
            number={deadCount}
            fColor={"#c11700"}
            increased={deadCountIncrease}
            typeOfCases={"Deaths"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>All confirmed deaths due to COVID-19, including 1 from the Diamond Princess cruise ship.</em>"
            >
              {i18next.t("homePage:status.Deaths")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={curedCount}
            fColor={"#00c177"}
            increased={curedCountIncrease}
            typeOfCases={"Recovered"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people that have recovered from COVID-19.</em>"
            >
              {i18next.t("homePage:status.Recoveries")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={3} lg={3} xl={3}>
          <Tag
            number={testedCount}
            fColor={"#007cf2"}
            increased={testedCountIncrease}
            typeOfCases={"Tested"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people that have been tested for COVID-19.</em>"
            >
              {i18next.t("homePage:status.Tested")}
            </button>
          </Tag>
        </Grid>

        <Grid item xs={4} sm={3} lg={3} xl={3}>
          <Tag
            number={activeCount}
            fColor={"#f75c8d"}
            increased={activeCountIncrease}
            typeOfCases={"Active Cases"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Existing confirmed cases that have not yet recovered.</em>"
            >
              {i18next.t("homePage:status.active")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={4} sm={3} lg={4} xl={4}>
          <Tag
            number={hospitalCount}
            fColor={"#9d71ea"}
            increased={hospitalCountIncrease}
            typeOfCases={"In Hospital"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people in hospital with COVID-19.</em>"
            >
              {i18next.t("homePage:status.hospital")}
            </button>
          </Tag>
        </Grid>
        <Grid item xs={4} sm={3} lg={3} xl={3}>
          <Tag
            number={icuCount}
            fColor={"#00aac1"}
            increased={icuCountIncrease}
            typeOfCases={"In ICU"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people with COVID-19 in intensive care.</em>"
            >
              {i18next.t("homePage:status.icu")}
            </button>
          </Tag>
        </Grid>

        <Grid item xs={12}>
          <UpdatesToday></UpdatesToday>
        </Grid>
      </Grid>
      <span
        className="due"
        style={{ fontSize: "80%", paddingTop: 0 }}
        aria-label={getAriaLabelForUpdatedTime(stateCaseData.updatedTime)}
        aria-describedby={getAriaLabelForUpdatedTime(stateCaseData.updatedTime)}
      >
        {i18next.t("homePage:status.note")}
        {stateCaseData.updatedTime}
      </span>

      {/*<div>*/}
      {/*<img width="100%" src={quanguoTrendChart[0].imgUrl} alt="" />*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*<img width="100%" src={hbFeiHbTrendChart[0].imgUrl} alt="" />*/}
      {/*</div>*/}
    </div>
  );
}

import React, { useState } from "react";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";

import previousData from "../../data/state.json";
import todayData from "../../data/stateCaseData.json";
import cm from "../../common/color_management/ColorManagement";
import i18next from "../../assets/translations/i18n";


export default function UpdatesToday() {
  const [update, setUpdate] = useState("No New Cases");

  const updateStates = [
    "Cases",
    "Deaths",
    "Recoveries",
    "Tested",
    "No New Cases",
  ];

  let currentView = {
    Cases: 0,
    Deaths: 1,
    Recoveries: 2,
    Tested: 3,
    "No New Cases": 4
  }[update];

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
    if (parseInt(todayDataObject[state][0]) !== parseInt(yesterdayData[state][0])) {
      stateUpdateStatus[state][0] = true;
    } else if (parseInt(todayDataObject[state][1]) !== parseInt(yesterdayData[state][1])) {
      stateUpdateStatus[state][1] = true;
    } else if (parseInt(todayDataObject[state][2]) !== parseInt(yesterdayData[state][2])) {
      stateUpdateStatus[state][2] = true;
    } else if (parseInt(todayDataObject[state][3]) !== parseInt(yesterdayData[state][3])) {
      stateUpdateStatus[state][3] = true;
    }

    if (
      todayDataObject[state][4] === "true" &&
      parseInt(todayDataObject[state][0]) <= parseInt(yesterdayData[state][0])
    ) {
      // This makes sure there is no increase in cases
      stateUpdateStatus[state][4] = true;
    }
  }

  function getDateKey(date) {
    return (
        date.getFullYear().toString() +
        "-" +
        parseInt(date.getMonth() + 1).toString() +
        "-" +
        date.getDate().toString()
    );
  }

  for (let state in noNewCasesStreak) {
    //Create keys for data for previous two days
    let date0 = new Date();
    let date1 = new Date(date0);
    date1.setDate(date1.getDate() - 1);
    let date2 = new Date(date1);
    date2.setDate(date2.getDate() - 1);
    let key1 = getDateKey(date1);
    let key2 = getDateKey(date2);

    let streakCount = 0;

    // While streak is true
    while (noNewCasesStreak[state][0]) {
      if (previousData[key1][state][0] <= previousData[key2][state][0]) {
        // Check if new cases on date 1 = new cases on date 2
        streakCount = streakCount + 1;

        // Set date 1 and date 2 back by one day
        date1.setDate(date1.getDate() - 1);
        date2.setDate(date2.getDate() - 1);

        key1 = getDateKey(date1);
        key2 = getDateKey(date2);
      } else {
        if (stateUpdateStatus[state][4]) {
          //Check if no new cases reported today
          streakCount = streakCount + 1;
          noNewCasesStreak[state][1] = streakCount;
          noNewCasesStreak[state][0] = false;
        }

        else {
          //If no new cases is false

          //Compare today data with yesterday data
          if (parseInt(todayDataObject[state][0]) <= parseInt(yesterdayData[state][0])) {
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
  const fontColor = cm.getPillButtonColors(true)['color'];

  function getSwitchStyles(statusTextColorScheme) {
    return {
      color: fontColor,
      borderColor: cm.getStatusTextColor(statusTextColorScheme),
      padding: "1px",
      zIndex: 10,
      outline: "none",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontSize: "80%",
      marginTop: "0.5rem",
      textTransform: "none",
    }
  }

  const switchStyles = [
    getSwitchStyles('confirmed'),
    getSwitchStyles('deaths'),
    getSwitchStyles('recovered'),
    getSwitchStyles('tested'),
    getSwitchStyles('noNewCases')
  ];

  let backgroundColor,
      inactiveTextColor,
      activeTextColor;

  if (cm.getColorSchemeType() === cm.COLOR_SCHEME_LIGHT) {
    backgroundColor = '#f2f4f4';
    inactiveTextColor = "#ccd1d1";
    activeTextColor = '#00c177';
  } else {
    backgroundColor = '#1a1a1a';
    inactiveTextColor = "#2a2b2b";
    activeTextColor = '#00c478';
  }

  function getDataStyle(statusTextColorScheme) {
    return {
      color: cm.getStatusTextColor(statusTextColorScheme),
      padding: "0px",
      border: "none",
      zIndex: 10,
      backgroundColor: backgroundColor,
      fontWeight: "bold",
      fontSize: "80%",
    };
  }

  const dataStyles = [
      getDataStyle('confirmed'),
      getDataStyle('deaths'),
      getDataStyle('recovered'),
      getDataStyle('tested'),
      getDataStyle('noNewCases')
  ];
  const inactiveStyles = {
    color: inactiveTextColor,
    padding: "0px",
    border: "none",
    backgroundColor: backgroundColor,
    fontSize: "80%",
  };

  const inactiveStylesSwitch = {
    color: cm.getPillButtonColors(false)['color'],
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
    color: inactiveTextColor,
    padding: "0px",
    border: "none",
    backgroundColor: backgroundColor,
    fontSize: "80%",
  };

  const activeStylesStreak = {
    color: activeTextColor,
    padding: "0px",
    border: "none",
    backgroundColor: backgroundColor,
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
    </div>
  );
}

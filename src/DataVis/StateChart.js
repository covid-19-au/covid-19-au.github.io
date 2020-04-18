import React, { Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactGA from "react-ga";
import latestAusData from "../data/stateCaseData";
import Tag from "../HomePage/Tag";

import AgeChart from "./AgeChart";
import GenderChart from "./GenderChart";
import GeneralBarChart from "./GeneralBarChart";
import GeneralLineChart from "./GeneralLineChart";

const stateNameMapping = {
  VIC: "Victoria",
  NSW: "New South Wales",
  QLD: "Queensland",
  ACT: "Australian Capital Territory",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
};

/**
 * get choosen state data
 * @param {String} state user chosed state
 * @return {Object} object which contains age and gender data for a specific state. Return null if the choosen state data is not available
 */
function getExpectStateData(state) {
  return state.toUpperCase() in ageGenderData ? ageGenderData[state] : null;
}

/**
 * get latest data for user selected state
 * @param {String} state user selected state
 * @return {Array} latest data of user choosen state
 */
function getLastData(state) {
  return stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]][
    state
  ];
}

/**
 * Render the state's status table
 * @param {String} state user selected state
 */
function renderStatus(state) {
  let lastData = getLastData(state.toUpperCase());
  let latestData = latestAusData["values"];
  for (let i = 0; i < latestData.length; i++) {
    if (latestData[i][0].toString() === state.toUpperCase()) {
      latestData = latestData[i].slice(1, latestData.length);
    }
  }

  return (
    <div>
      <Grid container spacing={1} justify="center" wrap="wrap" style={{ padding: "5px" }}>

        <Grid item xs={6} sm={4} lg={2}>
          <Tag
            number={numberWithCommas(latestData[0])}
            fColor={"#ff603c"}
            increased={latestData[0] - lastData[0]}
            typeOfCases={"Confirmed"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>All confirmed cases of COVID-19 so far, including deaths and recoveries.</em>"
            >
              Confirmed
          </button>

          </Tag>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Tag
            number={numberWithCommas(latestData[1])}
            fColor={"#c11700"}
            increased={latestData[1] - lastData[1]}
            typeOfCases={"Death"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>All confirmed deaths due to COVID-19, including 1 from the Diamond Princess cruise ship.</em>"
            >
              Deaths
          </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Tag
            number={numberWithCommas(latestData[2])}
            fColor={"#00c177"}
            increased={latestData[2] - lastData[2]}
            typeOfCases={"Recovered"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people that have recovered from COVID-19.</em>"
            >
              Recovered
          </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Tag
            number={numberWithCommas(latestData[3])}
            fColor={"#007cf2"}
            increased={latestData[3] - lastData[3]}
            typeOfCases={"Tested"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people that have been tested for COVID-19.</em>"
            >
              Tested
          </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Tag
            number={numberWithCommas(latestData[4])}
            fColor={"#9d71ea"}
            increased={latestData[4] - lastData[4]}
            typeOfCases={"In Hospital"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people in hospital with COVID-19.</em>"
            >
              in Hospital
          </button>
          </Tag>
        </Grid>
        <Grid item xs={6} sm={4} lg={2}>
          <Tag
            number={numberWithCommas(latestData[5])}
            fColor={"#00aac1"}
            increased={latestData[5] - lastData[5]}
            typeOfCases={"ICU"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Number of people with COVID-19 in intensive care.</em>"
            >
              in ICU
          </button>
          </Tag>
        </Grid>
      </Grid>
    </div>
  );
}

function StateChart({ state }) {
  const statusUpdateTime = latestAusData["updatedTime"];

  // get choosen state data
  const stateAgeGenderData = getExpectStateData(state);

  ReactGA.pageview("/state/" + state);

  return (
    <Grid container spacing={1} justify="center" wrap="wrap">
      <Grid item xs={11} sm={11} md={4}>
        <div className="card">
          <div className="table">
            <h2>{stateNameMapping[state]}</h2>
            {renderStatus(state.toUpperCase())}
            <span className="due" style={{ fontSize: "80%", padding: 0 }}>
              Time in AEST, Last Update: {statusUpdateTime}
            </span>
          </div>
        </div>
      </Grid>
      <GeneralBarChart state={state} />
      <GeneralLineChart state={state} />
      {stateAgeGenderData !== null ? (
        <Fragment>
          <GenderChart state={state} />
          <AgeChart state={state} />
        </Fragment>
      ) : (
          <Grid item xs={11} sm={11} md={5}>
            <h2 style={{ textAlign: "center" }}>
              We are working on acquiring detailed age group and gender data for{" "}
              {stateNameMapping[state]}!
          </h2>
            <br />
            <h5 style={{ textAlign: "center" }}>
              If you have reliable source for such data, please let us know
            through{" "}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                this
            </a>{" "}
            form.
          </h5>
          </Grid>
        )}
    </Grid>
  );
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default StateChart;

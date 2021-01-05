import React from "react";
import Grid from "@material-ui/core/Grid";
import ageGenderData from "../../data/ageGender.json";
import stateData from "../../data/state.json";
import latestAusData from "../../data/stateCaseData.json";
import Tag from "../../home/Tag";

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


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      <Grid
        container
        spacing={1}
        justify="center"
        wrap="wrap"
        style={{ padding: "5px" }}
      >
        <Grid item xs={6} sm={4} lg={3}>
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
        <Grid item xs={6} sm={4} lg={3}>
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
        <Grid item xs={6} sm={4} lg={3}>
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
        <Grid item xs={6} sm={4} lg={3}>
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
        <Grid item xs={4} sm={4} lg={3}>
          <Tag
            number={numberWithCommas(latestData[4])}
            fColor={"#f75c8d"}
            increased={latestData[4] - lastData[4]}
            typeOfCases={"Active"}
          >
            <button
              className="hoverButton"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title="<em>Existing confirmed cases that have not yet recovered.</em>"
            >
              Active
            </button>
          </Tag>
        </Grid>
        <Grid item xs={4} sm={4} lg={3}>
          <Tag
            number={numberWithCommas(latestData[5])}
            fColor={"#9d71ea"}
            increased={latestData[5] - lastData[5]}
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
        <Grid item xs={4} sm={4} lg={3}>
          <Tag
            number={numberWithCommas(latestData[6])}
            fColor={"#00aac1"}
            increased={latestData[6] - lastData[6]}
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

export default renderStatus;

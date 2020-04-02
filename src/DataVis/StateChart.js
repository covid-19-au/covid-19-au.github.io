import React from "react";
import Grid from "@material-ui/core/Grid";

import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactEcharts from "echarts-for-react";

// const color = {
//   male: "#ff0000",
//   female: "#0000ff",
//   notStated: "#000000"
// };

/**
 * get gender data for expect state
 * @param {Object} expectState state object contains age and gender data
 * @return {Array} list of gender data
 */
function getGenderData(expectState) {
  return expectState["gender"];
}

/**
 * get age chart labels
 * @param {Object} expectState state object contains age and gender data
 * @return {Array} age chart labels
 */
function getAgeChartLabels(expectState) {
  return Object.keys(expectState["age"]);
}

/**
 * get different age range data for different state
 * @param {Array} ageLabel list of different age range
 * @param {int} genderIndex gender indicator, 0 for all, 1 for male, 2 for female, 3 for not stated
 * @param {String} expectState expect state
 * @return {Array} list of age data
 */
function getAgeData(ageLabel, genderIndex, expectState) {
  let list = [];
  for (let i = 0; i < ageLabel.length; i++) {
    list.push(expectState["age"][ageLabel[i]][genderIndex]);
  }
  return list;
}

/**
 * get choosen state data
 * @param {String} state user chosed state
 * @return {Object} object which contains age and gender data for a specific state. Return null if the choosen state data is not available
 */
function getExpectStateData(state) {
  return state.toUpperCase() in ageGenderData ? ageGenderData[state] : null;
}

function getLatestData(state) {
  let latestDate = Object.keys(stateData)[Object.keys(stateData).length - 1];
  let latestData = stateData[latestDate][state.toUpperCase()];
  console.log(latestData);
}

function setGenderOption(expectState) {
  const genderLabel = ["Male", "Female", "Not Stated"];
  const genderData = getGenderData(expectState);
  // create dataset for gender graph display
  let dataArr = [];
  for (let i = 0; i < genderData.length; i++) {
    let tempData = { value: genderData[i], name: genderLabel[i] };
    dataArr.push(tempData);
  }

  let tempOption = {
    title: {
      text: "Gender Chart"
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br /> {b}: {c} ({d}%)"
    },
    legend: {
      data: genderLabel,
      top: "7%"
    },
    series: [
      {
        name: "gender",
        type: "pie",
        radius: ["40%", "70%"],
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: "bold"
          }
        },
        data: dataArr
      }
    ]
  };
  return tempOption;
}

function setAgeOption(expectState) {
  const ageChartLabels = getAgeChartLabels(expectState);
  const ageChartLegend = ["Male", "Female", "Not Stated", "All"];
  const maleAgeData = getAgeData(ageChartLabels, 1, expectState);
  const femaleAgeData = getAgeData(ageChartLabels, 2, expectState);
  const notStatedAgeData = getAgeData(ageChartLabels, 3, expectState);
  const allAgeData = getAgeData(ageChartLabels, 0, expectState);

  let tempOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999"
        }
      }
    },
    title: {
      text: "Age Range Chart"
    },
    legend: {
      data: ageChartLegend,
      top: "7%",
      selected: {
        "Male": true,
        "Female": true,
        "Not Stated": true,
        "All": false
      }
    },
    xAxis: {
      type: "category",
      data: ageChartLabels,
      axisPointer: {
        type: "shadow"
      }
    },
    yAxis: {},
    series: [
      {
        name: "Male",
        type: "bar",
        data: maleAgeData
      },
      {
        name: "Female",
        type: "bar",
        data: femaleAgeData
      },
      {
        name: "Not Stated",
        type: "bar",
        data: notStatedAgeData
      },
      {
        name: "All",
        type: "bar",
        data: allAgeData
      }
    ]
  };
  return tempOption;
}

function StateChart({ state }) {
  // get choosen state data
  const expectStateData = getExpectStateData(state);

  let genderOption;
  let ageOption;
  if (expectStateData !== null) {
    genderOption = setGenderOption(expectStateData);
    ageOption = setAgeOption(expectStateData);
  }

  if (expectStateData !== null) {
    return (
      <Grid item xs={11} sm={11} md={4}>
        <div className="card">
          <h2>{state.toUpperCase()} Chart</h2>
          <p>Cases by gender</p>
          <ReactEcharts option={genderOption} />
          <p>Cases by age group</p>
          <ReactEcharts option={ageOption} />
        </div>
        <div id="echartTest" style={{ width: "600px" }}></div>
      </Grid>
    );
  } else {
    return (
      <Grid item xs={11} sm={11} md={5}>
        <h2 style={{ textAlign: "center" }}>
          We are working on acquiring detailed data for {state}!
        </h2>
        <br />
        <h5 style={{ textAlign: "center" }}>
          If you have reliable source for such data, please let us know through
          the{" "}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link">
            this
          </a>{" "}
          form.
        </h5>
      </Grid>
    );
  }
}

export default StateChart;

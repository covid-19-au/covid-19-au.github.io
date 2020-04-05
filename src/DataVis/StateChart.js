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

const stateNameMapping = {
  VIC: "Victoria",
  NSW: "New South Wales",
  QLD: "Queensland",
  ACT: "Australian Capital Territory",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory"
};

const ALL_INDEX = 0;
const MALE_INDEX = 1;
const FEMALE_INDEX = 2;
const NOT_STATED_INDEX = 3;

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
  console.log("State: ", state);
  let latestDate = Object.keys(stateData)[Object.keys(stateData).length - 1];
  let latestData = stateData[latestDate][state];
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

  let series = new Series();
  let pieSeries = new PieSeries("gender", dataArr);
  pieSeries.setRadius("40%", "70%");
  series.addSubSeries(pieSeries);

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
    series: series.getSeriesList()
  };
  return tempOption;
}

function setAgeOption(expectState) {
  const ageChartLabels = getAgeChartLabels(expectState);
  const ageChartLegend = ["All", "Male", "Female", "Not Stated"];
  let ageDataList = [];
  ageDataList.push(getAgeData(ageChartLabels, ALL_INDEX, expectState)); // all age data
  ageDataList.push(getAgeData(ageChartLabels, MALE_INDEX, expectState)); // male age data
  ageDataList.push(getAgeData(ageChartLabels, FEMALE_INDEX, expectState)); // female age data
  ageDataList.push(getAgeData(ageChartLabels, NOT_STATED_INDEX, expectState)); // not stated age data
  let ageOptionSeries = new Series();
  for (let i = 0; i < ageDataList.length; i++) {
    let tempBarSeries = new BarSeries(ageChartLegend[i], ageDataList[i]);
    ageOptionSeries.addSubSeries(tempBarSeries);
  }

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
        Male: true,
        Female: true,
        "Not Stated": true,
        All: false
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
    series: ageOptionSeries.getSeriesList()
  };
  return tempOption;
}

function setGeneralBarOption(state) {
  getLatestData(state);
}

function setGeneralLineOption() {

}

function StateChart({ state }) {
  // get choosen state data
  const expectStateData = getExpectStateData(state);

  let genderOption;
  let ageOption;
  let generalBarOption;
  if (expectStateData !== null) {
    genderOption = setGenderOption(expectStateData);
    ageOption = setAgeOption(expectStateData);
    generalBarOption = setGeneralBarOption(state.toUpperCase());
    console.log(generalBarOption);
  }

  if (expectStateData !== null) {
    return (
      <Grid container spacing={1} justify="center" wrap="wrap">
        <Grid item xs={11}>
          <h1 style={{ textAlign: "center", paddingTop: "1%" }}>
            {stateNameMapping[state]}
          </h1>
        </Grid>
        <Grid item xs={11} sm={11} md={4} xl={4}>
          <div className="card">
            <h2>Cases by Gender</h2>
            <ReactEcharts option={genderOption} />
          </div>
        </Grid>
        <Grid item xs={11} sm={11} md={4} xl={6}>
          <div className="card">
            <h2>Cases by Age Group</h2>
            <ReactEcharts option={ageOption} />
          </div>
        </Grid>
        <Grid item xs={11} sm={11} md={4} xl={6}>
          <div className="card">
            <h2>Cases by Gender Information - Bar</h2>
            <ReactEcharts option={ageOption} />
          </div>
        </Grid>
        <Grid item xs={11} sm={11} md={4} xl={6}>
          <div className="card">
            <h2>Cases by Gender Information - Line</h2>
            <ReactEcharts option={ageOption} />
          </div>
        </Grid>
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

class Series {
  constructor() {
    this.list = [];
  }

  addSubSeries(subSeries) {
    this.list.push(subSeries);
  }

  getSeriesList() {
    return this.list;
  }
}

class SubSeries {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }
}

class BarSeries extends SubSeries {
  constructor(name, data) {
    super(name, data);
    this.type = "bar";
  }
}

class PieSeries extends SubSeries {
  constructor(name, data) {
    super(name, data);
    this.type = "pie";
    this.isDoughnut = false;
    this.radius = 0;
  }

  setRadius(innerRadius, outerRadius) {
    if (innerRadius !== "0%" || innerRadius !== 0) {
      this.isDoughnut = true;
      this.label = {
        show: false,
        position: "center"
      };
      this.emphasis = {
        label: {
          show: true,
          fontWeight: "bold"
        }
      };
    }
    this.radius = [innerRadius, outerRadius];
  }
}

export default StateChart;

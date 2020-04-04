import React from "react";
import Grid from "@material-ui/core/Grid";

import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactEcharts from "echarts-for-react";

const colorMapping = {
  Confirmed: "#ff603c",
  Death: "#c11700",
  Recovered: "#00c177",
  Tested: "#007cf2"
}

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

const lineBarTooltip = {
  trigger: "axis",
  axisPointer: {
    crossStyle: {
      color: "#999"
    }
  }
};
const pieTooltip = {
  trigger: "item",
  formatter: "{a} <br /> {b}: {c} ({d}%)"
};

const ALL_INDEX = 0;
const MALE_INDEX = 1;
const FEMALE_INDEX = 2;
const NOT_STATED_INDEX = 3;

/**
 * get gender data for expect state
 * @param {Object} expectStateData state object contains age and gender data
 * @return {Array} list of gender data
 */
function getGenderData(expectStateData) {
  return expectStateData["gender"];
}

/**
 * get age chart labels
 * @param {Object} expectStateData state object contains age and gender data
 * @return {Array} age chart labels
 */
function getAgeChartLabels(expectStateData) {
  return Object.keys(expectStateData["age"]);
}

/**
 * get different age range data for different state
 * @param {Array} ageLabel list of different age range
 * @param {int} genderIndex gender indicator, 0 for all, 1 for male, 2 for female, 3 for not stated
 * @param {String} expectStateData expect state
 * @return {Array} list of age data
 */
function getAgeData(ageLabel, genderIndex, expectStateData) {
  let list = [];
  for (let i = 0; i < ageLabel.length; i++) {
    list.push(expectStateData["age"][ageLabel[i]][genderIndex]);
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

/**
 * get latest data for user selected state
 * @param {String} state user selected state
 * @return {Array} latest data of user choosen state
 */
function getLatestData(state) {
  return stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]][
    state
  ];
}

/**
 * get all date
 * @return {Array} list of all data
 */
function getAllDate() {
  return Object.keys(stateData);
}

/**
 * get user selected state general information
 * @param {Array} dateList date list
 * @param {String} state user selected state
 * @return {Object} an object contains all data of user selected state
 */
function getStateGeneralData(dateList, state) {
  let generalData = {
    confirmed: [],
    death: [],
    recovered: [],
    tested: []
  };
  for (let i = 0; i < dateList.length; i++) {
    let tempData = stateData[dateList[i]][state];
    generalData["confirmed"].push(tempData[0]);
    if (tempData.length !== 1) {
      // when only confirmed data available
      generalData["death"].push(tempData[1]);
      generalData["recovered"].push(tempData[2]);
      generalData["tested"].push(tempData[3]);
    } else {
      generalData["death"].push(0);
      generalData["recovered"].push(0);
      generalData["tested"].push(0);
    }
  }
  return generalData;
}

/**
 * compute the gebder chart option
 * @param {String} state user selected state
 */
function setGenderOption(state) {
  const genderLabel = ["Male", "Female", "Not Stated"];
  const genderData = getGenderData(state);
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
    tooltip: pieTooltip,
    legend: {
      data: genderLabel,
      top: "7%"
    },
    series: series.getSeriesList()
  };
  return tempOption;
}

/**
 * compute the age chart option
 * @param {String} state user selected state
 */
function setAgeOption(state) {
  const ageChartLabels = getAgeChartLabels(state);
  const ageChartLegend = ["All", "Male", "Female", "Not Stated"];
  let ageDataList = [];
  ageDataList.push(getAgeData(ageChartLabels, ALL_INDEX, state)); // all age data
  ageDataList.push(getAgeData(ageChartLabels, MALE_INDEX, state)); // male age data
  ageDataList.push(getAgeData(ageChartLabels, FEMALE_INDEX, state)); // female age data
  ageDataList.push(getAgeData(ageChartLabels, NOT_STATED_INDEX, state)); // not stated age data
  let ageOptionSeries = new Series();
  for (let i = 0; i < ageDataList.length && i < ageChartLegend.length; i++) {
    let tempBarSeries = new BarSeries(ageChartLegend[i], ageDataList[i]);
    ageOptionSeries.addSubSeries(tempBarSeries);
  }

  let tempOption = {
    tooltip: lineBarTooltip,
    title: {
      text: "Age Group Chart"
    },
    legend: {
      data: ageChartLegend,
      top: "7%",
      selected: {
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

/**
 * compute the general information bar chart option
 * @param {String} state user selected state
 */
function setGeneralBarOption(state) {
  let latestData = getLatestData(state);
  let generalBarLegend = ["Confirmed", "Death", "Recovered", "Tested"];
  let generalLabel = ["General Information"];
  let generalBarSeries = new Series();
  for (let i = 0; i < generalBarLegend.length; i++) {
    let tempData = [];
    tempData.push(latestData[i]);
    let tempBarSeies = new BarSeries(generalBarLegend[i], tempData);
    tempBarSeies.setItemStyle(colorMapping[generalBarLegend[i]]);
    generalBarSeries.addSubSeries(tempBarSeies);
  }

  let tempOption = {
    tooltip: lineBarTooltip,
    title: {
      text: "General Info Bar Chart"
    },
    legend: {
      data: generalBarLegend,
      top: "7%",
      selected: {
        Tested: false
      }
    },
    xAxis: {
      type: "category",
      data: generalLabel,
      axisPointer: {
        type: "shadow"
      }
    },
    yAxis: {},
    series: generalBarSeries.getSeriesList()
  };
  return tempOption;
}

/**
 * compute the general information line chart option
 * @param {String} state user selected state
 */
function setGeneralLineOption(state) {
  const generalLineLegend = ["Confirmed", "Death", "Recovered", "Tested"];
  const dates = getAllDate();
  const generalData = getStateGeneralData(dates, state);
  let generalLineSeries = new Series();
  for (let i = 0; i < generalLineLegend.length; i++) {
    let tempLineSeries = new LineSeries(
      generalLineLegend[i],
      generalData[Object.keys(generalData)[i]]
    );
    tempLineSeries.setItemStyle(colorMapping[generalLineLegend[i]]);
    generalLineSeries.addSubSeries(tempLineSeries);
  }

  //graph initial start point
  let start = 100 - (14 / dates.length) * 100;
  let startPoint = parseInt(start);

  let tempOption = {
    tooltip: lineBarTooltip,
    title: {
      text: "General Info Line Chart"
    },
    legend: {
      data: generalLineLegend,
      top: "7%",
      selected: {
        Tested: false
      }
    },
    dataZoom: [
      {
        type: "inside",
        start: startPoint,
        end: 100
      },
      {
        start: 0,
        end: 10,
        handleIcon:
          "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        handleStyle: {
          color: "#fff",
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.6)",
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        bottom: "1%",
        left: "center"
      }
    ],
    xAxis: {
      type: "category",
      data: dates
    },
    yAxis: {
      type: "value"
    },
    series: generalLineSeries.getSeriesList()
  };
  return tempOption;
}

function StateChart({ state }) {
  // get choosen state data
  const expectStateData = getExpectStateData(state);

  let genderOption;
  let ageOption;
  let barOption;
  let lineOption;
  barOption = setGeneralBarOption(state.toUpperCase());
  lineOption = setGeneralLineOption(state.toUpperCase());
  if (expectStateData !== null) {
    genderOption = setGenderOption(expectStateData);
    ageOption = setAgeOption(expectStateData);
  }

  if (expectStateData !== null) {
    return (
      <Grid container spacing={1} justify="center" wrap="wrap">
        <Grid item xs={11}>
          <h1 style={{ textAlign: "center", paddingTop: "1%" }}>
            {stateNameMapping[state]}
          </h1>
        </Grid>
        <Grid item xs={11} sm={11} md={4}>
          <div className="card">
            <h2>General Information - Bar</h2>
            <ReactEcharts option={barOption} />
          </div>
        </Grid>
        <Grid item xs={11} sm={11} md={4} xl={6}>
          <div className="card">
            <h2>General Information - Line</h2>
            <ReactEcharts option={lineOption} />
          </div>
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
      </Grid>
    );
  } else {
    return (
      <Grid container spacing={1} justify="center" wrap="wrap">
        <Grid item xs={11}>
          <h1 style={{ textAlign: "center", paddingTop: "1%" }}>
            {stateNameMapping[state]}
          </h1>
        </Grid>
        <Grid item xs={11} sm={11} md={4}>
          <div className="card">
            <h2>General Information - Bar</h2>
            <ReactEcharts option={barOption} />
          </div>
        </Grid>
        <Grid item xs={11} sm={11} md={4} xl={6}>
          <div className="card">
            <h2>General Information - Line</h2>
            <ReactEcharts option={lineOption} />
          </div>
        </Grid>
        <Grid item xs={11} sm={11} md={5}>
          <h2 style={{ textAlign: "center" }}>
            We are working on acquiring detailed age group and gender data for{" "}
            {state}!
          </h2>
          <br />
          <h5 style={{ textAlign: "center" }}>
            If you have reliable source for such data, please let us know
            through the{" "}
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link">
              this
            </a>{" "}
            form.
          </h5>
        </Grid>
      </Grid>
    );
  }
}

/**
 * Series object which contains only one list for echarts to display data
 */
class Series {
  constructor() {
    this.list = [];
  }

  /**
   * 
   * @param {SubSeries} subSeries series object which hold data for different dataset
   */
  addSubSeries(subSeries) {
    this.list.push(subSeries);
  }

  /**
   * get the whole series list
   */
  getSeriesList() {
    return this.list;
  }
}

/**
 * Sub-series object which contains name and data for an object in Series
 */
class SubSeries {
  constructor(name, data) {
    this.name = name;
    this.data = data;
    this.itemStyle = {};
  }

  /**
   * set color for graph
   * @param {String} color color code
   */
  setItemStyle(color) {
    this.itemStyle["color"] = color;
  }
}

/**
 * Subseries for line chart
 */
class LineSeries extends SubSeries {
  constructor(name, data) {
    super(name, data);
    this.type = "line";
  }
}

/**
 * Subseries for bar chart
 */
class BarSeries extends SubSeries {
  constructor(name, data) {
    super(name, data);
    this.type = "bar";
  }
}

/**
 * Subseries for pie chart
 */
class PieSeries extends SubSeries {
  constructor(name, data) {
    super(name, data);
    this.type = "pie";
    this.isDoughnut = false;
    this.radius = 0;
  }

  /**
   * set radius for pie and check if the chart is a doughnut chart or not.
   * @param {int|String} innerRadius inner radius for a pie chart
   * @param {int|String} outerRadius outer radius for a pie chart
   */
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

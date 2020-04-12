import React, { useState, Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactEcharts from "echarts-for-react";
import ReactGA from "react-ga";
import latestAusData from "../data/stateCaseData";
import Tag from "../HomePage/Tag";

const colorMapping = {
  Confirmed: "#ff603c",
  Death: "#c11700",
  Recovered: "#00c177",
  Tested: "#007cf2",
  "In Hospital": "#9d71ea",
  ICU: "#00aac1",
};

const genderColorMapping = {
  Male: "#8ccfff",
  Female: "#24adff",
  All: "#ffa48c",
  NotStated: "#8cdaaf",
};

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

const lineBarTooltip = {
  trigger: "axis",
  axisPointer: {
    crossStyle: {
      color: "#999",
    },
  },
};

const ageTooltip = {
  trigger: "axis",
  axisPointer: {
    crossStyle: {
      color: "#999",
    },
  },
  formatter: function (params) {
    let str = "<div><p>Age: " + params[0].name + "</p></div>";
    for (let i = 0; i < params.length; i++) {
      str +=
        params[i].marker +
        " " +
        params[i].seriesName +
        ": " +
        params[i].data +
        "<br/>";
    }
    return str;
  },
};

const pieTooltip = {
  trigger: "item",
  formatter: "{a} <br /> {b}: {c} ({d}%)",
};

const activeStyles = {
  color: "black",
  borderColor: "#8ccfff",
  padding: "0px",
  outline: "none",
  zIndex: 10,
};
const inactiveStyles = {
  color: "grey",
  borderColor: "#e3f3ff",
  padding: "0px",
  outline: "none",
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
function getLastData(state) {
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
    tested: [],
    inHospital: [],
    icu: [],
  };
  for (let i = 0; i < dateList.length; i++) {
    let tempData = stateData[dateList[i]][state];
    generalData["confirmed"].push(tempData[0]);
    if (tempData.length !== 1) {
      // when only confirmed data available
      generalData["death"].push(tempData[1]);
      generalData["recovered"].push(tempData[2]);
      generalData["tested"].push(tempData[3]);
      generalData["inHospital"].push(tempData[4]);
      generalData["icu"].push(tempData[5]);
    } else {
      generalData["death"].push(0);
      generalData["recovered"].push(0);
      generalData["tested"].push(0);
      generalData["inHospital"].push(0);
      generalData["icu"].push(0);
    }
  }
  return generalData;
}

/**
 * compute the gebder chart option
 * @param {String} state user selected state
 */
function setGenderOption(state) {
  const genderLabel = ["Male", "Female", "NotStated"];
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

  // set colors
  let colors = [];
  for (let i = 0; i < genderLabel.length; i++) {
    colors.push(genderColorMapping[genderLabel[i]]);
  }
  let tempSeriesList = series.getSeriesList();
  tempSeriesList[0]["color"] = colors;
  series.setSeriesList(tempSeriesList);

  let tempOption = {
    tooltip: pieTooltip,
    legend: {
      data: genderLabel,
      top: "5%",
    },
    series: series.getSeriesList(),
  };
  return tempOption;
}

/**
 * compute the age chart option
 * @param {String} state user selected state
 */
function setAgeOption(state) {
  const ageChartLabels = getAgeChartLabels(state);
  const ageChartLegend = ["All", "Male", "Female", "NotStated"];
  let ageDataList = [];
  ageDataList.push(getAgeData(ageChartLabels, ALL_INDEX, state)); // all age data
  ageDataList.push(getAgeData(ageChartLabels, MALE_INDEX, state)); // male age data
  ageDataList.push(getAgeData(ageChartLabels, FEMALE_INDEX, state)); // female age data
  ageDataList.push(getAgeData(ageChartLabels, NOT_STATED_INDEX, state)); // not stated age data
  let ageOptionSeries = new Series();
  for (let i = 0; i < ageDataList.length && i < ageChartLegend.length; i++) {
    let tempBarSeries = new BarSeries(ageChartLegend[i], ageDataList[i]);
    tempBarSeries.setItemStyle(genderColorMapping[ageChartLegend[i]]);
    ageOptionSeries.addSubSeries(tempBarSeries);
  }

  let tempOption = {
    tooltip: ageTooltip,

    legend: {
      data: ageChartLegend,
      top: "5%",
      selected: {
        All: false,
      },
    },
    xAxis: {
      type: "category",
      data: ageChartLabels,
      axisPointer: {
        type: "shadow",
      },
    },
    yAxis: {},
    series: ageOptionSeries.getSeriesList(),
  };
  return tempOption;
}

/**
 * compute the general information bar chart option
 * @param {String} state user selected state
 */
function setGeneralBarOption(state) {
  let latestData = getLastData(state);
  let generalBarLegend = [
    "Confirmed",
    "Death",
    "Recovered",
    "Tested",
    "In Hospital",
    "ICU",
  ];
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
    grid: {
      containLabel: true,
      left: 0,
      right: "5%",
      bottom: "10%",
      top: "20%",
    },
    tooltip: lineBarTooltip,

    legend: {
      data: generalBarLegend,
      top: "5%",
      selected: {
        Tested: false,
      },
    },
    xAxis: {
      type: "category",
      data: generalLabel,
      axisPointer: {
        type: "shadow",
      },
    },
    yAxis: {},
    series: generalBarSeries.getSeriesList(),
  };
  return tempOption;
}

/**
 * compute the general information line chart option
 * @param {String} state user selected state
 */
function setGeneralLineOption(state, logScale) {
  const generalLineLegend = [
    "Confirmed",
    "Death",
    "Recovered",
    "Tested",
    "In Hospital",
    "ICU",
  ];
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

  let minY = 0;
  let yAxisType = "value";
  if (logScale) {
    yAxisType = "log";
    minY = 1;
  }

  //graph initial start point
  let start = 100 - (14 / dates.length) * 100;
  let startPoint = parseInt(start);

  let tempOption = {
    grid: {
      containLabel: true,
      left: 0,
      right: "5%",
      bottom: "10%",
      top: "20%",
    },
    tooltip: lineBarTooltip,
    legend: {
      data: generalLineLegend,
      top: "5%",
      selected: {
        Tested: logScale,
      },
    },
    dataZoom: [
      {
        type: "inside",
        start: startPoint,
        end: 100,
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
          shadowOffsetY: 2,
        },
        top: "92%",
        bottom: "1%",
        left: "center",
      },
    ],
    xAxis: {
      type: "category",
      data: dates,
    },
    yAxis: {
      type: yAxisType,
      min: minY,
    },
    series: generalLineSeries.getSeriesList(),
  };
  return tempOption;
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
      <div className="row">
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
      </div>
      <div className="row">
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
      </div>
      <div className="row">
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
            In Hospital
          </button>
        </Tag>
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
            ICU
          </button>
        </Tag>
      </div>
    </div>
  );
}

function StateChart({ state }) {
  const statusUpdateTime = latestAusData["updatedTime"];
  const ageGenderUpdateTime = ageGenderData["DateUpdate"];

  // get choosen state data
  const stateAgeGenderData = getExpectStateData(state);

  const [logScale, setLogScale] = useState(false);

  let genderOption;
  let ageOption;
  let barOption;
  let lineOption;
  barOption = setGeneralBarOption(state.toUpperCase());
  lineOption = setGeneralLineOption(state.toUpperCase(), logScale);
  if (stateAgeGenderData !== null) {
    genderOption = setGenderOption(stateAgeGenderData);
    ageOption = setAgeOption(stateAgeGenderData);
  }
  ReactGA.pageview("/state/" + state);

  return (
    <Grid container spacing={1} justify="center" wrap="wrap">
      <Grid item xs={11}>
        <h1 style={{ textAlign: "center", paddingTop: "1%" }}>
          {stateNameMapping[state]}
        </h1>
      </Grid>
      <Grid item xs={11} sm={11} md={4}>
        <div className="card">
          <div className="table">
            <h2>Status - {stateNameMapping[state]}</h2>
            {renderStatus(state.toUpperCase())}
            <span className="due" style={{ fontSize: "80%", padding: 0 }}>
              Time in AEST, Last Update: {statusUpdateTime}
            </span>
          </div>
        </div>
      </Grid>
      <Grid item xs={11} sm={11} md={4}>
        <div className="card">
          <h2>General Information - Bar</h2>
          <ReactEcharts option={barOption} />
          <span className="due" style={{ fontSize: "80%", padding: 0 }}>
            Time in AEST, Last Update: {ageGenderUpdateTime}
          </span>
        </div>
      </Grid>
      <Grid item xs={11} sm={11} md={4}>
        <div className="card">
          <h2>General Information - Line</h2>
          <ReactEcharts option={lineOption} />
          <span className="key" style={{ marginTop: "0.5rem" }}>
            Logarithmic Scale:&nbsp;
            <ButtonGroup size="small" aria-label="small outlined button group">
              <Button
                style={logScale ? activeStyles : inactiveStyles}
                disableElevation={true}
                onClick={() => setLogScale(true)}
              >
                On
              </Button>
              <Button
                style={logScale ? inactiveStyles : activeStyles}
                onClick={() => setLogScale(false)}
              >
                Off
              </Button>
            </ButtonGroup>
            <a
              style={{
                display: "inline-flex",
                backgroundColor: "white",
                verticalAlign: "middle",
              }}
              className="badge badge-light"
              href="https://en.wikipedia.org/wiki/Logarithmic_scale"
              target="blank"
            >
              <svg
                className="bi bi-question-circle"
                width="1.1em"
                height="1.1em"
                viewBox="0 0 16 16"
                fill="currentColor"
                backgroundcolor="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                  clipRule="evenodd"
                />
                <path d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
              </svg>
              <div className="dataSource"></div>
            </a>
          </span>
          <span className="due" style={{ fontSize: "80%", padding: 0 }}>
            Time in AEST, Last Update: {ageGenderUpdateTime}
          </span>
        </div>
      </Grid>
      {stateAgeGenderData !== null ? (
        <Fragment>
          <Grid item xs={11} sm={11} md={4} xl={4}>
            <div className="card">
              <h2>Cases by Gender</h2>
              <ReactEcharts option={genderOption} />
              <span className="" style={{ fontSize: "80%", padding: 0 }}>
                Time in AEST, Last Update: {ageGenderUpdateTime}
              </span>
            </div>
          </Grid>
          <Grid item xs={11} sm={11} md={4} xl={6}>
            <div className="card">
              {state.toUpperCase() === "ACT" ? (
                <h2>Gender bar chart</h2>
              ) : (
                <h2>Cases by Age Group</h2>
              )}
              <ReactEcharts option={ageOption} />
              <span className="due" style={{ fontSize: "80%", padding: 0 }}>
                Time in AEST, Last Update: {ageGenderUpdateTime}
              </span>
            </div>
          </Grid>
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

/**
 * Series object which contains only one list for echarts to display data
 */
class Series {
  constructor() {
    this.list = [];
  }

  /**
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

  /**
   * set series list
   * @param {Array} list series list
   */
  setSeriesList(list) {
    this.list = list;
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
        position: "center",
      };
      this.emphasis = {
        label: {
          show: true,
          fontWeight: "bold",
        },
      };
    }
    this.radius = [innerRadius, outerRadius];
  }
}

export default StateChart;

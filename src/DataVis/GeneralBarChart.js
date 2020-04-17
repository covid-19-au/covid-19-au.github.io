import React from "react";
import Grid from "@material-ui/core/Grid";
import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactEcharts from "echarts-for-react";

import { Series, BarSeries } from "./Series";

const colorMapping = {
  Confirmed: "#ff603c",
  Death: "#c11700",
  Recovered: "#00c177",
  Tested: "#007cf2",
  "in Hospital": "#9d71ea",
  "in ICU": "#00aac1",
};

const lineBarTooltip = {
  trigger: "axis",
  axisPointer: {
    crossStyle: {
      color: "#999",
    },
  },
};

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
    "in Hospital",
    "in ICU",
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

function GeneralBarChart({ state }) {
  const ageGenderUpdateTime = ageGenderData["DateUpdate"];

  let barOption;
  barOption = setGeneralBarOption(state.toUpperCase());

  return (
    <Grid item xs={11} sm={11} md={4}>
      <div className="card">
        <h2>General Information - Bar</h2>
        <ReactEcharts option={barOption} />
        <span className="due" style={{ fontSize: "80%", padding: 0 }}>
          Time in AEST, Last Update: {ageGenderUpdateTime}
        </span>
      </div>
    </Grid>
  );
}

export default GeneralBarChart;

import React from "react";
import ageGenderData from "../data/ageGender";
import stateCaseData from "../data/stateCaseData";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';

import { Series, BarSeries } from "./Series";
import { colorMapping } from "./Colors";
import cm from "../ColorManagement/ColorManagement";

const lineBarTooltip = {
  trigger: "axis",
  axisPointer: {
    crossStyle: {
      color: "#999",
    },
  },
};

/**
 * get second latest data for user selected state
 * @param {String} state user selected state
 * @return {Array} latest data of user choosen state
 */
function getLastData(state) {

  let requiredState = {}
  let j = 0
  while (j < stateCaseData["values"].length) {
    if (stateCaseData["values"][j][0] == state) {
      requiredState[state] = []
      let i = 1
      while (i < 8) {
        requiredState[state].push(stateCaseData["values"][j][i])
        i = i + 1
      }
    }
    j = j + 1
  }
  return requiredState[state];
}

/**
 * compute the general information bar chart option
 * @param {String} state user selected state
 */
function setGeneralBarOption(state) {
  let lastData = getLastData(state);
  let generalBarLegend = [
    "Confirmed",
    "Death",
    "Recovered",
    "Tested",
    "Active",
    "in Hospital",
    "in ICU",
  ];
  let generalLabel = ["General Information"];
  let generalBarSeries = new Series();
  for (let i = 0; i < generalBarLegend.length; i++) {
    let tempData = [];
    tempData.push(lastData[i]);
    let tempBarSeies = new BarSeries(generalBarLegend[i], tempData);
    tempBarSeies.setItemStyle(colorMapping[generalBarLegend[i]]);
    generalBarSeries.addSubSeries(tempBarSeies);
  }
  // // add active case into graph and put it after recovered case
  // let activeData = lastData[0] - lastData[1] - lastData[2];
  // generalBarLegend.splice(3, 0, "Active");
  // let tempBarSeies = new BarSeries(
  //   generalBarLegend[3],
  //   new Array(activeData.toString())
  // );
  // tempBarSeies.setItemStyle(colorMapping["Active"]);
  // generalBarSeries.addSubSeries(tempBarSeies, 3);

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
      top: "0%",
      selected: {
        Confirmed: false,
        Death: false,
        Recovered: false,
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
    <div>
      <ReactEchartsCore
          theme={cm.getEChartsTheme()}
          echarts={echarts}
          option={barOption} />
      <span className="due" style={{ fontSize: "80%", padding: 0 }}>
        Time in AEST, Last Update: {ageGenderUpdateTime}
      </span>
    </div>
  );
}

export default GeneralBarChart;

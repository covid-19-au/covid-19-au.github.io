import React from "react";
import Grid from "@material-ui/core/Grid";
import ageGenderData from "../data/ageGender";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import { Series, BarSeries } from "./Series";
import { genderColorMapping } from "./Colors";

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

const ALL_INDEX = 0;
const MALE_INDEX = 1;
const FEMALE_INDEX = 2;
const NOT_STATED_INDEX = 3;

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

function AgeChart({ state }) {
  const ageGenderUpdateTime = ageGenderData["DateUpdate"];

  // get choosen state data
  const stateAgeGenderData = getExpectStateData(state);

  let ageOption;
  if (stateAgeGenderData !== null) {
    ageOption = setAgeOption(stateAgeGenderData);
  }

  return (
    <Grid item xs={11} sm={11} md={4} xl={6}>
      <div className="card">
        {state.toUpperCase() === "ACT" ? (
          <h2>Gender bar chart</h2>
        ) : (
          <h2>Cases by Age Group</h2>
        )}
        <ReactEchartsCore echarts={echarts} option={ageOption} />
        <span className="due" style={{ fontSize: "80%", padding: 0 }}>
          Time in AEST, Last Update: {ageGenderUpdateTime}
        </span>
      </div>
    </Grid>
  );
}

export default AgeChart;

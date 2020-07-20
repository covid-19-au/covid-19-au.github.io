import React from "react";
import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactEcharts from "echarts-for-react";

import { Series, BarSeries } from "./Series";
import { colorMapping } from "./Colors";

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
    return stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]][
        state
        ];
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
    // add active case into graph and put it after recovered case
    let activeData = lastData[0] - lastData[1] - lastData[2];
    generalBarLegend.splice(3, 0, "Active");
    let tempBarSeies = new BarSeries(
        generalBarLegend[3],
        new Array(activeData.toString())
    );
    tempBarSeies.setItemStyle(colorMapping["Active"]);
    generalBarSeries.addSubSeries(tempBarSeies, 3);

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
                //Death: false,
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
            <ReactEcharts option={barOption} />
            <span className="due" style={{ fontSize: "80%", padding: 0 }}>
                Time in AEST, Last Update: {ageGenderUpdateTime}
            </span>
        </div>
    );
}

export default GeneralBarChart;

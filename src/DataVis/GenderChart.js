import React from "react";
import ageGenderData from "../data/ageGender";
import ReactEcharts from "echarts-for-react";

import {PieSeries, Series} from "./Series";
import {genderColorMapping} from "./Colors";

const pieTooltip = {
    trigger: "item",
    formatter: "{a} <br /> {b}: {c} ({d}%)",
};

/**
 * get gender data for expect state
 * @param {Object} expectStateData state object contains age and gender data
 * @return {Array} list of gender data
 */
function getGenderData(expectStateData) {
    return expectStateData["gender"];
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

    return {
        tooltip: pieTooltip,
        legend: {
            data: genderLabel,
            top: "5%",
        },
        series: series.getSeriesList(),
    };
}

function GenderChart({ state }) {
    const ageGenderUpdateTime = ageGenderData["DateUpdate"];

    // get choosen state data
    const stateAgeGenderData = getExpectStateData(state);

    let genderOption;
    if (stateAgeGenderData !== null) {
        genderOption = setGenderOption(stateAgeGenderData);
    }

    return (
        <div>
            <ReactEcharts option={genderOption} style={{ height: '200px' }} />
            <span className="" style={{ fontSize: "80%", padding: 0 }}>
                Time in AEST, Last Update: {ageGenderUpdateTime}
            </span>
        </div>
    );
}

export default GenderChart;

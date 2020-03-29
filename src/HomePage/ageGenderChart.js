import React, { useEffect, useState } from "react";
import Chart from "chart.js";

import ageGenderData from "../data/ageGenderData";

const color = {
  male: "#ff0000",
  female: "#0000ff",
  notStated: "#000000"
};

/**
 * get gender data for expect state
 * @param {Object} expectState state object contains age and gender data
 * @return {Array} list of gender data
 */
function getGenderData(expectState) {
  return expectState["gender"]["genderData"];
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

function AgeGenderChart({ state }) {
  const expectStateData = ageGenderData[state];
  console.log("Expect State Data: ", expectStateData);
  // gender chart
  const genderChartRef = React.createRef();
  const genderData = getGenderData(expectStateData);
  useEffect(() => {
    let myGenderChartRef = genderChartRef;
    myGenderChartRef = myGenderChartRef.current.getContext("2d");
    new Chart(myGenderChartRef, {
      type: "doughnut",
      data: {
        labels: ["male", "female", "not stated"],
        datasets: [
          {
            label: "Sales",
            data: genderData,
            backgroundColor: [color.male, color.female, color.notStated]
          }
        ]
      }
    });
  }, [ageGenderData]);

  // age chart
  const ageChartRef = React.createRef();
  const ageChartLabels = getAgeChartLabels(expectStateData);

  const allAgeData = getAgeData(ageChartLabels, 0, expectStateData);
  const maleAgeData = getAgeData(ageChartLabels, 1, expectStateData);
  const femaleAgeData = getAgeData(ageChartLabels, 2, expectStateData);
  const notStatedAgeData = getAgeData(ageChartLabels, 3, expectStateData);

  useEffect(() => {
    let myAgeChartRef = ageChartRef;
    myAgeChartRef = myAgeChartRef.current.getContext("2d");
    new Chart(myAgeChartRef, {
      type: "bar",
      data: {
        labels: ageChartLabels,
        datasets: [
          {
            label: "male",
            data: maleAgeData,
            backgroundColor: color.male
          },
          {
            label: "female",
            data: femaleAgeData,
            backgroundColor: color.female
          },
          {
            label: "not stated",
            data: notStatedAgeData,
            backgroundColor: color.notStated
          },
          {
            label: "all",
            data: allAgeData,
            borderColor: "#ebe134",
            fill: false,
            hidden: true,
            type: "line"
          }
        ]
      }
    });
  }, [ageGenderData]);

  return (
    <div className="card">
      <h2>VIC Chart</h2>
      <p>Cases by gender</p>
      <canvas id="vicGenderChart" ref={genderChartRef} />
      <p>Cases by age group</p>
      <canvas id="vicAgeRangeChart" ref={ageChartRef} />
    </div>
  );
}

export default AgeGenderChart;

import React, { useEffect, useState } from "react";
import Chart from "chart.js";

import vicData from "./data/vicData";

const color = {
  male: "#ff0000",
  female: "#0000ff",
  notStated: "#000000"
};

function getGenderData() {
  return vicData["gender"]["genderData"];
}

function getAgeChartLabels() {
  return Object.keys(vicData["age"]);
}

function VicChart() {
  // gender chart
  const genderChartRef = React.createRef();
  const genderData = getGenderData();
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
  }, [vicData]);

  // age chart
  const ageChartRef = React.createRef();
  const ageChartLabels = getAgeChartLabels();
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
            data: [24, 35, 60],
            backgroundColor: color.male
          },
          {
            label: "female",
            data: [12, 23, 53],
            backgroundColor: color.female
          },
          {
            label: "not stated",
            data: [0, 1, 0],
            backgroundColor: color.notStated
          }
        ]
      }
    });
  }, [vicData]);

  return (
    <div className="card">
      <h2>Vic Chart</h2>
      <canvas id="vicGenderChart" ref={genderChartRef} />
      <canvas id="vicAgeRangeChart" ref={ageChartRef} />
    </div>
  );
}

class Dataset {
  constructor(label) {
    this.label = label;
    this.data = [];
    this.backgroundColor = color[label];
  }
}

export default VicChart;

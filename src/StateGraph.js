import React, { useEffect, useState } from "react";

import CanvasJSReact from "./assets/canvasjs.react";
import Chart from "chart.js";
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

// Based on CanvasJS theme 1. Avoids two purple series and preserves colours day-to-day.
const colourMapping = {
  NSW: "#4F81BC",
  VIC: "#C0504E",
  QLD: "#9BBB58",
  WA: "#23BFAA",
  SA: "#8064A1",
  TAS: "#4AACC5",
  ACT: "#F79647",
  NT: "#CF6ECF"
};

const states = Object.keys(colourMapping);

/** Creates the Canvas data points for a particular state*/
function createInstances(stateData, state) {
  let instances = [];

  for (let day in stateData) {
    let arr = day.split("-");
    const cases = stateData[day],
      date = new Date(arr[0], arr[1] - 1, arr[2]);

    instances.push({
      y: cases[state][0],
      label:
        date.toLocaleDateString("default", { month: "long" }) +
        " " +
        date.getDate()
    });
  }

  return instances;
}

/** Sorts states by their number of cases */
function sortStates(stateData) {
  // Find the most recent day with data

  let latestData =
    stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]];

  // Sort state by cases
  let sortable = [];
  for (let state in latestData) {
    sortable.push([state, latestData[state]]);
  }
  // let casesByState = Object.keys(latestData).map(state => [state, latestData[state][0]]).sort((a, b) => b[1] - a[1]);
  sortable.sort(function(a, b) {
    return b[1][0] - a[1][0];
  });
  return sortable.map(state => state[0]);
}

/** Breaks the data down into spline data points */
function createSeries(stateData) {
  // Map each state into its series
  let orderedStates = sortStates(stateData);
  return orderedStates.map(state => ({
    type: "spline",
    name: state,
    color: colourMapping[state],
    showInLegend: true,
    dataPoints: createInstances(stateData, state)
  }));
}

/** Generates line graphs for state-level case data */
function StateGraph({ stateData }) {
  const [chartRef, setChartRef] = useState(React.createRef());
  const [dataLabels, setDataLabels] = useState(Object.keys(stateData));
  const [datasets, setDatasets] = useState([]);

  // CanvasJS API settings
  const [graphOptions, setGraphOptions] = useState(null);
  // Display loading text if data is not yet parsed
  const [isLoading, setIsLoading] = useState(true);
  getStateData(stateData);

  // useEffect(() => {
  //   setGraphOptions({
  //     data: createSeries(stateData),
  //     animationEnabled: true,
  //     height: 315,
  //     title: {
  //       fontFamily:
  //         "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
  //       fontSize: 20
  //     },
  //     axisX: {
  //       labelFontFamily: "sans-serif",
  //       //valueFormatString: 'MMM DD'
  //     },
  //     axisY: {
  //       labelFontFamily: "sans-serif"
  //     },
  //     legend: {
  //       verticalAlign: "top",
  //       fontFamily: "sans-serif"
  //     },
  //     toolTip: {
  //       shared: true,
  //       //valueFormatString: 'MMM DD'
  //     }
  //   })

  //   setIsLoading(false);
  // }, [stateData]);

  useEffect(() => {
    let myChartRef = chartRef;
    myChartRef = myChartRef.current.getContext("2d");
    new Chart(myChartRef, {
      type: "line",
      data: {
        labels: dataLabels,
        datasets: [
          { label: "Sales", data: [86, 78, 90], borderColor: colourMapping.ACT, fill: false },
          { label: "test", data: [65, 76, 94] , borderColor: colourMapping.NSW, fill: false }
        ],
      }
    });
  }, [stateData]);

  return (
    <div className="card">
      <h2>Confirmed Cases in Australian States</h2>
      {/* {isLoading ? <p>Loading...</p> : <CanvasJSChart options={graphOptions} style = {{paddingLeft: '500px'}}/>} */}

      <canvas id="stateGraph" ref={chartRef} />
    </div>
  );
}

function getStateData(stateData) {
  console.log("HERE")
  console.log(Object.keys(stateData).length);
  for (let i = 0; i < Object.keys(stateData).length; i++) {
    for (let j = 0; j < states.length; j++) {
      let stateName = stateData[Object.keys(stateData)[i]][states[j]];
      console.log("State Name: ", stateName);
    }
  }
}

class Dataset {
  constructor(label) {
    this.label = label;
    this.fill = false;
    this.borderColor = colourMapping.label;
    this.dataArr = [];
  }
  addData(newData) {
    this.dataArr.push(newData)
  }
}

export default StateGraph;

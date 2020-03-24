import React, { useEffect, useState } from "react";

import CanvasJS from './assets/canvasjs.min';
import CanvasJSReact from "./assets/canvasjs.react";
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

/** Creates the Canvas data points for a particular state*/
function createInstances(stateData, state) {
  let instances = [];

  for (let day in stateData) {
    const cases = stateData[day], date = new Date(day);

    instances.push({
      y: cases[state][0],
      label: date.toLocaleDateString('default', { month: 'long' }) + ' ' + date.getDate()
    });      
  }

  return instances;
}

/** Sorts states by their number of cases */
function sortStates(stateData) {
  // Find the most recent day with data
  let mostRecent = null;
  for (let date in stateData) {
    let dateObj = new Date(date);
    if (mostRecent === null) { 
      mostRecent = dateObj; 
    } else if (dateObj > mostRecent) {
      mostRecent = dateObj;
    }
  }
  
  let latestData= stateData[mostRecent.getFullYear() + '-' + (mostRecent.getMonth() + 1) + '-' + mostRecent.getDate()];
  
  // Sort state by cases
  let casesByState = Object.keys(latestData).map(state => [state, latestData[state][0]]).sort((a, b) => b[1] - a[1]);
  return casesByState.map(state => state[0]);
}

/** Breaks the data down into spline data points */
function createSeries(stateData) {
  // Map each state into its series
  let orderedStates = sortStates(stateData);
  return orderedStates.map(state => 
    ({
      type: "spline",
      name: state,
      showInLegend: true,
      dataPoints: createInstances(stateData, state)
    })
  )
}

/** Generates line graphs for state-level case data */
function StateGraph({stateData}) {
  // CanvasJS API settings
  const [graphOptions, setGraphOptions] = useState(null);
  // Display loading text if data is not yet parsed
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setGraphOptions({
      data: createSeries(stateData),
      animationEnabled: true,
      height: 315,
      title: {
        fontFamily:
          "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        fontSize: 20
      },
      axisX: {
        labelFontFamily: "sans-serif",
        //valueFormatString: 'MMM DD'
      },
      axisY: {
        labelFontFamily: "sans-serif"
      },
      legend: {
        verticalAlign: "top",
        fontFamily: "sans-serif"
      },
      toolTip: {
        shared: true,
        //valueFormatString: 'MMM DD'
      }
    })

    setIsLoading(false);
  }, [stateData]);

  return (
    <div className="card">
      <h2>Confirmed Cases in Australian States</h2>
      {isLoading ? <p>Loading...</p> : <CanvasJSChart options={graphOptions} style = {{paddingLeft: '500px'}}/>}
    </div>
  );
}

export default StateGraph;
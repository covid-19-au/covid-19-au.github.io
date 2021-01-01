import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import ageGenderData from "../data/ageGender";
import stateData from "../data/state";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import { Series, LineSeries } from "./Series";
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
    active: [],
    tested: [],
    inHospital: [],
    icu: [],
  };
  for (let i = 0; i < dateList.length; i++) {
    let tempData = stateData[dateList[i]][state];
    generalData["confirmed"].push(tempData[0]);
    if (tempData.length === 1) {
      generalData["death"].push(0);
      generalData["recovered"].push(0);
      generalData["tested"].push(0);
      generalData["active"].push(0);
      generalData["inHospital"].push(0);
      generalData["icu"].push(0);
    } else if (tempData.length === 4) {
      generalData["death"].push(tempData[1]);
      generalData["recovered"].push(tempData[2]);
      generalData["tested"].push(tempData[3]);
      generalData["active"].push(tempData[0] - tempData[1] - tempData[2]);
      generalData["inHospital"].push(0);
      generalData["icu"].push(0);
    } else if (tempData.length === 6) {
      generalData["death"].push(tempData[1]);
      generalData["recovered"].push(tempData[2]);
      generalData["tested"].push(tempData[3]);
      generalData["active"].push(tempData[0] - tempData[1] - tempData[2]);
      generalData["inHospital"].push(tempData[4]);
      generalData["icu"].push(tempData[5]);
    } else {
      generalData["death"].push(tempData[1]);
      generalData["recovered"].push(tempData[2]);
      generalData["tested"].push(tempData[3]);
      generalData["active"].push(tempData[4]);
      generalData["inHospital"].push(tempData[5]);
      generalData["icu"].push(tempData[6]);
    }
  }
  return generalData;
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
    "Active",
    "Tested",
    "in Hospital",
    "in ICU",
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
      top: "54px",
    },
    tooltip: lineBarTooltip,
    legend: {
      data: generalLineLegend,
      top: "0%",
      selected: {
        Confirmed: false,
        Death: false,
        Recovered: false,
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

function GeneralLineChart({ state }) {
  const ageGenderUpdateTime = ageGenderData["DateUpdate"];

  const [logScale, setLogScale] = useState(false);

  let lineOption;
  lineOption = setGeneralLineOption(state.toUpperCase(), logScale);

  return (
    <div>
      <ReactEchartsCore
          theme={cm.getEChartsTheme()}
          echarts={echarts}
          option={lineOption}
          style={{height: "28vh"}} />
      <span className="key" style={{ marginTop: "0.5rem" }}>
        Logarithmic Scale:&nbsp;
        <ButtonGroup size="small" aria-label="small outlined button group">
          <Button
            style={cm.getPillButtonColors(!logScale)}
            onClick={() => setLogScale(false)}
          >
            Off
          </Button>
          <Button
            style={cm.getPillButtonColors(logScale)}
            disableElevation={true}
            onClick={() => setLogScale(true)}
          >
            On
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
  );
}

export default GeneralLineChart;

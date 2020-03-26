import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Tag from "./Tag";
import keyBy from "lodash.keyby";

import Flights from "./Flights";
import StateGraph from "./StateGraph";
import MbMap from "./ConfirmedMap";
import GoogleMap from "./GoogleMap";

import uuid from "react-uuid";
import CanvasJSReact from "./assets/canvasjs.react";
import provinces from "./data/area";
import stateData from "./data/state";
import testedCases from "./data/testedCases";
import flights from "./data/flight";
import country from "./data/country";
import all from "./data/overall";
import stateCaseData from "./data/stateCaseData";

const provincesByName = keyBy(provinces, "name");

export default function HomePage({
  province,
  overall,
  myData,
  area,
  data,
  setProvince,
  gspace
}) {
  return (
    <Grid container spacing={gspace} justify="center" wrap="wrap">
      <Grid item xs={12} sm={12} md={10} lg={6} xl={4}>
        <Stat
          {...{ ...all, ...overall }}
          name={province && province.name}
          data={myData}
          countryData={country}
        />
        <div className="card">
          <h2>
            Cases by State {province ? `· ${province.name}` : false}
            {province ? (
              <small onClick={() => setProvince(null)}>Return</small>
            ) : null}
          </h2>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <GoogleMap
              province={province}
              data={data}
              onClick={name => {
                const p = provincesByName[name];
                if (p) {
                  setProvince(p);
                }
              }}
              newData={myData}
            />
            {/*{*/}
            {/*province ? false :*/}
            {/*<div className="tip">*/}
            {/*Click on the state to check state details.*/}
            {/*</div>*/}
            {/*}*/}
          </Suspense>
          <Area area={area} onChange={setProvince} data={myData} />

          <div style={{ paddingBottom: "1rem" }}>
            <span
              style={{ fontSize: "80%", float: "left", paddingLeft: 0 }}
              className="due"
            >
              *Note that under National Notifiable Diseases Surveillance System
              reporting requirements, cases are reported based on their
              Australian jurisdiction of residence rather than where they were
              detected. For example, a case reported previously in the NT in a
              NSW resident is counted in the national figures as a NSW case.
            </span>
          </div>
        </div>
      </Grid>

      <Grid item xs={12} sm={12} md={10} lg={6} xl={4}>
        <MbMap />
        <HistoryGraph countryData={country} />
      </Grid>
      <Grid item xs={12} sm={12} md={10} lg={6} xl={4}>
        <StateGraph stateData={stateData} />
      </Grid>

      <Grid item xs={12} sm={12} md={10} lg={6} xl={4}>
        <Flights flights={flights} />
      </Grid>
    </Grid>
  );
}

function Stat({
  modifyTime,
  confirmedCount,
  suspectedCount,
  deadCount,
  curedCount,
  name,
  quanguoTrendChart,
  hbFeiHbTrendChart,
  data,
  countryData
}) {
  let confCountIncrease = 0;
  let deadCountIncrease = 0;
  let curedCountIncrease = 0;
  if (data && countryData) {
    confirmedCount = 0;

    deadCount = 0;
    curedCount = 0;

    for (let i = 0; i < data.length; i++) {
      confirmedCount += parseInt(data[i][1]);
      deadCount += parseInt(data[i][2]);
      curedCount += parseInt(data[i][3]);
    }
    let lastTotal =
      countryData[
        Object.keys(countryData)[Object.keys(countryData).length - 1]
      ];
    confCountIncrease = confirmedCount - lastTotal[0];
    deadCountIncrease = deadCount - lastTotal[2];
    curedCountIncrease = curedCount - lastTotal[1];
  } else {
    confirmedCount = 0;

    deadCount = 0;
    curedCount = 0;
  }

  return (
    <div className="card">
      <h2 style={{ display: "flex" }}>
        Status {name ? `· ${name}` : false}
        <div
          style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}
        >
          <a
            style={{
              display: "inline-flex"
            }}
            className="badge badge-light"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/covid-19-au/covid-19-au.github.io/blob/dev/reference/reference.md"
          >
            <svg
              className="bi bi-question-circle"
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                clipRule="evenodd"
              />
              <path d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
            </svg>
            <div className="dataSource">Data Source</div>
          </a>
        </div>
      </h2>

      <div className="row">
        <Tag
          number={confirmedCount}
          fColor={"#e74c3c"}
          increased={confCountIncrease}
        >
          Confirmed
        </Tag>
        {/*<Tag number={suspectedCount || '-'}>*/}
        {/*疑似*/}
        {/*</Tag>*/}
        <Tag
          number={deadCount}
          fColor={"#a93226"}
          increased={deadCountIncrease}
        >
          Deaths
        </Tag>
        <Tag
          number={curedCount}
          fColor={"#00b321"}
          increased={curedCountIncrease}
        >
          Recovered
        </Tag>
      </div>
      <span className="due" style={{ fontSize: "80%", paddingTop: 0 }}>
        Time in AEDT, last updated at: {stateCaseData.updatedTime}
      </span>

      {/*<div>*/}
      {/*<img width="100%" src={quanguoTrendChart[0].imgUrl} alt="" />*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*<img width="100%" src={hbFeiHbTrendChart[0].imgUrl} alt="" />*/}
      {/*</div>*/}
    </div>
  );
}

let CanvasJSChart = CanvasJSReact.CanvasJSChart;

function HistoryGraph({ countryData }) {
  let today = Date.now();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState(null);
  const [newOpts, setNewOpts] = useState(null);
  useEffect(() => {
    let monthTrans = {
      0: "Jan",
      1: "Feb",
      2: "Mar",
      3: "Apr",
      4: "May",
      5: "Jun",
      6: "Jul",
      7: "Aug",
      8: "Sept",
      9: "Oct",
      10: "Nov",
      11: "Dec"
    };
    let historyData = [
      {
        type: "spline",
        name: "Confirmed",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "spline",
        name: "Deaths",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "spline",
        name: "Recovered",
        showInLegend: true,
        dataPoints: []
      }
    ];
    let newData = [
      {
        type: "stackedColumn",
        name: "New Cases",
        showInLegend: true,
        dataPoints: []
      },
      {
        type: "stackedColumn",
        name: "Deaths",
        showInLegend: true,
        dataPoints: []
      }
    ];
    let pre = [];
    for (let key in countryData) {
      let arr = key.split("-");
      let date = new Date(arr[0], arr[1] - 1, arr[2]);
      if ((today - date) / (1000 * 3600 * 24) <= 14) {
        let labelName =
          monthTrans[date.getMonth()] + " " + date.getDate().toString();
        historyData[0]["dataPoints"].push({
          y: countryData[key][0],
          label: labelName
        });
        historyData[1]["dataPoints"].push({
          y: countryData[key][2],
          label: labelName
        });
        historyData[2]["dataPoints"].push({
          y: countryData[key][1],
          label: labelName
        });
        newData[0]["dataPoints"].push({
          y: countryData[key][0] - pre[0],
          label: labelName
        });
        newData[1]["dataPoints"].push({
          y: countryData[key][2] - pre[2],
          label: labelName
        });
      }
      pre = countryData[key];
    }
    setOptions({
      animationEnabled: true,
      height: 314,
      title: {
        text: "Overall trends for COVID-19 cases in Australia ",
        fontFamily:
          "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        fontSize: 20
      },
      axisX: {
        labelFontFamily: "sans-serif"
      },
      axisY: {
        labelFontFamily: "sans-serif"
      },
      legend: {
        verticalAlign: "top",
        fontFamily: "sans-serif"
      },
      toolTip: {
        shared: true
        // content:"{label}, {name}: {y}" ,
      },

      data: historyData
    });
    setNewOpts({
      data: newData,
      animationEnabled: true,
      height: 315,
      title: {
        text: "Daily new cases and deaths in Australia",
        fontFamily:
          "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        fontSize: 20
      },
      axisX: {
        labelFontFamily: "sans-serif"
      },
      axisY: {
        labelFontFamily: "sans-serif"
      },
      legend: {
        verticalAlign: "top",
        fontFamily: "sans-serif"
      },
      toolTip: {
        shared: true
        // content:"{label}, {name}: {y}" ,
      }
    });

    setLoading(false);
  }, [countryData]);

  return loading ? (
    <div className="loading">Loading...</div>
  ) : (
    <div className="card">
      <h2>Historical Data</h2>
      <CanvasJSChart options={options} />
      <CanvasJSChart options={newOpts} />
    </div>
  );
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Area({ area, onChange, data }) {
  let totalRecovered = 0;
  for (let i = 0; i < data.length; i++) {
    totalRecovered += parseInt(data[i][3]);
  }
  let lastTotal =
    stateData[Object.keys(stateData)[Object.keys(stateData).length - 1]];

  const getAriaLabel = (state, confirmed, death, recovered, tested) => {
    return `In ${state
      .split("")
      .join(
        " "
      )}, there were ${confirmed} confirmed cases. Out of them, ${death} unfortunately resulted in death.
      
      ${recovered} recovered and ${tested} were tested`;
  };

  const renderArea = () => {
    let latest =
      testedCases[
        Object.keys(testedCases)[Object.keys(testedCases).length - 1]
      ];

    return data.map(x => (
      <div
        role={"button"}
        aria-label={getAriaLabel(...x)}
        aria-describedby={getAriaLabel(...x)}
        className="province"
        key={uuid()}
      >
        {/*<div className={`area ${x.name ? 'active' : ''}`}>*/}
        {/*{ x.name || x.cityName }*/}
        {/*</div>*/}
        {/*<div className="confirmed">{ x.confirmedCount }</div>*/}
        {/*<div className="death">{ x.deadCount }</div>*/}
        {/*<div className="cured">{ x.curedCount }</div>*/}
        <div className={"area"}>
          <strong>{x[0]}</strong>
        </div>
        <div className="confirmed">
          <strong>{numberWithCommas(x[1])}</strong>
          {x[0] === "NSW" || x[0] === "NT" || x[0] === "TAS" ? "*" : null}&nbsp;
          {x[1] - lastTotal[x[0]][0] > 0
            ? `(+${x[1] - lastTotal[x[0]][0]})`
            : null}
        </div>
        <div className="death">
          <strong>{numberWithCommas(x[2])}</strong>&nbsp;
          {x[2] - lastTotal[x[0]][1] > 0
            ? ` (+${x[2] - lastTotal[x[0]][1]})`
            : null}
        </div>
        <div className="cured">
          <strong>{numberWithCommas(x[3])}</strong>&nbsp;
          {x[3] - lastTotal[x[0]][2] > 0
            ? `(+${x[3] - lastTotal[x[0]][2]})`
            : null}
        </div>
        <div className="tested">{numberWithCommas(x[4])}</div>
      </div>
    ));
  };

  return (
    <div role={"table"}>
      <div className="province header">
        <div className="area header statetitle">State</div>
        <div className="confirmed header confirmedtitle">Confirmed</div>
        <div className="death header deathtitle">Deaths</div>
        <div className="cured header recoveredtitle">Recovered</div>
        <div className="tested header testedtitle">Tested</div>
      </div>
      {renderArea()}

      {totalRecovered > 25 ? null : (
        <div className="province">
          <div className={"area"}>
            <strong>TBD</strong>
          </div>
          <div className="confirmed">
            <strong></strong>
          </div>
          <div className="death">
            <strong></strong>
          </div>
          <div className="cured">
            <strong>21</strong>
          </div>
          <div className="tested"></div>
        </div>
      )}
    </div>
  );
}

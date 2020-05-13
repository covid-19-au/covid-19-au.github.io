import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";

import keyBy from "lodash.keyby";
import Area from "./Area";
import Flights from "./Flights";
import StateGraph from "./StateGraph";
import MbMap from "./ConfirmedMap";
import DaysSinceMap from "./DaysSinceMap"
import Stat from "./Stat";
import HistoryGraph from "./HistoryGraph";
import EChartGlobalLog from "./EChartGlobalLog";

import uuid from "react-uuid";
import CanvasJSReact from "../assets/canvasjs.react";
import provinces from "../data/area";
import stateData from "../data/state";
import flights from "../data/flight";
import country from "../data/country";
import all from "../data/overall";

import OverallTrend from "./OverallTrend";
import StateComparisonChart from "./StateComparisonChart";
import Ships from "./Ships";
import i18next from "../i18n";
import Acknowledgement from "../Acknowledgment";

const provincesByName = keyBy(provinces, "name");

const GoogleMap = React.lazy(() => import("./GoogleMap"));

export default function HomePage({
  province,
  overall,
  myData,
  area,
  data,
  setProvince,
  gspace,
}) {
  return (
    <Grid container spacing={gspace} justify="center" wrap="wrap">
      <Grid item xs={11} sm={11} md={10} lg={5}>
        <Stat
          {...{ ...all, ...overall }}
          name={province && province.name}
          data={myData}
          countryData={country}
        />
        <div className="card">
            <h2 style={{ display: "flex" }} aria-label="Cases of COVID 19 by state">{i18next.t("homePage:caseByState.title")}{province ? `· ${province.name}` : false}
                    <div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
                        <Acknowledgement>
                        </Acknowledgement></div>

            </h2>
            <Area area={area} onChange={setProvince} data={myData} />
        </div>
      </Grid>
      <Grid item xs={11} sm={11} md={10} lg={5}>
            <MbMap />

      </Grid>
      <Grid item xs={11} sm={11} md={10} lg={5}>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <div className="card">
                 <GoogleMap
                  province={province}
                  data={data}
                  onClick={(name) => {
                    const p = provincesByName[name];
                    if (p) {
                      setProvince(p);
                    }
                  }}
                  newData={myData}
                />
                </div>
          </Suspense>
          <DaysSinceMap />
      </Grid>

      <Grid item xs={11} sm={11} md={10} lg={5}>
        <StateComparisonChart />
        <OverallTrend />
      </Grid>
      <Grid item xs={11} sm={11} md={10} lg={5}>
        <EChartGlobalLog />
      </Grid>

      <Grid item xs={11} sm={11} md={10} lg={5}>
        <Flights flights={flights} />
        <Ships />
      </Grid>
    </Grid>
  );
}

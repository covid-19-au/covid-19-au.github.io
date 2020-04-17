import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import keyBy from "lodash.keyby";
import Area from "./HomePage/Area";
import Stat from "./HomePage/Stat"
import EChartGlobalLog from "./HomePage/EChartGlobalLog"
import uuid from "react-uuid";
import provinces from "./data/area";
import stateData from "./data/state";
import flights from "./data/flight";
import country from "./data/country";
import OverallTrend from "./HomePage/OverallTrend"
import StateComparisonChart from "./HomePage/StateComparisonChart"
import Carousel from 'react-material-ui-carousel'
import all from "./data/overall";

const provincesByName = keyBy(provinces, "name");

const GoogleMap = React.lazy(() => import("./HomePage/GoogleMap"));

export default function DashBoardConfig({ province, myData, overall, inputData, setProvince, area }) {
    let dashboardItemsPortrait = [
        <Stat
            {...{ ...all, ...overall }}
            name={province && province.name}
            data={myData}
            countryData={country}
        />,
        <Suspense fallback={<div className="loading">Loading...</div>}>
            <GoogleMap
                province={province}
                data={inputData}
                onClick={name => {
                    const p = provincesByName[name];
                    if (p) {
                        setProvince(p);
                    }
                }}
                newData={myData}
            />
        </Suspense>
        , <Suspense fallback={<div className="loading">Loading...</div>}>
            <Area area={area} onChange={setProvince} data={myData} />
        </Suspense>
    ]

    console.log(inputData)



    return (
        <Carousel interval="5000">
            {
                dashboardItemsPortrait.map(item => (
                    <div className="card">
                        {item}
                    </div>)
                )
            }
        </Carousel>
    )
}
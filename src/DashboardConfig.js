import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import keyBy from "lodash.keyby";
import Area from "./HomePage/Area";
import Stat from "./HomePage/Stat"
import EChartGlobalLog from "./HomePage/EChartGlobalLog";
import uuid from "react-uuid";
import provinces from "./data/area";
import stateData from "./data/state";
import flights from "./data/flight";
import country from "./data/country";
import OverallTrend from "./HomePage/OverallTrend";
import StateComparisonChart from "./HomePage/StateComparisonChart";
import Carousel from 'react-material-ui-carousel';
import all from "./data/overall";
import './DashboardConfig.css'
import Header from './Header';

const provincesByName = keyBy(provinces, "name");

const GoogleMap = React.lazy(() => import("./HomePage/GoogleMap"));

export default function DashBoardConfig({ province, myData, overall, inputData, setProvince, area }) {

    let dashboardItemsPortrait = [
        <div >
            <Grid container spacing={0} justify="center" wrap="wrap">
                <Grid item xs={11} >
                    <Stat
                        {...{ ...all, ...overall }}
                        name={province && province.name}
                        data={myData}
                        countryData={country}
                    />
                    <div className="card">
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
                            <Area area={area} onChange={setProvince} data={myData} />
                        </Suspense>
                    </div>
                </Grid>
            </Grid>
        </div>,
        <div>
            <Grid container spacing={0} justify="center" wrap="wrap">
                <Grid item xs={11} >
                    <OverallTrend />
                </Grid>
                <Grid item xs={11} >
                    <EChartGlobalLog />
                </Grid>
            </Grid>
        </div>

    ]

    let dashboardItemsLandscape = [
        <Grid container spacing={2} justify="center" wrap="wrap">

            <Grid item xs={5} className="removePadding">
                <Header province={province} />
                <Stat
                    {...{ ...all, ...overall }}
                    name={province && province.name}
                    data={myData}
                    countryData={country}
                />
                <OverallTrend />
            </Grid>
            <Grid item xs={4} >
                <div className="card">
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
                        <Area area={area} onChange={setProvince} data={myData} />
                    </Suspense>
                </div>
            </Grid>

        </Grid>,
        <div style={{ flexGrow: 1 }}>
            <Grid container spacing={1} justify="center" wrap="wrap">

                <Grid item xs={12} className="removePadding">
                    <Header province={province} />
                </Grid>
                <Grid item xs={6} >
                    <StateComparisonChart />
                </Grid>
                <Grid item xs={6} >
                    <EChartGlobalLog />
                </Grid>
            </Grid>
        </div>
    ]

    console.log(inputData)


    if (window.innerHeight > window.innerWidth) {
        return (

            <Carousel interval="15000">
                {
                    dashboardItemsPortrait.map(item => (
                        <div>{item}</div>
                    )
                    )
                }
            </Carousel >
        )
    }
    else {
        return (
            <Carousel interval="15000">
                {
                    dashboardItemsLandscape.map(item => (
                        <div>{item}</div>
                    )
                    )
                }
            </Carousel>
        )
    }
}
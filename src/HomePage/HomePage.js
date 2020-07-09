import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";

import keyBy from "lodash.keyby";
import Area from "./Area";
import Flights from "./Flights";
import ConfirmedMap from "./ConfirmedMap";
import Stat from "./Stat";
import EChartGlobalLog from "./EChartGlobalLog";

import provinces from "../data/area";
import flights from "../data/flight";
import country from "../data/country";
import all from "../data/overall";

import OverallTrend from "./OverallTrend";
import StateComparisonChart from "./StateComparisonChart";
import Ships from "./Ships";
import Acknowledgement from "../Acknowledgment";
import i18next from "../i18n";

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
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">{i18next.t("homePage:status.title")}
                        <div style={{ alignSelf: "flex-end", marginLeft: "auto", fontSize: "60%" }}>
                            <Acknowledgement>
                            </Acknowledgement></div>
                    </h2>

                    <Stat
                        {...{ ...all, ...overall }}
                        name={province && province.name}
                        data={myData}
                        countryData={country}
                    />

                    <Suspense fallback={<div className="loading">Loading...</div>}>
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
                        <Area area={area} onChange={setProvince} data={myData} />
                    </Suspense>
                </div>
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card" style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h2 style={{ display: 'flex' }}
                            aria-label="Casemap">Case Map<div
                        style={{
                                alignSelf: "flex-end",
                                marginLeft: "auto",
                                fontSize: "60%"
                            }}>
                            <Acknowledgement>
                            </Acknowledgement>
                        </div>
                    </h2>
                    <ConfirmedMap />
                </div>
            </Grid>
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <OverallTrend />
            </Grid>
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <StateComparisonChart />
            </Grid>
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <EChartGlobalLog />
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <Flights flights={flights} />
                <Ships />
            </Grid>
        </Grid>
    );
}

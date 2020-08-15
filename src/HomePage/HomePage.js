import React, { useState, Suspense, useEffect } from "react";
import Grid from "@material-ui/core/Grid";

import keyBy from "lodash.keyby";
import Area from "./Area";
import Flights from "./Flights";
import ConfirmedMap from "./ConfirmedMap";
import Stat from "./Stat";
import EChartGlobalLog from "./EChartGlobalLog";

import flights from "../data/flight";
import country from "../data/country";
import all from "../data/overall";

import OverallTrend from "./OverallTrend";
import StateCasesChart from "./StateCasesChart";
import Ships from "./Ships";
import Acknowledgement from "../Acknowledgment";
import i18next from "../i18n";
import stateCaseData from "../data/stateCaseData";
import UpdatedDateFns from "./UpdatedDateFns";
import provinces from "../data/area";
import GoogleMap from "./GoogleMap";


const provincesByName = keyBy(provinces, "name");


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
                </div>

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
                    <Area area={area} onChange={setProvince} data={myData} />
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

                <OverallTrend />
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">Active</h2>
                    <StateCasesChart valueType="active" />
                </div>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">Totals</h2>
                    <StateCasesChart valueType="total" />
                </div>
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">Deaths</h2>
                    <StateCasesChart valueType="deaths" />
                </div>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">In Hospital</h2>
                    <StateCasesChart valueType="in_hospital" />
                </div>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Status of COVID 19 cases">In ICU</h2>
                    <StateCasesChart valueType="in_icu" />
                </div>
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <EChartGlobalLog />
            </Grid>
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <Flights flights={flights} />
                {/*<Ships />*/}
            </Grid>
        </Grid>
    );
}

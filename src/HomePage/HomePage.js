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
import StateTestsChart from "./StateTestsChart";
import Acknowledgement from "../Acknowledgment";
import i18next from "../i18n";
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
                    <h2 style={{ display: "flex" }} aria-label="Active COVID 19 cases">Active, Total and Deaths<div
                        style={{
                            alignSelf: "flex-end",
                            marginLeft: "auto",
                            fontSize: "60%"
                        }}>
                        <Acknowledgement>
                        </Acknowledgement>
                    </div></h2>
                    <StateCasesChart valueTypes={["active", "total", "deaths"]} />
                </div>
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="In hospital or ICU due to COVID 19">In Hospital/ICU<div
                        style={{
                            alignSelf: "flex-end",
                            marginLeft: "auto",
                            fontSize: "60%"
                        }}>
                        <Acknowledgement>
                        </Acknowledgement>
                    </div></h2>
                    <StateCasesChart valueTypes={["in_hospital", "in_icu"]} />
                </div>
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Total tests performed">Total Tested<div
                        style={{
                            alignSelf: "flex-end",
                            marginLeft: "auto",
                            fontSize: "60%"
                        }}>
                        <Acknowledgement>
                        </Acknowledgement>
                    </div></h2>
                    <StateTestsChart />
                </div>

                <Flights flights={flights} />
                {/*<Ships />*/}
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <EChartGlobalLog />
            </Grid>
        </Grid>
    );
}

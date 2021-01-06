import React from "react";
import Grid from "@material-ui/core/Grid";

import keyBy from "lodash.keyby";
import CasesByStateTable from "./charts/CasesByStateTable";
import Flights from "./flights/Flights";
import ConfirmedMap from "./confirmed_map/ConfirmedMap";
import NationalStatTiles from "./national_stat_tiles/NationalStatTiles";
import EChartGlobalLog from "./charts/GlobalComparison";

import flights from "../data/flight.json";
import country from "../data/country.json";
import all from "../data/overall.json";

import NationalCasesDeathsRecoveries from "./charts/NationalCasesDeathsRecoveries";
import StateComparisonChart from "../common/data_vis/CrawlerDataVis/StateComparisonChart";
import Acknowledgement from "../common/Acknowledgment";
import i18next from "../assets/translations/i18n";
import provinces from "../data/area.json";
import GoogleMap from "./google_map/GoogleMap";


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

                    <NationalStatTiles
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
                    <CasesByStateTable area={area} onChange={setProvince} data={myData} />
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

                <NationalCasesDeathsRecoveries />
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2 style={{ display: "flex" }} aria-label="Active COVID 19 cases">State Comparisons<div
                        style={{
                            alignSelf: "flex-end",
                            marginLeft: "auto",
                            fontSize: "60%"
                        }}>
                        <Acknowledgement>
                        </Acknowledgement>
                    </div></h2>

                    <StateComparisonChart />
                </div>
            </Grid>

            {/*
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
            */}

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <EChartGlobalLog />
            </Grid>

            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <Flights flights={flights} />
            </Grid>
        </Grid>
    );
}

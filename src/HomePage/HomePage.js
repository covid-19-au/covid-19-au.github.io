import React from "react";
import Grid from "@material-ui/core/Grid";

import Area from "./Area";
import Flights from "./Flights";
import ConfirmedMap from "./ConfirmedMap";
import Stat from "./Stat";
import EChartGlobalLog from "./EChartGlobalLog";

import flights from "../data/flight";
import country from "../data/country";
import all from "../data/overall";

import OverallTrend from "./OverallTrend";
import StateComparisonChart from "./StateComparisonChart";
import Ships from "./Ships";
import Acknowledgement from "../Acknowledgment";
import i18next from "../i18n";
import stateCaseData from "../data/stateCaseData";
import UpdatedDateFns from "./UpdatedDateFns";


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

                    <Area area={area} onChange={setProvince} data={myData} />

                    <span className="due" style={{ fontSize: "80%", paddingTop: 0 }}
                        aria-label={UpdatedDateFns.getAriaLabelForUpdatedTime(stateCaseData.updatedTime)}
                        aria-describedby={UpdatedDateFns.getAriaLabelForUpdatedTime(stateCaseData.updatedTime)}>
                        {i18next.t("homePage:status.note")}{stateCaseData.updatedTime}
                    </span>
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

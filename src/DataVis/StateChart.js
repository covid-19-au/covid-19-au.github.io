import React, { Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import ageGenderData from "../data/ageGender";
import ReactGA from "react-ga";
import latestAusData from "../data/stateCaseData";

import AgeChart from "./AgeChart";
import GenderChart from "./GenderChart";
import GeneralBarChart from "./GeneralBarChart";
import GeneralLineChart from "./GeneralLineChart";
import renderStatus from "./renderStatus";
import RegionalCasesBarChart from "../HomePage/CrawlerDataVis/RegionalCases/RegionalCasesBarChart";
import MultiDataTypeBarChart from "../HomePage/CrawlerDataVis/MultiDataTypeBarChart";
import RegionalCasesHeatMap from "../HomePage/CrawlerDataVis/RegionalCases/RegionalCasesHeatMap";
import PopulationPyramid from "../HomePage/CrawlerDataVis/AgeCharts/PopulationPyramid";
import RegionalCasesTreeMap from "../HomePage/CrawlerDataVis/RegionalCases/RegionalCasesTreeMap";
import RegionType from "../HomePage/CrawlerDataTypes/RegionType";
import DataDownloader from "../HomePage/CrawlerData/DataDownloader";
import ConfirmedMap from "../HomePage/ConfirmedMap"
import Acknowledgement from "../Acknowledgment";
import AgeBarChart from "../HomePage/CrawlerDataVis/AgeCharts/AgeBarChart";

const stateNameMapping = {
    VIC: "Victoria",
    NSW: "New South Wales",
    QLD: "Queensland",
    ACT: "Australian Capital Territory",
    SA: "South Australia",
    WA: "Western Australia",
    TAS: "Tasmania",
    NT: "Northern Territory",
};

/**
 * get choosen state data
 * @param {String} state user chosed state
 * @return {Object} object which contains age and gender data for a specific state. Return null if the choosen state data is not available
 */
function getExpectStateData(state) {
    return state.toUpperCase() in ageGenderData ? ageGenderData[state] : null;
}

class StateChart extends React.Component {
    constructor({ state }) {
        super();
        this.stateName = state;
        this.dataDownloader = new DataDownloader();
    }

    render() {
        const statusUpdateTime = latestAusData["updatedTime"];

        // get choosen state data
        const stateAgeGenderData = getExpectStateData(this.stateName);

        ReactGA.pageview("/state/" + this.stateName);

        return (
            <Grid container spacing={1} justify="center" wrap="wrap">
                <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card">
                        <div className="table">
                            {/* Display some basic current case stats */}
                            <h2>{stateNameMapping[this.stateName]}</h2>
                            {renderStatus(this.stateName.toUpperCase())}
                        </div>

                        <hr />

                        <div style={{marginTop: '20px'}}>
                            <GeneralBarChart state={this.stateName} />
                        </div>
                    </div>
                </Grid>

                <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card" style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h2 style={{ display: 'flex' }}
                            aria-label="Casemap">Case Map<div style={{
                                alignSelf: "flex-end",
                                marginLeft: "auto",
                                fontSize: "60%"
                            }}>
                                <Acknowledgement>
                                </Acknowledgement>
                            </div>
                        </h2>
                        <ConfirmedMap stateName={'AU-'+this.stateName} />
                    </div>
                </Grid>

                <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card">
                        <h2>Historical Data</h2>
                        {/* Display "Historical Statistics" chart */}
                        <GeneralLineChart state={this.stateName} />
                    </div>

                    <div className="card">
                        <h2>Infection Sources</h2>
                        <MultiDataTypeBarChart ref={(el) => this.multiDataTypeAreaChart = el} />
                    </div>
                </Grid>

                {stateAgeGenderData !== null || this.stateName === 'QLD' ? (
                    <Fragment>
                        {/* "Cases by Age Group" chart */}
                        <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                            <div className="card">
                                <h2>Gender and Age</h2>
                                {stateAgeGenderData ? <GenderChart state={this.stateName} /> : ''}
                                <PopulationPyramid ref={(el) => this.populationPyramid = el} />
                                <AgeBarChart ref={(el) => this.ageBarChart = el} />
                            </div>
                        </Grid>
                    </Fragment>
                ) : (
                    <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                        <h2 style={{ textAlign: "center" }}>
                            We are working on acquiring detailed age group and gender data for{" "}
                            {stateNameMapping[this.stateName]}!
                        </h2>
                        <br />
                        <h5 style={{ textAlign: "center" }}>
                            If you have reliable source for such data, please let us know
                            through{" "}
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSeX4RU-TomFmq8HAuwTI2_Ieah60A95Gz4XWIMjsyCxZVu7oQ/viewform?usp=sf_link"
                                style={{ color: "blue", textDecoration: "underline" }}
                            >
                                this
                            </a>{" "}
                            form.
                        </h5>
                    </Grid>
                )}

                {/*<Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card">
                        <h2>Patient Status</h2>
                        <MultiDataTypeBarChart ref={(el) => this.multiDataTypeAreaChart2 = el} />
                    </div>
                </Grid>*/}
                <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card">
                        <h2>Regional Heatmap</h2>
                        <RegionalCasesHeatMap ref={(el) => this.bubbleChart = el} />
                    </div>
                </Grid>
                <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card">
                        <h2>Regional Cases</h2>
                        <RegionalCasesBarChart ref={(el) => this.areaChart = el} />
                    </div>
                    <div className="card">
                        <h2>Regional Tree Map</h2>
                        <RegionalCasesTreeMap ref={(el) => this.treeMap = el} />
                    </div>
                </Grid>
            </Grid>
        );
    }

    componentDidMount() {
        this.__initPlotlyJSCharts();
    }

    async __initPlotlyJSCharts() {
        // TODO: FIX NT!!!! ===========================================================================================

        let regionParent = 'au-'+this.stateName.toLowerCase(),
            regionSchema;

        if (regionParent === 'au-qld') regionSchema = 'hhs';
        else if (regionParent === 'au-tas') regionSchema = 'ths';
        else if (regionParent === 'au-nt') regionSchema = 'admin_1';
        else if (regionParent === 'au-act') regionSchema = 'sa3';
        else regionSchema = 'lga';

        let totalCaseData = await this.dataDownloader.getCaseData(
            'total', regionSchema, regionParent
        );
        this.treeMap.setCasesInst(totalCaseData, 21);

        let newCaseData = await this.dataDownloader.getCaseData(
            'status_active', regionSchema, regionParent
        );
        this.areaChart.setCasesInst(newCaseData);
        this.bubbleChart.setCasesInst(newCaseData);

        let casesInsts = [];
        for (let dataType of [
            'source_confirmed',
            'source_community',
            'source_under_investigation',
            'source_overseas'
        ]) {
            casesInsts.push(await this.dataDownloader.getCaseData(
                dataType, 'admin_1', 'au'
            ));
        }
        this.multiDataTypeAreaChart.setCasesInst(
            casesInsts,
            new RegionType('admin_1', 'au', regionParent)
        );

        /*casesInsts = [];
        for (let dataType of [
            'status_deaths',
            'status_hospitalized',
            'status_icu',
            'status_active',
            //'status_recovered',
            'status_unknown'
        ]) {
            let i = await this.dataDownloader.getCaseData(
                dataType, 'admin_1', 'au'
            );
            if (i)
                casesInsts.push(i);
        }
        this.multiDataTypeAreaChart2.setCasesInst(
            casesInsts,
            new RegionType('admin_1', 'au', regionParent)
        );*/

        if (this.populationPyramid) {
            let femaleData = await this.dataDownloader.getCaseData(
                'total_female', 'admin_1', 'au'
            );
            let maleData = await this.dataDownloader.getCaseData(
                'total_male', 'admin_1', 'au'
            );
            this.populationPyramid.setCasesInst(
                maleData, femaleData,
                new RegionType('admin_1', 'au', regionParent)
            );
        }

        if (this.ageBarChart) {
            let totalCaseData = await this.dataDownloader.getCaseData(
                'new', 'admin_1', 'au'
            );
            this.ageBarChart.setCasesInst(
                totalCaseData,
                new RegionType('admin_1', 'au', regionParent)
            )
        }
    }
}

export default StateChart;

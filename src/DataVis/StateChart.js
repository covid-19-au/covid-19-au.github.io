import React, { Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import ageGenderData from "../data/ageGender";
import ReactGA from "react-ga";
import latestAusData from "../data/stateCaseData";

import GenderChart from "./GenderChart";
import GeneralBarChart from "./GeneralBarChart";
import GeneralLineChart from "./GeneralLineChart";
import renderStatus from "./renderStatus";
import RegionalCasesBarChart from "../HomePage/CrawlerDataVis/RegionalCasesBarChart";
import MultiDataTypeBarChart from "../HomePage/CrawlerDataVis/MultiDataTypeBarChart";
import PopulationPyramid from "../HomePage/CrawlerDataVis/PopulationPyramid";
import RegionalCasesTreeMap from "../HomePage/CrawlerDataVis/RegionalCasesTreeMap";
import RegionType from "../HomePage/CrawlerDataTypes/RegionType";
import DataDownloader from "../HomePage/CrawlerData/DataDownloader";
import ConfirmedMap from "../HomePage/ConfirmedMap"
import Acknowledgement from "../Acknowledgment";
import AgeBarChart from "../HomePage/CrawlerDataVis/AgeBarChart";
import getRemoteData from "../HomePage/CrawlerData/RemoteData";

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
    constructor(props) {
        // Params for props: state/dataType/timePeriod
        super(props);
    }

    render() {
        const statusUpdateTime = latestAusData["updatedTime"];

        // get choosen state data
        const stateAgeGenderData = getExpectStateData(this.props.state);

        ReactGA.pageview("/state/" + this.props.state);

        let infectionSources = (
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2>Infection Sources</h2>
                    <MultiDataTypeBarChart ref={(el) => this.multiDataTypeAreaChart = el} />
                </div>
            </Grid>
        );
        let mostActive10Regions = (
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2>Most Active Regions</h2>
                    <RegionalCasesBarChart ref={(el) => this.areaChart = el} />
                    {/*<RegionalCasesHeatMap ref={(el) => this.bubbleChart = el} />*/}
                </div>
            </Grid>
        );
        let casesShownAsArea = (
            <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                <div className="card">
                    <h2>Cases Shown as Area</h2>
                    <RegionalCasesTreeMap ref={(el) => this.treeMap = el} />
                </div>
            </Grid>
        );
        let genderBalance = (
            <div className="card">
                <h2>Gender Balance</h2>
                {stateAgeGenderData ? <GenderChart state={this.props.state} /> : ''}
            </div>
        );

        return (
            <Grid container spacing={1} justify="center" wrap="wrap">
                <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                    <div className="card">
                        <div className="table">
                            {/* Display some basic current case stats */}
                            <h2>{stateNameMapping[this.props.state]}</h2>
                            {renderStatus(this.props.state.toUpperCase())}
                        </div>
                    </div>

                    {/*<div className="card">
                        <h2>Current Statistics</h2>
                        <GeneralBarChart state={this.props.state} />
                    </div>*/}

                    <div className="card">
                        <h2>Historical Data</h2>
                        {/* Display "Historical Statistics" chart */}
                        <GeneralLineChart state={this.props.state} />
                    </div>

                    {this.props.state !== 'NT' && this.props.state !== 'TAS' ? genderBalance : ''}
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
                        <ConfirmedMap stateName={'AU-'+this.props.state}
                                      dataType={this.props.dataType}
                                      timePeriod={this.props.timePeriod}
                                      height={"60vh"}/>
                    </div>
                </Grid>

                {this.props.state !== 'NT' && this.props.state !== 'TAS' ? infectionSources : ''}

                {stateAgeGenderData !== null || this.props.state === 'QLD' || this.props.state === 'WA' ? (
                    <Fragment>
                        {/* "Cases by Age Group" chart */}
                        <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                            <div className="card">
                                <h2>Age Distribution</h2>
                                <PopulationPyramid ref={(el) => this.populationPyramid = el} />
                            </div>
                        </Grid>
                        <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                            <div className="card">
                                <h2>Age Distribution Over Time</h2>
                                <AgeBarChart ref={(el) => this.ageBarChart = el} />
                            </div>
                        </Grid>
                    </Fragment>
                ) : (
                    <Grid style={{minWidth: '45%', maxWidth: '700px'}} item xs={11} sm={11} md={10} lg={5}>
                        <h2 style={{ textAlign: "center" }}>
                            We are working on acquiring detailed age group and gender data for{" "}
                            {stateNameMapping[this.props.state]}!
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

                {this.props.state !== 'NT' ? mostActive10Regions : ''}
                {this.props.state !== 'NT' ? casesShownAsArea : ''}
            </Grid>
        );
    }

    /********************************************************************
     * On initialization triggers
     ********************************************************************/

    componentDidMount() {
        this.__initPlotlyJSCharts();
    }

    async __initPlotlyJSCharts() {
        // TODO: FIX NT!!!! ===========================================================================================

        let remoteData = await getRemoteData();
        this.dataDownloader = new DataDownloader(remoteData);

        let regionParent = 'au-'+this.props.state.toLowerCase(),
            regionSchema;

        if (regionParent === 'au-qld') regionSchema = 'hhs';
        else if (regionParent === 'au-tas') regionSchema = 'ths';
        else if (regionParent === 'au-nt') regionSchema = 'admin_1';
        else if (regionParent === 'au-act') regionSchema = 'sa3';
        else regionSchema = 'lga';

        this.__initTreeMap(regionSchema, regionParent);
        this.__initAreaChart(regionSchema, regionParent);
        this.__initInfectionSource(regionParent);

        if (this.populationPyramid) {
            this.__initPopulationPyramid(regionParent);
        }

        if (this.ageBarChart) {
            this.__initAgeBarChart(regionParent);
        }
    }

    /********************************************************************
     * Horizontal bar/area charts
     ********************************************************************/

    /**
     *
     * @param regionSchema
     * @returns {Promise<void>}
     * @private
     */
    async __initAreaChart(regionSchema, regionParent) {
        let activeCaseData = await this.dataDownloader.getCaseData(
            'status_active', regionSchema, regionParent
        );
        let newCaseData = await this.dataDownloader.getCaseData(
            'new', regionSchema, regionParent
        );

        if (!this.areaChart) {
            return;
        }
        this.areaChart.setCasesInsts(activeCaseData, newCaseData);
    }

    /**
     *
     * @param regionParent
     * @returns {Promise<void>}
     * @private
     */
    async __initInfectionSource(regionParent) {
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
        if (!this.multiDataTypeAreaChart) {
            return;
        }
        this.multiDataTypeAreaChart.setCasesInst(
            casesInsts,
            new RegionType('admin_1', 'au', regionParent)
        );
    }

    /**
     *
     * @param regionParent
     * @returns {Promise<void>}
     * @private
     */
    async __initAgeBarChart(regionParent) {
        let totalCaseData = await this.dataDownloader.getCaseData(
                'total', 'admin_1', 'au'
        );
        if (!this.ageBarChart) {
            return;
        }
        this.ageBarChart.setCasesInst(
            totalCaseData,
            new RegionType('admin_1', 'au', regionParent)
        )
    }
    
    /********************************************************************
     * Vertical bar charts
     ********************************************************************/

    /**
     *
     * @param regionParent
     * @returns {Promise<void>}
     * @private
     */
    async __initPopulationPyramid(regionParent) {
        let femaleData = await this.dataDownloader.getCaseData(
            'total_female', 'admin_1', 'au'
        );
        let maleData = await this.dataDownloader.getCaseData(
            'total_male', 'admin_1', 'au'
        );
        let regionType = new RegionType(
            'admin_1', 'au', regionParent
        );

        if (!this.populationPyramid) {
            return;
        } else if (maleData.getAgeRanges(regionType).length && femaleData.getAgeRanges(regionType).length) {
            this.populationPyramid.setCasesInst(
                maleData, femaleData, regionType
            );
        } else {
            // TODO: Display age totals if male/female breakdowns not available!
            this.populationPyramid.setCasesInst(
                await this.dataDownloader.getCaseData(
                    'total', 'admin_1', 'au'
                ), null, regionType
            );
        }
    }

    /********************************************************************
     * Tree maps
     ********************************************************************/

    /**
     *
     * @param regionSchema
     * @param regionParent
     * @returns {Promise<void>}
     * @private
     */
    async __initTreeMap(regionSchema, regionParent) {
        let totalCaseData = await this.dataDownloader.getCaseData(
            'total', regionSchema, regionParent
        );
        let newCaseData = await this.dataDownloader.getCaseData(
            'new', regionSchema, regionParent
        );
        let activeCaseData = await this.dataDownloader.getCaseData(
            'status_active', regionSchema, regionParent
        );

        if (!this.treeMap) {
            return;
        } else if (!activeCaseData || !activeCaseData.datatypeInData()) {
            // Revert to 21 days if "status_active" isn't available
            this.treeMap.setCasesInst(null, newCaseData, totalCaseData);
        } else {
            this.treeMap.setCasesInst(activeCaseData, newCaseData, totalCaseData);
        }
    }
}

export default StateChart;

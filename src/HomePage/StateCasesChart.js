import React from "react";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
// import i18n bundle
import i18next from '../i18n';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";

import stateData from "../data/state.json"
import stateColours from "./stateColours";


let valuesMap = {
    "total": 0,
    "deaths": 1,
    "recovered": 3,
    //"tested": 4,
    "active": 4,
    "in_hospital": 5,
    "in_icu": 6
};


class StateCasesChart extends React.Component {
    constructor(props) {
        super(props);

        if (!props.valueTypes) {
            throw "valueTypes must be supplied!";
        }
        this.state = {
            valueType: props.valueTypes[0]
        };
        this.__valueType = props.valueTypes[0];
        this.__logScale = false;
        this.__currentKey = 0;
    }

    /*******************************************************************
     * HTML Rendering
     *******************************************************************/

    render() {
        if (!this.state.option) {
            return '';
        }

        const activeStyles = {
            color: 'black',
            borderColor: '#8ccfff',
            padding: "0px",
            outline: "none",
            zIndex: 10
        };
        const inactiveStyles = {
            color: 'grey',
            borderColor: '#e3f3ff',
            padding: "0px",
            outline: "none"
        };

        return (
            <>
                <Paper style={{
                    display: this.props.valueTypes.length <= 1 ? "none" : "block",
                    marginBottom: "20px"
                }}>
                    <Tabs
                     value={this.state.valueType}
                     indicatorColor="primary"
                     textColor="primary"
                     onChange={(e, newValue) => this.setValueType(newValue)}
                     centered
                    >
                        {
                            this.props.valueTypes.map(valueType => {
                                return <Tab label={valueType.replace('_', ' ')} value={valueType} />;
                            })
                        }
                    </Tabs>
                </Paper>

                <ReactEchartsCore
                    key={this.__currentKey++}
                    echarts={echarts}
                    style={{
                        height: "28vh",
                        width: this.state.sizeHack ? "auto" : "100%"
                    }}
                    option={this.state.option}
                />

                <span className="due">
                    <span className="key"><p>{i18next.t("homePage:chartCommon.clickLegend")}</p></span><br />
                    <span className="key"><p>{i18next.t("homePage:chartCommon.clickPoint")}</p></span><br />

                    <span className="key" style={{ marginTop: "0.5rem" }}>

                        Logarithmic Scale:&nbsp;
                        <ButtonGroup size="small" aria-label="small outlined button group">
                            <Button style={this.state.logScale ? inactiveStyles : activeStyles}
                                    onClick={() => this.setLogScale(false)}>Off</Button>
                            <Button style={this.state.logScale ? activeStyles : inactiveStyles}
                                    disableElevation={true}
                                    onClick={() => this.setLogScale(true)}>On</Button>
                        </ButtonGroup>
                        <a
                            style={{
                                display: "inline-flex",
                                backgroundColor: "white",
                                verticalAlign: "middle"
                            }}
                            className="badge badge-light"
                            href="https://en.wikipedia.org/wiki/Logarithmic_scale"
                            target="blank"
                        >
                            <svg className="bi bi-question-circle"
                                 width="1.1em"
                                 height="1.1em"
                                 viewBox="0 0 16 16"
                                 fill="currentColor"
                                 backgroundColor="white"
                                 xmlns="http://www.w3.org/2000/svg"
                            >
                                <path fillRule="evenodd"
                                      d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                                      clipRule="evenodd" />
                                <path
                                    d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                            </svg>
                            <div className="dataSource" />
                        </a>
                    </span>
                </span>
            </>
        );
    }

    componentDidMount() {
        this.__updateSeriesData();
    }

    setValueType(valueType) {
        this.__valueType = valueType;
        this.__updateSeriesData();
    }

    /*******************************************************************
     * Misc fns
     *******************************************************************/

    setLogScale(logScale) {
        this.__logScale = logScale;
        this.__updateSeriesData();
    }

    /**
     * Sorts states by their number of cases
     *
     * @param stateData
     * @returns {*[]}
     */
    getSortedStates(stateData) {
        // Find the most recent day with data
        let latestData = stateData[
            Object.keys(stateData)[Object.keys(stateData).length - 1]
        ];

        // Sort state by cases
        let sortable = [];
        for (let state in latestData) {
            sortable.push([state, latestData[state]]);
        }
        sortable.sort(function (a, b) {
            return b[1][0] - a[1][0];
        });

        return sortable.map(state => state[0]);
    }

    /*******************************************************************
     * Case data
     *******************************************************************/

    /**
     * Breaks the data down into spline data points
     * @param stateData
     * @param states
     * @returns {*}
     */
    getCaseData(stateData, states) {
        // Map each state into its series
        return states.map(state => this.__getCaseData(stateData, state));
    }

    __getCaseData(stateData, state) {
        let instances = [];

        for (let day in stateData) {
            let arr = day.split("-");
            const cases = stateData[day];
            instances.push(cases[state][valuesMap[this.__valueType]]);
        }
        return instances;
    }

    getCaseDates(stateData) {
        let monthTrans = {
            0: "Jan",
            1: "Feb",
            2: "Mar",
            3: "Apr",
            4: "May",
            5: "Jun",
            6: "Jul",
            7: "Aug",
            8: "Sept",
            9: "Oct",
            10: "Nov",
            11: "Dec"
        };

        let dateData = [];
        for (let key in stateData) {
            let arr = key.split("-");
            let date = new Date(arr[0], arr[1] - 1, arr[2]);
            let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
            dateData.push(labelName);
        }
        return dateData;
    }

    /*******************************************************************
     * Update series data
     *******************************************************************/

    __updateSeriesData() {
        let yAxisType = this.__logScale ? 'log' : 'value';
        let orderedStates = this.getSortedStates(stateData);

        // Get case data
        let caseData = this.getCaseData(stateData, orderedStates);
        let caseDates = this.getCaseDates(stateData);

        // Graph initial start point (4 weeks)
        let startCase = parseInt(100 - (28 / caseDates.length * 100));

        // List of lines to pass into "series" option
        let lineSeries = [];

        // Add dotted+solid lines for confirmed cases
        let i = 0;
        while (i < orderedStates.length) {
            let confirmedLine = {
                name: i18next.t("homePage:state." + orderedStates[i]),
                type: 'line',
                symbol: 'circle',
                stack: this.__logScale ? null : 'one',
                areaStyle: this.__logScale ? null : {},
                smooth: true,
                sampling: 'average',
                animation: false,
                data: caseData[i],
                itemStyle: {
                    color: stateColours[orderedStates[i]]
                },
            };
            lineSeries.push(confirmedLine);
            i = i + 1;
        }

        this.setState({
            logScale: this.__logScale,
            valueType: this.__valueType,
            option: {
                animation: false,
                grid: [
                    {
                        top: '40px',
                        bottom: '40px',
                        containLabel: true,
                        left: 0,
                        right: 0,
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: "white",
                    borderColor: "#bae1ff",
                    borderWidth: "1",
                    textStyle: {
                        color: "black"
                    }
                },
                legend: {
                    show: true,
                    left: "10%",
                    right: "10%",
                    top: "top",
                    itemGap: 5
                },
                yAxis: [
                    {
                        type: yAxisType,
                        min: this.__logScale ? 1 : 0
                    }
                ],
                xAxis: [{
                    type: "category",
                    data: caseDates
                }],
                dataZoom: [
                    {
                        type: 'inside',
                        start: startCase,
                        end: 100
                    },
                    {
                        start: 0,
                        end: 10,
                        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                        handleSize: '80%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        },
                        bottom: "0%",
                        left: "center"
                    }
                ],
                series: lineSeries
            }
        })
    }
}

export default StateCasesChart;

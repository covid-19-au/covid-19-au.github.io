import React from "react";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import stateData from "../data/state.json"
// import i18n bundle
import i18next from '../i18n';


class StateComparisonChart extends React.Component {
    constructor(props) {
        super(props);

        this.stateColours = {
            "NSW": "#8ccfff",
            "VIC": "#547dbf",
            "QLD": "#c27cb9",
            "WA": "#8e9191",
            "SA": "#c74c4a",
            "TAS": "#79d9b4",
            "ACT": "#edbd64",
            "NT": "#ed7d51"
        };
        this.state = {
            yAxisType: "value",
            logScale: false,
        };
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
            <div className="card">
                <h2>{i18next.t("homePage:stateComparisons.title")}</h2>

                <ReactEchartsCore
                    echarts={echarts}
                    style={{
                        height: "550px"
                    }}
                    option={this.state.option}
                />

                <span className="due">
                    <span className="key"><p>{i18next.t("homePage:chartCommon.clickLegend")}</p></span><br />
                    <span className="key"><p>{i18next.t("homePage:chartCommon.clickPoint")}</p></span><br />
                    <span className="key"><p>{i18next.t("homePage:chartCommon.dottedLine")}</p></span><br />
                    <span className="key" style={{ marginTop: "0.5rem" }}>

                        Logarithmic Scale:&nbsp;
                        <ButtonGroup size="small" aria-label="small outlined button group">
                            <Button style={this.state.logScale ? activeStyles : inactiveStyles}
                                    disableElevation={true}
                                    onClick={() => this.setLogScale(true)}>On</Button>
                            <Button style={this.state.logScale ? inactiveStyles : activeStyles}
                                    onClick={() => this.setLogScale(false)}>Off</Button>
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
            </div>
        );
    }

    componentDidMount() {
        this.__updateSeriesData();
    }

    /*******************************************************************
     * Misc fns
     *******************************************************************/

    setLogScale(logScale) {
        this.setState({
            logScale: logScale
        });
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
        return states.map(state =>this.__getCaseData(stateData, state));
    }

    __getCaseData(stateData, state) {
        let instances = [];

        for (let day in stateData) {
            let arr = day.split("-");
            const cases = stateData[day];
            instances.push(cases[state][0]);
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
     * Tested data
     *******************************************************************/

    getTestedData(stateData, states) {
        // Map each state into its series
        return states.map(state => this.__getTestedData(stateData, state));
    }

    __getTestedData(stateData, state) {
        let instances = [];

        for (let day in stateData) {
            let arr = day.split("-");
            let date = new Date(arr[0], arr[1] - 1, arr[2]);
            const cases = stateData[day];

            if (date.getMonth() > 1) {
                if (date.getMonth() === 2) {
                    if (date.getDate() >= 18) {
                        instances.push(cases[state][3]);
                    }
                }
                else if (date.getMonth() > 2) {
                    instances.push(cases[state][3]);
                }
            }
        }
        return instances;
    }

    getTestedDates(stateData) {
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
            if (date.getMonth() > 1) {
                if (date.getMonth() === 2) {
                    if (date.getDate() >= 18) {
                        let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                        dateData.push(labelName);
                    }
                }
                else {
                    let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                    dateData.push(labelName);
                }
            }
        }
        return dateData;
    }

    getTestedDataSet(testedData, orderedStates) {
        let dataSet = {};

        let j = 0;
        while (j < testedData.length) {
            let currentState = orderedStates[j];

            dataSet[currentState] = [];
            dataSet[currentState].push([]);
            dataSet[currentState][0].push(testedData[j][0]);

            let i = 0;
            while (i < testedData[j].length - 1) {
                let currentListIndex = dataSet[currentState].length - 1;
                //add next value if it is different
                while (
                    testedData[j][i] !== testedData[j][i + 1] &&
                    i < testedData[j].length - 1
                ) {
                    dataSet[currentState][currentListIndex].push(testedData[j][i + 1]);
                    i = i + 1;
                }

                let k = 0;
                dataSet[currentState].push([]); //push a new list
                currentListIndex = dataSet[currentState].length - 1;

                //Add dash for every value already recorded
                while (k <= i) {
                    dataSet[currentState][currentListIndex].push("-");
                    k = k + 1;
                }

                //Add dash for next value if it is the same
                while (testedData[j][i] === testedData[j][i + 1] && i < testedData[j].length - 1) {
                    dataSet[currentState][currentListIndex].push("-");
                    i = i + 1;
                }

                //Start new solid line if different value encountered
                dataSet[currentState][currentListIndex][i] = testedData[j][i];
            }
            j = j + 1;
        }
        return dataSet;
    }

    /*******************************************************************
     * Update series data
     *******************************************************************/

    __updateSeriesData() {
        let yAxisType = this.state.logScale ? 'log' : null;
        let orderedStates = this.getSortedStates(stateData);

        // Get case data
        let caseData = this.getCaseData(stateData, orderedStates);
        let caseDates = this.getCaseDates(stateData);

        // Get tested data
        let testedData = this.getTestedData(stateData, orderedStates);
        let testedDates = this.getTestedDates(stateData);
        let testedDataFinal = this.getTestedDataSet(testedData, orderedStates);

        // Graph initial start point (2 weeks)
        let startCase = parseInt(100 - (14 / caseDates.length * 100));
        let startTested = parseInt(100 - (14 / testedDates.length * 100));

        // List of lines to pass into "series" option
        let lineSeries = [];

        // Add solid lines
        let i = 0;
        while (i < orderedStates.length) {
            let j = 0;

            while (j < testedDataFinal[orderedStates[i]].length) {
                let newLine = {
                    name: i18next.t("homePage:state." + orderedStates[i]),
                    type: 'line',
                    sampling: 'average',
                    showSymbol: false,
                    itemStyle: {
                        color: this.stateColours[orderedStates[i]]
                    },
                    data: testedDataFinal[orderedStates[i]][j],
                    tooltip: {
                        trigger: "none"
                    }
                };

                lineSeries.push(newLine);
                j = j + 1;
            }
            i = i + 1;
        }

        // Add Dotted Lines and confirmed cases
        i = 0;
        while (i < orderedStates.length) {
            let dottedLine = {
                name: i18next.t("homePage:state." + orderedStates[i]),
                type: 'line',
                itemStyle: {
                    color: this.stateColours[orderedStates[i]]
                },
                data: testedData[i],
                lineStyle: {
                    type: "dotted"
                }
            };

            let confirmedLine = {
                name: i18next.t("homePage:state." + orderedStates[i]),
                type: 'line',
                smooth: true,
                sampling: 'average',
                itemStyle: {
                    color: this.stateColours[orderedStates[i]]
                },
                data: caseData[i],
                xAxisIndex: 1, yAxisIndex: 1
            };

            lineSeries.push(dottedLine);
            lineSeries.push(confirmedLine);

            i = i + 1;
        }

        this.setState({
            option: {
                grid: [
                    {
                        bottom: '53%',
                        containLabel: true,
                        left: 0,
                        right: "5%",
                        top: '12%'
                    },
                    {
                        bottom: '7%',
                        top: '60%',
                        containLabel: true,
                        left: 0,
                        right: "5%"
                    }
                ],
                title: [
                    {
                        text: i18next.t("homePage:status.testConducted"),
                        left: '5%',
                        top: '7%',
                        textStyle: {
                            fontWeight: "bold",
                            fontSize: 12
                        }
                    },
                    {
                        text: i18next.t("homePage:status.confirmCase"),
                        top: '55%',
                        left: '5%',
                        textStyle: {
                            fontWeight: "bold",
                            fontSize: 12
                        }
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
                        min: this.state.logScale ? 100 : 0
                    },
                    {
                        type: yAxisType,
                        min: this.state.logScale ? 1 : 0,
                        gridIndex: 1
                    }
                ],
                xAxis: [{
                    type: "category",
                    data: testedDates

                }, {
                    type: "category",
                    data: caseDates,
                    gridIndex: 1
                }

                ], dataZoom: [{
                    type: 'inside',
                    start: startTested,
                    end: 100,
                }, {
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
                    bottom: "46.5%",
                    left: "center"
                }, {
                    type: 'inside',
                    start: startCase,
                    end: 100,
                    xAxisIndex: 1
                }, {
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
                    left: "center",
                    xAxisIndex: 1
                }],
                series: lineSeries
                //Tested Graphs
            }
        })
    }
}

export default StateComparisonChart;

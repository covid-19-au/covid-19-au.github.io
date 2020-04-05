
import React, { useState, Suspense, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import countryData from "../data/country.json";
import echarts from "echarts"
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import stateData from "../data/state.json"

function createdCaseDates(stateData, logScale) {

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

    let dateData = []
    for (let key in stateData) {
        let arr = key.split("-");
        let date = new Date(arr[0], arr[1] - 1, arr[2]);
        if (logScale) {
            if (date.getMonth() > 1) {
                if (date.getMonth() == 2) {
                    if (date.getDate() > 20) {
                        let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                        dateData.push(labelName)
                    }
                }
                else {
                    let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                    dateData.push(labelName)
                }
            }
        }
        else {
            let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
            dateData.push(labelName)
        }
    }

    return (dateData)
}

function createTestedDates(stateData) {
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

    let dateData = []
    for (let key in stateData) {
        let arr = key.split("-");
        let date = new Date(arr[0], arr[1] - 1, arr[2]);
        if (date.getMonth() > 1) {
            if (date.getMonth() == 2) {
                if (date.getDate() >= 18) {
                    let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                    dateData.push(labelName)
                }
            }
            else {
                let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                dateData.push(labelName)
            }
        }
    }
    return (dateData)
}


function createInstances(stateData, state, logScale) {
    let instances = [];

    for (let day in stateData) {
        let arr = day.split("-");

        const cases = stateData[day]

        instances.push(
            cases[state][0]
        );
    }
    return instances;
}

function createTestedInstances(stateData, state) {
    let instances = [];

    for (let day in stateData) {
        let arr = day.split("-");
        let date = new Date(arr[0], arr[1] - 1, arr[2]);
        const cases = stateData[day]
        if (date.getMonth() > 1) {
            if (date.getMonth() == 2) {
                if (date.getDate() >= 18) {
                    instances.push(
                        cases[state][3]
                    );

                }
            }
            else if (date.getMonth() > 2) {
                instances.push(
                    cases[state][3]
                );

            }
        }


    }
    return instances;
}

/** Sorts states by their number of cases */
function sortStates(stateData) {
    // Find the most recent day with data


    let latestData = stateData[
        Object.keys(stateData)[Object.keys(stateData).length - 1]
    ];

    // Sort state by cases
    let sortable = [];
    for (let state in latestData) {
        sortable.push([state, latestData[state]]);
    }
    // let casesByState = Object.keys(latestData).map(state => [state, latestData[state][0]]).sort((a, b) => b[1] - a[1]);
    sortable.sort(function (a, b) {
        return b[1][0] - a[1][0];
    })
    return sortable.map(state => state[0]);
}

/** Breaks the data down into spline data points */
function createCaseData(stateData, states, logScale) {
    // Map each state into its series
    return states.map(state =>
        (createInstances(stateData, state, logScale)
        )
    )
}

function createTestedData(stateData, states) {
    // Map each state into its series
    return states.map(state =>
        (createTestedInstances(stateData, state)
        )
    )
}



export default function StateComparisonChart() {

    const [logScale, setLogScale] = useState(false);

    let yAxisType = "value"
    if (logScale) {
        yAxisType = "log"
    }

    let orderedStates = sortStates(stateData)
    let caseData = createCaseData(stateData, orderedStates, logScale)
    let testedData = createTestedData(stateData, orderedStates)
    let testedDates = createTestedDates(stateData)
    let caseDates = createdCaseDates(stateData, logScale)

    let testedDataDots = [[], [], [], [], [], [], [], []]
    let testedDataSolid = [[], [], [], [], [], [], [], []]

    let j = 0
    while (j < testedData.length) {
        let i = 1
        testedDataDots[j].push(testedData[j][0])
        testedDataSolid[j].push(testedData[j][0])

        while (i < testedData[j].length) {
            if (testedData[j][i] === testedData[j][i - 1]) {
                testedDataDots[j].push(testedData[j][i])
                testedDataSolid[j].push("-")
            }
            else {
                testedDataSolid[j].push(testedData[j][i])
                testedDataDots[j].push("-")
            }
            i = i + 1
        }
        j = j + 1
    }

    console.log(testedDataDots)
    console.log(testedDataSolid)


    let stateColours = {
        "NSW": "#8ccfff",
        "VIC": "#547dbf",
        "QLD": "#c27cb9",
        "WA": "#8e9191",
        "SA": "#c74c4a",
        "TAS": "#79d9b4",
        "ACT": "#edbd64",
        "NT": "#ed7d51"
    }

    //graph initial start point (2 weeks)
    let startCase = parseInt(100 - (14 / caseDates.length * 100))
    let startTested = parseInt(100 - (14 / testedDates.length * 100))
    console.log(startCase)
    console.log(caseDates.length)

    // set max Y value by rounding max data value to nearest 1000

    let maxYCase
    let maxYTested

    if (logScale) {
        maxYCase = Math.ceil((parseInt(Math.max(...caseData))) / 10000) * 10000
        maxYTested = Math.ceil((parseInt(Math.max(...testedData))) / 10000) * 10000
    }
    else {
        maxYCase = Math.ceil((parseInt(Math.max(...caseData))) / 1000) * 1000
        maxYTested = Math.ceil((parseInt(Math.max(...testedData))) / 1000) * 1000
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
            <h2>State Comparisons</h2>

            <ReactEcharts style={{ height: "550px" }} option={
                {
                    grid: [{
                        bottom: '53%',
                        containLabel: true,
                        left: 0,
                        right: "5%",
                        top: '12%'
                    }, {
                        bottom: '7%',
                        top: '60%',
                        containLabel: true,
                        left: 0,
                        right: "5%"
                    }],
                    title: [
                        {
                            text: "Tests Conducted",
                            left: '5%',
                            top: '7%',
                            textStyle: {
                                fontWeight: "bold",
                                fontSize: 12
                            }
                        },
                        {
                            text: "Confirmed Cases",
                            top: '55%',
                            left: '5%',
                            textStyle: {
                                fontWeight: "bold",
                                fontSize: 12
                            }
                        }
                    ], tooltip: {
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
                            type: "value"
                        },
                        {
                            type: yAxisType,
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
                    series: [
                        //Tested Graphs

                        {
                            name: orderedStates[0],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[0]]
                            },
                            data: testedData[0]
                        }, {
                            name: orderedStates[1],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[1]]
                            },
                            data: testedData[1]
                        }, {
                            name: orderedStates[2],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[2]]
                            },
                            data: testedData[2]
                        }, {
                            name: orderedStates[3],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[3]]
                            },
                            data: testedData[3]
                        }, {
                            name: orderedStates[4],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[4]]
                            },
                            data: testedData[4]
                        }, {
                            name: orderedStates[5],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[5]]
                            },
                            data: testedData[5]
                        }, {
                            name: orderedStates[6],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[6]]
                            },
                            data: testedData[6]
                        }, {
                            name: orderedStates[7],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[7]]
                            },
                            data: testedData[7]
                        },
                        //Confirmed Cases
                        {
                            name: orderedStates[0],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[0]]
                            },
                            data: caseData[0],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[1],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[1]]
                            },
                            data: caseData[1],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[2],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[2]]
                            },
                            data: caseData[2],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[3],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[3]]
                            },
                            data: caseData[3],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[4],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[4]]
                            },
                            data: caseData[4],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[5],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[5]]
                            },
                            data: caseData[5],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[6],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[6]]
                            },
                            data: caseData[6],
                            xAxisIndex: 1, yAxisIndex: 1
                        }, {
                            name: orderedStates[7],
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            sampling: 'average',
                            itemStyle: {
                                color: stateColours[orderedStates[7]]
                            },
                            data: caseData[7],
                            xAxisIndex: 1, yAxisIndex: 1
                        }
                    ]

                }}></ReactEcharts>
            <span className="due">
                <span className="key"><p>*Click on legend to add/remove graphs</p></span><br />
                <span className="key"><p>*Click on points for detailed data</p></span><br />
                 Log Scale Buttons
                <span className="key" style={{ marginTop: "0.5rem" }}>

                    Logarithmic Scale (Cases Only):&nbsp;
                    <ButtonGroup size="small" aria-label="small outlined button group">
                        <Button style={logScale ? activeStyles : inactiveStyles} disableElevation={true} onClick={() => setLogScale(true)}>On</Button>
                        <Button style={logScale ? inactiveStyles : activeStyles} onClick={() => setLogScale(false)}>Off</Button>
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
                        <svg className="bi bi-question-circle" width="1.1em" height="1.1em" viewBox="0 0 16 16" fill="currentColor" backgroundColor="white"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
                                clipRule="evenodd" />
                            <path
                                d="M5.25 6.033h1.32c0-.781.458-1.384 1.36-1.384.685 0 1.313.343 1.313 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.007.463h1.307v-.355c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.326 0-2.786.647-2.754 2.533zm1.562 5.516c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                        </svg>
                        <div className="dataSource"></div>
                    </a>

                </span>
            </span>
        </div>
    )
}
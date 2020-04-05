
import React, { useState, Suspense, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import countryData from "../data/country.json";
import echarts from "echarts"
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import stateData from "../data/state.json"

function createdCaseDates(stateData) {

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
        let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
        dateData.push(labelName)
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


function createInstances(stateData, state) {
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
function createCaseData(stateData, states) {
    // Map each state into its series
    return states.map(state =>
        (createInstances(stateData, state)
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


    let orderedStates = sortStates(stateData)
    let caseData = createCaseData(stateData, orderedStates)
    let testedData = createTestedData(stateData, orderedStates)
    let testedDates = createTestedDates(stateData)
    let caseDates = createdCaseDates(stateData)

    let stateColours = {
        "NSW": "#c11700",
        "VIC": "#0096a7",
        "QLD": "#ff7e5f",
        "WA": "#c100aa",
        "SA": "#58bcff",
        "TAS": "#004ac1",
        "ACT": "#8cdaaf",
        "NT": "#ba9bef"
    }

    console.log(testedData)

    return (
        <div className="card">
            <h2>State Comparisons</h2>

            <ReactEcharts style={{ height: "500px" }} option={
                {
                    grid: [{
                        bottom: '60%'
                    }, {
                        top: '60%'
                    }],
                    title: [
                        {
                            text: "",
                            left: '8%'
                        },
                        {
                            text: "Confirmed Cases",
                            top: '50%',
                            left: '8%'
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
                        left: "center",
                        top: "top",
                        itemGap: 5
                    }, yAxis: [
                        {
                            type: "value"
                        },
                        {
                            type: "value",
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

                    ],
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
        </div>
    )
}
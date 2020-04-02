import React, { useState, Suspense, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import countryData from "../data/country";
import echarts from "echarts"

export default function OverallTrend(data) {

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

    console.log(countryData)

    let dateData = []
    let confirmedData = []
    let deathData = []
    let recoveryData = []


    let today = Date.now()
    //Create array of date data for x-axis
    for (let key in countryData) {
        let arr = key.split("-");
        let date = new Date(arr[0], arr[1] - 1, arr[2]);
        let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()] + "-" + date.getFullYear().toString();
        dateData.push(labelName)
        console.log(date)
    }


    //Create arrays of case data
    for (let key in countryData) {
        confirmedData.push(countryData[key][0])
        deathData.push(countryData[key][2])
        recoveryData.push(countryData[key][1])
    }

    //graph initial start point
    let start = 100 - (14 / dateData.length * 100)
    let startPoint = parseInt(start)

    return (
        <ReactEcharts
            option={
                {
                    tooltip: {
                        trigger: 'axis',
                        position: function (pt) {
                            return [pt[0], '10%'];
                        }
                    },
                    title: {
                        left: 'center',
                        text: 'Overall Trend for COVID-19 Cases in Australia',
                    },
                    toolbox: {
                        feature: {
                            dataZoom: {
                                yAxisIndex: 'none'
                            },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dateData
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '100%'],
                        max: "dataMax"
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: 100,
                        end: 75
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
                        }
                    }],
                    series: [

                        {
                            name: 'Confirmed Cases',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            sampling: 'average',
                            itemStyle: {
                                color: "#ff603c"
                            },
                            data: confirmedData
                        }, {
                            name: 'Deaths',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            sampling: 'average',
                            itemStyle: {
                                color: "#c11700"
                            },
                            data: deathData
                        }, {
                            name: 'Recoveries',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            sampling: 'average',
                            itemStyle: {
                                color: "#00c177"
                            },
                            data: recoveryData
                        }
                    ]
                }}

        />
    )

}
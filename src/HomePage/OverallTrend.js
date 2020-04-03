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


    let dateData = []
    let confirmedData = []
    let deathData = []
    let recoveryData = []


    let today = Date.now()
    //Create array of date data for x-axis
    for (let key in countryData) {
        let arr = key.split("-");
        let date = new Date(arr[0], arr[1] - 1, arr[2]);
        let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
        dateData.push(labelName)
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

    // set max Y value
    let maxValue = parseInt(Math.max(...confirmedData))
    let maxY = Math.ceil(maxValue / 1000) * 1000

    console.log(maxY)


    return (
        <ReactEcharts style={{ height: "412px" }}
            option={
                {
                    grid: {
                        containLabel: true,
                        left: 0,
                        right: "5%"
                        , bottom: "20%"
                    },
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: "white",
                        borderColor: "#bae1ff",
                        borderWidth: "1",
                        textStyle: {
                            color: "black"
                        }
                    },
                    title: {
                        left: 'center',
                        text: 'Overall trends for COVID-19 \n cases in Australia',
                        textStyle: {
                            fontFamily:
                                "Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
                            fontSize: 20,
                            fontWeight: "normal"
                        }
                    },
                    toolbox: {
                        show: false
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dateData,
                        scale: true,
                        axisLabel: {
                            showMaxLabel: true
                        }
                    },
                    yAxis: {
                        axisLabel: {
                            show: true
                        },
                        type: 'value',
                        max: maxY,
                    },
                    legend: {
                        show: true,
                        left: "center",
                        bottom: "12%",
                        itemGap: 5
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: startPoint,
                        end: 100
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
                        bottom: "1%",
                        left: "center"
                    }],
                    series: [

                        {
                            name: 'Confirmed Cases',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
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
                            symbolSize: 8,
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
                            symbolSize: 8,
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
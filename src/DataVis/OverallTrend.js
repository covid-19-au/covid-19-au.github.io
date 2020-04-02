import React, { useState, Suspense, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import countryData from "../data/country";
import echarts from "echarts"

export default function OverallTrend(data) {



    var base = +new Date(1968, 9, 3);
    var oneDay = 24 * 3600 * 1000;
    var date = [];

    var data = [Math.random() * 300];

    for (var i = 1; i < 20000; i++) {
        var now = new Date(base += oneDay);
        date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
        data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
    }

    console.log(data)






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
        dateData.push(date)
    }

    //Create arrays of case data
    for (let key in countryData) {
        confirmedData.push(countryData[key][0])
        deathData.push(countryData[key][1])
        recoveryData.push(countryData[key][2])
    }
    console.log(confirmedData)
    console.log(deathData)
    console.log(recoveryData)

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
                        text: '大数据量面积图',
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
                        boundaryGap: [0, '100%']
                    },
                    dataZoom: [{
                        type: 'inside',
                        start: 0,
                        end: 10
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
                            name: '邮件营销',
                            type: 'line',
                            stack: '总量',
                            data: confirmedData
                        },
                        {
                            name: '联盟广告',
                            type: 'line',
                            stack: '总量',
                            data: deathData
                        },
                        {
                            name: '视频广告',
                            type: 'line',
                            stack: '总量',
                            data: recoveryData
                        },
                        {
                            name: '直接访问',
                            type: 'line',
                            stack: '总量',
                            data: [320, 332, 301, 334, 390, 330, 320]
                        },
                        {
                            name: '搜索引擎',
                            type: 'line',
                            stack: '总量',
                            data: [820, 932, 901, 934, 1290, 1330, 1320]
                        }
                    ]
                }}

        />
    )

}
import React, { useState, Suspense, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import countryData from "../data/country.json";
import echarts from "echarts"
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import stateData from "../data/state.json"
// import i18n bundle
import i18next from '../i18n';

export default function OverallTrend() {

    const [logScale, setLogScale] = useState(false);

    let yAxisType = "value"
    if (logScale) {
        yAxisType = "log"
    }

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
    let newConfirmed = []
    let newDeath = []
    //Create array of date data for x-axis

    let preConfirmed = 0
    let preDeath = 0
    for (let key in countryData) {
        let arr = key.split("-");
        let date = new Date(arr[0], arr[1] - 1, arr[2]);
        if (logScale) {
            //log graph breaks if we include data before March 1st so we exclude that data here
            if (date.getMonth() >= 2) {
                let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
                dateData.push(labelName)

                confirmedData.push(countryData[key][0])
                deathData.push(countryData[key][2])
                recoveryData.push(countryData[key][1])

                newConfirmed.push(countryData[key][0] - preConfirmed)
                newDeath.push(countryData[key][2] - preDeath)

                preConfirmed = countryData[key][0]
                preDeath = countryData[key][2]
            }
        }
        //if not log scale, we include all data
        else {
            let labelName = date.getDate().toString() + "-" + monthTrans[date.getMonth()];
            dateData.push(labelName)

            confirmedData.push(countryData[key][0])
            deathData.push(countryData[key][2])
            recoveryData.push(countryData[key][1])

            newConfirmed.push(countryData[key][0] - preConfirmed)
            newDeath.push(countryData[key][2] - preDeath)

            preConfirmed = countryData[key][0]
            preDeath = countryData[key][2]
        }

    }

    //graph initial start point (2 weeks)
    let start = 100 - (14 / dateData.length * 100)
    let startPoint = parseInt(start)

    // set max Y value by rounding max data value to nearest 1000
    let maxValue = parseInt(Math.max(...confirmedData))
    let maxY

    if (logScale) {
        maxY = Math.ceil(maxValue / 10000) * 10000
    }
    else {
        maxY = Math.ceil(maxValue / 1000) * 1000
    }

    // set max Y value for new Cases Y axis
    maxValue = parseInt(Math.max(...newConfirmed))
    let maxY2 = Math.ceil(maxValue / 100) * 100

    let y1Interval = parseInt(Math.max(...confirmedData)) / 5
    let y2Interval = parseInt(Math.max(...newConfirmed)) / 5



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
            <h2>{i18next.t("homePage:overallTrend.title")}</h2>
            <ReactEcharts style={{ height: "400px" }}
                option={
                    {
                        grid: {
                            containLabel: true,
                            left: 0,
                            right: "5%"
                            , bottom: "10%",
                            top: "20%"
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
                        toolbox: {
                            show: false
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: true,
                            data: dateData,
                            scale: true,
                            axisLabel: {
                                showMaxLabel: true
                            }
                        },
                        yAxis: [{
                            name: i18next.t("homePage:overallTrend.yaxis1"),
                            axisLabel: {
                                show: true
                            },
                            type: yAxisType,
                            max: maxY
                        }, {
                            name: i18next.t("homePage:overallTrend.yaxis2"),
                            axisLabel: {
                                show: true
                            },
                            type: 'value',
                            max: maxY2,
                            splitLine: {
                                show: false
                            }
                        }
                        ],
                        legend: {
                            show: true,
                            left: "center",
                            top: "top",
                            itemGap: 5
                        },
                        dataZoom: [{
                            type: 'inside',
                            start: 0,
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
                            bottom: "0%",
                            left: "center"
                        }],
                        series: [

                            {
                                name: i18next.t("homePage:overallTrend.series1"),
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
                                name: i18next.t("homePage:overallTrend.series2"),
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
                                name: i18next.t("homePage:overallTrend.series3"),
                                type: 'line',
                                smooth: true,
                                symbol: 'circle',
                                symbolSize: 8,
                                sampling: 'average',
                                itemStyle: {
                                    color: "#00c177"
                                },
                                data: recoveryData
                            },
                            {
                                name: i18next.t("homePage:overallTrend.series4"),
                                type: 'bar',
                                yAxisIndex: '1',
                                sampling: 'average',
                                itemStyle: {
                                    color: "#8ccfff"
                                },
                                data: newConfirmed
                            }
                        ]
                    }}

            />
            <span className="due">
                <span className="key"><p>{i18next.t("homePage:chartCommon.clickLegend")}</p></span><br />
                <span className="key"><p>{i18next.t("homePage:chartCommon.clickPoint")}</p></span><br />
                <span className="key" style={{ marginTop: "0.5rem" }}>

                {i18next.t("homePage:misc.logScale")}&nbsp;
                    <ButtonGroup size="small" aria-label="small outlined button group">
                        <Button style={logScale ? activeStyles : inactiveStyles} disableElevation={true} onClick={() => setLogScale(true)}>{i18next.t("homePage:misc.onButton")}</Button>
                        <Button style={logScale ? inactiveStyles : activeStyles} onClick={() => setLogScale(false)}>{i18next.t("homePage:misc.offButton")}</Button>
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
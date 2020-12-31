/**
This file is licensed under the MIT license

Copyright (c) 2020 David Morrissey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';

import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import MapTimeSlider from "../ConfirmedMap/MapControls/MapTimeSlider";
import cm from "../../ColorManagement/ColorManagement";


class PopulationPyramid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: '14days'
        };
        this.__mode = '14days';
    }

    render() {
        return (
            <div>
                <Paper>
                    <Tabs
                        value={this.state.mode}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={(e, newValue) => this.setMode(newValue)}
                        ref={(el) => this.visTabs = el}
                        centered
                    >
                        <Tab label="All Time" value="alltime" />
                        <Tab label="Last 14 Days" value="14days" />
                    </Tabs>
                </Paper>

                {
                    this.state.option ?
                        <ReactEchartsCore
                            theme={cm.getEChartsTheme()}
                            echarts={echarts}
                            ref={el => {
                                this.reactEChart = el
                            }}
                            option={this.state.option}
                            style={{
                                height: "50vh",
                                marginTop: '25px'
                            }}
                        /> :''
                }

                <div style={{display: this.state.mode === '14days' ? 'block' : 'none'}}>
                    <MapTimeSlider
                        ref={el => {this.mapTimeSlider = el}}
                        onChange={() => this.__onTimeSliderChange()}
                    />
                </div>
            </div>
        );
    }

    __onTimeSliderChange() {
        this.setCasesInst(
            this.__maleCasesInst,
            this.__femaleCasesInst,
            this.__regionType
        );
    }

    setMode(mode) {
        this.__mode = mode;
        this.setCasesInst(
            this.__maleCasesInst,
            this.__femaleCasesInst,
            this.__regionType
        );
    }

    setCasesInst(maleCasesInst, femaleCasesInst, regionType) {
        this.__maleCasesInst = maleCasesInst;
        this.__femaleCasesInst = femaleCasesInst;
        this.__regionType = regionType;

        if (!this.mapTimeSlider) {
            return setTimeout(
                () => this.setCasesInst(
                    maleCasesInst, femaleCasesInst, regionType
                ),
                20
            );
        }

        let maleVals = [],
            femaleVals = [],
            ageRanges = new Set();

        // First get possible age ranges
        for (let ageRange of maleCasesInst.getAgeRanges(regionType)) {
            ageRanges.add(ageRange);
        }
        if (femaleCasesInst) {
            for (let ageRange of femaleCasesInst.getAgeRanges(regionType)) {
                ageRanges.add(ageRange);
            }
        }
        ageRanges = Array.from(ageRanges).sort();

        // Now add the values
        for (let ageRange of ageRanges) {
            let appendMe = this.__mode === 'alltime' ?
                maleCasesInst.getCaseNumber(regionType, ageRange) :
                maleCasesInst.getCaseNumberOverNumDays(
                    regionType, ageRange, 14, this.mapTimeSlider.getValue()
                );
            if (appendMe) {
                maleVals.push(appendMe.getValue());
            }
        }
        if (femaleCasesInst) {
            for (let ageRange of ageRanges) {
                let appendMe = this.__mode === 'alltime' ?
                    femaleCasesInst.getCaseNumber(regionType, ageRange) :
                    femaleCasesInst.getCaseNumberOverNumDays(
                        regionType, ageRange, 14, this.mapTimeSlider.getValue()
                    );
                if (appendMe) {
                    femaleVals.push(-appendMe.getValue());
                }
            }
        }

        this.setState({
            mode: this.__mode,
            option: {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        console.log(JSON.stringify(params));
                        return (
                            `<div>Age group ${params[0].axisValueLabel}</div>` +
                            params.map(param => {

                                let value;
                                if (param.seriesName === 'Male' || param.seriesName === 'Total') {
                                    value = param.value;
                                } else if (param.seriesName === 'Female') {
                                    value = -param.value;
                                }

                                return (
                                    `<div style="border-bottom: 1px solid ${param.color}; border-left: 8px solid ${param.color}; padding-left: 3px;">` +
                                    `<span style="padding: 0; display: inline; margin: 0">` +
                                    `${param.seriesName}&nbsp;&nbsp;` +
                                    `<span style="float: right; padding: 0; display: inline; margin: 0">` +
                                    `${value}` +
                                    `</span>` +
                                    `</span>` +
                                    `</div>`
                                );
                            }).join('')
                        );
                    },
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                animationDuration: 200,
                legend: {
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: o => {
                                return Math.abs(o)
                            }
                        },
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        axisTick: {
                            show: false
                        },
                        data: ageRanges
                    }
                ],
                series: femaleVals.length ? [
                    {
                        name: 'Female',
                        type: 'bar',
                        stack: true,
                        label: {
                            show: true,
                            formatter: o => -o.value
                        },
                        data: femaleVals
                    },
                    {
                        name: 'Male',
                        type: 'bar',
                        stack: true,
                        label: {
                            show: true,
                            formatter: o => o.value
                        },
                        data: maleVals
                    },
                ] : [
                    {
                        name: 'Total',
                        type: 'bar',
                        stack: true,
                        label: {
                            show: true,
                            formatter: o => o.value
                        },
                        data: maleVals
                    }
                ]
            }
        });
    }
}

export default PopulationPyramid;



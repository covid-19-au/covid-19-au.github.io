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
import 'echarts/lib/chart/pie';

import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import MapTimeSlider from "../ConfirmedMap/MapControls/MapTimeSlider";
import {genderColorMapping} from "../../DataVis/Colors";


class GenderPieChart extends React.Component {
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
                            echarts={echarts}
                            ref={el => {
                                this.reactEChart = el
                            }}
                            option={this.state.option}
                            style={{
                                height: "22vh",
                                marginTop: "-5px",
                                marginBottom: "-10px"
                            }}
                        /> :''
                }

                <div style={{display: this.state.mode === '14days' ? 'block' : 'none', zIndex: 2}}>
                    <MapTimeSlider
                        ref={el => {this.mapTimeSlider = el}}
                        onChange={() => this.__onTimeSliderChange()}
                        extraStyles={{
                            margin: "0px 10px"
                        }}
                    />
                </div>
            </div>
        );
    }

    __onTimeSliderChange() {
        this.setCasesInst(
            this.__totalCasesInst,
            this.__maleCasesInst,
            this.__femaleCasesInst,
            this.__regionType
        );
    }

    setMode(mode) {
        this.__mode = mode;
        this.setCasesInst(
            this.__totalCasesInst,
            this.__maleCasesInst,
            this.__femaleCasesInst,
            this.__regionType
        );
    }

    setCasesInst(totalCasesInst, maleCasesInst, femaleCasesInst, regionType) {
        this.__totalCasesInst = totalCasesInst;
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

        // Now add the values
        let male = this.__mode === 'alltime' ?
            maleCasesInst.getCaseNumber(regionType, null).getValue() :
            maleCasesInst.getCaseNumberOverNumDays(
                regionType, null, 14, this.mapTimeSlider.getValue()
            ).getValue();

        let female = this.__mode === 'alltime' ?
            femaleCasesInst.getCaseNumber(regionType, null).getValue() :
            femaleCasesInst.getCaseNumberOverNumDays(
                regionType, null, 14, this.mapTimeSlider.getValue()
            ).getValue();

        let malePercent = Math.round((male/(male+female))*100),
            femalePercent = Math.round((female/(male+female))*100);

        this.setState({
            mode: this.__mode,
            option: {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    top: "15%",
                    orient: 'vertical',
                    left: 'left',
                    data: ['Female', 'Male']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,

                },
                series: [
                    {
                        name: 'Gender',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        color: [
                            genderColorMapping['Male'],
                            genderColorMapping['Female']
                        ],
                        data: [
                            {
                                value: male || 0,
                                name: 'Male',
                                label: {
                                    show: true,
                                    color: '#222',
                                    formatter: o => `Male\n${malePercent}%`
                                },
                            },
                            {
                                value: female || 0,
                                name: 'Female',
                                label: {
                                    show: true,
                                    color: '#222',
                                    formatter: o => `Female\n${femalePercent}%`
                                },
                            },
                        ],
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            }
        });
    }
}

export default GenderPieChart;

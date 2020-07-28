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
import ReactEcharts from "echarts-for-react";


class PopulationPyramid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (!this.state.option) {
            return null;
        }

        return (
            <div>
                <ReactEcharts
                    ref={el => {this.reactEChart = el}}
                    option={this.state.option}
                    style={{
                        height: "50vh",
                        marginTop: '25px'
                    }}
                />
            </div>
        );
    }

    setCasesInst(maleCasesInst, femaleCasesInst, regionType) {
        let maleVals = [],
            femaleVals = [],
            ageRanges = new Set();

        // First get possible age ranges
        for (let ageRange of maleCasesInst.getAgeRanges(regionType)) {
            ageRanges.add(ageRange);
        }
        for (let ageRange of femaleCasesInst.getAgeRanges(regionType)) {
            ageRanges.add(ageRange);
        }
        ageRanges = Array.from(ageRanges).sort();

        // Now add the values
        for (let ageRange of ageRanges) {
            maleVals.push(
                maleCasesInst.getCaseNumber(regionType, ageRange).getValue()
            );
        }

        for (let ageRange of ageRanges) {
            femaleVals.push(
                -femaleCasesInst.getCaseNumber(regionType, ageRange).getValue()
            );
        }

        this.setState({
            option: {
                tooltip: {
                    trigger: 'axis',
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
                            formatter: o => Math.abs(o)
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
                series: [
                    {
                        name: 'Female',
                        type: 'bar',
                        stack: true,
                        label: {
                            show: true,
                            formatter: o => Math.abs(o.value)
                        },
                        data: femaleVals
                    },
                    {
                        name: 'Male',
                        type: 'bar',
                        stack: true,
                        label: {
                            show: true,
                            formatter: o => Math.abs(o.value)
                        },
                        data: maleVals
                    },
                ]
            }
        });
    }
}

export default PopulationPyramid;



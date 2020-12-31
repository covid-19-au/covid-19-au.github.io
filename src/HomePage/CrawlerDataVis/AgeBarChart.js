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
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';

import {toPercentiles, getBarHandleIcon, getMaximumCombinedValue, percentilesTooltip, otherTooltip} from "./eChartsFns";
import DataPointsCollection from "../CrawlerDataTypes/DataPointsCollection";
import cm from "../../ColorManagement/ColorManagement";


/**
 * An "age distribution" filled bar chart which allows comparing regions over time.
 *
 * Only really suitable for desktop as the legend uses too much space on mobile
 */
class AgeBarChart extends React.Component {
    constructor() {
        super();
        this.state = {
            mode: 'percentiles',
            allDates: []
        };
        this.__mode = 'percentiles';
    }

    /*******************************************************************
     * HTML Rendering
     *******************************************************************/

    render() {
        if (!this.state.option) {
            return null;
        }

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
                        <Tab label="New" value="total" />
                        <Tab label="% Percentiles" value="percentiles" />
                    </Tabs>
                </Paper>

                <ReactEchartsCore
                    theme={cm.getEChartsTheme()}
                    echarts={echarts}
                    ref={el => {this.reactEChart = el}}
                    option={this.state.option}
                    style={{
                        height: "50vh",
                        marginTop: '25px'
                    }}
                />

                {this.__mode === 'percentiles' ? <div style={{color: "gray", marginTop: "10px", textAlign: "center"}}>Note: in percentiles mode, values are averaged over 7 days to reduce noise. Negative values are ignored.</div> : ''}
            </div>
        );
    }

    /*******************************************************************
     * Re-render methods
     *******************************************************************/

    setMode(mode) {
        this.__mode = mode;
        this.__updateSeriesData()
    }

    setCasesInst(casesData, regionType) {
        this.__casesData = casesData;
        this.__regionType = regionType;
        this.__updateSeriesData()
    }

    /*******************************************************************
     * Get chart data
     *******************************************************************/

    __updateSeriesData() {
        if (!this.__casesData) {
            return;
        }

        let data = {},
            series = [],
            allDates = new Set();

        for (let caseNumberTimeSeries of new DataPointsCollection(
            this.__casesData.getAgeRanges(this.__regionType).map((ageRange) => {
                return this.__casesData.getCaseNumberTimeSeries(
                    this.__regionType, ageRange
                );
            })
        )) {

            let ageRange = caseNumberTimeSeries.getAgeRange();
            data[ageRange] = [];

            if (caseNumberTimeSeries) {
                caseNumberTimeSeries = caseNumberTimeSeries.getNewValuesFromTotals();
                if (this.__mode === 'percentiles') {
                    caseNumberTimeSeries = caseNumberTimeSeries.getDayAverage(7);
                }
            } else {
                caseNumberTimeSeries = [];
            }

            caseNumberTimeSeries.sort((x, y) => {
                return x.getDateType() - y.getDateType()
            });

            for (let timeSeriesItem of caseNumberTimeSeries) {
                allDates.add(timeSeriesItem.getDateType());

                data[ageRange].push([
                    timeSeriesItem.getDateType(),
                    (timeSeriesItem.getValue() >= 0 || this.__mode !== 'percentiles') ?
                        timeSeriesItem.getValue() : 0
                ]);
            }

            series.push({
                name: ageRange,
                type: this.__mode === 'percentiles' ? 'line' : 'bar',
                areaStyle: this.__mode === 'percentiles' ? {} : null,
                stack: 'one',
                data: data[ageRange],
                symbol: 'roundRect',
                step: false,
            });
        }

        if (this.__mode === 'percentiles') {
            toPercentiles(series);
        }

        this.setState({
            mode: this.__mode,
            option: {
                legend: {

                },
                animationDuration: 200,
                tooltip: {
                    trigger: 'axis',
                    formatter: this.__mode === 'percentiles' ? percentilesTooltip : otherTooltip,
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                grid: {
                    top: 50,
                    left: '3%',
                    right: '4%',
                    bottom: 50,
                    containLabel: true
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: this.__mode === 'percentiles' ? "{value}%" : '{value}'
                    },
                    max: this.__mode === 'percentiles' ? 100 : getMaximumCombinedValue(series)
                },
                dataZoom: [
                    {
                        type: 'slider',
                        realtime: true,
                        start: allDates.size*100-28,
                        end: allDates.size*100,
                        bottom: 10,
                        height: 20,
                        handleIcon: getBarHandleIcon(),
                        handleSize: '120%'
                    },
                    {
                        type: 'inside',
                        start: allDates.size*100-28,
                        end: allDates.size*100,
                        bottom: 0,
                        height: 20
                    }
                ],
                series: series
            }
        });
    }
}

export default AgeBarChart;

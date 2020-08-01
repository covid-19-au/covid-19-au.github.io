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

import ReactEcharts from "echarts-for-react";
import {toPercentiles, getBarHandleIcon, getMaximumCombinedValue} from "../eChartsFns";


/**
 * A "regional cases" filled bar chart which allows comparing regions over time.
 *
 * Only really suitable for desktop as the legend uses too much space on mobile
 */
class RegionalCasesBarChart extends React.Component {
    constructor() {
        super();
        this.state = {
            mode: 'active'
        };
        this.__mode = 'active';
    }

    /*******************************************************************
     * HTML Rendering
     *******************************************************************/

    render() {
        // xAxis range: getLastDaysRangeOfSample(this.state.data, 21)
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
                        {this.disableTotalMode ? '' : <Tab label="Active" value="active" />}
                        {this.disableTotalMode ? '' : <Tab label="Active %" value="percentiles" />}
                        <Tab label="New" value="new" />
                    </Tabs>
                </Paper>

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

    /*******************************************************************
     * Re-render methods
     *******************************************************************/

    setMode(mode) {
        this.__mode = mode;
        this.__updateSeriesData()
    }

    setCasesInsts(casesInst, newCasesInst) {
        this.__casesInst = casesInst;
        this.__newCasesInst = newCasesInst;

        if (!casesInst) {
            this.disableTotalMode = true;
            this.__mode = 'new';
        }

        this.__updateSeriesData()
    }

    /*******************************************************************
     * Get chart data
     *******************************************************************/

    __updateSeriesData() {
        let series = [],
            allDates = new Set(),
            casesInst = this.__mode === 'new' ?
                this.__newCasesInst : this.__casesInst;

        for (let regionType of casesInst.getRegionChildren()) {
            let caseNumberTimeSeries = casesInst.getCaseNumberTimeSeries(
                regionType, null
            ) || [];
            caseNumberTimeSeries.sort((x, y) => {
                return x.getDateType().getTime()-y.getDateType().getTime()
            });

            let data = [];
            for (let timeSeriesItem of caseNumberTimeSeries) {
                data.push([
                    timeSeriesItem.getDateType(),
                    (timeSeriesItem.getValue() >= 0) ? timeSeriesItem.getValue() : 0
                ]);
                allDates.add(timeSeriesItem.getDateType());
            }

            // Only add if there are samples available for this region
            if (!data.length) {
                continue;
            }

            series.push({
                name: regionType.getLocalized(),
                type: this.__mode === 'percentiles' ? 'line' : 'bar',
                areaStyle: this.__mode === 'percentiles' ? {} : null,
                stack: 'mystack',
                data: data,
                symbol: 'roundRect',
                step: true,
            });
        }

        if (!series.length) {
            if (this.__mode === 'active' || this.__mode === 'percentiles') {
                this.disableTotalMode = true;
                this.__mode = 'new';
                return this.__updateSeriesData();
            }
        }

        // Limit to just the 6 regions with most cases
        series.sort((a, b) => a.data[0][1] - b.data[0][1])
              .reverse();
        let leftOver = series.slice(5);
        series = series.slice(0, 5);

        // Merge the other regions into a single "other" category
        let otherTotals = {},
            otherOut = [];
        for (let seriesItem of leftOver) {
            for (let [dateType, value] of seriesItem.data) {
                if (!(dateType in otherTotals)) {
                    otherTotals[dateType] = [dateType, 0]
                }
                otherTotals[dateType][1] += value;
            }
        }
        for (let k in otherTotals) {
            otherOut.push(otherTotals[k]);
        }
        series.push({
            name: 'Other',
            type: this.__mode === 'percentiles' ? 'line' : 'bar',
            areaStyle: this.__mode === 'percentiles' ? {} : null,
            stack: 'mystack',
            data: otherOut,
            symbol: 'roundRect',
            step: true,
        });

        // Sort so that highest values are on the bottom
        for (let seriesItem of series) {
            seriesItem.data.sort((a, b) => a[0].getTime() - b[0].getTime());
        }
        series.sort(
            (a, b) => b.data[b.data.length-1][1] - a.data[a.data.length-1][1]
        );

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
                    boundaryGap: false,
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

export default RegionalCasesBarChart;

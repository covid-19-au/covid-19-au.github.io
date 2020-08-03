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
import {toPercentiles, getBarHandleIcon, getMaximumCombinedValue} from "./eChartsFns";
import DataPointsCollection from "../CrawlerDataTypes/DataPointsCollection";


class MultiDataTypeBarChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'totals'
        };
        this.__mode = 'total';
    }

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

                <ReactEcharts
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
        this.__updateSeriesData();
    }

    setCasesInst(casesInsts, regionType) {
        this.__casesInsts = casesInsts;
        this.__regionType = regionType;
        this.__updateSeriesData();
    }

    /*******************************************************************
     * Get chart data
     *******************************************************************/

    __updateSeriesData() {
        let series = [],
            allDates = new Set();

        for (let caseNumberTimeSeries of new DataPointsCollection(this.__casesInsts.map((casesInst) => {
            return casesInst.getCaseNumberTimeSeries(this.__regionType, null);
        }), null)) {
            if (caseNumberTimeSeries) {
                caseNumberTimeSeries = caseNumberTimeSeries.getNewValuesFromTotals();
                if (this.__mode === 'percentiles') {
                    caseNumberTimeSeries = caseNumberTimeSeries.getDayAverage(7);
                }
            } else {
                caseNumberTimeSeries = [];
            }

            let data = [];
            for (let timeSeriesItem of caseNumberTimeSeries) {
                data.push([
                    timeSeriesItem.getDateType(),
                    (timeSeriesItem.getValue() >= 0 || this.__mode !== 'percentiles') ? timeSeriesItem.getValue() : 0
                ]);
                allDates.add(timeSeriesItem.getDateType());
            }

            // Only add if there are samples available for this region
            if (!data.length) {
                continue;
            }

            series.push({
                name: caseNumberTimeSeries.getDataType().replace('source_', '').replace('status_', '').replace(/_/, ' '),
                type: this.__mode === 'percentiles' ? 'line' : 'bar',
                areaStyle: this.__mode === 'percentiles' ? {} : null,
                stack: 'stackalltogether',
                data: data,
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

export default MultiDataTypeBarChart;

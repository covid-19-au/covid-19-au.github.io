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

import {toPercentiles, getBarHandleIcon, percentilesTooltip, otherTooltip, roundUp, roundDown} from "./eChartsFns";
import DataPointsCollection from "../CrawlerDataTypes/DataPointsCollection";
import DateType from "../CrawlerDataTypes/DateType";
import cm from "../../color_management/ColorManagement";


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
                        <Tab label={!this.__activeMode ? 'New' : 'Active'} value="total"/>
                        <Tab label="% Percentiles" value="percentiles"/>
                    </Tabs>
                </Paper>

                <ReactEchartsCore
                    theme={cm.getEChartsTheme()}
                    echarts={echarts}
                    ref={el => {this.reactEChart = el}}
                    option={this.state.option}
                    onEvents={{
                        datazoom: evt => {
                            this.__startIndex = Math.floor(evt.start*2 - 2);
                            this.__endIndex = Math.ceil(evt.end*2 - 2);
                            this.__calcMaxMinVals()
                        }
                    }}
                    style={{
                        height: "50vh",
                        marginTop: '25px'
                    }}
                />

                {this.__mode === 'percentiles' && !this.__activeMode ? <div style={{
                    color: "gray",
                    marginTop: "10px",
                    textAlign: "center"
                }}>Note: in percentiles mode, values are averaged over 7 days to reduce noise. Negative values are ignored.</div> : ''}
            </div>
        );
    }

    __calcMaxMinVals() {
        // Only update if changed!
        if (this.__prevStartIndex === this.__startIndex &&
            this.__prevEndIndex === this.__endIndex) {
            return;
        }
        this.__prevStartIndex = this.__startIndex;
        this.__prevEndIndex = this.__endIndex;

        let minVals = {},
            maxVals = {};

        let fromDate = new DateType(new Date(this.state.minDate)),
            toDate = new DateType(new Date(this.state.maxDate));

        let startIndex, endIndex;
        if ('__startIndex' in this) {
            startIndex = this.__startIndex;
            endIndex = this.__endIndex;
        } else {
            // HACK: Fill in default before vals calc'd!
            startIndex = fromDate.dateDiff(toDate)-62;
            endIndex = fromDate.dateDiff(toDate);
        }

        for (let i=startIndex; i<endIndex; i++) {
            for (let seriesItem of this.state.option.series) {
                for (let [x, y] of seriesItem.data) {
                    if (x.equalTo(fromDate.daysAdded(i))) {
                        minVals[x] = minVals[x] || 0;
                        maxVals[x] = maxVals[x] || 0;
                        if (y < 0)
                            minVals[x] += y||0;
                        if (y > 0)
                            maxVals[x] += y||0;
                    }
                }
            }
        }

        let minValue = 99999999999999,
            maxValue = -999999999999999;

        for (let x in minVals) {
            if (minVals[x] < minValue) minValue = minVals[x];
            if (maxVals[x] > maxValue) maxValue = maxVals[x];
        }

        minValue = minValue === 99999999999999 ? 0 : minValue;
        maxValue = maxValue === -999999999999999 ? 1 : maxValue;

        this.__minValue = minValue;
        this.__maxValue = maxValue;
    }

    /*******************************************************************
     * Re-render methods
     *******************************************************************/

    setMode(mode) {
        this.__mode = mode;
        this.__updateSeriesData();
    }

    setCasesInst(casesInsts, regionType, activeMode) {
        this.__casesInsts = casesInsts;
        this.__regionType = regionType;
        this.__activeMode = activeMode;
        this.__updateSeriesData();
    }

    /*******************************************************************
     * Get chart data
     *******************************************************************/

    __updateSeriesData() {
        let series = [],
            allDates = new Set();

        let collection = this.__casesInsts.map(casesInst => {
            return casesInst.getCaseNumberTimeSeries(this.__regionType, null);
        });
        if (this.__mode === 'percentiles') {
            collection = new DataPointsCollection(collection);
        }

        for (let caseNumberTimeSeries of collection) {
            if (caseNumberTimeSeries) {
                if (!this.__activeMode) {
                    caseNumberTimeSeries = caseNumberTimeSeries.getNewValuesFromTotals();
                    if (this.__mode === 'percentiles') {
                        caseNumberTimeSeries = caseNumberTimeSeries.getDayAverage(7);
                    }
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
                name: caseNumberTimeSeries.getDataType().replace('source_', '').replace('status_', '').replace(/_/, ' ').replace(/_/, ' '),
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
            activeMode: this.__activeMode,
            maxDate: Math.max.apply(Math, Array.from(allDates)),
            minDate: Math.min.apply(Math, Array.from(allDates)),
            option: {
                theme: cm.getEChartsTheme(),
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
                    /*min: this.__mode === 'percentiles' ? 0 : value => {
                        this.__calcMaxMinVals();
                        return roundDown(this.__minValue);
                    },
                    max: this.__mode === 'percentiles' ? 100 : value => {
                        this.__calcMaxMinVals();
                        return roundUp(this.__maxValue);
                    }*/
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

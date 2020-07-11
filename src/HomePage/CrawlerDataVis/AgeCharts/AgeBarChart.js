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
import Plot from 'react-plotly.js';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import getLastDaysRangeOfSample from "../getLastDaysRangeOfSample";


/**
 * An "age distribution" filled bar chart which allows comparing regions over time.
 *
 * Only really suitable for desktop as the legend uses too much space on mobile
 */
class AgeBarChart extends React.Component {
    constructor() {
        super();
        this.state = {
            mode: 'total'
        };
    }

    render() {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

        for (let iData of this.state.data||[]) {
            if (this.state.mode === 'percentiles') {
                iData['groupnorm'] = 'percent';
                delete iData['type']; // Percent doesn't work for bar graphs??
            } else {
                delete iData['groupnorm'];
                if (vw < 800) {
                    // Don't use bar graphs if screen
                    // width not enough to separate values
                    delete iData['type'];
                } else {
                    iData['type'] = 'bar';
                }
            }
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
                        <Tab label="Total" value="total" />
                        <Tab label="% Percentiles" value="percentiles" />
                    </Tabs>
                </Paper>

                <Plot
                    data={this.state.data||[]}
                    layout={{
                        autosize: true,
                        margin: {
                            l: 40,
                            r: 10,
                            b: 50,
                            t: 10,
                            pad: 0
                        },
                        barmode: 'stack',
                        legend: {
                            x: 0,
                            //xanchor: 'right',
                            y: 1.0,
                            yanchor: 'bottom',
                            orientation: 'h'
                        },
                        xaxis: {
                            showgrid: true,
                            gridcolor: '#ddd',
                            tickangle: 45,
                            range: getLastDaysRangeOfSample(this.state.data, 21)
                        },
                        yaxis: {
                            showgrid: true,
                            gridcolor: '#999'
                        },
                    }}
                    config = {{
                        displayModeBar: false,
                        responsive: true
                    }}
                    style={{
                        height: '50vh',
                        width: '100%'
                    }}
                />
            </div>
        );
    }

    setMode(mode) {
        this.setState({
            mode: mode
        });
    }

    setCasesInst(casesData, regionType) {
        let xVals = {},
            yVals = {},
            data = [];

        for (let ageRange of casesData.getAgeRanges(regionType)) {
            xVals[ageRange] = [];
            yVals[ageRange] = [];

            let caseNumberTimeSeries = casesData.getCaseNumberTimeSeries(regionType, ageRange);
            if (caseNumberTimeSeries) {
                caseNumberTimeSeries = caseNumberTimeSeries.getNewValuesFromTotals().getDayAverage(7);
            } else {
                caseNumberTimeSeries = [];
            }

            for (let timeSeriesItem of caseNumberTimeSeries) {
                xVals[ageRange].push(timeSeriesItem.getDateType());
                yVals[ageRange].push((timeSeriesItem.getValue() >= 0) ? timeSeriesItem.getValue() : 0); // NOTE ME!!! ==========
            }

            data.push({
                name: ageRange,
                stackgroup: 'one',
                x: xVals[ageRange],
                y: yVals[ageRange]
            });
        }

        this.setState({
            data: data
        });
    }
}

export default AgeBarChart;

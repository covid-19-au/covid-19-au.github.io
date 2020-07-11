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
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import getLastDaysRangeOfSample from "../getLastDaysRangeOfSample";


/**
 * A "regional cases" filled bar chart which allows comparing regions over time.
 *
 * Only really suitable for desktop as the legend uses too much space on mobile
 */
class RegionalCasesBarChart extends React.Component {
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
                            orientation: 'h',
                            font: {
                                size: 12
                            }
                        },
                        xaxis: {
                            showgrid: true,
                            gridcolor: '#ddd',
                            //tickangle: 45,
                            range: getLastDaysRangeOfSample(this.state.data, 21)
                        },
                        yaxis: {
                            showgrid: true,
                            gridcolor: '#999',
                            //autorange: 'reversed'
                        },
                    }}
                    config = {{
                        displayModeBar: false,
                        responsive: true
                    }}
                    style={{
                        width: '100%',
                        height: '50vh'
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

    setCasesInst(casesInst, numDays) {
        this.__casesInst = casesInst;

        let data = [];

        for (let regionType of casesInst.getRegionChildren()) {
            let xVals = [],
                yVals = [];

            for (let timeSeriesItem of casesInst.getCaseNumberTimeSeries(regionType, null)||[]) {
                xVals.push(timeSeriesItem.getDateType());
                yVals.push(timeSeriesItem.getValue());
            }
            if (!yVals.length) {
                continue;
            }

            data.push([
                yVals[yVals.length-1],
                {
                    name: regionType.getLocalized(),
                    type: 'bar',
                    stackgroup: 'one',
                    x: xVals,
                    y: yVals,
                    //orientation: 'h',
                    //groupnorm: 'percent'
                }
            ]);
            // iData['groupnorm'] = 'percent';
            //                 delete iData['type'];
        }
        data.sort((a, b) => a[0] - b[0]);

        this.setState({
            data: data.map(a => a[1]).reverse().slice(0, 10)
        });
    }
}

export default RegionalCasesBarChart;

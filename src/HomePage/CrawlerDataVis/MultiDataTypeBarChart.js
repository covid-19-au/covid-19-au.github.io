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


class MultiDataTypeBarChart extends React.Component {
    constructor() {
        super();
        this.state = {
            mode: 'totals'
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
                        <Tab label="Totals" value="totals" />
                        <Tab label="% Percentiles" value="percentiles" />
                    </Tabs>
                </Paper>

                <Plot
                    data={this.state.data||[]}
                    layout={{
                        autosize: true,
                        margin: {
                            l: 30,
                            r: 10,
                            b: 50,
                            t: 10,
                            pad: 0
                        },
                        barmode: 'stack',
                        showlegend: true,
                        legend: {
                            x: 0,
                            //xanchor: 'right',
                            y: 1.0,
                            yanchor: 'bottom',
                            orientation: 'h'
                        },
                        xaxis: {
                            showgrid: true,
                            gridcolor: '#999',
                            tickangle: 45
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

    setCasesInst(casesInsts, regionType) {
        let data = [];

        for (let casesInst of casesInsts) {
            let xVals = [],
                yVals = [];

            let caseNumberTimeSeries = casesInst.getCaseNumberTimeSeries(regionType, null);
            if (caseNumberTimeSeries) {
                caseNumberTimeSeries = caseNumberTimeSeries.getNewValuesFromTotals().getDayAverage(7);
            } else {
                caseNumberTimeSeries = [];
            }

            for (let timeSeriesItem of caseNumberTimeSeries) {
                xVals.push(timeSeriesItem.getDateType());
                yVals.push((timeSeriesItem.getValue() >= 0) ? timeSeriesItem.getValue() : 0); // NOTE ME!!! ==========
            }
            if (!yVals.length) {
                continue;
            }

            data.push([
                yVals[yVals.length-1],
                {
                    name: casesInst.dataType.replace('source_', '').replace('status_', '').replace(/_/, ' '),
                    type: 'bar',
                    stackgroup: 'one',
                    x: xVals,
                    y: yVals
                }
            ]);
        }
        data.sort((a, b) => a[0] - b[0]);

        this.setState({
            data: data.map(a => a[1])
        });
    }
}

export default MultiDataTypeBarChart;

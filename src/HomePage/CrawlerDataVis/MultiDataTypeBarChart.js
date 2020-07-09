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
        this.state = {};
    }

    render() {
        return (
            <div>
                <Paper>
                    <Tabs
                    value={'active'}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, newValue) => this.FIXME(newValue)}
                    ref={(el) => this.visTabs = el}
                    centered
                    >
                        <Tab label="Default" value="active" />
                        <Tab label="% Percentiles" value="alpha" />
                    </Tabs>
                </Paper>

                <Plot
                    data={this.state.data||[]}
                    layout={{
                        //width: '100%',
                        height: 500,
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
                            y: 0.95,
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
                        'font-size': '15px'
                    }}
                />
            </div>
        );
    }

    setCasesInst(casesInsts, regionType) {
        let data = [];

        for (let casesInst of casesInsts) {
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

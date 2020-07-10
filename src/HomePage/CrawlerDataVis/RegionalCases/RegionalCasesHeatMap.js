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


class RegionalCasesHeatMap extends React.Component {
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
                        <Tab label="Active" value="active" />
                        <Tab label="New" value="new" />
                    </Tabs>
                </Paper>

                <RadioGroup aria-label="gender" name="gender1" value={"numcases"} style={{ display: 'block', textAlign: 'center', marginTop: '10px' }} onChange={() => {}}>
                    <FormControlLabel value="numcases" control={<Radio />} label="Sort By # Cases" style={{ display: 'inline-block', width: '170px' }} />
                    <FormControlLabel value="alphabetical" control={<Radio />} label="Sort Alphabetically" style={{ display: 'inline-block', width: '170px' }} />
                </RadioGroup>

                <Plot
                    data={this.state.data||[]}
                    layout={{
                        height: this.state.data ? (this.state.data.length*30) : 0,
                        //width: '100%',
                        margin: {
                            r: 10,
                            b: 10,
                            t: 30,
                            pad: 0
                        },
                        showlegend: false,
                        hovermode: "closest",
                        autosize: true,
                        xaxis: {
                            side: 'top',
                            showgrid: true,
                            gridcolor: '#ddd'
                        },
                        yaxis: {
                            showgrid: true,
                            gridcolor: '#999',
                            tickangle: 45
                        }
                    }}
                    config={{
                        displayModeBar: false,
                        responsive: true
                    }}
                    style={{
                        width: '100%'
                    }}
                />
            </div>
        );
    }

    setCasesInst(casesInst, numDays) {
        this.__casesInst = casesInst;

        let data = [];
        var x = -1;

        for (let regionType of casesInst.getRegionChildren()) {
            x++;

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
                    mode: 'markers',
                    x: xVals,
                    y: xVals.map((item) => regionType.getLocalized()),
                    text: yVals,
                    hovertemplate: "%{x}: <b>%{text}</b>",
                    marker: {
                        size: yVals.map(i => Math.log(i+2)*5),
                        color: yVals.map(i => Math.log(i+2)*5),
                        symbol: "square"
                    }
                }
            ]);
        }
        data.sort((a, b) => a[0] - b[0]);

        this.setState({
            data: data.map(a => a[1])
        });
    }
}

export default RegionalCasesHeatMap;

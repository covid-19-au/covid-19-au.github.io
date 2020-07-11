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
import getLastDaysRangeOfSample from "../getLastDaysRangeOfSample";


class PopulationPyramid extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <Plot
                data={this.state.data||[]}
                layout={{
                    autosize: true,
                    margin: {
                        l: 60,
                        r: 10,
                        b: 50,
                        t: 10,
                        pad: 0
                    },
                    showlegend: true,
                    legend: {
                        x: 1.0,
                        xanchor: 'right',
                        y: 1.0,
                        yanchor: 'bottom',
                        orientation: 'h'
                    },
                    xaxis: {
                        title: {
                            text: 'Number'
                        },
                        showgrid: true,
                        gridcolor: '#999'
                    },
                    yaxis: {
                        title: {
                            text: 'Age'
                        },
                        type: 'category'
                    },
                    bargap: 0.1,
                    barmode: 'relative'
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
        );
    }

    setCasesInst(maleCasesInst, femaleCasesInst, regionType) {
        let maleXVals = [],
            maleYVals = [],
            femaleXVals = [],
            femaleYVals = [],
            data = [];

        for (let ageRange of maleCasesInst.getAgeRanges(regionType)) {
            maleYVals.push(ageRange);
            maleXVals.push(maleCasesInst.getCaseNumber(regionType, ageRange).getValue());
        }

        data.push({
            meta: {
                columnNames: {
                    x: 'Men, x',
                    y: 'Men, y; Women, y'
                }
            },
            name: 'Men',
            type: 'bar',
            x: maleXVals,
            y: maleYVals,
            marker: {
                color: 'powderblue'
            },
            text: maleXVals,
            hoverinfo: 'x',
            orientation: 'h'
        });

        if (femaleCasesInst) {
            for (let ageRange of femaleCasesInst.getAgeRanges(regionType)) {
                femaleYVals.push(ageRange);
                femaleXVals.push(femaleCasesInst.getCaseNumber(regionType, ageRange).getValue());
            }
            data.push({
                meta: {
                    columnNames: {
                        x: 'Women, x',
                        y: 'Men, y; Women, y',
                        text: 'text'
                    }
                },
                name: 'Women',
                type: 'bar',
                x: femaleXVals.map(i => -i),
                y: femaleYVals,
                marker: {
                    color: 'seagreen'
                },
                text: femaleXVals,
                hoverinfo: 'text',
                orientation: 'h'
            });
        }

        this.setState({
            data: data
        });
    }
}

export default PopulationPyramid;

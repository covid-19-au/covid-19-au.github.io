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
//import Plot from 'react-plotly.js';

// Get minimized plotly
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
const Plot = createPlotlyComponent(Plotly);


class TreeMap extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <Plot
                data={[{
                    type: 'treemap',
                    values: this.state.values||[],
                    labels: this.state.labels||[],
                    parents: this.state.parents||[],
                    marker: {colorscale: 'Blues'}
                }]}
                layout={{
                    //width: '100%',
                    height: 500,
                    margin: {
                        l: 10,
                        r: 10,
                        b: 10,
                        t: 10,
                        pad: 0
                    }
                }}
                config = {{
                    displayModeBar: false,
                    responsive: true
                }}
                style={{
                    'font-size': '15px'
                }}
            />
        );
    }

    setCasesInst(casesInst, numDays) {
        this.__casesInst = casesInst;

        let values = [],
            labels = [],
            parents = [];

        for (let regionType of casesInst.getRegionChildren()) {
            labels.push(regionType.prettified());
            if (numDays) {
                values.push(casesInst.getCaseNumberOverNumDays(regionType, null, numDays).getValue());
            } else {
                values.push(casesInst.getCaseNumber(regionType, null).getValue());
            }
            parents.push("");
        }

        this.setState({
            values: values,
            labels: labels,
            parents: parents
        });
    }
}

export default TreeMap;

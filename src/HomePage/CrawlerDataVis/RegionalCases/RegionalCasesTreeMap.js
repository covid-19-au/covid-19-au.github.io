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


/**
 * A tree map which shows boxes corresponding to current number of regional cases.
 *
 * Not currently in use - mainly experimental, may come back and try with tree map
 * hierarchies
 */
class RegionalCasesTreeMap extends React.Component {
    constructor() {
        super();
        this.state = {
            mode: 'active'
        };
    }

    render() {
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
                        <Tab label="Active" value="active" />
                        <Tab label="New" value="new" />
                        <Tab label="Total" value="total" />
                    </Tabs>
                </Paper>

                <Plot
                    data={[{
                        type: 'treemap',
                        textinfo: "label+value+percent parent+percent",
                        values: this.state.values||[],
                        labels: this.state.labels||[],
                        parents: this.state.parents||[],
                        //marker: {colorscale: 'Blues'}
                    }]}
                    layout={{
                        autosize: true,
                        margin: {
                            l: 10,
                            r: 10,
                            b: 10,
                            t: 0,
                            pad: 0
                        },
                        font: {
                            size: 16
                        }
                    }}
                    config={{
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

    setCasesInst(casesInst, numDays) {
        this.__casesInst = casesInst;

        let values = [],
            labels = [],
            parents = [];

        for (let regionType of casesInst.getRegionChildren()) {
            let timeSeriesItem;
            labels.push(regionType.getLocalized());

            if (numDays) {
                timeSeriesItem = casesInst.getCaseNumberOverNumDays(regionType, null, numDays)
            } else {
                timeSeriesItem = casesInst.getCaseNumber(regionType, null);
            }

            if (timeSeriesItem) {
                values.push(timeSeriesItem.getValue());
                parents.push("");
            }
        }

        this.setState({
            values: values,
            labels: labels,
            parents: parents
        });
    }
}

export default RegionalCasesTreeMap;

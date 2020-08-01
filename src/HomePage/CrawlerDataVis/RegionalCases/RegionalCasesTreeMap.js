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

import RegionType from "../../CrawlerDataTypes/RegionType";


/**
 * A tree map which shows boxes corresponding to current number of regional cases.
 *
 * Not currently in use - mainly experimental, may come back and try with tree map
 * hierarchies
 */
class RegionalCasesTreeMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'active'
        };
        this.__mode = 'active';
    }

    /*******************************************************************
     * HTML Rendering
     *******************************************************************/

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
                        {this.disableActiveMode ? '' : <Tab label="Active" value="active" />}
                        {this.disableNewMode ? '' : <Tab label="New" value="new" />}
                        <Tab label="Total" value="total" />
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
            </div>
        );
    }

    /*******************************************************************
     * Re-render methods
     *******************************************************************/

    setMode(mode) {
        this.__mode = mode;
        this.__updateData();
    }

    setCasesInst(activeCasesInst, newCasesInst, totalCasesInst) {
        this.__activeCasesInst = activeCasesInst;
        this.__newCasesInst = newCasesInst;
        this.__totalCasesInst = totalCasesInst;

        this.__updateData();
    }

    /*******************************************************************
     * Get chart data
     *******************************************************************/

    __updateData() {
        let numDays = 0,
            casesInst;

        if (this.__mode === 'active' && this.__activeCasesInst) {
            casesInst = this.__activeCasesInst;
        } else if (this.__mode === 'active') {
            // Emulate active with 21 day difference if active data not available
            casesInst = this.__totalCasesInst;
            numDays = 21;
        } else if (this.__mode === 'new') {
            casesInst = this.__newCasesInst;
        } else if (this.__mode === 'total') {
            casesInst = this.__totalCasesInst;
        } else {
            throw "Shouldn't get here";
        }

        let data = [],
            foundNonZero = false;
        for (let regionType of casesInst.getRegionChildren()) {
            let timeSeriesItem;

            if (numDays) {
                timeSeriesItem = casesInst.getCaseNumberOverNumDays(regionType, null, numDays)
            } else {
                timeSeriesItem = casesInst.getCaseNumber(regionType, null);
            }

            if (timeSeriesItem) {
                if (timeSeriesItem.getValue() > 0) {
                    foundNonZero = true;
                }
                data.push({
                    name: regionType.getLocalized(),
                    value: timeSeriesItem.getValue(),
                    children: []
                });
            }
        }

        if (!data.length || !foundNonZero) {
            if (this.__mode === 'active') {
                this.disableActiveMode = true;
                this.__mode = 'new';
                return this.__updateData();
            } else if (this.__mode === 'new') {
                this.disableNewMode = true;
                this.__mode = 'total';
                return this.__updateData();
            }
        }

        this.setState({
            mode: this.__mode,
            option: {
                series: [{
                    name: new RegionType(
                        'admin_1',
                        casesInst.getRegionParent().split('-')[0],
                        casesInst.getRegionParent()
                    ).getLocalized(),
                    animationDuration: 100,
                    type: 'treemap',
                    data: data
                }]
            }
        });
    }
}

export default RegionalCasesTreeMap;

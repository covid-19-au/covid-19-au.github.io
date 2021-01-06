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
import 'echarts/lib/chart/treemap';

import RegionType from "../CrawlerDataTypes/RegionType";
import MapTimeSlider from "../ConfirmedMap/MapControls/MapTimeSlider";
import DateType from "../CrawlerDataTypes/DateType";
import cm from "../../color_management/ColorManagement";


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

                <ReactEchartsCore
                    theme={cm.getEChartsTheme()}
                    echarts={echarts}
                    ref={el => {this.reactEChart = el}}
                    option={this.state.option}
                    style={{
                        height: "65vh",
                        maxHeight: "570px",
                        marginTop: '25px'
                    }}
                />

                <MapTimeSlider
                    onChange={(newValue) => this.__onTimeSliderChange(newValue)}
                />
            </div>
        );
    }

    /**
     *
     * @param newDateType
     * @private
     */
    __onTimeSliderChange(newDateType) {
        this.__dateType = newDateType;
        this.__updateData();
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
                timeSeriesItem = casesInst.getCaseNumberOverNumDays(
                    regionType, null, numDays, this.__dateType
                )
            } else {
                timeSeriesItem = casesInst.getCaseNumber(
                    regionType, null, this.__dateType
                );
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

        if ((!data.length || !foundNonZero) &&
            (!this.__dateType || this.__dateType.equalTo(DateType.today()))) {

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

        // Add percentiles
        let total = 0;
        for (let iData of data) {
            total += iData.value||0;
        }
        for (let iData of data) {
            iData.value = [iData.value, Math.round(iData.value/total*100.0)];
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
                    type: 'treemap',
                    data: data,
                    label: {
                        normal: {
                            position: 'insideTopLeft',
                            formatter: function (params) {
                                return [
                                    '{name|' + params.name + '}',
                                    '{hr|}',
                                    '{cases|' + params.value[0] + '}',
                                    '{percent|' + params.value[1] + '%}'
                                ].join('\n');
                            },
                            rich: {
                                name: {
                                    fontSize: 13,
                                    color: 'white'
                                },
                                cases: {
                                    fontSize: 14,
                                    lineHeight: 14,
                                    color: '#efefef'
                                },
                                percent: {
                                    fontSize: 14,
                                    lineHeight: 14,
                                    color: '#efefef'
                                },
                                hr: {
                                    width: '100%',
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    borderWidth: 0.5,
                                    height: 0,
                                    lineHeight: 10
                                }
                            }
                        },
                    },

                }]
            }
        });
    }
}

export default RegionalCasesTreeMap;

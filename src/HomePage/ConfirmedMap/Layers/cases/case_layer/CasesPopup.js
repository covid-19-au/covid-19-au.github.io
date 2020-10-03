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

import mapboxgl from "mapbox-gl/dist/mapbox-gl";
import RegionType from "../../../../CrawlerDataTypes/RegionType";
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';

import React from "react";
import ReactDOM from "react-dom";
import Fns from "../../../Fns";


class CasesPopup {
    /**
     * A popup window shown when clicking on cases
     *
     * Also shows basic information about the underlay
     * (if there's one selected)
     *
     * @param map a MapBox GL instance
     * @param useID the MapBox GL source layer ID
     * @param mapBoxSource the MapBoxSource/ClusteredCaseSource instance
     */
    constructor(map, useID, mapBoxSource) {
        // FIXME!
        this.map = map;
        this.mapBoxSource = mapBoxSource;
        this.useID = useID;

        this._onClick = this._onClick.bind(this);
        this._onMouseEnter = this._onMouseEnter.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);

        //this.enablePopups();
    }

    /*******************************************************************
     * Map popups
     *******************************************************************/

    /**
     * Create the popup events
     */
    enablePopups() {
        this.disablePopups();
        const map = this.map;
        map.on('click', this.useID, this._onClick);
        map.on('mouseenter', this.useID, this._onMouseEnter);
        map.on('mouseleave', this.useID, this._onMouseLeave);
        this.__popupsEnabled = true;
    }

    /**
     * Remove the popup events
     */
    disablePopups() {
        if (!this.__popupsEnabled) {
            return;
        } else if (!this.useID) {
            throw "useID invalid!"
        }

        this.map.off('click', this.useID, this._onClick);
        this.map.off('mouseenter', this.useID, this._onMouseEnter);
        this.map.off('mouseleave', this.useID, this._onMouseLeave);

        if (this.__popup) {
            this.__popup.remove();
            this.__popup = null;
        }
        this.__currentFeature = null;
        this.__popupsEnabled = false;
    }

    /*******************************************************************
     * Map events
     *******************************************************************/

    /**
     * Called when clicking cases layers
     *
     * @param e the MapBox event object
     * @private
     */
    _onClick(e) {
        if (!e.features.length) {
            if (this.__popup) {
                this.__popup.remove();
            }
            this.__currentFeature = null;
            return;
        }
        else if (e.features[0] === this.__currentFeature) {
            return;
        }
        let feature = this.__currentFeature = e.features[0];

        if (this.__popup) {
            this.__popup.remove();
        }

        // Get info about the region
        let regionType = new RegionType(
            feature.properties['regionSchema'],
            feature.properties['regionParent'],
            feature.properties['regionChild']
        );

        // Get the most recent case number and case time series
        let caseDataInst = this.mapBoxSource.getCaseDataInst(
                regionType.getRegionSchema(), regionType.getRegionParent()
            ),
            caseInfo = caseDataInst.getCaseNumber(regionType, null);

        if (!caseInfo) {
            // no data?
            return;
        }

        // Show the popup
        this.__showPopup(e.lngLat, regionType, caseInfo, caseDataInst);
    }

    /**
     * Called when entering cases layers
     *
     * @private
     */
    _onMouseEnter() {
        this.map.getCanvas().style.cursor = 'pointer';
    }

    /**
     * Called when leaving cases layers
     *
     * @private
     */
    _onMouseLeave() {
        // Change it back to a pointer when it leaves.
        this.map.getCanvas().style.cursor = '';
    }

    /*******************************************************************
     * Show popup
     *******************************************************************/

    /**
     * Show a popup for real
     *
     * @param lngLat a MapBox Longitude/Latitude instance
     * @param regionType a RegionType instance for cases
     * @param caseInfo the latest case info data
     * @param caseDataInst CaseData or CasesWithManualAUStateData instance
     * @private
     */
    __showPopup(lngLat, regionType, caseInfo, caseDataInst) {
        let popup = this.__popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        let regionLabel = regionType.prettified(),
            regionChild = regionType.getRegionChild(),
            regionSchema = regionType.getRegionSchema();

        popup.setHTML(
            `<div>` +
                `${regionLabel} (${regionSchema}${regionChild !== regionLabel ? ' '+regionChild : ''})` +
                '<br/>Cases: ' + caseInfo.getValue() +
                '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo.getDateType().prettified() +
                '<div id="chartContainer" style="width: 200px; min-height: 60px; height: 15vh"></div>' +
            `</div>`
        );

        popup.setLngLat(lngLat);
        popup.addTo(this.map);

        let series = [];
        for (let sourceId of caseDataInst.getSourceIds()) {
            let timeSeries = caseDataInst.getCaseNumberTimeSeries(regionType, null, null, sourceId);
            if (timeSeries) {
                series.push({
                    name: sourceId.replace(/_/g, ' '),
                    animation: false,
                    data: timeSeries,
                    type: 'line',
                    symbol: 'none',
                });
            }

            if (sourceId === 'manual_state_data' && timeSeries) {
                // HACK: Only show manual data if it's available!
                // JHU/Bing data is often quite low quality for state-level AU/NZ/Canada etc data, so it may be a good idea to extend this!
                break;
            }
        }

        // only display the legend if there's
        // more than a single source available
        let legend;
        if (series.length > 1) {
            legend = {
                legend: {
                    show: true,
                    top: 15
                }
            };
        } else {
            legend = {};
        }

        ReactDOM.render(
            <ReactEchartsCore
                echarts={echarts}
                ref={el => {this.reactEChart = el}}
                option={{
                    xAxis: {
                        type: 'time',
                        axisLabel: {
                            formatter: function(value) {
                                value = new Date(value);
                                return value.getDate() + "/" +(value.getMonth()+1);
                            }
                        }
                    },
                    ...legend,
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            formatter: function(value) {
                                let compact = Fns.getCompactNumberRepresentation(value, 1);
                                if (compact.indexOf('.0') !== -1) {
                                    return Fns.getCompactNumberRepresentation(value, 0);
                                } else {
                                    return compact;
                                }
                            },
                            show: true
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            //type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    grid: {
                        left: 40,
                        top: 15,
                        right: 8,
                        bottom: 20
                    },
                    series: series
                }}
                style={{
                    //width: "200px",
                    minHeight: "60px",
                    height: "15vh"
                }}
            />,
            document.getElementById('chartContainer')
        );
        document.getElementById('chartContainer').id = '';
    }
}

export default CasesPopup;

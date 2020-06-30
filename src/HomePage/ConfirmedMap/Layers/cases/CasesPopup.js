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

import mapboxgl from "mapbox-gl";
import CanvasJS from "../../../../assets/canvasjs.min";
import RegionType from "../../../CrawlerDataTypes/RegionType";


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
            caseInfo = caseDataInst.getCaseNumber(regionType, null),
            timeSeries = caseDataInst.getCaseNumberTimeSeries(regionType, null);

        if (!caseInfo || !timeSeries) {
            // no data?
            return;
        }

        // Show the popup
        this.__showPopup(e.lngLat, regionType, caseInfo, timeSeries);
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
     * @param timeSeries case info time series
     * @private
     */
    __showPopup(lngLat, regionType, caseInfo, timeSeries) {
        let popup = this.__popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true
        });
        let regionLabel = regionType.prettified(),
            regionChild = regionType.getRegionChild(),
            regionSchema = regionType.getRegionSchema();

        popup.setHTML(
            `${regionLabel} (${regionSchema}${regionChild !== regionLabel ? ' '+regionChild : ''})` +
            '<br/>Cases: ' + caseInfo.getValue() +
            '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo.getDateType().prettified() +
            '<div id="chartContainer" style="width: 200px; min-height: 60px; height: 13vh;"></div>'
        );

        popup.setLngLat(lngLat);
        popup.addTo(this.map);

        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: false,
            //animationDuration: 200,
            theme: "light2",
            axisX: {
                valueFormatString: "D/M",
                gridThickness: 1
            },
            data: [{
                type: "line",
                dataPoints: timeSeries.getCanvasJSData()
            }]
        });
        chart.render();

        document.getElementById('chartContainer').id = '';
    }
}

export default CasesPopup;

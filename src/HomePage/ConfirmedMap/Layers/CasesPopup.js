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
import CanvasJS from "../../../assets/canvasjs.min";
import RegionType from "../../CrawlerDataTypes/RegionType";
import DateType from "../../CrawlerDataTypes/DateType";


class CasesPopup {
    /**
     * A popup window shown when clicking on cases
     *
     * Also shows basic information about the underlay
     * (if there's one selected)
     *
     * @param map a MapBox GL instance
     * @param useID the MapBox GL source layer ID
     */
    constructor(map, useID) {
        // FIXME!
        this.map = map;
        this.useID = useID;
        this.enablePopups();
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
        var popup;
        var currentFeature = null;

        var click = (e) => {

        };
        map.on('click', this.useID, this._click);

        map.on('mouseenter', this.useID, this._mouseEnter);

        // Change it back to a pointer when it leaves.
        var mouseLeave = () => {

        };
        map.on('mouseleave', this.useID, this._mouseLeave);
    }

    /**
     * Remove the popup events
     */
    disablePopups() {
        this.map.off('click', this.useID, click);
        this.map.off('mouseenter', this.useID, mouseEnter);
        this.map.off('mouseleave', this.useID, mouseLeave);

        if (this.__popup) {
            this.__popup.remove();
            this.__popup = null;
        }
        this.__currentFeature = null;
    }

    /*******************************************************************
     * Map events
     *******************************************************************/

    _onClick(e) {
        if (!e.features.length) {
            if (popup) {
                popup.remove();
            }
            currentFeature = null;
            return;
        }
        else if (e.features[0] == currentFeature) {
            return;
        }
        currentFeature = e.features[0];

        if (popup) {
            popup.remove();
        }

        var cityName = e.features[0].properties.city,
            cityLabel = e.features[0].properties.cityLabel;
        var caseInfo = this.caseDataSource.getCaseNumber(cityName, null);

        if (!caseInfo || caseInfo['numCases'] == null || caseInfo['updatedDate'] == null) {
            // no data?
            return;
        }

        var absInfo;
        let underlayDataSource = this.__getUnderlayDataSource(FIXME);
        if (underlayDataSource) {
            // TODO: Store on mouseover, so as to allow combining different schemas?
            absInfo = underlayDataSource.getOnOrBeforeDate(
                new RegionType(FIXME),
                DateType.today()
            );
        }

        let caseDataSource = this.__getCaseDataSource(FIXME); // TODO: MANY METHODS+ATTRIBUTES HAVE CHANGED!!! ===========

        var timeSeries = caseDataSource.getCaseNumberTimeSeries(
            new RegionType(FIXME),
            null
        );

        popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true
        })
            .setLngLat(e.lngLat)
            .setHTML(
                `${cityLabel} (${caseDataSource.regionSchema}${cityName !== cityLabel ? ' '+cityName : ''})` +
                '<br/>Cases: ' + caseInfo['numCases'] +
                '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo['updatedDate'] +
                (absInfo ? ('<br>ABS Underlay: '+this._getUnderlayValue(underlayDataSource, absInfo['numCases'], true)) : '') +
                '<div id="chartContainer" ' +
                'style="width: 200px; min-height: 60px; height: 13vh;"></div>'
            )
            .addTo(map);

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
                dataPoints: timeSeries
            }]
        });
        chart.render();

        document.getElementById('chartContainer').id = '';
    }

    _onMouseEnter() {
        map.getCanvas().style.cursor = 'pointer';
    }

    _onMouseLeave() {
        map.getCanvas().style.cursor = '';
    }
}

export default CasesPopup;

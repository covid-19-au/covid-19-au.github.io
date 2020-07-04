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

import CasesPopup from "./CasesPopup";
import getMapBoxCaseColors from "./getMapBoxCaseColors";


class CasesFillPolyLayer {
    /**
     * A transparent fill poly layer for
     * cases to allow for popup on click events
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique ID for the MapBox GL layer
     * @param mapBoxSource a MapBoxSource instance
     */
    constructor(map, uniqueId, mapBoxSource) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.mapBoxSource = mapBoxSource;

        this.__casesPopup = new CasesPopup(map, this.uniqueId + 'fillpoly', this.mapBoxSource);
        this.__addLayer();
    }

    __addLayer() {
        // Add the colored fill area
        const map = this.map;

        // Make it so that symbol/circle layers are given different priorities
        // This is a temporary fix to make ACT display in the correct priority -
        // see also LayerHeatMap.js for an explanation.
        var lastFillLayer;
        var layers = map.getStyle().layers;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'fill' && layers[i].id.indexOf('fillpoly') !== -1) {
                lastFillLayer = layers[i].id;
            }
        }

        map.addLayer(
            {
                id: this.uniqueId+'fillpoly',
                type: 'fill',
                source: this.mapBoxSource.getSourceId()
            },
            lastFillLayer
        );

        this.__casesPopup.enablePopups();
    }

    /*******************************************************************
     * Fill poly
     *******************************************************************/

    /**
     * Add the (transparent) fill poly layer for
     * cases to allow for popup on click events
     */
    updateLayer() {
        let colors = [
            'rgba(0,80,0,0.8)',
            'rgba(0,0,80,0.0)',
            'rgba(231,50,16,0.05)',
            'rgba(231,50,16,0.1)',
            'rgba(231,50,16,0.2)',
            'rgba(231,50,16,0.4)',
            'rgba(231,50,16,0.8)',
            '#e73210'
        ];

        let caseVals = this.mapBoxSource.getPointsAllVals(),
            circleColor = getMapBoxCaseColors(caseVals, colors);

        this.map.setPaintProperty(
            this.uniqueId + 'fillpoly', 'fill-opacity', 0.3
        );
        this.map.setPaintProperty(
            this.uniqueId + 'fillpoly', 'fill-color', circleColor
        );

        /*if (this.__shown) {
            this.__casesPopup.disablePopups();
        }

        //this.__casesPopup = new CasesPopup(map, this.uniqueId + 'fillpoly', this.mapBoxSource);
        let callLater = () => {
            // HACK: Only enable after the map is ready, as it seems exceptions occur in mapbox otherwise
            if (this.map.loaded()) {
                this.__casesPopup.enablePopups();
            }
            else {
                setTimeout(callLater, 150);
            }
        };
        callLater();*/

        this.__shown = true;
    }

    /**
     * Remove the fill poly layer
     */
    removeLayer() {
        if (this.__shown) {
            this.__casesPopup.disablePopups();

            const map = this.map;
            map.removeLayer(this.uniqueId + 'fillpoly');

            /*if (this.__casesPopup) {
                this.__casesPopup.disablePopups();
                this.__casesPopup = null;
            }*/
            this.__shown = false;
        }
    }
}

export default CasesFillPolyLayer;

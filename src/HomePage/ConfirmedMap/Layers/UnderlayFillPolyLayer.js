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

import UnderlayLegend from "./UnderlayLegend"


class UnderlayFillPolyLayer {
    /**
     * A filled color polygon layer for use with
     * underlay data, such as ABS statistics
     *
     * @param map a MapBox GL instance
     * @param opacity a floating point number 0.0 to 1.0
     * @param uniqueId a unique identifier for the MapBox layer
     */
    constructor(map, opacity, uniqueId) {
        this.map = map;
        this.opacity = opacity;
        this.uniqueId = uniqueId;
        this.addLayer();
    }

    /**
     * TODO!!!
     * @param maxMinStatVal
     */
    setMaxMinStatVal(maxMinStatVal) {
        this.__maxMinStatVal = maxMinStatVal;
    }

    /**
     *
     * @param underlayData
     */
    setUnderlayData(underlayData) {
        this.__underlayData = underlayData;
    }

    /**
     *
     * @returns {string}
     */
    getFillPolyId() {
        return this.uniqueId+'fillpoly';
    }

    /*******************************************************************
     * Fill poly
     *******************************************************************/

    /**
     * Add the colored underlay fill layer
     */
    addLayer() {
        // Remove any existing legends etc
        this.removeLayer();

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
                id: this.getFillPolyId(),
                type: 'fill',
                source: this.underlayMapBoxSource.getSourceId(),
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'stat'],
                        ...this.__underlayLegend.getLabelsColors()
                    ],
                    'fill-opacity': this.opacity
                }
            },
            lastFillLayer
        );

        // Add legend/popup event as specified
        if (this.addLegend && this.absDataSource) {
            //let isPercent = this.dataSource.getSourceName().indexOf('(%)') !== -1;
            this.__underlayLegend = new UnderlayLegend(
                map, isPercent, this.__maxMinStatVal
            );
        }
    }

    /**
     * Remove the colored underlay fill layer
     */
    removeLayer() {
        const map = this.map;
        map.removeLayer(this.getFillPolyId());

        if (this.__underlayLegend) {
            this.__underlayLegend.FIXME();
        }
    }
}

export default UnderlayFillPolyLayer;

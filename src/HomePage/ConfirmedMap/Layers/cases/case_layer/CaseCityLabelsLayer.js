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
import getMapBoxCaseColors from "../getMapBoxCaseColors";


class CaseCityLabelsLayer {
    constructor(map, uniqueId, clusteredCaseSources) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;
    }

    __addLayer() {
        if (this.__layerAdded) {
            return;
        }
        this.__addCityLabel(false);
        // Need to add after the rectangle source has been
        // created to make sure it's directly underneath it!
        this.__addCityLabel(true);
        this.__layerAdded = true;
    }

    __addCityLabel(underneath) {
        let layerId = this.uniqueId + 'citylabel' + (underneath ? 'un' : '');
        this.map.addLayer(
            {
                'id': layerId,
                'type': 'symbol',
                'maxzoom': 14,
                'source': this.clusteredCaseSources.getSourceId(),
                'filter': ['all',
                    //['!=', 'cases', 0],
                    ['has', 'cases']
                ],
                'layout': {
                    'text-field': [
                        'format',
                        ['get', 'label'],
                        {'font-scale': 0.7},
                    ],
                    'text-transform': 'lowercase',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.75],
                    'text-anchor': 'top',
                    'text-allow-overlap': underneath,
                    'symbol-sort-key': ["get", "cases"]
                },
                'paint': {
                    'text-halo-width': 1,
                    'text-halo-blur': 2,
                    //"text-opacity-transition": {duration: FADE_TRANSITION_DURATION},
                }
            },
            underneath ? (this.uniqueId+'rectangle') : null
        );
        //this.hoverStateHelper.associateLayerId(layerId);
    }

    updateLayer(caseVals) {
        if (!this.__layerAdded) {
            this.__addLayer();
        }

        caseVals = caseVals||this.clusteredCaseSources.getPointsAllVals();
        this.__caseVals = caseVals;

        let startOpacity;
        if (caseVals.length < 40) {
            startOpacity = 1.0;
        } else if (caseVals.length < 70) {
            startOpacity = 0.8;
        } else if (caseVals.length < 100) {
            startOpacity = 0.6;
        } else {
            startOpacity = 0.4;
        }

        let textColor = getMapBoxCaseColors(
                [187,122,121, 1.0], [182, 14, 28, 1.0],
                'rgba(0, 0, 0, 0.0)', 'rgb(169,0,15)',
                [115,140,111, 1.0], [46,110,15, 1.0],
                caseVals, [0.0, 0.25, 0.5, 0.75, 0.80, 0.85, 0.90, 0.95, 0.99999], 1
            ),
            textHaloColor = getMapBoxCaseColors(
                [255, 255, 255, startOpacity], [255, 255, 255, 1.0],
                'rgba(0, 0, 0, 0.0)', 'rgb(255, 255, 255)',
                [255, 255, 255, startOpacity], [255, 255, 255, 1.0],
                caseVals, [0.0, 0.25, 0.5, 0.75, 0.80, 0.85, 0.90, 0.95, 0.99999], 1
            ),
            hoverRectangleColor = "rgba(150, 10, 6, 0.9)";

        this.map.setPaintProperty(
            this.uniqueId+'citylabel', 'text-color', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                hoverRectangleColor,
                textColor
            ]
        );
        this.map.setPaintProperty(
            this.uniqueId+'citylabelun', 'text-color', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                hoverRectangleColor,
                textColor
            ]
        );
        this.map.setPaintProperty(
            this.uniqueId+'citylabel', 'text-halo-color', textHaloColor
        );
        this.map.setPaintProperty(
            this.uniqueId+'citylabelun', 'text-halo-color', textHaloColor
        );

        this.__shown = true;
    }

    fadeIn() {
        this.map.setPaintProperty(this.uniqueId + 'citylabel', 'text-opacity', 1.0);
        this.map.setPaintProperty(this.uniqueId + 'citylabelun', 'text-opacity', 1.0);
    }

    fadeOut() {
        this.map.setPaintProperty(this.uniqueId + 'citylabel', 'text-opacity', 0);
        this.map.setPaintProperty(this.uniqueId + 'citylabelun', 'text-opacity', 0);
    }

    removeLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId + 'citylabel');
            map.removeLayer(this.uniqueId + 'citylabelun');
            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default CaseCityLabelsLayer;

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

import getMapBoxCaseColors from "./getMapBoxCaseColors";


class CaseCirclesLayer {
    /**
     * MapBox GL layers which show case numbers in red circles
     *
     * Also has a layer showing the region labels underneath
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique id for the MapBox GL layer
     * @param clusteredCaseSources
     */
    constructor(map, uniqueId, clusteredCaseSources) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;
    }

    __addLayer() {
        let map = this.map;

        // Make it so that symbol/circle layers are given different priorities
        // This is essentially a hack to make it so Canberra is situated above
        // NSW lines, but under NSW cases which are larger in number.
        // Ideally, all the layers for all the schemas should be combined,
        // so as to be able to combine ACT+NSW cases at different zooms
        var lastSymbolLayer,
            lastCircleLayer;

        var layers = map.getStyle().layers;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                lastSymbolLayer = layers[i].id;
            }
            else if (layers[i].type === 'circle') {
                lastCircleLayer = layers[i].id;
            }
            else if (layers[i].type === 'fill' || layers[i].type === 'line') {
                lastSymbolLayer = lastCircleLayer = null;
            }
        }

        map.addLayer(
            {
                'id': this.uniqueId,
                'type': 'circle',
                'source': this.clusteredCaseSources.getSourceId(),
                filter: ['all',
                    ['!=', 'cases', 0],
                    ['has', 'cases']
                ]
            }, lastCircleLayer
        );

        map.addLayer({
            'id': this.uniqueId+'citylabel',
            'type': 'symbol',
            'source': this.clusteredCaseSources.getSourceId(),
            'filter': ['all',
                ['!=', 'cases', 0],
                ['has', 'cases']
            ],
            'layout': {
                'text-field': [
                    'format',
                    ['get', 'label'],
                    { 'font-scale': 0.7 },
                ],
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 0.8],
                'text-anchor': 'top',
                //'text-allow-overlap': true,
                'symbol-sort-key': ['get', 'negcases']
            },
            'paint': {
                'text-color': 'rgba(0, 0, 0, 0.8)',
                'text-halo-color': 'rgba(255, 255, 255, 0.8)',
                'text-halo-width': 3,
                'text-halo-blur': 2
            }
        }, lastSymbolLayer);

        map.addLayer({
            id: this.uniqueId+'label',
            type: 'symbol',
            source: this.clusteredCaseSources.getSourceId(),
            filter: ['all',
                ['!=', 'cases', 0],
                ['has', 'cases']
            ],
            layout: {
                'text-field': '{casesFmt}',
                'text-font': [
                    'Arial Unicode MS Bold',
                    'Open Sans Bold',
                    'DIN Offc Pro Medium'
                ],
                'text-size': 13,
                'text-allow-overlap': true,
                'symbol-sort-key': ["to-number", ["get", "cases"], 1]
            },
            paint: {
                "text-color": "rgba(255, 255, 255, 1.0)"
            }
        }, lastSymbolLayer);

        this.__layerAdded = true;
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    /**
     * Add the case circles layer
     *
     * @param caseVals
     */
    updateLayer() {
        if (!this.__layerAdded) {
            this.__addLayer();
        }

        /*let colors = [
            'rgba(0,80,0,0.8)',
            'rgba(0,0,80,0.0)',
            '#ff9f85',
            '#ff9f85',
            '#ff5c30',
            '#ff4817',
            '#e73210',
            '#e73210'
        ];*/
        let map = this.map,
            caseVals = this.clusteredCaseSources.getPointsAllVals(),
            circleColor = getMapBoxCaseColors(
                [255, 222, 207, 0.5], [231, 50, 16, 1.0],
                'rgba(0, 0, 0, 0.0)',
                [0,80,0,1.0], [0,80,0,0.4],
                caseVals, [0.0, 0.25, 0.5, 0.75, 0.80, 0.85, 0.90, 0.95, 1.0], 20
            );

        let circleRadius;
        if (this.clusteredCaseSources.clusteringBeingUsed()) {
            circleRadius = [
                'interpolate',
                ['linear'],
                ['get', 'casesSz'],
                -4, 20,
                -3, 14,
                -2, 10,
                -1, 9,
                0, 0,
                1, 9,
                2, 13,
                3, 16,
                4, 20
            ];
        } else {
            // Scale circle radius by relative values
            let posTimes = 1.0,
                negTimes = 1.0,
                lowest = caseVals[0],
                highest = caseVals[caseVals.length-1];

            if (highest <= 9) {
                posTimes *= 1.5;
            } else if (highest <= 99) {
                posTimes *= 1.3;
            } else if (highest <= 999) {
                posTimes *= 1.1;
            }

            if (lowest >= 0) {
                negTimes *= 1.5;
            } else if (highest >= -1) {
                negTimes *= 1.3;
            } else if (highest >= -10) {
                negTimes *= 1.1;
            }

            circleRadius = [
                'interpolate',
                ['linear'],
                ['get', 'casesSz'],
                -4, 20*negTimes,
                -3, 14*negTimes,
                -2, 10*negTimes,
                -1, 9*negTimes,
                0, 0,
                1, 9*posTimes,
                2, 15*posTimes,
                3, 22*posTimes,
                4, 30*posTimes
            ];
        }

        map.setPaintProperty(
            // Size circle radius by value
            this.uniqueId, 'circle-radius', circleRadius
        );
        map.setPaintProperty(
            // Color circle by value
            this.uniqueId, 'circle-color', circleColor
        );

        this.__shown = true;
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId);
            map.removeLayer(this.uniqueId + 'label');
            map.removeLayer(this.uniqueId + 'citylabel');
            this.__shown = false;
        }
    }
}

export default CaseCirclesLayer;

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

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    /**
     * Add the case circles layer
     *
     * @param caseVals
     */
    addLayer(caseVals) {
        this.removeLayer();

        let map = this.map,
            minZoom = this.clusteredCaseSources.getMinZoom(),
            maxZoom = this.clusteredCaseSources.getMaxZoom(),
            circleColor;

        if (caseVals[caseVals.length-1] <= 4) {
            circleColor = [
                'step',
                ['get', 'cases'],
                'rgba(0,80,0,0.8)',
                0, 'rgba(0,0,80,0.0)',
                1, '#ff9f85',
                5, '#ff9f85',
                50, '#ff5c30',
                100, '#ff4817',
                300, '#e73210'
            ];
        } else {
            let clipVal = (i, gt) => {
                // mapbox needs ints in ascending order,
                // so make sure each is higher than the last
                i = parseInt(i);
                return i > gt ? i : gt+1;
            };

            circleColor = [
                'step',
                ['get', 'cases'],
                'rgba(0,80,0,0.8)',
                0, 'rgba(0,0,80,0.0)',
                1, '#ff9f85',
                5, '#ff9f85',
                clipVal(caseVals[parseInt(caseVals.length*0.5)], 5), '#ff5c30',
                clipVal(caseVals[parseInt(caseVals.length*0.7)], 6), '#ff4817',
                clipVal(caseVals[parseInt(caseVals.length*0.9)], 7), '#e73210',
                clipVal(caseVals[caseVals.length-1], 8), '#e73210'
            ];
        }

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

        for (let zoomLevel=minZoom; zoomLevel<maxZoom; zoomLevel++) {
            var opacity;
            if (zoomLevel === minZoom) {
                opacity = [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    zoomLevel + 0.9999999999999, 1,
                    zoomLevel + 1, 0,
                ];
            }
            else {
                opacity = [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    zoomLevel - 0.0000000000001, 0,
                    zoomLevel, 1,
                    zoomLevel + 0.9999999999999, 1,
                    zoomLevel + 1, 0
                ];
            }

            map.addLayer(
                {
                    'id': this.uniqueId+zoomLevel,
                    'type': 'circle',
                    'source': this.clusteredCaseSources.getSourceIdByZoom(zoomLevel),
                    'minzoom': (zoomLevel-1 < 0) ? 0 : zoomLevel-1,
                    'maxzoom': zoomLevel+2,
                    filter: ['all',
                        ['!=', 'cases', 0],
                        ['has', 'cases']
                    ],
                    'paint': {
                        // Size circle radius by value
                        'circle-radius': [
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
                        ],
                        // Color circle by value
                        'circle-color': circleColor,
                        // Transition by zoom level
                        'circle-opacity': opacity
                    }
                }, lastCircleLayer
            );

            map.addLayer({
                id: this.uniqueId+'label'+zoomLevel,
                type: 'symbol',
                source: this.clusteredCaseSources.getSourceIdByZoom(zoomLevel),
                minzoom: (zoomLevel-1 < 0) ? 0 : zoomLevel-1,
                maxzoom: zoomLevel+2,
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
                    "text-color": "rgba(255, 255, 255, 1.0)",
                    // Transition by zoom level
                    'text-opacity': opacity
                }
            }, lastSymbolLayer);
        }

        map.addLayer(
            {
                id: this.uniqueId,
                type: 'circle',
                source: this.clusteredCaseSources.getSourceIdByZoom(maxZoom),
                minzoom: 6,
                filter: ['all',
                    ['!=', 'cases', 0],
                    ['has', 'cases']
                ],
                paint: {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'casesSz'],
                        -4, 20,
                        -3, 14,
                        -2, 10,
                        -1, 9,
                        0, 0,
                        1, 9,
                        2, 15,
                        3, 22,
                        4, 30
                    ],
                    // Color circle by value
                    'circle-color': circleColor,
                    // Transition by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6.99999999999, 0,
                        7.00000000001, 1
                    ]
                }
            }, lastCircleLayer
        );

        map.addLayer({
            'id': this.uniqueId+'citylabel',
            'type': 'symbol',
            'minzoom': 6,
            'source': this.clusteredCaseSources.getSourceIdByZoom(maxZoom),
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
            source: this.clusteredCaseSources.getSourceIdByZoom(maxZoom),
            minzoom: 6,
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
                'symbol-sort-key': ["to-number", ["get", "negcases"], 1]
            },
            paint: {
                "text-color": "rgba(255, 255, 255, 1.0)",
                // Transition by zoom level
                'text-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    6.99999999999, 0,
                    7.00000000001, 1
                ]
            }
        }, lastSymbolLayer);

        this.__shown = true;
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            let minZoom = this.clusteredCaseSources.getMinZoom(),
                maxZoom = this.clusteredCaseSources.getMaxZoom();

            const map = this.map;
            map.removeLayer(this.uniqueId);
            map.removeLayer(this.uniqueId + 'label');
            map.removeLayer(this.uniqueId + 'citylabel');

            for (let zoomLevel = minZoom; zoomLevel < maxZoom; zoomLevel++) {
                map.removeLayer(this.uniqueId + 'label' + zoomLevel);
                map.removeLayer(this.uniqueId + zoomLevel);
            }
            this.__shown = false;
        }
    }
}

export default CaseCirclesLayer;

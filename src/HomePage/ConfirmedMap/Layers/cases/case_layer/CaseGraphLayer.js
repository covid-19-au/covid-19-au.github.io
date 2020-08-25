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

import MapBoxSource from "../../../Sources/MapBoxSource";

let RECTANGLE_WIDTH = 25;


class CaseGraphLayer {
    /**
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique id for the MapBox GL layer
     * @param clusteredCaseSources
     */
    constructor(map, uniqueId, clusteredCaseSources) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;

        this.lineSource = new MapBoxSource(map, null, null, null);
    }

    __getRectangleWidths() {
        return {
            '-6': RECTANGLE_WIDTH,
            '-5': RECTANGLE_WIDTH,
            '-4': RECTANGLE_WIDTH,
            '-3': RECTANGLE_WIDTH,
            '-2': RECTANGLE_WIDTH,
            '-1': RECTANGLE_WIDTH,
            '0': RECTANGLE_WIDTH,
            '1': RECTANGLE_WIDTH,
            '2': RECTANGLE_WIDTH,
            '3': RECTANGLE_WIDTH,
            '4': RECTANGLE_WIDTH,
            '5': RECTANGLE_WIDTH,
            '6': RECTANGLE_WIDTH
        };
    }

    __addLayer() {
        if (this.__layerAdded) {
            return;
        }
        let map = this.map;

        let DASH_ON_RATIO = 2,
            DASH_OFF_RATIO = 0.7,
            DASH_LENGTH = 1;

        map.addLayer({
            id: this.uniqueId+'zeroline',
            type: 'line',
            'maxzoom': 14,
            source: this.lineSource.getSourceId(),
            'filter': ['all',
                ['has', 'isZeroLine']
            ],
            'layout': {
                //'line-join': 'round',
                //'line-cap': 'round'
            },
            'paint': {
                'line-color': 'white',
                'line-width': 1,
                //'line-blur': 0.5,
                'line-dasharray': [
                    DASH_ON_RATIO*DASH_LENGTH,
                    DASH_OFF_RATIO*DASH_LENGTH
                ]
            }
        });

        // Add the cases graph line layer
        map.addLayer({
            id: this.uniqueId+'line',
            type: 'line',
            'maxzoom': 14,
            source: this.lineSource.getSourceId(),
            'filter': ['all',
                ['has', 'casesTimeSeries']
            ],
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': 'white',
                'line-width': 2.0,
                'line-blur': 0.5
            }
        });

        this.__layerAdded = true;
    }

    fadeOut() {
        this.map.setPaintProperty(this.uniqueId+'line', 'line-opacity', 0);
        this.map.setPaintProperty(this.uniqueId+'zeroline', 'line-opacity', 0);
    }

    fadeIn() {
        this.map.setPaintProperty(this.uniqueId+'line', 'line-opacity', 1.0);
        this.map.setPaintProperty(this.uniqueId+'zeroline', 'line-opacity', 1.0);
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    /**
     * Add the case circles layer
     *
     * @param caseVals
     */
    updateLayer(caseVals, typeOfData, maxDateType) {
        if (!this.__layerAdded) {
            this.__addLayer();
        }

        caseVals = caseVals||this.clusteredCaseSources.getPointsAllVals();
        this.__updateLineData(caseVals, typeOfData, maxDateType);

        this.__caseVals = caseVals;
        this.__shown = true;
    }

    __updateLineData(caseVals, typeOfData, maxDateType) {
        let data = this.clusteredCaseSources.getData(),
            features = data['features'],
            zeroFeatures = [],
            daysToClip = maxDateType ? maxDateType.numDaysSince() : 0;

        let min = 9999999999999999,
            max = -999999999999999;

        for (let feature of features) {
            let timeSeries = feature['properties']['casesTimeSeries'];
            if (!timeSeries || !timeSeries.length) {
                continue
            }
            timeSeries = feature['properties']['casesTimeSeriesMod'] =
                timeSeries.slice(daysToClip, daysToClip + (RECTANGLE_WIDTH * 2));

            let iMin = Math.min(...timeSeries),
                iMax = Math.max(...timeSeries);

            if (Math.min(...timeSeries)) {
                if (iMin < min) min = iMin;
                if (iMax > max) max = iMax;
            }
        }

        for (let feature of features) {
            let [lng, lat] = feature['geometry']['coordinates'],
                pxPoint = this.map.project([lng, lat]);

            let longitudeInPx = pxPoint.x;
            let latitudeInPx = pxPoint.y;

            feature['geometry']['type'] = 'LineString';
            feature['geometry']['coordinates'] = [];

            let timeSeries = feature['properties']['casesTimeSeries'];
            if (!timeSeries || !timeSeries.filter(i => !!i).length) {
                continue
            }

            timeSeries = feature['properties']['casesTimeSeriesMod'];
            if (!timeSeries || !timeSeries.filter(i => !!i).length) {
                continue
            }

            let idx = 0,
                min = Math.min(...timeSeries),
                max = Math.max(...timeSeries);

            if (min > 0 && max > 0) {
                min = 0;
            }
            if (min < 0 && max < 0) {
                max = 0;
            }

            for (let x=longitudeInPx+RECTANGLE_WIDTH; x>longitudeInPx-RECTANGLE_WIDTH; x--) {
                let pt1 = this.map.unproject([x, latitudeInPx-10]).toArray(),
                    pt2 = this.map.unproject([x, latitudeInPx+10]).toArray();

                let y = timeSeries[idx++];
                if (y == null) {
                    let lastCoord = feature['geometry']['coordinates'][
                        feature['geometry']['coordinates'].length-1
                    ];

                    if (lastCoord) {
                        feature['geometry']['coordinates'].push([pt1[0], lastCoord[1]]);
                    }
                    continue;
                }

                y = pt2[1] - ((y-min)/(max-min) * (pt2[1]-pt1[1]));
                feature['geometry']['coordinates'].push([pt1[0], y]);
            }

            let pt1 = this.map.unproject([longitudeInPx-RECTANGLE_WIDTH, latitudeInPx-10]).toArray(),
                pt2 = this.map.unproject([longitudeInPx+RECTANGLE_WIDTH, latitudeInPx+10]).toArray(),
                zeroY = pt2[1] - ((0-min)/(max-min) * (pt2[1]-pt1[1]));

            zeroFeatures.push({
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [pt1[0], zeroY],
                        [pt2[0], zeroY]
                    ]
                },
                properties: {
                    isZeroLine: true
                }
            })

            //console.log(JSON.stringify(feature['geometry']['coordinates']));
        }

        data['features'] = data['features'].concat(zeroFeatures);
        this.lineSource.setData(typeOfData, data);
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId);
            map.removeLayer(this.uniqueId + 'line');

            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default CaseGraphLayer;

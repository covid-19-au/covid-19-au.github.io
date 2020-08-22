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

import CaseRectangleLayer from "./CaseRectangleLayer";
import CaseCityLabelsLayer from "./CaseCityLabelsLayer";
import MapBoxSource from "../../Sources/MapBoxSource";

let RECTANGLE_WIDTH = 25;


class CaseGraphLayer {
    /**
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique id for the MapBox GL layer
     * @param clusteredCaseSources
     */
    constructor(map, uniqueId, clusteredCaseSources, hoverStateHelper) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;

        this.lineSource = new MapBoxSource(map, null, null, null);
        this.hoverStateHelper = hoverStateHelper;
        this.hoverStateHelper.associateSourceId(this.clusteredCaseSources.getSourceId());

        this.caseCityLabelsLayer = new CaseCityLabelsLayer(map, uniqueId, clusteredCaseSources);
        this.caseRectangleLayer = new CaseRectangleLayer(map, uniqueId, clusteredCaseSources, hoverStateHelper);
    }

    __addLayer() {
        if (this.__layerAdded) {
            return;
        }
        let map = this.map;

        this.caseRectangleLayer.__addLayer();
        this.caseCityLabelsLayer.__addLayer();

        // Add the cases number layer
        map.addLayer({
            id: this.uniqueId+'line',
            type: 'line',
            'maxzoom': 14,
            source: this.lineSource.getSourceId(),
            filter: ['all',
                ['!=', 'cases', 0],
                ['has', 'cases']
            ],
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#5555ff',
                'line-width': 2,
                'line-blur': 0.5
            }
        });

        this.__layerAdded = true;
    }

    fadeOut() {
        this.map.setPaintProperty(this.uniqueId+'line', 'line-opacity', 0);
        this.caseCityLabelsLayer.fadeOut();
        this.caseRectangleLayer.fadeOut();
    }

    fadeIn() {
        this.map.setPaintProperty(this.uniqueId+'line', 'line-opacity', 1.0);
        this.caseCityLabelsLayer.fadeIn();
        this.caseRectangleLayer.fadeIn();
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    /**
     * Add the case circles layer
     *
     * @param caseVals
     */
    updateLayer(caseVals) {
        if (!this.__layerAdded) {
            this.__addLayer();
        }

        caseVals = caseVals||this.clusteredCaseSources.getPointsAllVals();
        let rectangleWidths = this.__getRectangleWidths(caseVals);

        this.caseCityLabelsLayer.updateLayer(caseVals);
        this.caseRectangleLayer.updateLayer(caseVals, rectangleWidths);
        this.__updateLineData(rectangleWidths);

        this.__caseVals = caseVals;
        this.__shown = true;
    }

    __getRectangleWidths(caseVals) {
        // HACK!
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

    __updateLineData(rectangleWidths) {
        let data = this.clusteredCaseSources.getData(),
            features = data['features'];

        for (let feature of features) {
            let [lng, lat] = feature['geometry']['coordinates'],
                pxPoint = this.map.project([lng, lat]),
                casesSz = parseInt(feature['properties']['casesSz']),
                leftOver = Math.abs(feature['properties']['casesSz']-casesSz);

            if (!casesSz) continue;
            if (casesSz < -4) casesSz = -4;
            if (casesSz > 4) casesSz = 4;

            let pxLng = pxPoint.x;
            let pxLat = pxPoint.y;
            let rectangleWidth = rectangleWidths[casesSz];

            rectangleWidth += (
                rectangleWidths[
                    casesSz < 0 ? casesSz-1 : casesSz+1
                ] - rectangleWidth
            ) * leftOver;

            //console.log(`${casesSz} ${rectangleWidth} ${pxLng} ${pxLat}`);
            feature['geometry']['type'] = 'LineString';
            feature['geometry']['coordinates'] = [];

            let timeSeries = feature['properties']['casesTimeSeries'];
            if (!timeSeries || !timeSeries.length) {
                continue
            }



            let min = Math.min(...timeSeries),
                max = Math.max(...timeSeries),
                idx = 0;

            for (let x=pxLng+rectangleWidth; x>pxLng-rectangleWidth; x--) {
                let pt1 = this.map.unproject([x, pxLat-10]).toArray(),
                    pt2 = this.map.unproject([x, pxLat+10]).toArray();

                let y = timeSeries[idx++];
                if (y == null) {
                    break;
                }

                y = pt2[1] - ((y-min)/(max-min) * (pt2[1]-pt1[1]));
                feature['geometry']['coordinates'].push([pt1[0], y]);
            }
            //console.log(JSON.stringify(feature['geometry']['coordinates']));
        }

        this.lineSource.setData(data);
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId);
            map.removeLayer(this.uniqueId + 'line');

            this.caseCityLabelsLayer.removeLayer();
            this.caseRectangleLayer.removeLayer();

            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default CaseGraphLayer;

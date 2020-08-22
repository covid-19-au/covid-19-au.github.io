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
import MapBoxSource from "../../Sources/MapBoxSource";


class CaseRectangleLayer {
    constructor(map, uniqueId, clusteredCaseSources, hoverStateHelper) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;
        this.hoverStateHelper = hoverStateHelper;

        this.rectangleSource = new MapBoxSource(map, null, null, null);
        this.hoverStateHelper.associateSourceId(this.rectangleSource.getSourceId());
    }

    __addLayer() {
        if (this.__layerAdded) {
            return;
        }
        this.map.addLayer({
            'id': this.uniqueId+'rectangle',
            'type': 'fill',
            'maxzoom': 14,
            'source': this.rectangleSource.getSourceId(),
            filter: ['all',
                ['!=', 'cases', 0],
                ['has', 'cases']
            ],
            paint: {
                //"fill-opacity-transition": {duration: FADE_TRANSITION_DURATION},
            }
        });
        this.__layerAdded = true;
    }

    fadeOut() {
        this.map.setPaintProperty(this.uniqueId+'rectangle', 'fill-opacity', 0);
    }

    fadeIn() {
        this.map.setPaintProperty(this.uniqueId+'rectangle', 'fill-opacity', 1.0);
    }

    updateLayer(caseVals, rectangleWidths) {
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

        let map = this.map;
        let rectangleColor = getMapBoxCaseColors(
                [255, 222, 207, startOpacity], [231, 50, 16, 1.0],
                'rgba(0, 0, 0, 0.0)', 'rgb(169, 0, 15)',
                [164,192,160, startOpacity], [46,110,15, 1.0],
                caseVals, [0.0, 0.25, 0.5, 0.75, 0.80, 0.85, 0.90, 0.95, 0.99999], 1
            ),
            hoverRectangleColor = "rgba(150, 10, 6, 0.9)";

        map.setPaintProperty(
            // Color circle by value
            this.uniqueId+'rectangle', 'fill-color', [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                hoverRectangleColor,
                rectangleColor
            ]
        );

        this.__updateRectangleWidth(rectangleWidths);
        this.__shown = true;
    }

    __updateRectangleWidth(rectangleWidths) {
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

            let pt1 = this.map.unproject([pxLng-rectangleWidth, pxLat-10]),
                pt2 = this.map.unproject([pxLng+rectangleWidth, pxLat-10]),
                pt3 = this.map.unproject([pxLng+rectangleWidth, pxLat+10]),
                pt4 = this.map.unproject([pxLng-rectangleWidth, pxLat+10]);

            feature['geometry']['type'] = 'Polygon';
            feature['geometry']['coordinates'] = [[
                pt1.toArray(), pt2.toArray(),
                pt3.toArray(), pt4.toArray(),
            ]];
        }

        this.rectangleSource.setData(data);
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            this.map.removeLayer(this.uniqueId + 'rectangle');
            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default CaseRectangleLayer;

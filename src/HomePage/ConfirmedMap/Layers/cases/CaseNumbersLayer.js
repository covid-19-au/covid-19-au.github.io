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
import CaseCityLabelsLayer from "./CaseCityLabelsLayer";
import CaseRectangleLayer from "./CaseRectangleLayer";


class CaseNumbersLayer {
    /**
     * MapBox GL layers which show case numbers in red circles
     *
     * Also has a layer showing the region labels underneath
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique id for the MapBox GL layer
     * @param clusteredCaseSources
     */
    constructor(map, uniqueId, clusteredCaseSources, hoverStateHelper) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;

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
            id: this.uniqueId+'label',
            type: 'symbol',
            'maxzoom': 14,
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
                'symbol-sort-key': ["get", "cases"]
            },
            paint: {
                "text-color": "rgba(255, 255, 255, 1.0)",
                //"text-opacity-transition": {duration: FADE_TRANSITION_DURATION},
            }
        });

        this.__layerAdded = true;
    }

    fadeOut() {
        this.map.setPaintProperty(this.uniqueId+'label', 'text-opacity', 0);

        this.caseCityLabelsLayer.fadeOut();
        this.caseRectangleLayer.fadeOut();
    }

    fadeIn() {
        this.map.setPaintProperty(this.uniqueId+'label', 'text-opacity', 1.0);

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

        let colors = [
            'rgba(0,80,0,0.8)',
            'rgba(0,0,80,0.0)',
            '#ff9f85',
            '#ff9f85',
            '#ff5c30',
            '#ff4817',
            '#e73210',
            '#e73210'
        ];

        caseVals = caseVals||this.clusteredCaseSources.getPointsAllVals();
        let rectangleWidths = this.__getRectangleWidths(caseVals);

        this.caseCityLabelsLayer.updateLayer(caseVals);
        this.caseRectangleLayer.updateLayer(caseVals, rectangleWidths);

        this.__caseVals = caseVals;
        this.__shown = true;
    }

    __getRectangleWidths(caseVals) {
        let rectangleWidths;

        if (this.clusteredCaseSources.clusteringBeingUsed()) {
            rectangleWidths = {
                '-6': 30,
                '-5': 25,
                '-4': 20,
                '-3': 14,
                '-2': 10,
                '-1': 9,
                '0': 0,
                '1': 9,
                '2': 13,
                '3': 16,
                '4': 20,
                '5': 25,
                '6': 30,
            };
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

            rectangleWidths = {
                '-6': 30 * negTimes,
                '-5': 25 * negTimes,
                '-4': 20 * negTimes,
                '-3': 14 * negTimes,
                '-2': 10 * negTimes,
                '-1': 9 * negTimes,
                '0': 0,
                '1': 9 * posTimes,
                '2': 15 * posTimes,
                '3': 22 * posTimes,
                '4': 30 * posTimes,
                '5': 35 * posTimes,
                '6': 40 * posTimes
            };
        }
        return rectangleWidths;
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId);
            map.removeLayer(this.uniqueId + 'label');

            this.caseCityLabelsLayer.removeLayer();
            this.caseRectangleLayer.removeLayer();

            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default CaseNumbersLayer;

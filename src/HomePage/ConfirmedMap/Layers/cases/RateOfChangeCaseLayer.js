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

import CaseRectangleLayer from "./case_layer/CaseRectangleLayer";
import CaseCityLabelsLayer from "./case_layer/CaseCityLabelsLayer";
import CaseGraphLayer from "./case_layer/CaseGraphLayer";


class RateOfChangeCaseLayer {
    /**
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique id for the MapBox GL layer
     * @param clusteredCaseSources
     */
    constructor(remoteData, map, uniqueId, clusteredCaseSources, hoverStateHelper) {
        this.remoteData = remoteData;
        this.map = map;
        this.uniqueId = uniqueId;
        this.clusteredCaseSources = clusteredCaseSources;

        this.hoverStateHelper = hoverStateHelper;
        this.hoverStateHelper.associateSourceId(this.clusteredCaseSources.getSourceId());

        this.caseGraphLayer = new CaseGraphLayer(map, uniqueId, clusteredCaseSources);
        this.caseCityLabelsLayer = new CaseCityLabelsLayer(map, uniqueId, clusteredCaseSources);
        this.caseRectangleLayer = new CaseRectangleLayer(
            map, uniqueId+'graph', clusteredCaseSources, hoverStateHelper,
            3, 2
        );
    }

    __addLayer() {
        if (this.__layerAdded) {
            return;
        }

        this.caseRectangleLayer.__addLayer();
        this.caseCityLabelsLayer.__addLayer();
        this.caseGraphLayer.__addLayer();

        this.__layerAdded = true;
    }

    fadeOut() {
        this.caseCityLabelsLayer.fadeOut();
        this.caseRectangleLayer.fadeOut();
        this.caseGraphLayer.fadeOut();
    }

    fadeIn() {
        this.caseCityLabelsLayer.fadeIn();
        this.caseGraphLayer.fadeIn();
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
    updateLayer(caseVals, maxDateType) {
        if (!this.__layerAdded) {
            this.__addLayer();
        }

        caseVals = caseVals||this.clusteredCaseSources.getPointsAllVals();
        let rectangleWidths = this.__getRectangleWidths(caseVals),
            typeOfData = this.clusteredCaseSources.getTypeOfData();

        this.caseCityLabelsLayer.updateLayer(caseVals, typeOfData);
        this.caseGraphLayer.updateLayer(caseVals, typeOfData, maxDateType);
        this.caseRectangleLayer.updateLayer(caseVals, typeOfData, rectangleWidths, maxDateType);

        this.__caseVals = caseVals;
        this.__shown = true;
    }

    __getRectangleWidths(caseVals) {
        return this.caseGraphLayer.__getRectangleWidths(caseVals);
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            this.caseCityLabelsLayer.removeLayer();
            this.caseRectangleLayer.removeLayer();

            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default RateOfChangeCaseLayer;

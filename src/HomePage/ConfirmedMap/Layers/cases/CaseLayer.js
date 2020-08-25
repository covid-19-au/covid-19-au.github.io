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
import CaseNumbersLayer from "./case_layer/CaseNumbersLayer";
import CaseGraphLayer from "./case_layer/CaseGraphLayer";

let RECTANGLE_WIDTH = 25;


class CaseLayer {
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
        this.__mode = 'casenums';

        this.hoverStateHelper = hoverStateHelper;
        this.hoverStateHelper.associateSourceId(this.clusteredCaseSources.getSourceId());

        this.caseGraphLayer = new CaseGraphLayer(
            map, uniqueId, clusteredCaseSources
        );
        this.caseCityLabelsLayer = new CaseCityLabelsLayer(
            map, uniqueId, clusteredCaseSources
        );
        this.caseNumbersRectangleLayer = new CaseRectangleLayer(
            map, uniqueId, clusteredCaseSources, hoverStateHelper,
            false
        );
        this.caseGraphRectangleLayer = new CaseRectangleLayer(
            map, uniqueId+'graph', clusteredCaseSources, hoverStateHelper,
            true, 3, 2
        );
        this.caseNumbersLayer = new CaseNumbersLayer(
            remoteData, map, uniqueId, clusteredCaseSources, hoverStateHelper
        );
    }

    __addLayer() {
        if (this.__layerAdded) {
            return;
        }

        this.caseNumbersRectangleLayer.__addLayer();
        this.caseGraphRectangleLayer.__addLayer();
        this.caseCityLabelsLayer.__addLayer();
        this.caseGraphLayer.__addLayer();
        this.caseNumbersLayer.__addLayer();

        this.__layerAdded = true;
    }

    fadeOut() {
        this.caseCityLabelsLayer.fadeOut();
        this.caseNumbersRectangleLayer.fadeOut();
        this.caseGraphRectangleLayer.fadeOut();
        this.caseNumbersLayer.fadeOut();
        this.caseGraphLayer.fadeOut();
    }

    fadeIn() {
        this.caseCityLabelsLayer.fadeIn();

        if (this.__mode === 'casenums') {
            this.caseGraphLayer.fadeOut();
            this.caseNumbersRectangleLayer.fadeIn();
            this.caseGraphRectangleLayer.fadeOut();
            this.caseNumbersLayer.fadeIn();
        } else if (this.__mode === 'graphs') {
            this.caseGraphLayer.fadeIn();
            this.caseGraphRectangleLayer.fadeIn();
            this.caseNumbersRectangleLayer.fadeOut();
            this.caseNumbersLayer.fadeOut();
        }
    }

    changeModeToCaseNums() {
        this.__mode = 'casenums';
    }

    changeModeToGraphs() {
        this.__mode = 'graphs';
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

        if (this.__mode === 'graphs') {
            this.caseGraphLayer.updateLayer(caseVals, typeOfData, maxDateType);
            this.caseGraphRectangleLayer.updateLayer(caseVals, typeOfData, rectangleWidths, maxDateType);
        } else if (this.__mode === 'casenums') {
            this.caseNumbersLayer.updateLayer(caseVals, typeOfData);
            this.caseNumbersRectangleLayer.updateLayer(caseVals, typeOfData, rectangleWidths, maxDateType);
        }

        this.__caseVals = caseVals;
        this.__shown = true;
    }

    __getRectangleWidths(caseVals) {
        if (this.__mode === 'casenums') {
            return this.caseNumbersLayer.__getRectangleWidths(caseVals);
        } else if (this.__mode === 'graphs') {
            return this.caseGraphLayer.__getRectangleWidths(caseVals);
        }
    }

    /**
     * Remove the cases layer
     */
    removeLayer() {
        if (this.__shown) {
            this.caseCityLabelsLayer.removeLayer();
            this.caseNumbersRectangleLayer.removeLayer();
            this.caseGraphRectangleLayer.removeLayer();
            this.caseNumbersLayer.removeLayer();

            this.__shown = false;
            this.__layerAdded = false;
        }
    }
}

export default CaseLayer;

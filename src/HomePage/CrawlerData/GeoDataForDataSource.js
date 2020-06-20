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

import UnderlayData from "./UnderlayData"
import CasesData from "./CasesData"
import Fns from "../ConfirmedMap/Fns"

// Higher values will result in less accurate lines,
// but faster performance. Default is 0.375
const MAPBOX_TOLERANCE = 0.45;


class GeoDataForDataSource {
    /**
     * A means to process data from GeoData instances,
     * adding properties such as case numbers or statistics.
     *
     * Also can cluster points for cases, so as to be able
     * to get a zoomed-out general overview of an area
     *
     * @param geoData the GeoData instance
     * @param dataSource
     */
    constructor(geoData, dataSource) {
        this.geoData = geoData;
        this.dataSource = dataSource;

        this._polygonDataCache = {};
        this._pointDataCache = {};

        this._associateSource(geoData, dataSource)
    }
}

export default GeoDataForDataSource;

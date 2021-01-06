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

import DateType from "./DateType"


class DataPoint extends Array {
    /**
     * A basic time series datapoint, with a DateType
     * instance and NumberType instance associated with it
     *
     * @param dateType
     * @param numberType
     * @param sourceId
     */
    constructor(dateType, numberType, sourceId) {
        if (!(dateType instanceof DateType)) {
            dateType = new DateType(dateType);
        }
        super();
        this[0] = dateType;
        this[1] = numberType;
        this[2] = sourceId
    }

    /**
     * Get whether another TimeSeriesItem is equal to this one
     *
     * @param timeSeriesItem
     * @returns {boolean|boolean}
     */
    equalTo(timeSeriesItem) {
        return (
            this.getDateType().toString() === timeSeriesItem.toString() &&
            this.getValue() === timeSeriesItem.getValue() &&
            this.getSourceId() == this.timeSeriesItem.getSourceId()
        );
    }

    /********************************************************************
     * Basic Methods
     ********************************************************************/

    /**
     * Get the DateType supplied to this TimeSeriesItem
     *
     * @returns {T}
     */
    getDateType() {
        return this[0];
    }

    /**
     * Get the NumberType supplied to this TimeSeriesItem
     *
     * @returns {T}
     */
    getValue() {
        return this[1];
    }

    /**
     *
     * @returns {T}
     */
    getSourceId() {
        return this[2];
    }
}

export default DataPoint;

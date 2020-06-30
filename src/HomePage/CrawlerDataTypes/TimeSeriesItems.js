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

import CasesData from "../CrawlerData/CasesData"
import RegionType from "../CrawlerDataTypes/RegionType"
import UnderlayData from "../CrawlerDataTypes/TimeSeriesItem"


class TimeSeriesItems extends Array {
    /**
     * An array of TimeSeriesItem instances. Inherits from Array,
     * so has all the normal methods like push() etc, but also
     * associates a data source, region schema/parent/child,
     * the time period the data is over and optionally an age range
     *
     * @param dataSource a CasesData or UnderlayData instance
     * @param regionType a RegionType instance
     * @param dateRangeType a DateRangeType instance. Note this may
     *        not necessarily be the maximum and minimum dates within
     *        the TimeSeriesItem's contained in the array if datapoints
     *        aren't available for the requested time interval
     * @param ageRange (optional) the age range the time series value
     *        is relevant for, e.g. "0-9"
     * @param items (optional) populate with these initial items
     */
    constructor(dataSource, regionType, dateRangeType, ageRange, items) {
        super();
        if (items) {
            for (var item of items) {
                this.push(item);
            }
        }

        if (
            !(dataSource instanceof CasesData) &&
            !(dataSource instanceof UnderlayData)
        ) {
            throw (
                `RegionType ${regionType} should be an instance of ` +
                `DataSourceBase like CasesData or UnderlayData!`
            );
        }

        if (!(regionType instanceof RegionType)) {
            throw `RegionType ${regionType} should be an instance of RegionType!`;
        }

        this.dataSource = dataSource;
        this.regionType = regionType;
        this.ageRange = ageRange;
    }

    /********************************************************************
     * Get information about the data source etc
     ********************************************************************/

    /**
     * Get the CasesData or UnderlayData associated with this instance
     *
     * @returns {*}
     */
    getDataSource() {
        return this.dataSource;
    }

    /**
     * Get the RegionType instance associated with these items,
     * allowing getting information about the region schema,
     * region parent, region child.
     *
     * Also allows for limited localization of place names.
     *
     * @returns {*}
     */
    getRegionType() {
        return this.regionType;
    }

    /**
     * Get the age range (e.g. "0-9") which is associated with this
     * set of items. `null` if  there is no such association
     *
     * @returns {*}
     */
    getAgeRange() {
        return this.ageRange;
    }

    /**
     *
     * @returns {*}
     */
    getDataType() {
        return this.dataType;
    }

    /********************************************************************
     * Get days since value change
     ********************************************************************/

    /**
     * Get the number of days before today that
     * the value was higher than the most recent value.
     */
    getDaysSinceLastIncrease() {
        var firstValue = null;
        for (var [dateType, valueType] of this) {
            if (firstValue == null) {
                firstValue = valueType;
            }
            else {
                if (valueType > firstValue) {
                    return dateType.numDaysSince();
                }
            }
        }
    }

    /**
     * Get the number of days before today that
     * the value was lower than the most recent value.
     */
    getDaysSinceLastDecrease() {
        var firstValue = null;
        for (var [dateType, valueType] of this) {
            if (firstValue == null) {
                firstValue = valueType;
            }
            else {
                if (valueType < firstValue) {
                    return dateType.numDaysSince();
                }
            }
        }
    }

    /********************************************************************
     * TODO!
     ********************************************************************/

    /**
     *
     * @param overNumDays
     */
    getRateOfChange(overNumDays) {

    }

    /**
     * Get the rolling average over a provided number of days
     *
     * @param overNumDays the number of days to average over
     */
    getDayAverage(overNumDays) {

    }

    /**
     *
     */
    getRatePerCapita100k() {

    }

    /**
     *
     */
    getRatePerRegion100k() {

    }

    /********************************************************************
     * Get data for CanvasJS graphs
     ********************************************************************/

    /**
     *
     * @returns {{x: *, y: *}[]}
     */
    getCanvasJSData() {
        let r = [];
        for (let item of this) {
            r.push({
                x: item.getDateType(),
                y: item.getValue()
            });
        }
        return r;
    }
}

export default TimeSeriesItems;

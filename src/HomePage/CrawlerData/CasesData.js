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

import ConfirmedMapFns from "../ConfirmedMap/Fns";
import StateLatestNums from "../../data/stateCaseData.json"
import DataSourceBase from "./DataSourceBase"

import DateRangeType from "../CrawlerDataTypes/DateRangeType"
import DateType from "../CrawlerDataTypes/DateType"
import RegionType from "../CrawlerDataTypes/RegionType"
import TimeSeriesItem from "../CrawlerDataTypes/TimeSeriesItem"
import TimeSeriesItems from "../CrawlerDataTypes/TimeSeriesItems"

import getFromTodaysStateCaseData from "./getFromTodaysStateCaseData"


class CasesData {
    /**
     * A datasource which contains values over time
     *
     * In format:
     * {
     *  "sub_headers" [subheader name 1, subheader name 2 ...]
     *  "data": [["", "0-9", [["01/05/2020", 0], ...],
     *           ["", "0-9", [["01/05/2020", 0], ...], ...]
     * }
     * the first value in each data item is the
     * city name/region, and the second is the agerange.
     *
     * NOTE: state names/city names supplied to this
     * class must be lowercased and have ' - ' replaced with '-'.
     * This is way too resource-intensive to run otherwise!
     *
     * @param casesData the base data downloaded from JSON
     * @param uniqueId
     * @param regionSchema
     * @param regionParent
     * @param dataType the key, e.g. "new", "total", "status_active" etc
     * @param regionsDateIds This is a map from
     *        {id: date string in format DD/MM/YYYY, ...}
              as otherwise the data will be a lot larger!
     * @param updatedDate
     */
    constructor(uniqueId, casesData, regionsDateIds,
                dataType, updatedDate,
                regionSchema, regionParent) {

        this.uniqueId = uniqueId;
        this.casesData = casesData;
        this.regionsDateIds = this._getRegionsDateIds(regionsDateIds);

        this.dataType = dataType;
        this.updatedDate = new DateType(updatedDate);

        this.regionSchema = regionSchema;
        this.regionParent = regionParent;

        this.subHeaderIndex = casesData['sub_headers'].indexOf(dataType);
        this.data = casesData['data'];
    }

    /**
     * Convert YYYY_MM_DD format to DateType objects,
     * so as to reduce comparison times
     * 
     * @param regionsDateIds
     * @returns {{}}
     * @private
     */
    _getRegionsDateIds(regionsDateIds) {
        let r = {};
        for (let [key, value] of regionsDateIds.entries()) {
            r[key] = new DateType(value);
        }
        return r;
    }

    /**
     * Get a unique ID that can be used for mapbox gl source IDs etc
     *
     * @returns {*}
     */
    getUniqueId() {
        return this.uniqueId;
    }

    /**
     * Get when this data source was updated as a DateType
     *
     * @returns {*}
     */
    getUpdatedDate() {
        return this.updatedDate;
    }

    /*******************************************************************
     * Basic case numbers
     *******************************************************************/

    /**
     * Return only the latest value
     *
     * @param regionType
     * @param ageRange
     * @returns {{numCases: number, updatedDate: *}|{numCases, updatedDate}|{numCases: number, updatedDate}}
     */
    getCaseNumber(regionType, ageRange) {
        if (this.schema === 'statewide') {
            var n = getFromTodaysStateCaseData(this.stateName, this.dataType);
            if (n != null) {
                return new TimeSeriesItem(new DateType(n[1]), parseInt(n[0]));
            }
        }

        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (iRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        return new TimeSeriesItem(dateUpdated, parseInt(iValue));
                    }
                }
            }
        }
        return new TimeSeriesItem(dateUpdated, 0);
    }

    /**
     * Return the latest value minus the value 14 days ago,
     * to get a general idea of how many active cases there
     * still are.
     *
     * This is both useful when active numbers aren't provided,
     * or for comparison with the active figures
     *
     * @param regionType
     * @param ageRange
     * @param numDays
     * @returns {{numCases: number, updatedDate: *}|null|{numCases: number, updatedDate: *}}
     */
    getCaseNumberOverNumDays(regionType, ageRange, numDays) {
        var oldest = null;

        var latest = this.getCaseNumber(regionType, ageRange);
        if (!latest) {
            return null;
        }

        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (iRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        oldest = new TimeSeriesItem(
                            latest['updatedDate'], latest['numCases'] - parseInt(iValue)
                        );

                        if (dateUpdated.numDaysSince() > numDays) {
                            return oldest;
                        }
                    }
                }
            }
        }

        // Can't do much if data doesn't go back
        // that far other than show oldest we can
        return oldest || new TimeSeriesItem(
            latest['updatedDate'], 0
        );
    }

    /*******************************************************************
     * Case number time series
     *******************************************************************/

    /**
     * Get the case numbers as a TimeSeriesItems array
     *
     * @param regionType
     * @param ageRange
     * @returns {[]}
     */
    getCaseNumberTimeSeries(regionType, ageRange) {
        var dateRangeType = new DateRangeType(DateType.today(), DateType.today());
        var r = new TimeSeriesItems(
            this, regionType, dateRangeType, ageRange
        );

        var latest = this.getCaseNumber(regionType, ageRange);
        if (latest && latest.numCases) {
            // Make sure we use the manually entered values first!
            r.push(new TimeSeriesItem(latest.updatedDate, parseInt(latest.numCases)));
        }

        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (iRegion === regionType.getChildRegion() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        // May as well use CanvasJS format
                        r.push(new TimeSeriesItem(dateUpdated, parseInt(iValue)));
                    }
                }
            }
        }

        r.sort((x, y) => x.getDateType() - y.getDateType());
        dateRangeType.setDateRange(r[0].getUpdatedDate(), r[r.length-1].getUpdatedDate());
        return r;
    }

    /**
     * Get the case numbers as a TimeSeriesItems array,
     * but only over the specified number of days
     *
     * @param regionType a RegionType instance
     * @param ageRange
     * @param numDays
     * @returns {[]}
     */
    getCaseNumberTimeSeriesOverNumDays(regionType, ageRange, numDays) {
        var r = [];
        var values = this.getCaseNumberTimeSeries(regionType, ageRange);

        for (var i = 0; i < values.length; i++) {
            var iData = values[i];
            if (iData.getDateType().numDaysSince() > numDays) {
                continue;
            }
            r.push(iData);
        }
        return r;
    }

    /*******************************************************************
     * Miscellaneous calculations
     *******************************************************************/

    /**
     * Get the maximum, minimum and median case values
     *
     * @returns {{min: number, median: *, max: number}}
     */
    getMaxMinValues() {
        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            // PERFORMANCE WARNING!
            var value = this.getCaseNumber(iRegion, iAgeRange)['numCases'];

            if (value === '' || value == null) {
                continue;
            }
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
            allVals.push(value);
        }

        allVals.sort();
        return {
            'max': max,
            'min': min,
            'median': allVals[Math.round(allVals.length / 2.0)]
        }
    }

    /**
     * Get the number of days since the last increase
     *
     * @param regionType a RegionType instance
     * @param ageRange (optional) the age range e.g. "0-9" as a string
     * @returns {null|*}
     */
    getDaysSince(regionType, ageRange) {
        ageRange = ageRange || '';
        var firstVal = null;

        for (var [iChildRegion, iAgeRange, iValues] of this.data) {
            if (iChildRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue == null || iValue === '') {
                        continue;
                    }
                    else if (firstVal == null) {
                        firstVal = iValue;
                    }
                    else if (firstVal > iValue) {
                        return dateUpdated.numDaysSince();
                    }
                }
            }
        }
        return null;
    }
}

export default CasesData;

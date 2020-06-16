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


/**
 * Get stats from today's hand-crafted state data
 *
 * @param stateName the Australian state name
 * @param dataType the datatype
 * @returns {null|*[]}
 */
function getFromStateCaseData(stateName, dataType) {
    var dateUpdated = StateLatestNums.updatedTime.split(' ')[1].replace(/[-]/g, '/');

    for (var [
        iStateName, iConfirmed, iDeaths, iRecovered,
        iTested, iInHospital, iInICU, iUnknown
    ] of StateLatestNums.values) {
        if (stateName.toUpperCase() !== iStateName.toUpperCase()) {
            continue;
        }
        else if (dataType === 'total') {
            return new TimeSeriesItem(dateUpdated, iConfirmed);
        }
        else if (dataType === 'status_deaths') {
            return new TimeSeriesItem(dateUpdated, iDeaths);
        }
        else if (dataType === 'status_recovered') {
            return new TimeSeriesItem(dateUpdated, iRecovered);
        }
        else if (dataType === 'tests_total') { //  CHECK ME!!!
            return new TimeSeriesItem(dateUpdated, iTested);
        }
        else if (dataType === 'status_icu') {
            return new TimeSeriesItem(dateUpdated, iInICU);
        }
        else if (dataType === 'status_hospitalized') {
            return new TimeSeriesItem(dateUpdated, iInHospital);
        }
    }
    return null;
}


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
        this.updatedDate = updatedDate;

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
     *
     * @returns {*}
     */
    getUniqueId() {
        return this.uniqueId;
    }

    /**
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
     * @param region
     * @param ageRange
     * @returns {{numCases: number, updatedDate: *}|{numCases, updatedDate}|{numCases: number, updatedDate}}
     */
    getCaseNumber(regionType, ageRange) {
        if (this.schema === 'statewide') {
            var n = getFromStateCaseData(this.stateName, this.dataType);
            if (n != null) {
                return new TimeSeriesItem(
                    new DateType(n[1]),
                    getNumberByType(FIXME, parseInt(n[0]))
                );
            }
        }

        regionChild = ConfirmedMapFns.prepareForComparison(regionChild || '');
        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (
                (this.schema === 'statewide' || iRegion === regionChild) &&
                iAgeRange === ageRange
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        return new TimeSeriesItem(
                            new DateType(dateUpdated),
                            getNumberByType(FIXME, parseInt(iValue))
                        );
                    }
                }
            }
        }
        return new TimeSeriesItem(
            new DateType(dateUpdated),
            getNumberByType(FIXME, 0)
        );
    }

    /**
     * Return the latest value minus the value 14 days ago,
     * to get a general idea of how many active cases there
     * still are.
     *
     * This is both useful when active numbers aren't provided,
     * or for comparison with the active figures
     *
     * @param region
     * @param ageRange
     * @param numDays
     * @returns {{numCases: number, updatedDate: *}|null|{numCases: number, updatedDate: *}}
     */
    getCaseNumberOverNumDays(regionType, ageRange, numDays) {

        var oldest = null;
        var latest = super.getCaseNumber(region, ageRange);
        if (!latest) {
            return null;
        }

        region = ConfirmedMapFns.prepareForComparison(region || '');
        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (
                (this.schema === 'statewide' || iRegion === region) &&
                iAgeRange === ageRange
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        oldest = {
                            'numCases': latest['numCases'] - parseInt(iValue),
                            'updatedDate': latest['updatedDate']
                        };

                        if (ConfirmedMapFns.dateDiffFromToday(dateUpdated) > numDays) {
                            return oldest;
                        }
                    }
                }
            }
        }

        // Can't do much if data doesn't go back
        // that far other than show oldest we can
        return oldest || {
            'numCases': 0,
            'updatedDate': latest['updatedDate']
        };
    }

    /*******************************************************************
     * Case number time series
     *******************************************************************/

    /**
     *
     * @param region
     * @param ageRange
     * @returns {[]}
     */
    getCaseNumberTimeSeries(regionType, ageRange) {
        var r = [];
        var latest = this.__getCaseNumber(region, ageRange);
        if (latest && latest.numCases) {
            // Make sure we use the manually entered values first!
            r.push({
                x: ConfirmedMapFns.parseDate(latest.updatedDate),
                y: parseInt(latest.numCases)
            });
        }

        region = ConfirmedMapFns.prepareForComparison(region || '');
        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (
                (this.schema === 'statewide' || iRegion === region) &&
                iAgeRange === ageRange
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        // May as well use CanvasJS format
                        r.push({
                            x: ConfirmedMapFns.parseDate(dateUpdated),
                            y: parseInt(iValue)
                        });
                    }
                }
            }
        }
        r.sort((x, y) => x.x - y.x);
        return r;
    }

    /**
     *
     * @param regionType a RegionType instance
     * @param ageRange
     * @param numDays
     * @returns {[]}
     */
    getCaseNumberTimeSeriesOverNumDays(regionType, ageRange, numDays) {
        var r = [];
        var values = super.getCaseNumberTimeSeries(
            regionType, ageRange
        );

        for (var i = 0; i < values.length; i++) {
            var iData = values[i];
            if (ConfirmedMapFns.dateDiff(iData.x, ConfirmedMapFns.getToday()) > numDays) {
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
        // Return only the latest value
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

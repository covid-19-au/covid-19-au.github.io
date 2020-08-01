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

import Fns from "../ConfirmedMap/Fns";

import DateRangeType from "../CrawlerDataTypes/DateRangeType"
import DateType from "../CrawlerDataTypes/DateType"
import RegionType from "../CrawlerDataTypes/RegionType"
import TimeSeriesItem from "../CrawlerDataTypes/TimeSeriesItem"
import TimeSeriesItems from "../CrawlerDataTypes/TimeSeriesItems"

import getFromTodaysStateCaseData from "./getFromTodaysStateCaseData"

function debug(message) {
    if (false) {
        console.log(message);
    }
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
     * @param regionSchema
     * @param regionParent
     * @param dataType the key, e.g. "new", "total", "status_active" etc
     * @param regionsDateIds This is a map from
     *        {id: date string in format DD/MM/YYYY, ...}
              as otherwise the data will be a lot larger!
     * @param updatedDate
     */
    constructor(casesData, regionsDateIds, subHeaders,
                dataType, updatedDate,
                regionSchema, regionParent) {

        this.casesData = casesData;
        this.regionsDateIds = this._getRegionsDateIds(regionsDateIds);

        this.dataType = dataType;
        this.updatedDate = new DateType(updatedDate);

        this.regionSchema = regionSchema;
        this.regionParent = regionParent;

        this.subHeaderIndex = subHeaders.indexOf(dataType);
        this.data = casesData['data'];

        //this.getCaseNumber = Fns.regionFnCached(this.getCaseNumber, this);
        //this.getCaseNumberOverNumDays = Fns.regionFnCached(this.getCaseNumberOverNumDays, this);
        //this.getMaxMinValues = Fns.fnCached(this.getMaxMinValues, this);
        //this.getDaysSince = Fns.regionFnCached(this.getDaysSince, this);
        //this.getCaseNumberTimeSeries = Fns.regionFnCached(this.getCaseNumberTimeSeries, this);

        //this.getCaseNumberTimeSeriesOverNumDays = Fns.regionFnCached(this.getCaseNumberTimeSeriesOverNumDays, this);

        this.__averagedCache = new Map();
    }

    /**
     * HACK: Returns if this dataType actually is in the data
     *       This should be fixed in DataDownloader+the CasesData
     *       not created if the data doesn't exist, but will
     *       require more refactoring!
     */
    datatypeInData() {
        return this.subHeaderIndex !== -1;
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
        for (let [key, value] of Object.entries(regionsDateIds)) {
            r[key] = new DateType(value);
            //console.log(`${JSON.stringify(value)} ${JSON.stringify(r[key])} ${r[key].prettified()}`);
        }
        return r;
    }

    /**
     * Get when this data source was updated as a DateType
     *
     * @returns {*}
     */
    getUpdatedDate() {
        return this.updatedDate;
    }

    /**
     * Get the schema of this cases data, for example "admin_1"
     *
     * @returns {*}
     */
    getRegionSchema() {
        return this.regionSchema;
    }

    /**
     * Get the parent region of this schema. For instance,
     * the parent of "au-vic" is "au" in the admin_1 schema.
     *
     * @returns {*}
     */
    getRegionParent() {
        return this.regionParent;
    }

    /**
     *
     * @returns {*}
     */
    getDataType() {
        return this.dataType;
    }

    /*******************************************************************
     * Get possible children
     *******************************************************************/

    /**
     * Get all possible region children which
     * don't have an associated age range
     *
     * @returns {*[]}
     */
    getRegionChildren() {
        let r = new Set();
        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (!iAgeRange) {
                r.add(iRegion)
            }
        }
        return this.__regionChildrenToTypes(Array.from(r).sort());
    }

    /**
     * Get all possible region children which
     * have an associated age range
     *
     * @returns {*[]}
     */
    getAgeRanges(regionType) {
        let r = new Set();
        for (var [iRegion, iAgeRange, iValues] of this.data) {
            let iRegionType = new RegionType(
                this.regionSchema, this.regionParent, iRegion
            );
            if (regionType.equalTo(iRegionType) && iAgeRange && this.getCaseNumber(regionType, iAgeRange)) {
                r.add(iAgeRange)
            }
        }
        return Array.from(r).sort();
    }

    /**
     * Convert children to RegionType's with region schema/parent
     *
     * @param children
     * @returns {[]}
     * @private
     */
    __regionChildrenToTypes(children) {
        let r = [];
        for (let child of children) {
            r.push(new RegionType(this.regionSchema, this.regionParent, child));
        }
        return r;
    }

    /*******************************************************************
     * Basic case numbers
     *******************************************************************/

    /**
     * Return only the latest value
     *
     * @param regionType
     * @param ageRange
     * @param maxDateType allows setting the date before which to get the result.
     *                    For instance, if today is 30th July but this is set to 27th July
     *                    and there are only values from the 25th, it will return the 25th.
     * @returns {{numCases: number, updatedDate: *}|{numCases, updatedDate}|{numCases: number, updatedDate}}
     */
    getCaseNumber(regionType, ageRange, maxDateType) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        // TODO: FIX FOR MANUALLY ENTERED DATA!!! ===========================================================================

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (iRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (dateUpdated > maxDateType) {
                        continue;
                    } if (iValue != null && iValue !== '') {
                        return new TimeSeriesItem(dateUpdated, parseInt(iValue));
                    }
                }
            }
        }
        return null;
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
    getCaseNumberOverNumDays(regionType, ageRange, numDays, maxDateType) {
        maxDateType = maxDateType || DateType.today();
        ageRange = ageRange || '';

        let latest = this.getCaseNumber(regionType, ageRange, maxDateType);
        if (!latest) {
            return null;
        }

        let oldest = null;
        for (let [iRegion, iAgeRange, iValues] of this.data) {
            if (iRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    let dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (dateUpdated > maxDateType) {
                        continue;
                    } if (iValue != null && iValue !== '') {
                        oldest = new TimeSeriesItem(
                            latest.getDateType(), latest.getValue() - parseInt(iValue)
                        );
                        if (dateUpdated.numDaysSince(maxDateType) > numDays) {
                            return oldest;
                        }
                    }
                }
            }
        }

        // Can't do much if data doesn't go back
        // that far other than show oldest we can
        return oldest || new TimeSeriesItem(
            latest.getDateType(), 0
        );
    }

    /*******************************************************************
     * Averaged (smoothed) case numbers over num days
     *******************************************************************/

    /**
     *
     * @param regionType
     * @param ageRange
     * @param maxDateType
     */
    getSmoothedCaseNumber(regionType, ageRange, maxDateType) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        let uniqueKey = `${regionType.getHashKey()}||${ageRange}`;
        if (!this.__averagedCache.has(uniqueKey)) {
            let dataPoints = this.getCaseNumberTimeSeries(regionType, ageRange, DateType.today());
            if (dataPoints) {
                dataPoints = dataPoints.getDayAverage(7);
                //console.log(JSON.stringify(dataPoints))
                //alert("DATAPOINTS: "+uniqueKey)
            } else {
                //alert("NOT DATAPOINTS: "+uniqueKey)
            }
            this.__averagedCache.set(uniqueKey, dataPoints);
        }

        let dataPoints = this.__averagedCache.get(uniqueKey);
        if (!dataPoints) {
            return null;
        }
        else {
            for (let timeSeriesItem of dataPoints) {
                //console.log(timeSeriesItem.getDateType().prettified())
                if (timeSeriesItem.getDateType() <= maxDateType) {
                    return timeSeriesItem;
                }
            }
            return null;
        }
    }

    /**
     *
     * @param regionType
     * @param ageRange
     * @param numDays
     * @param maxDateType
     */
    getSmoothedCaseNumberOverNumDays(regionType, ageRange, numDays, maxDateType) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        let latestTimeSeriesItem = this.getSmoothedCaseNumber(
            regionType, ageRange, maxDateType
        );
        let pastTimeSeriesItem = this.getSmoothedCaseNumber(
            regionType, ageRange, maxDateType.daysSubtracted(numDays)
        );

        if (latestTimeSeriesItem && pastTimeSeriesItem) {
            return new TimeSeriesItem(
                latestTimeSeriesItem.getDateType(),
                Math.round(latestTimeSeriesItem.getValue() - pastTimeSeriesItem.getValue()) // NOTE ME!!! ============================================
            )
        }
        return null;
    }

    /*******************************************************************
     * Case number time series
     *******************************************************************/

    /**
     * Get the case numbers as a TimeSeriesItems array (or null if no data)
     *
     * @param regionType
     * @param ageRange
     * @returns {[]}
     */
    getCaseNumberTimeSeries(regionType, ageRange, maxDateType) {
        maxDateType = maxDateType || DateType.today();

        var dateRangeType = new DateRangeType(maxDateType, maxDateType);
        var r = new TimeSeriesItems(
            this, regionType, dateRangeType, ageRange
        );

        // TODO: FIX FOR MANUALLY ENTERED DATA!!! ===========================================================================

        ageRange = ageRange || '';

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            if (iRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (dateUpdated > maxDateType) {
                        continue;
                    } if (iValue != null && iValue !== '') {
                        // May as well use CanvasJS format
                        r.push(new TimeSeriesItem(dateUpdated, parseInt(iValue)));
                    }
                }
            }
        }

        if (!r.length) {
            return null;
        }
        r.sort((x, y) => x.getDateType() - y.getDateType());
        dateRangeType.setDateRange(r[0].getDateType(), r[r.length-1].getDateType());
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
    getCaseNumberTimeSeriesOverNumDays(regionType, ageRange, numDays, maxDateType) {
        maxDateType = maxDateType || DateType.today();

        var r = [];
        var values = this.getCaseNumberTimeSeries(regionType, ageRange, maxDateType);

        for (let iData of values) {
            if (iData.getDateType().numDaysSince(maxDateType) > numDays) {
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
    getMaxMinValues(maxDateType) {
        maxDateType = maxDateType || DateType.today();

        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (var [iRegion, iAgeRange, iValues] of this.data) {
            let iRegionType = new RegionType(this.regionSchema, this.regionParent, iRegion);
            var value = this.getCaseNumber(iRegionType, iAgeRange, maxDateType);  // TODO: Is this call necessary?? ===============
            if (!value) {
                continue;
            }
            value = value.getValue();

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
    getDaysSince(regionType, ageRange, maxDateType) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();
        var firstVal = null;

        for (var [iChildRegion, iAgeRange, iValues] of this.data) {
            if (iChildRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIds[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (dateUpdated > maxDateType) {
                        continue;
                    } if (iValue == null || iValue === '') {
                        continue;
                    } else if (firstVal == null) {
                        firstVal = iValue;
                    } else if (firstVal > iValue) {
                        return dateUpdated.numDaysSince(maxDateType);
                    }
                }
            }
        }
        return null;
    }
}

export default CasesData;

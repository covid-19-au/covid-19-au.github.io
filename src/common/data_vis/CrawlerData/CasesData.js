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

import DateType from "../CrawlerDataTypes/DateType"
import RegionType from "../CrawlerDataTypes/RegionType"
import DataPoint from "../CrawlerDataTypes/DataPoint"
import DataPoints from "../CrawlerDataTypes/DataPoints"


function debug(message) {
    if (false) {
        console.log(message);
    }
}

export const PRIORITIZE_RECENT_DATAPOINT = 0,
             PRIORITIZE_MANUAL_THEN_RECENT_DATAPOINT = 1,
             PRIORITIZE_RECENT_DATAPOINTS = 2,
             PRIORITIZE_LOW_INT_VALUE = 3,
             PRIORITIZE_FIRST_VALUE = 4;


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
    constructor(casesData, regionsDateIds, subHeaders, sourceIds,
                dataType, updatedDate,
                regionSchema, regionParent) {

        this.casesData = casesData;
        this.regionsDateIds = this._getRegionsDateIds(regionsDateIds);

        this.dataType = dataType;
        this.updatedDate = new DateType(updatedDate);

        this.regionSchema = regionSchema;
        this.regionParent = regionParent;

        this.subHeaderIndex = subHeaders.indexOf(dataType);

        if (!casesData['dataUncompressed']) {
            casesData['data'] = this.__dataUncompressed(casesData['data'])
            casesData['dataUncompressed'] = true;
        }

        this.data = casesData['data'];
        this.sourceIds = sourceIds;

        this.__averagedCache = new Map();
    }

    /**
     *
     * @param data
     * @private
     */
    __dataUncompressed(data) {
        let r = {};

        for (let key in data) {
            let sourceDataOut = [];

            for (let sourceDataItems of data[key]) {
                let sourceDataItemsOut = [];

                for (let sourceDataItem of sourceDataItems) {
                    let sourceDataItemOut = [sourceDataItem[0]]

                    for (let item of sourceDataItem.slice(1)) {
                        if (typeof item === 'string') {
                            // Strings contain an integer specifying number of nulls
                            // (run length encoding) to reduce needed downloads
                            for (let i = 0; i < parseInt(item); i++) {
                                sourceDataItemOut.push(null);
                            }
                        } else {
                            sourceDataItemOut.push(item)
                        }
                    }
                    sourceDataItemsOut.push(sourceDataItemOut);
                }
                sourceDataOut.push(sourceDataItemsOut);
            }
            r[key] = sourceDataOut;
        }
        return r;
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

    /**
     *
     * @returns {*}
     */
    getSourceIds() {
        return this.sourceIds;
    }

    /**
     *
     * @param fn
     * @param mode
     * @param args
     * @returns {null|*}
     * @private
     */
    __tryEachSourceId(fn, mode, ...args) {
        let r = null;

        for (let sourceId of this.getSourceIds()) {
            //console.log(args.concat([sourceId]));
            let iR = fn.apply(this, args.concat([sourceId]));

            if (iR != null && mode === PRIORITIZE_FIRST_VALUE) {
                return iR;
            } else if (iR != null && mode === PRIORITIZE_LOW_INT_VALUE) {
                if (r == null || iR < r) {
                    r = iR;
                }
            } else if (iR != null && mode === PRIORITIZE_RECENT_DATAPOINT) {
                // I've noticed that Bing has a lot of data on a more granular level than JHU,
                // but that the quality of the data is sometimes not high or not updated, so thinking
                // that the higher counts on the same date should take preference at the least
                if (r == null || iR.getDateType() > r.getDateType() ||
                    (iR.getDateType() >= r.getDateType() && r.getValue() < iR.getValue())) {
                    r = iR;
                }
            } else if (iR != null && mode === PRIORITIZE_MANUAL_THEN_RECENT_DATAPOINT) {
                if (sourceId === 'manual_state_data') {
                    return iR;
                } else if (r == null || iR.getDateType() > r.getDateType() ||
                    (iR.getDateType() >= r.getDateType() && r.getValue() < iR.getValue())) {
                    r = iR;
                }
            } else if (iR != null && mode === PRIORITIZE_RECENT_DATAPOINTS) {
                if (r == null || iR.getDateRangeType().getToDate() > r.getDateRangeType().getToDate() ||
                    (iR.getDateRangeType().getToDate() >= r.getDateRangeType().getToDate() && r[0].getValue() < iR[0].getValue())) {
                    r = iR;
                }
            } else if (iR != null) {
                throw "invalid mode: "+mode;
            }
        }

        return r;
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
        for (let key in this.data) {
            let [iRegionChild, iAgeRange] = key.split('||');
            if (!iAgeRange) {
                r.add(iRegionChild)
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

        for (let key in this.data) {
            let [iRegionChild, iAgeRange] = key.split('||');
            let iRegionType = new RegionType(this.regionSchema, this.regionParent, iRegionChild);

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
    getCaseNumber(regionType, ageRange, maxDateType, sourceId) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getCaseNumber, PRIORITIZE_RECENT_DATAPOINT, regionType, ageRange, maxDateType);
        }

        let sourceIdIdx = this.sourceIds.indexOf(sourceId);
        let iValues = this.data[`${regionType.getRegionChild()}||${ageRange}`];

        if (iValues) {
            for (let j = 0; j < iValues[sourceIdIdx].length; j++) {
                let dateUpdated = this.regionsDateIds[iValues[sourceIdIdx][j][0]],
                    iValue = iValues[sourceIdIdx][j][this.subHeaderIndex + 1];

                if (dateUpdated > maxDateType) {
                    continue;
                }
                if (iValue != null && iValue !== '') {
                    //alert(iValue+' '+sourceId+' '+sourceIdIdx+' '+iValues+' '+regionType.toString())
                    return new DataPoint(dateUpdated, parseInt(iValue), sourceId);
                }
            }
            //console.log('FOUND BUT NO VALS: '+sourceId+' '+sourceIdIdx+' '+JSON.stringify(iValues)+' '+regionType.getRegionChild()+' '+ageRange)
        } else {
            //console.log('NOT FOUND: '+sourceId+' '+sourceIdIdx+' '+JSON.stringify(iValues)+' '+regionType.getRegionChild()+' '+ageRange)
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
    getCaseNumberOverNumDays(regionType, ageRange, numDays, maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();
        ageRange = ageRange || '';

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getCaseNumberOverNumDays, PRIORITIZE_RECENT_DATAPOINT, regionType, ageRange, numDays, maxDateType);
        }
        let sourceIdIdx = this.sourceIds.indexOf(sourceId);

        let latest = this.getCaseNumber(regionType, ageRange, maxDateType, sourceId);
        if (!latest) {
            return null;
        }

        let oldest = null;
        let iValues = this.data[`${regionType.getRegionChild()}||${ageRange}`];

        if (iValues) {
            for (var j = 0; j < iValues[sourceIdIdx].length; j++) {
                let dateUpdated = this.regionsDateIds[iValues[sourceIdIdx][j][0]],
                    iValue = iValues[sourceIdIdx][j][this.subHeaderIndex + 1];

                if (dateUpdated > maxDateType) {
                    continue;
                }
                if (iValue != null && iValue !== '') {
                    oldest = new DataPoint(
                        latest.getDateType(), latest.getValue() - parseInt(iValue), sourceId
                    );
                    if (dateUpdated.numDaysSince(maxDateType) > numDays) {
                        return oldest;
                    }
                }
            }
        }

        // Can't do much if data doesn't go back
        // that far other than show oldest we can
        return oldest || null;
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
    getSmoothedCaseNumber(regionType, ageRange, maxDateType, sourceId) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getSmoothedCaseNumber, PRIORITIZE_RECENT_DATAPOINT, regionType, ageRange, maxDateType);
        }

        let uniqueKey = `${regionType.getHashKey()}||${ageRange}||${sourceId}`;
        if (!this.__averagedCache.has(uniqueKey)) {
            let dataPoints = this.getCaseNumberTimeSeries(regionType, ageRange, DateType.today(), sourceId);
            if (dataPoints) {
                dataPoints = dataPoints.getDayAverage(7);
            }
            this.__averagedCache.set(uniqueKey, dataPoints);
        }

        let dataPoints = this.__averagedCache.get(uniqueKey);
        if (!dataPoints) {
            return null;
        }
        else {
            for (let timeSeriesItem of dataPoints) {
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
    getSmoothedCaseNumberOverNumDays(regionType, ageRange, numDays, maxDateType, sourceId) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getSmoothedCaseNumberOverNumDays, PRIORITIZE_RECENT_DATAPOINT, regionType, ageRange, numDays, maxDateType);
        }

        let latestTimeSeriesItem = this.getSmoothedCaseNumber(regionType, ageRange, maxDateType, sourceId);
        let pastTimeSeriesItem = this.getSmoothedCaseNumber(regionType, ageRange, maxDateType.daysSubtracted(numDays), sourceId);

        if (latestTimeSeriesItem && pastTimeSeriesItem) {
            let value = Math.round(latestTimeSeriesItem.getValue() - pastTimeSeriesItem.getValue());
            return new DataPoint(latestTimeSeriesItem.getDateType(), value, sourceId)
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
    getCaseNumberTimeSeries(regionType, ageRange, maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();
        ageRange = ageRange || '';

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getCaseNumberTimeSeries, PRIORITIZE_RECENT_DATAPOINTS, regionType, ageRange, maxDateType);
        }
        let sourceIdIdx = this.sourceIds.indexOf(sourceId);

        let r = new DataPoints(this, regionType, ageRange);
        let iValues = this.data[`${regionType.getRegionChild()}||${ageRange}`];

        if (iValues) {
            for (let j = 0; j < iValues[sourceIdIdx].length; j++) {
                let dateUpdated = this.regionsDateIds[iValues[sourceIdIdx][j][0]],
                    iValue = iValues[sourceIdIdx][j][this.subHeaderIndex + 1];

                if (dateUpdated > maxDateType) {
                    continue;
                } else if (iValue != null && iValue !== '') {
                    r.push(new DataPoint(dateUpdated, parseInt(iValue), sourceId));
                }
            }
        }

        if (!r.length) {
            return null;
        }
        r.sort((x, y) => x.getDateType() - y.getDateType());
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
    getCaseNumberTimeSeriesOverNumDays(regionType, ageRange, numDays, maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getCaseNumberTimeSeriesOverNumDays, PRIORITIZE_RECENT_DATAPOINTS, regionType, ageRange, numDays, maxDateType);
        }

        let r = new DataPoints(this, regionType, ageRange);
        let values = this.getCaseNumberTimeSeries(regionType, ageRange, maxDateType, sourceId);

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
    getMaxMinValues(maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getMaxMinValues, PRIORITIZE_FIRST_VALUE, maxDateType);
        }

        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (let key in this.data) {
            let [iRegionChild, iAgeRange] = key.split('||');
            let iRegionType = new RegionType(this.regionSchema, this.regionParent, iRegionChild);

            var value = this.getCaseNumber(iRegionType, iAgeRange, maxDateType, sourceId);
            if (!value) continue;
            value = value.getValue();

            if (value === '' || value == null) continue;
            if (value > max) max = value;
            if (value < min) min = value;

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
    getDaysSince(regionType, ageRange, maxDateType, sourceId) {
        ageRange = ageRange || '';
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getDaysSince, PRIORITIZE_LOW_INT_VALUE, regionType, ageRange, maxDateType);
        }
        let sourceIdIdx = this.sourceIds.indexOf(sourceId);

        let firstVal = null;
        let iValues = this.data[`${regionType.getRegionChild()}||${ageRange}`];

        for (let j = 0; j < iValues[sourceIdIdx].length; j++) {
            let dateUpdated = this.regionsDateIds[iValues[sourceIdIdx][j][0]],
                iValue = iValues[sourceIdIdx][j][this.subHeaderIndex + 1];

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
        return null;
    }
}

export default CasesData;

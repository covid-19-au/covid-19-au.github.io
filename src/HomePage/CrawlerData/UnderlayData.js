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

import DataPoints from "../CrawlerDataTypes/DataPoints"
import DataPoint from "../CrawlerDataTypes/DataPoint"
import RegionType from "../CrawlerDataTypes/RegionType"
import DateType from "../CrawlerDataTypes/DateType"


class UnderlayData {
    /**
     *
     * @param data
     * @param key
     */
    constructor(data, key) {
        /*
        data -> {
            "region_ids": {}, // for schema/parent/child together
            "time_series_ids": {},
            "metadata": {
                "region_schema": {
                    "region_parent":
                        {...optional metadata...}
                }
            },
            "key_groups": {
                group_key: [key, ...],
                ...
            },
            "data": {
                "key": {
                    "region_schema": {
                        "region_parent": {
                            "region_child": [YYYY_MM_DD, value, YYYY_MM_DD, value, ...]
                        }
                    }
                }
            }
        }
        */
        this.regionIDs = data.region_ids;
        this.timeSeriesIDs = data.time_series_ids;
        this.metaData = data.metadata;
        this.keyGroups = data.key_groups;
        this.data = data.data;
        this.key = key;
    }

    /**
     * Get whether the value is a percentile
     *
     * @returns {boolean}
     */
    getIsPercent() {
        return this.key.indexOf('(%)') !== -1;
    }

    /********************************************************************
     * IDs to values (decompression to save downloads)
     ********************************************************************/

    /**
     * Convert schema/parent/child ID's to the original string
     *
     * @param args the IDs to convert
     * @returns {*[]}
     * @private
     */
    _rid(...args) {
        if (args[0] instanceof RegionType) {
            return [
                this.regionIDs[args[0].getRegionSchema()],
                this.regionIDs[args[0].getRegionParent()],
                this.regionIDs[args[0].getRegionChild()]
            ];
        }
        return args.map((s) => this.regionIDs[s]);
    }

    /**
     *
     * @param regionType
     * @returns {*}
     * @private
     */
    _getValuesByRID(regionType) {
        var [regionSchemaID, regionParentID, regionChildID] = this._rid(regionType);
        var keyId = this._rid(this.key);
        return this.data[regionSchemaID][regionParentID][regionChildID][keyId];
    }

    /**
     * Convert date ID's to the original string
     * (YYYY_MM_DD binary-sortable format)
     *
     * @param args the IDs to convert
     * @returns {*[]}
     * @private
     */
    _tsid(...args) {
        return args.map((s) => this.timeSeriesIDs[s]);
    }

    /********************************************************************
     * Enumerate possible schemas/region parents/region children
     ********************************************************************/

    /**
     * Get possible region schemas (such as "admin0" or "lga")
     * as an array of strings
     *
     * @returns {[]}
     */
    getRegionSchemas() {
        var r = [];
        for (var k in this.data) {
            r.push(this._rid(k)[0])
        }
        return r;
    }

    /**
     * Get possible parent regions of a given schema
     * (such as "AU" or "AU-VIC" as specified by ISO 3166 a2 or ISO 3166-2)
     *
     * @param regionSchema
     * @returns {[]}
     */
    getRegionParents(regionSchema) {
        var r = [];
        for (var k in this.data[regionSchema]) {
            r.push(this._rid(k)[0])
        }
        return r;
    }

    /**
     * Get possible child regions of a given schema/region parent
     *
     * @param regionSchema
     * @param regionParent
     * @returns {[]}
     */
    getRegionChildren(regionSchema, regionParent) {
        var r = [];
        for (var k in this.data[regionSchema][regionParent]) {
            r.push(this._rid(k)[0])
        }
        return r;
    }

    /*******************************************************************
     * Data processing: associate abs statistics
     *******************************************************************/

    /**
     * Assign statistics data from an UnderlayData instance
     *
     * @param features
     * @param dateType
     */
    assignStatInfoToGeoJSON(features, dateType) {
        dateType = dateType || DateType.today();

        for (let feature of features) {
            let properties = feature.properties;
            let regionType = new RegionType(
                properties['regionSchema'],
                properties['regionParent'],
                properties['regionChild']
            );

            let statInfo = this.getOnOrBeforeDate(regionType, dateType);
            if (!statInfo) {
                continue;
            }

            properties['stat'] = statInfo.getValue();
            properties['statDate'] = statInfo.getUpdatedDate().toString();
        }

        return features;
    }

    /********************************************************************
     * Get by dates
     ********************************************************************/

    /**
     * Get a single time series item by a given date
     *
     * @param regionType RegionType instance
     * @param dateType a DateType instance
     * @returns {*[]}
     */
    getByDate(regionType, dateType) {
        var [regionSchemaID, regionParentID, regionChildID] = this._rid(regionType);
        var values = this.data[regionSchemaID][regionParentID][regionChildID];

        for (var i=0; i<values.length; i+=2) {
            if (new DateType(values[i]).toString() === dateType.toString()) {
                return new DataPoint(
                    new DateType(values[i]), values[i+1]
                );
            }
        }
    }

    /**
     * Get the first TimeSeriesItem instance of the
     * datapoint immediately on or before a given date
     *
     * @param regionType a RegionType instance
     * @param dateType a DateType instance
     * @returns {*[]}
     */
    getOnOrBeforeDate(regionType, dateType) {
        // Values are sorted newest to oldest
        var values = this._getValuesByRID(regionType);
        var dateTypeString = dateType.toString();

        for (var i=0; i<values.length; i+=2) {
            if (values[i] <= dateTypeString) {
                return new DataPoint(
                    new DateType(values[i]), values[i+1]
                );
            }
        }
    }

    /**
     * Get the first TimeSeriesItem instance of the
     * datapoint immediately on or after a given date
     *
     * @param regionType a RegionType instance
     * @param dateType a DateType instance
     * @returns {*[]}
     */
    getOnOrAfterDate(regionType, dateType) {
        var values = this._getValuesByRID(regionType);
        var dateTypeString = dateType.toString();

        for (var i=values.length-2; i>=0; i-=2) {
            if (values[i] >= dateTypeString) {
                return new DataPoint(
                    new DateType(values[i]), values[i+1]
                );
            }
        }
    }

    /**
     * Get a range of items as a new TimeSeriesItems object
     *
     * @param regionType the region schema, region parent and
     *        region child as a RegionType instance
     * @param dateRangeType the from/to dates as a
     *        DateRangeType instance
     * @returns {[]}
     */
    getDateRange(regionType, dateRangeType) {
        var r = new DataPoints(this, regionType);
        var values = this._getValuesByRID(regionType);

        var fromDateString = dateRangeType.getFromDate().toString();
        var toDateString = dateRangeType.getToDate().toString();

        for (var i=0; i<values.length; i+=2) {
            if (fromDateString <= values[i] <= toDateString) {
                var timeSeriesItem = new DataPoint(
                    new DateType(values[i]), values[i+1]
                );
                r.push(timeSeriesItem);
            }
        }
        return r;
    }

    /********************************************************************
     * Get max/min/median values
     ********************************************************************/

    /**
     * Get the maximum, minimum and median values
     *
     * @returns {{min: number, median: *, max: number}}
     */
    getMaxMinValues() {
        if (this.__maxMinStatVal) {
            // Cache values to improve performance
            return this.__maxMinStatVal;
        }

        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (let schema of this.getRegionSchemas()) {
            for (let regionParent of this.getRegionParents()) {
                for (let regionChild of this.getRegionChildren()) {
                    var values = this.data[schema][regionParent][regionChild];

                    for (let i=0; i<values.length; i+=2) {
                        let value = values[i+1];
                        if (value === '') continue;
                        if (value > max) max = value;
                        if (value < min) min = value;
                        allVals.push(value);
                    }
                }
            }
        }

        allVals.sort();

        let r = {
            'max': max,
            'min': min,
            'median': allVals[Math.round(allVals.length / 2.0)]
        };
        this.__maxMinStatVal = r;
        return r;
    }
}

export default UnderlayData;

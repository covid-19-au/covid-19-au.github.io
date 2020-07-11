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
    constructor(casesData, regionsDateIds,
                dataType, updatedDate,
                regionSchema, regionParent) {

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
     * Get all possibile region children which
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
     * Data processing: associate case nums
     *******************************************************************/

    /**
     * Assign cases time series data from a CasesData instance
     *
     * @param features
     * @param ageRange
     */
    getCaseInfoGeoJSON(inputGeoJSON, ageRange, dateRangeType,
                       ignoreChildren, iso3166WithinView) {

        ignoreChildren = ignoreChildren || new Set();
        let max = -9999999999999,
            min = 9999999999999;

        let out = [];

        for (let feature of inputGeoJSON.features) {
            let properties = feature.properties;

            if (
                (
                    properties['regionSchema'] === 'admin_0' ||
                    properties['regionSchema'] === 'admin_1'
                )
                && !iso3166WithinView.has(properties['regionChild'])
            ) {
                console.log(`Ignoring child due to not in view: ${properties['regionSchema']}->${properties['regionChild']}`);
                continue;
            }
            else if (
                properties['regionSchema'] !== 'admin_0' &&
                properties['regionSchema'] !== 'admin_1' &&
                !iso3166WithinView.has(this.regionParent)
            ) {
                console.log(`Ignoring *ALL* parent due to not in view: ${properties['regionSchema']}->${properties['regionChild']}`);
                continue;
            }
            else if (
                ignoreChildren.has(`${properties['regionSchema']}||${properties['regionChild']}`) || (
                    properties['regionSchema'] === 'admin_1' &&
                    ignoreChildren.has(`${properties['regionSchema']}||${properties['regionChild'].split('-')[0]}`)
                )
            ) {
                // Make it so children such as AU-TAS will replace AU
                console.log(`Ignoring child: ${properties['regionSchema']}->${properties['regionChild']}`);
                continue;
            }
            else if (!parseInt(properties.largestItem)) {
                // Ignore smaller islands etc, only add each region once!
                out.push(feature);
                continue;
            }

            let regionType = new RegionType(
                properties['regionSchema'],
                properties['regionParent'],
                properties['regionChild']
            );

            let timeSeriesItem;
            if (!dateRangeType) {
                timeSeriesItem = this.getCaseNumber(regionType, ageRange);
            }
            else {
                // This method really should accept a specific time period!
                timeSeriesItem = this.getCaseNumberOverNumDays(regionType, ageRange, dateRangeType.getDifferenceInDays());   // HACK!!!! ===================================
            }

            if (!timeSeriesItem) {
                console.log(`No data for ${regionType.prettified()} (${regionType.getRegionChild()})`);
                out.push(feature);
                continue;
            }
            //console.log(`Data found for ${regionType.prettified()} (${regionType.getRegionChild()})`);

            if (timeSeriesItem.getDaysSince) {
                var dayssince = this.getDaysSince(regionType, ageRange);
                if (dayssince != null) {
                    properties['dayssince'] = dayssince;
                    properties['revdayssince'] = 1000000-(dayssince*2);
                }
            }

            properties['cases'] = timeSeriesItem.getValue();
            properties['negcases'] = -timeSeriesItem.getValue();
            properties['casesFmt'] = Fns.getCompactNumberRepresentation(timeSeriesItem.getValue(), 1);
            properties['casesSz'] = this._getCasesSize(feature);

            if (properties.cases && properties.cases < min) min = properties.cases;
            if (properties.cases && properties.cases > max) max = properties.cases;

            out.push(feature);
        }

        //console.log(JSON.stringify(features));
        let r = Fns.geoJSONFromFeatures(out);
        r.max = out.length ? max : 0;
        r.min = out.length ? min : 0;
        return r;
    }

    /**
     * Make it so that there's roughly enough area
     * within circles to be able to display the text.
     *
     * This also makes it so that e.g. 100 is slightly
     * smaller than 999 etc. It's hard to find a good
     * balance here, and it may not work well for
     * millions or above.
     *
     * @param feature
     * @returns {*}
     * @private
     */
    _getCasesSize(feature) {
        var len = feature.properties['casesFmt'].length,
            absCases = Math.abs(feature.properties['cases']),
            isNeg = feature.properties['cases'] < 0.0,
            r;

        // TODO: Make millions slightly larger than thousands!
        if (100000000 >= absCases >= 10000000) {
            r = len+absCases/100000000.0;
        }
        else if (absCases >= 1000000) {
            r = len+absCases/10000000.0;
        }
        else if (absCases >= 100000) {
            r = len+absCases/1000000.0;
        }
        else if (absCases >= 10000) {
            r = len+absCases/100000.0;
        }
        else if (absCases >= 1000) {
            r = len+absCases/10000.0;
        }
        else if (absCases >= 100) {
            r = len+absCases/1000.0;
        }
        else if (absCases >= 10) {
            r = len+absCases/100.0;
        }
        else if (absCases >= 1) {
            r = len+absCases/10.0;
        }
        else {
            r = len;
        }
        return isNeg ? -r : r;
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
        if (this.schema === 'statewide') { // FIXME!!!! =====================================================================
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
                            latest.getDateType(),
                            latest.getValue() - parseInt(iValue)
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
            latest.getDateType(), 0
        );
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
            if (iRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
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
            let iRegionType = new RegionType(this.regionSchema, this.regionParent, iRegion);
            var value = this.getCaseNumber(iRegionType, iAgeRange);  // TODO: Is this call necessary?? ===============
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

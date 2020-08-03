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
import DateRangeType from "./DateRangeType";
import DataPoint from "./DataPoint";
import DataPoints from "./DataPoints";


class DataPointsCollection extends Array {
    constructor(dataPointsInsts, defaultValue) {
        super();
        let dateRange = null;
        this.defaultValue = defaultValue;

        for (let dataPointsInst of dataPointsInsts||[]) {
            if (!dateRange) {
                dateRange = dataPointsInst.getDateRangeType();
            } else {
                dateRange = dateRange.addedTo(
                    dataPointsInst.getDateRangeType()
                );
            }
        }

        if (dateRange) {
            // Make sure blanks are filled in for the entire date range!
            for (let dataPointsInst of dataPointsInsts||[]) {
                dataPointsInst = dataPointsInst.missingDaysFilledIn(
                    dateRange, defaultValue
                );
                this.push(dataPointsInst);
            }
        }
    }

    /********************************************************************
     * Clone/copy collection of datapoints
     ********************************************************************/

    /**
     *
     */
    clone() {
        return new DataPointsCollection(this, this.defaultValue);
    }

    /**
     * Create a new copy of this DataPointsCollection, but without any
     * of the DataPoints instances supplied in the array `dataPointsInsts`
     *
     * @param dataPointsInsts
     */
    cloneExcept(dataPointsInsts) {
        return new DataPointsCollection(this.filter(
            item => dataPointsInsts.indexOf(item) === -1
        ), this.defaultValue);
    }

    /********************************************************************
     * Get maximum/minimum values
     ********************************************************************/

    getMaxValue() {
        // TODO!
    }

    getMinValue() {
        // TODO!
    }

    /********************************************************************
     * Get age ranges/datatypes/region children
     ********************************************************************/

    /**
     *
     * @returns {any[]}
     */
    getAgeRanges() {
        let r = new Set();
        for (let dataPointsInst of this) {
            r.add(dataPointsInst.getAgeRange());
        }
        return Array.from(r);
    }

    /**
     *
     * @returns {any[]}
     */
    getDataTypes() {
        let r = new Set();
        for (let dataPointsInst of this) {
            r.add(dataPointsInst.getDataType());
        }
        return Array.from(r);
    }

    /**
     *
     * @returns {any[]}
     */
    getRegionTypes() {
        let r = [],
            set = new Set();

        for (let dataPointsInst of this) {
            if (set.has(dataPointsInst.getHashKey())) {
                continue;
            }
            set.add(dataPointsInst.getHashKey());
            r.push(dataPointsInst.getRegionType());
        }

        return r;
    }

    /********************************************************************
     * Get DataPoints instances by property
     ********************************************************************/

    /**
     *
     * @param ageRange
     */
    getByAgeRange(ageRange) {
        ageRange = ageRange || '';

        for (let dataPointsInst of this) {
            if (dataPointsInst.getAgeRange() === ageRange) {
                return dataPointsInst;
            }
        }
        return null;
    }

    /**
     *
     * @param dataType
     */
    getByDataType(dataType) {
        for (let dataPointsInst of this) {
            if (dataPointsInst.getDataType() === dataType) {
                return dataPointsInst;
            }
        }
        return null;
    }

    /**
     *
     * @param regionType
     */
    getByRegionType(regionType) {
        for (let dataPointsInst of this) {
            if (dataPointsInst.getRegionType().equalTo(regionType)) {
                return dataPointsInst;
            }
        }
        return null;
    }

    /********************************************************************
     * Merge
     ********************************************************************/

    /**
     * Reduce down to just the highest case
     * numbers over `averageOverDays` days
     *
     * @param leaveRegionTypesAsIs
     * @param category
     * @param averageOverDays
     */
    otherRegionsMergedIntoCategory(leaveRegionTypesAsIs, category, averageOverDays) {

    }

    /**
     *
     * @param ageRange1
     * @param ageRange2
     */
    ageRangeMerged(ageRange1, ageRange2) {
        let dataPoints1 = this.getByAgeRange(ageRange1),
            dataPoints2 = this.getByAgeRange(ageRange2);

        let newDataPoints = dataPoints1.map(function(dataPoint1, i) {
            let dataPoint2 = dataPoints2[i];
            if (!dataPoint1.getDateType().equalTo(dataPoint2.getDateType())) {
                throw "Shouldn't get here!";
            }
            return new DataPoint(
                dataPoint1.getDateType(),
                dataPoint1.getValue()+dataPoint2.getValue()
            );
        });

        return dataPoints1.cloneWithoutDatapoints(newDataPoints);
    }

    /**
     *
     * @param dataType1
     * @param dataType2
     */
    dataTypesMerged(dataType1, dataType2) {
        let dataPoints1 = this.getByDataType(dataType1),
            dataPoints2 = this.getByDataType(dataType2);

        let newDataPoints = dataPoints1.map(function(dataPoint1, i) {
            let dataPoint2 = dataPoints2[i];
            if (!dataPoint1.getDateType().equalTo(dataPoint2.getDateType())) {
                throw "Shouldn't get here!";
            }
            return new DataPoint(
                dataPoint1.getDateType(),
                dataPoint1.getValue()+dataPoint2.getValue()
            );
        });

        return dataPoints1.cloneWithoutDatapoints(newDataPoints);
    }
}

export default DataPointsCollection;

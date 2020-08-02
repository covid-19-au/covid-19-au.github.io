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


class DataPointsCollection extends Array {
    constructor(dataPointsInsts) {
        super();
        let fromDateType, toDateType;

        for (let dataPointsInst of dataPointsInsts||[]) {
            for (let dataPoint of dataPointsInsts) {
                if (!fromDateType || dataPoint.getDateType() < fromDateType) {
                    fromDateType = FIXME;
                }
                if (!toDateType || dataPoint.getDateType() > toDateType) {
                    toDateType = FIXME;
                }
            }
            this.push(dataPointsInst);
        }

        if (fromDateType && toDateType) {
            this.dateRangeType = new DateRangeType(
                fromDateType, toDateType
            );

            // TODO: MAKE SURE BLANKS ARE FILLED IN FOR THE ENTIRE DATE RANGE!!!!
        }
    }

    push(item) {

        super.push(item);
    }

    /********************************************************************
     * Get age ranges/datatypes/region children
     ********************************************************************/

    /**
     *
     */
    getAgeRanges() {

    }

    /**
     *
     */
    getDataTypes() {

    }

    /**
     *
     */
    getRegionChildren() {

    }

    /********************************************************************
     * Get DataPoints instances by property
     ********************************************************************/

    /**
     *
     * @param ageRange
     */
    getByAgeRange(ageRange) {

    }

    /**
     *
     * @param dataType
     */
    getByDataType(dataType) {

    }

    /**
     *
     * @param regionType
     */
    getByRegionType(regionType) {

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
    mergeOtherRegionsIntoCategory(leaveRegionTypesAsIs, category, averageOverDays) {

    }

    /**
     *
     * @param ageRange1
     * @param ageRange2
     */
    mergeAgeRanges(ageRange1, ageRange2) {

    }

    /**
     *
     * @param dataType1
     * @param dataType2
     */
    mergeDataTypes(dataType1, dataType2) {

    }
}

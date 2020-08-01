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

import DateType from "./DateType";

let DAY_IN_MILLISECONDS = 86400000;


class DateRangeType {
    /**
     * A date range with from/to dates, represented by two DateType's
     *
     * @param fromDate the DateType instance representing the "from" date
     * @param toDate the DateType instance representing the "to" date
     */
    constructor(fromDate, toDate) {
        this.setDateRange(fromDate, toDate);
    }

    /**
     *
     * @param dateRangeType
     * @returns {boolean}
     */
    equalTo(dateRangeType) {
        return this.toString() === dateRangeType.toString();
    }

    /********************************************************************
     * Get/set from/to dates
     ********************************************************************/

    /**
     * Get the "from" range DateType object
     *
     * @returns {*}
     */
    getFromDate() {
        return this.fromDate;
    }

    /**
     * Get the "to" range DateType object
     *
     * @returns {*}
     */
    getToDate() {
        return this.toDate;
    }

    /**
     * Set the "from" and "to" range of this date range object
     *
     * @returns {*}
     */
    setDateRange(fromDate, toDate) {
        if (fromDate > toDate) {
            throw `fromDate ${fromDate} should be less than or equal to toDate ${toDate}`;
        }
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

    /********************************************************************
     * Miscellaneous convenience Fns
     ********************************************************************/

    /**
     * Get an array of DateType's which this
     * date range pertains to (inclusive)
     *
     * @returns {*}
     */
    toArrayOfDateTypes() {
        let daysOffsetInMs = 0,
            r = [];

        while (true) {
            let iDate = new DateType(this.fromDate+daysOffsetInMs);
            if (iDate > this.toDate) {
                break;
            }
            r.push(iDate);
            daysOffsetInMs += DAY_IN_MILLISECONDS;
        }
        return r;
    }

    /**
     * Expand two date ranges together to include the complete
     * time range encompassed by both DateRangeType's
     *
     * @param otherDateRangeType
     * @returns {DateRangeType}
     */
    addedTo(otherDateRangeType) {
        let fromDate,
            toDate;

        if (otherDateRangeType.getFromDate() < this.getFromDate()) {
            fromDate = otherDateRangeType.getFromDate();
        } else {
            fromDate = this.getFromDate();
        }

        if (otherDateRangeType.getToDate() > this.getFromDate()) {
            toDate = otherDateRangeType.getToDate();
        } else {
            toDate = this.getToDate();
        }

        return new DateRangeType(fromDate, toDate);
    }

    /********************************************************************
     * Date queries
     ********************************************************************/

    /**
     * Gets the difference in days between the to and from dates
     *
     * @returns {number}
     */
    getDifferenceInDays() {
        return (this.toDate.getTime()-this.fromDate.getTime()) / DAY_IN_MILLISECONDS;
    }

    /**
     * Returns true if dateType or Date object `dateType`
     * is between this date range, otherwise false
     *
     * @param dateType
     * @returns {boolean}
     */
    isDateWithinRange(dateType) {
        return this.fromDate <= dateType <= this.toDate;
    }

    /********************************************************************
     * Get string representation
     ********************************************************************/

    /**
     * Get this date range as a pretty-printed
     * DD/MM/YYYY-DD/MM/YYYY format
     *
     * @returns {string}
     */
    prettified() {
        return (
            this.fromDate.prettified() +
            '-' +
            this.toDate.prettified()
        );
    }

    /**
     * Convert to YYYY_MM_DD-YYYY_MM_DD
     * (binary sortable) format
     *
     * @returns {string}
     */
    toString() {
        return (
            this.fromDate.toString() +
            '-' +
            this.toDate.toString()
        )
    }
}

export default DateRangeType;

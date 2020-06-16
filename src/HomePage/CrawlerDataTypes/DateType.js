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


/**
 * Get a new DateType instance initialized to the current day
 * @returns {DateType}
 */
function getToday() {
    // TODO!
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return new DateType(today);
}


class DateType extends Date {
    /**
     * A date type which inherits from Date (so can be used as one),
     * but which only to be used with a year, month and day
     * (with no hours, minutes etc).
     *
     * Months and days can also be optional if they aren't provided
     * by the source, as with some kinds of underlay data.
     *
     * Constructor accepts JavaScript Date instances, DateType
     * instances, YYYY_MM_DD "binary sortable" format,
     * DD/MM/YYYY date
     */
    constructor() {
        var years, months, days;

        if (typeof arguments[0] === 'string') {
            // Validate and parse as string
            var s = arguments[0];

            if (s.indexOf('/') !== -1) {
                // In DD/MM/YYYY format
                [days, months, years] = s.split('_');
                years = parseInt(years);
                months = parseInt(months);
                days = parseInt(days);
            }
            else if (s.length === 10) {
                // Years, months and days
                [years, months, days] = s.split('_');
                years = parseInt(years);
                months = parseInt(months);
                days = parseInt(days);
            }
            else if (s.length === 7) {
                // Years and months
                [years, months] = s.split('_');
                years = parseInt(years);
                months = parseInt(months);
            }
            else if (s.length === 4) {
                // Years only
                years = parseInt(s);
            }
        }
        else if (typeof arguments[0].getMonth === 'function') {
            // Passed a date, so use the
            // supplied years/months/days
            years = arguments[0].getYear();
            months = arguments[0].getMonth()-1;
            days = arguments[0].getDay();
        }
        else {
            // Use supplied years/months/days
            years = arguments[0];
            months = arguments[1];
            days = arguments[2];
        }

        super(
            years,
            months == null ? 0 : months-1,
            days == null ? 0 : days
        );
        this.setHours(0, 0, 0, 0);

        this.years = years;
        this.months = months;
        this.days = days;
    }

    /**
     * Returns whether this DateType instance is of the same day to another
     *
     * @param dateType
     * @returns {boolean}
     */
    equalTo(dateType) {
        return this.toString() === dateType.toString();
    }

    /********************************************************************
     * Get whether today
     ********************************************************************/

    /**
     * Return whether this DateType instance is today
     *
     * @returns {boolean}
     */
    isToday() {
        return getToday().toString() === this.toString();
    }

    /********************************************************************
     * Get difference in days
     ********************************************************************/

    /**
     * Get the difference in days between
     * this DateType instance and today
     *
     * @returns {number}
     */
    numDaysSince() {
        // Get number of days ago from today and
        // `dateString` in dd/mm/yyyy format
        // NOTE: returns a *positive* number if
        // `dateString` is in the past
        var today = getToday();
        return this.dateDiff(this, today); // CHECK ME!!! ================================================
    }

    /**
     * Get the difference in days between this DateType
     * instance and another supplied DateType instance
     *
     * @param otherDateType
     * @returns {number}
     */
    dateDiff(otherDateType) {
        // Get the difference in days between
        // the first and second `Date` instances
        return Math.round((otherDateType - this) / (1000 * 60 * 60 * 24));
    }

    /********************************************************************
     * Add/subtract days
     ********************************************************************/

    /**
     * Add days to this DateType, returning a new DateType object
     *
     * @param days
     * @returns {DateType}
     */
    daysAdded(days) {
        if (this.months == null || this.days == null) {
            throw "Can't add days if days weren't specified in constructor!";
        }
        return new DateType(this + days);
    }

    /**
     * Subtract days from this DateType, returning a new DateType object
     *
     * @param days
     * @returns {DateType}
     */
    daysSubtracted(days) {
        if (this.months == null || this.days == null) {
            throw "Can't add days if days weren't specified in constructor!";
        }
        return new DateType(this - days);
    }

    /********************************************************************
     * Convert to string
     ********************************************************************/

    /**
     * Get the date in prettified DD/MM/YYYY format
     *
     * @returns {string}
     */
    prettified() {
        if (this.months != null && this.days != null) {
            return `${this.days}/${this.months}/${this.years}`;
        }
        else if (this.months != null) {
            return `${this.months}/${this.years}`;
        }
        else {
            return `${this.years}`;
        }
    }

    /**
     * Get the date in binary-sortable YYYY_MM_DD format
     *
     * @returns {string}
     */
    toString() {
        if (this.months != null && this.days != null) {
            return `${this.years}_${this.months}_${this.days}`;
        }
        else if (this.months != null) {
            return `${this.years}_${this.months}`;
        }
        else {
            return `${this.years}`;
        }
    }
}

export default DateType;

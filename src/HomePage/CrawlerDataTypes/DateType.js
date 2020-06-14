function getToday() {
    // TODO!
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return new DateType(today);
}


class DateType extends Date {
    /**
     * A date type which inherits from Date (so can be used as one),
     * but which only has years, months and days.
     *
     * Months and days can also be optional if they aren't provided
     * by the source, as with some kinds of underlay data.
     *
     * Constructor accepts JavaScript Date instances, DateType
     * instances,
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

    /********************************************************************
     * Get whether today
     ********************************************************************/

    /**
     * Return whether this DateType instance is today
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

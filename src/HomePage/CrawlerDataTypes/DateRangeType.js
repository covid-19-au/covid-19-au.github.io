class DateRangeType {
    constructor(fromDate, toDate) {
        if (fromDate > toDate) {
            throw `fromDate ${fromDate} should be greater than toDate ${toDate}`;
        }
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

    /********************************************************************
     *
     ********************************************************************/

    getFromDate() {
        return this.fromDate;
    }

    getToDate() {
        return this.toDate;
    }

    /********************************************************************
     *
     ********************************************************************/

    getDifferenceInDays() {
        return this.toDate-this.fromDate;
    }

    /********************************************************************
     *
     ********************************************************************/

    getPrettifiedValue() {
        return (
            this.fromDate.prettified() +
            '-' +
            this.toDate.prettified()
        );
    }

    toString() {
        return (
            this.fromDate.toString() +
            '-' +
            this.toDate.toString()
        )
    }
}

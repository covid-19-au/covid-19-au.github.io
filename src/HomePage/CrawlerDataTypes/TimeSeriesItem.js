class TimeSeriesItem extends Array {
    constructor(dataType, dateType, numberType) {
        super([dateType, numberType]);
        this.dataType = dataType;
    }

    getDataType() {
        return this.dataType;
    }

    getDate() {
        return this[0];
    }

    getValue() {
        return this[1];
    }
}

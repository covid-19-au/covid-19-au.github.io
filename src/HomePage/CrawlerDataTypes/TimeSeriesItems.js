class TimeSeriesItems extends Array {
    constructor(dataSource, regionType, ageRange, fromDate, toDate, dataType, items) {

        // TODO: Should the regional population, per capita population etc be specified somewhere?? =======================

        super();
        if (items) {
            for (var item of items) {
                this.push(item);
            }
        }

        this.dataSource = dataSource;
        this.regionType = regionType;
        this.ageRange = ageRange;
        this.dataType = dataType;
    }

    /********************************************************************
     * Get information about the data source etc
     ********************************************************************/

    getDataSource() {
        return this.dataSource;
    }

    getRegionType() {
        return this.regionType;
    }

    getAgeRange() {
        return this.ageRange;
    }

    getDataType() {
        return this.dataType;
    }

    /********************************************************************
     * Get days since value change
     ********************************************************************/

    /**
     *
     */
    getDaysSinceLastIncrease() {

    }

    /**
     *
     */
    getDaysSinceLastDecrease() {

    }

    /********************************************************************
     * Get data for CanvasJS graphs
     ********************************************************************/

    /**
     *
     * @returns {{x: *, y: *}[]}
     */
    getCanvasJSData() {
        return this.items.map((item) => {
            return {
                x: item[0],
                y: item[1]
            }
        });
    }
}

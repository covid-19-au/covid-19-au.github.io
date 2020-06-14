class CovidUnderlayData {
    /**
     *
     * @param data
     */
    constructor(data) {
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
                "region_schema": {
                    "region_parent": {
                        "region_child": [YYYY_MM_DD, value, YYYY_MM_DD, value, ...]
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
    }

    /********************************************************************
     * IDs to values (decompression to save downloads)
     ********************************************************************/

    /**
     *
     * @param args
     * @returns {*[]}
     * @private
     */
    _rid(...args) {
        return args.map((s) => this.regionIDs[s]);
    }

    /**
     *
     * @param args
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

    /********************************************************************
     * Get by dates
     ********************************************************************/

    /**
     * Get a single time series item by a given date
     * @param regionSchema
     * @param regionParent
     * @param regionChild
     * @param date the date in YYYY_MM_DD format
     * @returns {*[]}
     */
    getByDate(regionSchema, regionParent, regionChild, date) {
        /*

         */
        var [regionSchemaID, regionParentID, regionChildID] = this._rid(
            regionSchema, regionParent, regionChild
        );

        var values = this.data[regionSchemaID][regionParentID][regionChildID];
        for (var i=0; i<values.length; i+=2) {
            if (values[i] === date) {
                return [values[i], values[i+1]];
            }
        }
    }

    /**
     *
     * @param regionSchema
     * @param regionParent
     * @param regionChild
     * @param date the date in YYYY_MM_DD format
     * @returns {*[]}
     */
    getOnOrBeforeDate(regionSchema, regionParent, regionChild, date) {
        /*

         */
        var [regionSchemaID, regionParentID, regionChildID] = this._rid(
            regionSchema, regionParent, regionChild
        );

        // Values are sorted newest to oldest
        var values = this.data[regionSchemaID][regionParentID][regionChildID];
        for (var i=0; i<values.length; i+=2) {
            if (values[i] <= date) {
                return [values[i], values[i+1]];
            }
        }
    }

    /**
     *
     * @param regionSchema
     * @param regionParent
     * @param regionChild
     * @param date the date in YYYY_MM_DD format
     * @returns {*[]}
     */
    getOnOrAfterDate(regionSchema, regionParent, regionChild, date) {
        /*

         */
        var [regionSchemaID, regionParentID, regionChildID] = this._rid(
            regionSchema, regionParent, regionChild
        );

        var values = this.data[regionSchemaID][regionParentID][regionChildID];
        for (var i=values.length-2; i>=0; i-=2) {
            if (values[i] >= date) {
                return [values[i], values[i+1]];
            }
        }
    }

    /**
     * Get a range of items as a new TimeSeriesItems object
     * @param regionSchema
     * @param regionParent
     * @param regionChild
     * @param fromDate the from date in YYYY_MM_DD format
     * @param toDate the to date in YYYY_MM_DD format
     * @returns {[]}
     */
    getDateRange(regionSchema, regionParent, regionChild, fromDate, toDate) {
        var r = new TimeSeriesItems(
            this, regionSchema, regionParent, regionChild,
            null, fromDate, toDate, dataType
        );
        var [regionSchemaID, regionParentID, regionChildID] = this._rid(
            regionSchema, regionParent, regionChild
        );

        var values = this.data[regionSchemaID][regionParentID][regionChildID];
        for (var i=0; i<values.length; i+=2) {
            if (fromDate <= values[i] <= toDate) {
                r.push(new TimeSeriesItem(
                    dataType, new DateType(values[i]), new NumberType(values[i+1])
                ));
            }
        }
        return r;
    }
}

function reduceAgeRangeCategories() {
    let arr = new __AgeRangeReducer(ageRangeData, maxCats, maxUnknown);
    let mergeMap = arr.getMergeMap();
    // ...
}



class __AgeRangeReducer {
    /**
     *
     * @param ageRangeData
     * @param maxCats
     * @param maxUnknown
     */
    constructor(ageRangeData, maxCats, maxUnknown) {
        // TODO: Should the age ranges be based
        //  on the newest, or based on an average?
        this.ageRangeData = ageRangeData; // {ageRange: }
        this.maxCats = maxCats;
        this.maxUnknown = maxUnknown;
    }

    getMergeMap() {
        let unknown = 0,
            ageRanges = []; // [[fromAge, toRange/null, TimeSeriesItem instance], ...]

        // ...

        ageRanges.sort((x, y) => x[0] - y[0] || x[1] - y[1]);

        let mergeMap = {};

        // ...

        return mergeMap;
    }

    getMergedAgeRangeDatapoints(timeSeriesItems) {
        // ...
    }
}
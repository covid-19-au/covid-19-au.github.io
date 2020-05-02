import ConfirmedMapFns from "./ConfirmedMapFns";


class DataSourceBase {
    constructor(sourceName) {
        this._sourceName = sourceName;
    }

    getSourceName() {
        return this._sourceName;
    }
}


class TimeSeriesDataSource extends DataSourceBase {
    /*
    A datasource which contains values over time

    In format:
    {
     "sub_headers" [subheader name 1, subheader name 2 ...]
     "data": [["", "0-9", [["01/05/2020", 0], ...],
              ["", "0-9", [["01/05/2020", 0], ...], ...]
    }
    the first value in each data item is the
    city name/region, and the second is the agerange.

    NOTE: state names/city names supplied to this
    class must be lowercased and have ' - ' replaced with '-'.
    This is way too resource-intensive to run otherwise!
    */

    constructor(sourceName, subHeader, mapAreaData, schema, stateName) {
        super(sourceName);
        this.subHeaderIndex = mapAreaData['sub_headers'].indexOf(subHeader);

        this.subHeader = subHeader;
        this.data = mapAreaData['data'];

        this.schema = schema;
        this.stateName = stateName;
    }

    getCaseNumber(region, ageRange) {
        // Return only the latest value

        if (this.currentValues) {
            return this.currentValues.getCaseInfoForCity(
                this.stateName, region
            );
        }

        region = ConfirmedMapFns.prepareForComparison(region || '');
        ageRange = ageRange || '';

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iRegion = iData[0],
                iAgeRange = iData[1],
                iValues = iData[2];

            if (
                (this.schema === 'statewide' || iRegion === region) &&
                iAgeRange === ageRange
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        return {
                            'numCases': parseInt(iValue),
                            'updatedDate': dateUpdated
                        }
                    }
                }
            }
        }
        return {
            'numCases': 0,
            'updatedDate': dateUpdated
        };
    }

    getCaseNumberTimeSeries(region, ageRange) {
        var r = [];

        region = ConfirmedMapFns.prepareForComparison(region || '');
        ageRange = ageRange || '';

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iRegion = iData[0],
                iAgeRange = iData[1],
                iValues = iData[2];

            if (
                (this.schema === 'statewide' || iRegion === region) &&
                iAgeRange === ageRange
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        // May as well use CanvasJS format
                        r.push({
                            x: ConfirmedMapFns.parseDate(dateUpdated),
                            y: parseInt(iValue)
                        });
                    }
                }
            }
        }
        return r;
    }

    /*getCaseInfoForCity(stateName, cityName) {
        // Return the latest value - the value 14 days ago,
        // to get a general idea of how many active cases there
        // still are. This isn't going to be very accurate,
        // but better than nothing.
        var oldest = null;
        var latest = super.getCaseInfoForCity(
            stateName, cityName
        );
        if (!latest) {
            return null;
        }

        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i];
            var iStateName = iData[0],
                iCityName = iData[1],
                iValues = iData[2];

            if (
                iStateName === stateName &&
                iCityName === cityName
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    oldest = {
                        'numCases': latest['numCases'] - parseInt(iValue),
                        'updatedDate': latest['updatedDate']
                    };

                    if (dateDiffFromToday(dateUpdated) > this.daysAgo) {
                        return oldest;
                    }
                }
            }
        }

        // Can't do much if data doesn't go back
        // that far other than show oldest we can
        return oldest || {
            'numCases': 0,
            'updatedDate': latest['updatedDate']
        };
    }

    getCaseInfoTimeSeriesForCity(stateName, cityName) {
        var r = [];
        var values = super.getCaseInfoTimeSeriesForCity(
            stateName, cityName
        );

        for (var i = 0; i < values.length; i++) {
            var iData = values[i];
            if (dateDiff(iData.x, getToday()) > this.daysAgo) {
                continue;
            }
            r.push(iData);
        }
        return r;
    }*/
}

export default TimeSeriesDataSource;

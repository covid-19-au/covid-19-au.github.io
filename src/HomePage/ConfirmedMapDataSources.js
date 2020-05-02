import {
    prepareForComparison, parseDate,
    dateDiffFromToday, getToday, dateDiff
} from "./ConfirmedMapFns";
import absStatsData from "../data/absStats";


const absStats = absStatsData['data'],
    absStatsStates = absStatsData['states'],
    absStatsLGANames = absStatsData['lga_names'];

// TODO: Should these be here?
exports.absStats = absStats;
exports.absStatsStates = absStatsStates;
exports.absStatsLGANames = absStatsLGANames;


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

        region = prepareForComparison(region || '');
        ageRange = ageRange || '';

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iRegion = iData[0],
                iAgeRange = iData[1],
                iValues = iData[2];

            if (
                iRegion === region &&
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

        region = prepareForComparison(region || '');
        ageRange = ageRange || '';

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iRegion = iData[0],
                iAgeRange = iData[1],
                iValues = iData[2];

            if (
                iRegion === region &&
                iAgeRange === ageRange
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        // May as well use CanvasJS format
                        r.push({
                            x: parseDate(dateUpdated),
                            y: parseInt(iValue)
                        });
                    }
                }
            }
        }
        return r;
    }
}
exports.TimeSeriesDataSource = TimeSeriesDataSource;


class ActiveTimeSeriesDataSource extends TimeSeriesDataSource {
    // NOTE: This is only for states which don't supply
    // specfic info about which cases are active!!!
    constructor(sourceName, subHeader, mapAreaData, daysAgo) {
        super(sourceName, subHeader, mapAreaData, null);
        this.daysAgo = daysAgo;
    }

    getCaseInfoForCity(stateName, cityName) {
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
    }
}
exports.ActiveTimeSeriesDataSource = ActiveTimeSeriesDataSource;


class BigTableOValuesDataSource extends DataSourceBase {
    /*
    A datasource which contains a subheader list, and
    corresponding data.
    (Note class instances of this only correspond to a single
     header/subheader!)

    Data in format:

     [STATE NAME??,
      LGA name,
      value for header 1/subheader 1,
      value for header 2/subheader 2,
      ...]

    This is useful for Australian Bureau of Statistics stats
    etc, where there are a lot of values in
    categories/subcategories, but we're only interested in
    the most recent ones. Much more space-efficient to do
    this than store in hash tables!

    Essentially this is a JSON equivalent of CSV, the CSV
    file being based on ones downloaded from ABS.
    */
    constructor(sourceName, header, subHeader, mapAreaData) {
        super(sourceName);
        this.header = header;
        this.subHeader = subHeader;
        this.subHeaderIndex = mapAreaData['sub_headers'].indexOf(subHeader);
        var today = getToday();
        this.updatedDate = (
            today.getDay() + '/' +
            today.getMonth() + '/' +
            today.getFullYear()
        );
        this.data = mapAreaData['data'];
    }

    getCaseInfoForCity(stateName, cityName) {
        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iStateName = absStatsStates[iData[0]],
                iCityName = absStatsLGANames[iData[1]],
                value = iData[this.subHeaderIndex + 2];

            if (
                iStateName === stateName &&
                iCityName === cityName
            ) {
                return {
                    'numCases': value === '' ? null : value,
                    'updatedDate': this.updatedDate
                };
            }
        }
        //throw "value not found!";
    }

    getMaxMinValues() {
        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                value = iData[this.subHeaderIndex + 2];

            if (value === '') { // value == null
                continue;
            }
            if (value > max) max = value;
            if (value < min) min = value;
            allVals.push(value);
        }

        allVals.sort();
        return {
            'max': max,
            'min': min,
            'median': allVals[Math.round(allVals.length / 2.0)]
        }
    }
}
exports.BigTableOValuesDataSource = BigTableOValuesDataSource;

import ConfirmedMapFns from "./Fns";
import StateLatestNums from "../../data/stateCaseData.json"


function getFromStateCaseData(stateName, subHeader) {
    var dateUpdated = StateLatestNums.updatedTime.split(' ')[1].replace(/[-]/g, '/');

    for (var [
        iStateName, iConfirmed, iDeaths, iRecovered,
        iTested, iInHospital, iInICU, iUnknown
    ] of StateLatestNums.values) {
        if (stateName.toUpperCase() !== iStateName.toUpperCase()) {
            continue;
        }
        else if (subHeader === 'total') {
            return [iConfirmed, dateUpdated];
        }
        else if (subHeader === 'status_deaths') {
            return [iDeaths, dateUpdated];
        }
        else if (subHeader === 'status_recovered') {
            return [iRecovered, dateUpdated];
        }
        else if (subHeader === 'tests_total') { //  CHECK ME!!!
            return [iTested, dateUpdated];
        }
        else if (subHeader === 'status_icu') {
            return [iInICU, dateUpdated];
        }
        else if (subHeader === 'status_hospitalized') {
            return [iInHospital, dateUpdated];
        }
    }
    return null;
}


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

    constructor(sourceName, subHeader, mapAreaData, regionsDateIDs, schema, stateName) {
        super(sourceName);
        this.subHeaderIndex = mapAreaData['sub_headers'].indexOf(subHeader);

        this.subHeader = subHeader;
        this.data = mapAreaData['data'];
        // This is map from {id: date string in format DD/MM/YYYY, ...}
        // as otherwise the data will be a lot larger!
        this.regionsDateIDs = regionsDateIDs;

        this.schema = schema;
        this.stateName = stateName;
    }

    getUpdatedDate() {
        var updatedDates = [];

        if (this.schema === 'statewide') {
            var n = getFromStateCaseData(this.stateName, this.subHeader);
            if (n != null) {
                var d = n[1].split('/');
                updatedDates.push([d[2]+d[1]+d[0], d.join('/')]);
            }
        }
        for (var k in this.regionsDateIDs) {
            var d = this.regionsDateIDs[k].split('/');
            updatedDates.push([d[2]+d[1]+d[0], d.join('/')]);
        }
        updatedDates.sort();

        return updatedDates[updatedDates.length-1][1];
    }

    getCaseNumber(region, ageRange) {
        return this.__getCaseNumber(region, ageRange);
    }

    __getCaseNumber(region, ageRange) {
        // Return only the latest value

        if (this.schema === 'statewide') {
            var n = getFromStateCaseData(this.stateName, this.subHeader);
            if (n != null) {
                return {
                    'numCases': parseInt(n[0]),
                    'updatedDate': n[1]
                }
            }
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
                    var dateUpdated = this.regionsDateIDs[iValues[j][0]],
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

    getDaysSince(region, ageRange) {
        // Return only the latest value

        region = ConfirmedMapFns.prepareForComparison(region || '');
        ageRange = ageRange || '';
        var firstVal = null;

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
                    var dateUpdated = this.regionsDateIDs[iValues[j][0]],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue == null || iValue === '') {
                        continue;
                    }

                    if (firstVal == null) {
                        firstVal = iValue;
                    }
                    else if (firstVal > iValue) {
                        //console.log(dateUpdated+' '+ConfirmedMapFns.dateDiffFromToday(dateUpdated));
                        return ConfirmedMapFns.dateDiffFromToday(dateUpdated)
                    }
                }
            }
        }
        return null;
    }

    getCaseNumberTimeSeries(region, ageRange) {
        var r = [];
        var latest = this.__getCaseNumber(region, ageRange);
        if (latest && latest.numCases) {
            // Make sure we use the manually entered values first!
            r.push({
                x: ConfirmedMapFns.parseDate(latest.updatedDate),
                y: parseInt(latest.numCases)
            });
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
                    var dateUpdated = this.regionsDateIDs[iValues[j][0]],
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
        r.sort((x, y) => x.x - y.x);
        return r;
    }

    getMaxMinValues() {
        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iRegion = iData[0],
                iAgeRange = iData[1];

            // PERFORMANCE WARNING!
            var value = this.getCaseNumber(iRegion, iAgeRange)['numCases'];

            if (value === '' || value == null) {
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

export default TimeSeriesDataSource;

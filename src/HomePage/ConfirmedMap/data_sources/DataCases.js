import ConfirmedMapFns from "../Fns";
import stateNums from "../../../data/state.json"


let stateCaseDataTypes = new Set([
    'total',
    'status_deaths',
    'status_recovered',
    'tests_total',
    'status_icu',
    'status_active',
    'status_hospitalized'
]);


function getFromStateCaseData(stateName, dataType) {
    let dates = ConfirmedMapFns.sortedKeys(stateNums).reverse();
    stateName = stateName.toUpperCase();

    let r = [];
    for (let sortableDate of dates) {
        let [
            confirmed, deaths, recovered,
            tested, active, inHospital, inICU
        ] = stateNums[sortableDate][stateName];

        let map = {
            'total': confirmed,
            'status_deaths': deaths,
            'status_recovered': recovered,
            'tests_total': tested,
            'status_icu': inICU,
            'status_active': active,
            'status_hospitalized': inHospital
        };
        let [yyyy, mm, dd] = sortableDate.split('-');
        let printableDate = `${dd}/${mm}/${yyyy}`;

        if (map[dataType] != null) {
            r.push({
                sortableDate: sortableDate,
                printableDate: printableDate,
                numCases: map[dataType]
            });
        }
    }
    return r;
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

        // Convert DD/MM/YYYY format to date objects
        // which can be more easily compared etc
        this.regionObjDateIDs = {};
        for (let dateId in regionsDateIDs) {
            this.regionObjDateIDs[dateId] = ConfirmedMapFns.parseDate(regionsDateIDs[dateId]);
        }
    }

    getUpdatedDate() {
        if (this._updated) {
            // Cache to improve performance if possible
            return this._updated;
        }
        var updatedDates = [];

        if (this.schema === 'statewide' && stateCaseDataTypes.has(this.subHeader)) {
            let n = getFromStateCaseData(this.stateName, this.subHeader);
            for (let [sortableDate, printableDate, value] of n) {
                updatedDates.push([sortableDate, printableDate]);
            }
        } else {
            for (var i = 0; i < this.data.length; i++) {
                var iData = this.data[i],
                    iValues = iData[2];

                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = this.regionsDateIDs[iValues[j][0]];
                    var d = dateUpdated.split('/');
                    updatedDates.push([d[2] + d[1] + d[0], d.join('/')]);
                }
            }
        }
        updatedDates.sort();

        var updated = updatedDates[updatedDates.length-1][1];
        this._updated = updated;
        return updated;
    }

    getCaseNumber(region, ageRange, maxDate) {
        return this.__getCaseNumber(region, ageRange, maxDate);
    }

    __getCaseNumber(region, ageRange, maxDate) {
        maxDate = maxDate || ConfirmedMapFns.getToday();

        // Return only the latest value
        if (this.schema === 'statewide' && !ageRange && stateCaseDataTypes.has(this.subHeader)) {
            let n = getFromStateCaseData(this.stateName, this.subHeader);

            for (let caseItem of n) {
                if (maxDate && ConfirmedMapFns.parseDate(caseItem.printableDate) > maxDate) {
                    continue;
                }
                return {
                    'updatedDate': caseItem.printableDate,
                    'numCases': parseInt(caseItem.numCases)
                }
            }
        } else {
            region = ConfirmedMapFns.prepareForComparison(region || '');
            ageRange = ageRange || '';

            for (let i = 0; i < this.data.length; i++) {
                let [iRegion, iAgeRange, iValues] = this.data[i];

                if (
                    (this.schema === 'statewide' || iRegion === region) &&
                    iAgeRange === ageRange
                ) {
                    for (var j = 0; j < iValues.length; j++) {
                        var dateUpdated = this.regionsDateIDs[iValues[j][0]],
                            dateUpdatedObj = this.regionObjDateIDs[iValues[j][0]],
                            iValue = iValues[j][this.subHeaderIndex + 1];

                        if (maxDate && dateUpdatedObj > maxDate) {
                            continue;
                        } else if (iValue != null && iValue !== '') {
                            return {
                                'numCases': parseInt(iValue),
                                'updatedDate': dateUpdated
                            }
                        }
                    }
                }
            }
        }
        return {
            'numCases': 0,
            'updatedDate': null
        };  // WARNING!
    }

    getDaysSince(region, ageRange) {
        // Return only the latest value

        if (this.schema === 'statewide' && !ageRange && stateCaseDataTypes.has(this.subHeader)) {
            return ConfirmedMapFns.dateDiffFromToday(
                getFromStateCaseData(this.stateName, this.subHeader)[0].printableDate
            );
        } else {
            region = ConfirmedMapFns.prepareForComparison(region || '');
            ageRange = ageRange || '';
            let firstVal = null;

            for (var i = 0; i < this.data.length; i++) {
                let [iRegion, iAgeRange, iValues] = this.data[i];

                if (
                    (this.schema === 'statewide' || iRegion === region) &&
                    iAgeRange === ageRange
                ) {
                    for (let j = 0; j < iValues.length; j++) {
                        let dateUpdated = this.regionsDateIDs[iValues[j][0]],
                            iValue = iValues[j][this.subHeaderIndex + 1];

                        if (iValue == null || iValue === '') {
                            continue;
                        } else if (firstVal == null) {
                            firstVal = iValue;
                        } else if (firstVal > iValue) {
                            //console.log(dateUpdated+' '+ConfirmedMapFns.dateDiffFromToday(dateUpdated));
                            return ConfirmedMapFns.dateDiffFromToday(dateUpdated)
                        }
                    }
                }
            }
        }
        return null;
    }

    getCaseNumberTimeSeries(region, ageRange, maxDate) {
        maxDate = maxDate || ConfirmedMapFns.getToday();

        var r = [];

        if (this.schema === 'statewide' && !ageRange && stateCaseDataTypes.has(this.subHeader)) {
            for (let item of getFromStateCaseData(this.stateName, this.subHeader)) {
                let dateUpdatedObj = ConfirmedMapFns.parseDate(item.printableDate);
                if (maxDate && dateUpdatedObj > maxDate) {
                    continue;
                }
                r.push({
                    x: dateUpdatedObj,
                    y: parseInt(item.numCases)
                });
            }
        } else {
            region = ConfirmedMapFns.prepareForComparison(region || '');
            ageRange = ageRange || '';

            for (let i = 0; i < this.data.length; i++) {
                let [iRegion, iAgeRange, iValues] = this.data[i];

                if (
                    (this.schema === 'statewide' || iRegion === region) &&
                    iAgeRange === ageRange
                ) {
                    for (let j = 0; j < iValues.length; j++) {
                        let dateUpdated = this.regionsDateIDs[iValues[j][0]],
                            dateUpdatedObj = this.regionObjDateIDs[iValues[j][0]],
                            iValue = iValues[j][this.subHeaderIndex + 1];

                        if (maxDate && dateUpdatedObj > maxDate) {
                            continue;
                        }
                        else if (iValue != null && iValue !== '') {
                            // May as well use CanvasJS format
                            r.push({
                                x: dateUpdatedObj,
                                y: parseInt(iValue)
                            });
                        }
                    }
                }
            }
        }

        r.sort((x, y) => x.x - y.x);
        return r;
    }

    getMaxMinValues() {
        let min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (let i = 0; i < this.data.length; i++) {
            let iData = this.data[i],
                iRegion = iData[0],
                iAgeRange = iData[1];

            // PERFORMANCE WARNING!
            let value = this.getCaseNumber(iRegion, iAgeRange)['numCases'];

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

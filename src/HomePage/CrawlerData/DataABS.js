import ConfirmedMapFns from "../ConfirmedMap/Fns";
import absStatsData from "../../data/absStats";


const absStats = absStatsData['data'],
    absStatsStates = absStatsData['states'],
    absStatsLGANames = absStatsData['lga_names'];


class DataSourceBase {
    constructor(sourceName) {
        this._sourceName = sourceName;
    }

    getSourceName() {
        return this._sourceName;
    }
}


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
        var today = ConfirmedMapFns.getToday();
        this.updatedDate = (
            today.getDay() + '/' +
            today.getMonth() + '/' +
            today.getFullYear()
        );
        this.data = mapAreaData['data'];
    }

    getCaseInfoForCity(stateName, cityName) {
        stateName = stateName.toLowerCase();
        cityName = ConfirmedMapFns.prepareForComparison(cityName);

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

export default BigTableOValuesDataSource;

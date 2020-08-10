/**
This file is licensed under the MIT license

Copyright (c) 2020 David Morrissey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import ConfirmedMapFns from "../../ConfirmedMap/Fns";
import absStatsData from "../../../data/absStats";


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

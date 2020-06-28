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
import shipData from "../../../data/ship.json"


function getPossibleShips() {
    return shipData.map((dataItem) => {
        return dataItem['name'];
    });
}

function getByShip(shipName) {
    for (var dataItem of shipData) {
        if (dataItem['name'] === shipName) {
            return dataItem;
        }
    }
}

class DataSourceBase { // HACK - please move to another file!!! =================
    constructor(sourceName) {
        this._sourceName = sourceName;
    }

    getSourceName() {
        return this._sourceName;
    }
}


class ConfirmedMapShipsData extends DataSourceBase {
    constructor(sourceName, stateName, shipName) {
        /*
        {
            "name": "RUBY PRINCESS",
            "data": [
              {
                "state": "NSW",
                "case": "467",
                "death": "7",
                "update": "15/04/2020",
                "url": "https://www.health.nsw.gov.au/news/Pages/2020041500.aspx"
              },
              ...
              ], ...
         }
         */
        super(sourceName);
        this.stateName = stateName;
        this.shipName = shipName;
        this.data = getByShip(shipName);
        this.schema = 'statewide';
    }

    getUpdatedDate() {
        var data = this.data['data'];

        for (var dataItem of data) {
            if (this.stateName.toUpperCase() !== dataItem['state'].toUpperCase()) {
                continue;
            }
            return dataItem['update'];
        }
        return null;
    }

    getDaysSince() {
        return null;
    }

    getCaseNumber(region, ageRange) {
        var data = this.data['data'];
        //console.log("get: "+region+' '+this.stateName);

        for (var dataItem of data) {
            if (this.stateName.toUpperCase() !== dataItem['state'].toUpperCase()) {
                continue;
            }
            return {
                numCases: parseInt(dataItem['case']),
                updatedDate: dataItem['update']
            }
        }
        return null;
    }

    getCaseNumberTimeSeries(region, ageRange) {
        // TODO: Add complete time series!!
        var cn = this.getCaseNumber(region, ageRange);
        if (cn) {
            return [{
                x: ConfirmedMapFns.parseDate(cn.updatedDate),
                y: parseInt(cn.numCases)
            }];
        }
        return null;
    }

    getMaxMinValues() {
        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        var data = this.data['data'];

        for (var dataItem of data) {
            var value = parseInt(dataItem['case']);
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

export default {
    ConfirmedMapShipsData: ConfirmedMapShipsData,
    getPossibleShips: getPossibleShips
};

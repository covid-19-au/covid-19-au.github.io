import ConfirmedMapFns from "../ConfirmedMap/Fns";
import shipData from "../../data/ship.json"


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
        // console.log("get: "+region+' '+this.stateName);

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

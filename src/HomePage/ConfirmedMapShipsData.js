import ConfirmedMapFns from "./ConfirmedMapFns";
import shipData from "../data/ship.json"


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

    getCaseNumber(region, ageRange) {
        var data = this.data['data'];
        console.log("get: "+region+' '+this.stateName);

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
}

export default {
    ConfirmedMapShipsData: ConfirmedMapShipsData,
    getPossibleShips: getPossibleShips
};

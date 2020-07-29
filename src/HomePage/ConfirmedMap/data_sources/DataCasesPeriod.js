import ConfirmedMapFns from "../Fns";
import TimeSeriesDataSource from "./DataCases"

class TimeSeriesDataSourceForPeriod extends TimeSeriesDataSource {
    constructor(sourceName, subHeader, mapAreaData,
                regionsDateIDs, schema, stateName,
                daysAgo) {
        super(
            sourceName, subHeader, mapAreaData,
            regionsDateIDs, schema, stateName
        );
        this.daysAgo = daysAgo;
    }

    getCaseNumber(region, ageRange, maxDate) {
        // Return the latest value - the value 14 days ago,
        // to get a general idea of how many active cases there
        // still are. This isn't going to be very accurate,
        // but better than nothing.
        maxDate = maxDate || ConfirmedMapFns.getToday();

        var latest = super.getCaseNumber(region, ageRange, maxDate);
        if (!latest) {
            return null;
        }

        var oldest = super.getCaseNumber(
            region, ageRange,
            new Date(maxDate.getTime() - (this.daysAgo * ConfirmedMapFns.DAY_IN_MILLISECONDS))
        );
        if (!oldest) {
            return null;
        }

        return {
            'numCases': latest['numCases'] - oldest['numCases'],
            'updatedDate': latest['updatedDate']
        };
    }

    /*getCaseNumberTimeSeries(region, ageRange, maxDate) {
        maxDate = maxDate || ConfirmedMapFns.getToday();

        var r = [];
        var values = super.getCaseNumberTimeSeries(
            region, ageRange, maxDate
        );

        for (var i = 0; i < values.length; i++) {
            var iData = values[i];
            if (ConfirmedMapFns.dateDiffFromToday(iData.x, maxDate) > this.daysAgo) {
                continue;
            }
            r.push(iData);
        }
        return r;
    }*/
}

export default TimeSeriesDataSourceForPeriod;

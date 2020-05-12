import ConfirmedMapFns from "./Fns";
import TimeSeriesDataSource from "./CaseData"

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

    getCaseNumber(region, ageRange) {
        // Return the latest value - the value 14 days ago,
        // to get a general idea of how many active cases there
        // still are. This isn't going to be very accurate,
        // but better than nothing.
        var oldest = null;
        var latest = super.getCaseNumber(region, ageRange);
        if (!latest) {
            return null;
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
                        oldest = {
                            'numCases': latest['numCases'] - parseInt(iValue),
                            'updatedDate': latest['updatedDate']
                        };

                        if (ConfirmedMapFns.dateDiffFromToday(dateUpdated) > this.daysAgo) {
                            return oldest;
                        }
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

    getCaseNumberTimeSeries(region, ageRange) {
        var r = [];
        var values = super.getCaseNumberTimeSeries(
            region, ageRange
        );

        for (var i = 0; i < values.length; i++) {
            var iData = values[i];
            if (ConfirmedMapFns.dateDiff(iData.x, ConfirmedMapFns.getToday()) > this.daysAgo) {
                continue;
            }
            r.push(iData);
        }
        return r;
    }
}

export default TimeSeriesDataSourceForPeriod;

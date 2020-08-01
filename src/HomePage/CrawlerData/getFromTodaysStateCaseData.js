import StateLatestNums from "../../data/stateCaseData";
import TimeSeriesItem from "../CrawlerDataTypes/TimeSeriesItem";
import DateType from "../CrawlerDataTypes/DateType";


/**
 * Get stats from today's hand-crafted state data
 *
 * @param stateName the Australian state name
 * @param dataType the datatype
 * @returns {null|*[]}
 */
function getFromTodaysStateCaseData(stateName, dataType) {
    var dateUpdated = StateLatestNums.updatedTime.split(' ')[1].replace(/[-]/g, '/');

    for (var [
        iStateName, iConfirmed, iDeaths, iRecovered,
        iTested, iInHospital, iInICU, iUnknown
    ] of StateLatestNums.values) {
        if (stateName.toUpperCase() !== iStateName.toUpperCase()) {
            continue;
        }
        else if (dataType === 'total') {
            return new TimeSeriesItem(new DateType(dateUpdated), iConfirmed);
        }
        else if (dataType === 'status_deaths') {
            return new TimeSeriesItem(new DateType(dateUpdated), iDeaths);
        }
        else if (dataType === 'status_recovered') {
            return new TimeSeriesItem(new DateType(dateUpdated), iRecovered);
        }
        else if (dataType === 'tests_total') { //  CHECK ME!!!
            return new TimeSeriesItem(new DateType(dateUpdated), iTested);
        }
        else if (dataType === 'status_icu') {
            return new TimeSeriesItem(new DateType(dateUpdated), iInICU);
        }
        else if (dataType === 'status_hospitalized') {
            return new TimeSeriesItem(new DateType(dateUpdated), iInHospital);
        }
    }
    return null;
}

export default getFromTodaysStateCaseData;

import StateLatestNums from "../../../data/stateCaseData.json";
import DataPoint from "../CrawlerDataTypes/DataPoint";
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
            return new DataPoint(new DateType(dateUpdated), iConfirmed);
        }
        else if (dataType === 'status_deaths') {
            return new DataPoint(new DateType(dateUpdated), iDeaths);
        }
        else if (dataType === 'status_recovered') {
            return new DataPoint(new DateType(dateUpdated), iRecovered);
        }
        else if (dataType === 'tests_total') { //  CHECK ME!!!
            return new DataPoint(new DateType(dateUpdated), iTested);
        }
        else if (dataType === 'status_icu') {
            return new DataPoint(new DateType(dateUpdated), iInICU);
        }
        else if (dataType === 'status_hospitalized') {
            return new DataPoint(new DateType(dateUpdated), iInHospital);
        }
    }
    return null;
}

export default getFromTodaysStateCaseData;

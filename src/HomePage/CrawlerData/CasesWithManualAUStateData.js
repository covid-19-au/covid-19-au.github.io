import Fns from "../ConfirmedMap/Fns";
import CasesData from "./CasesData";
import stateNums from "../../data/state";
import DataPoints from "../CrawlerDataTypes/DataPoints";
import DataPoint from "../CrawlerDataTypes/DataPoint";
import DateType from "../CrawlerDataTypes/DateType";

import {
    PRIORITIZE_RECENT_DATAPOINT,
    PRIORITIZE_RECENT_DATAPOINTS,
    PRIORITIZE_LOW_INT_VALUE,
    PRIORITIZE_FIRST_VALUE,
    PRIORITIZE_MANUAL_THEN_RECENT_DATAPOINT
} from "./CasesData";

const STATE_CASE_DATA_TYPES = new Set([
    'total',
    'status_deaths',
    'status_recovered',
    'tests_total',
    'status_icu',
    'status_active',
    'status_hospitalized'
]);

const MANUAL_STATE_DATA_ID = 'manual_state_data';


class CasesWithManualAUStateData extends CasesData {
    constructor(casesData, regionsDateIds, subHeaders, sourceIds,
                dataType, updatedDate,
                regionSchema, regionParent) {

        super(casesData, regionsDateIds, subHeaders, sourceIds,
              dataType, updatedDate,
              regionSchema, regionParent);

        this.__useManualStateData = (
            regionSchema === 'admin_1' &&
            regionParent === 'au' &&
            STATE_CASE_DATA_TYPES.has(dataType)
        );
        this.__dataPointsCache = new Map();
        this.__caseNumberCache = new Map();
    }

    /**
     *
     * @returns {*}
     */
    getSourceIds() {
        if (this.__useManualStateData) {
            return [MANUAL_STATE_DATA_ID].concat(super.getSourceIds());
        } else {
            return super.getSourceIds()
        }
    }

    /**
     *
     * @param casesData
     * @param stateName
     * @param dataType
     * @returns {DataPoints}
     * @private
     */
    __getDataPointsFromStateCaseData(regionType) {
        if (this.regionSchema !== 'admin_1' || this.regionParent !== 'au') {
            throw "Shouldn't get here!";
        } else if (this.__dataPointsCache.has(regionType.getHashKey())) {
            return this.__dataPointsCache.get(regionType.getHashKey());
        }

        let dates = Fns.sortedKeys(stateNums).reverse();
        let stateName = regionType.getRegionChild()
                                  .split('-')[1]
                                  .toUpperCase();

        let r = new DataPoints(
            this, regionType,"", []
        );

        for (let sortableDate of dates) {
            if (!(stateName in stateNums[sortableDate])) {
                //console.log(`NOT IN: ${stateName} ${JSON.stringify(stateNums[sortableDate])}`)
                continue;
            }
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

            if (map[this.dataType] != null) {
                let [yyyy, mm, dd] = sortableDate.split('-');
                r.push(new DataPoint(
                    new DateType(parseInt(yyyy), parseInt(mm), parseInt(dd)),
                    map[this.dataType]
                ));
            }
        }

        r.sortDescending();
        r = r.length ? r : null;
        this.__dataPointsCache.set(regionType.getHashKey(), r);
        return r;
    }

    /*******************************************************************
     * Basic case numbers
     *******************************************************************/

    /**
     *
     * @param regionType
     * @param ageRange
     * @param maxDateType
     */
    getCaseNumber(regionType, ageRange, maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();
        sourceId = sourceId || null;

        let r;
        if (sourceId == null) {
            r = this.__tryEachSourceId(this.getCaseNumber, PRIORITIZE_MANUAL_THEN_RECENT_DATAPOINT, regionType, ageRange, maxDateType);
        } else if (sourceId === MANUAL_STATE_DATA_ID) {
            if (!this.__useManualStateData || ageRange) {
                r = null;
            } else {
                for (let dataPoint of this.__getDataPointsFromStateCaseData(regionType) || []) {
                    if (dataPoint.getDateType() <= maxDateType) {
                        r = dataPoint;
                        break;
                    }
                }
            }
        } else {
            r = super.getCaseNumber(regionType, ageRange, maxDateType, sourceId);
        }
        return r;
    }

    /**
     *
     * @param regionType
     * @param ageRange
     * @param numDays
     * @param maxDateType
     */
    getCaseNumberOverNumDays(regionType, ageRange, numDays, maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getCaseNumberOverNumDays, PRIORITIZE_MANUAL_THEN_RECENT_DATAPOINT, regionType, ageRange, numDays, maxDateType);
        }

        if (sourceId === MANUAL_STATE_DATA_ID) {
            if (!this.__useManualStateData || ageRange) {
                return null;
            } else {
                let currentDataPoint = this.getCaseNumber(regionType, ageRange, maxDateType);
                let prevDataPoint = this.getCaseNumber(regionType, ageRange, maxDateType.daysSubtracted(numDays));

                if (currentDataPoint && prevDataPoint) {
                    let value = currentDataPoint.getValue() - prevDataPoint.getValue();
                    return new DataPoint(currentDataPoint.getDateType(), value, sourceId);
                }
                return null;
            }
        } else {
            return super.getCaseNumberOverNumDays(
                regionType, ageRange, numDays, maxDateType, sourceId
            );
        }
    }

    /*******************************************************************
     * Case number time series
     *******************************************************************/

    /**
     *
     * @param regionType
     * @param ageRange
     * @param maxDateType
     */
    getCaseNumberTimeSeries(regionType, ageRange, maxDateType, sourceId) {
        maxDateType = maxDateType || DateType.today();

        if (sourceId == null) {
            return this.__tryEachSourceId(this.getCaseNumberTimeSeries, PRIORITIZE_RECENT_DATAPOINTS, regionType, ageRange, maxDateType);
        }

        if (sourceId === MANUAL_STATE_DATA_ID) {
            if (!this.__useManualStateData || ageRange || regionType.getRegionSchema() !== 'admin_1' || regionType.getRegionParent() !== 'au') {
                return null;
            } else {
                let dataPoints = this.__getDataPointsFromStateCaseData(regionType) || new DataPoints(this, regionType, ageRange);
                let out = dataPoints.cloneWithoutDatapoints();

                for (let dataPoint of dataPoints) {
                    if (dataPoint.getDateType() <= maxDateType) {
                        out.push(dataPoint);
                    }
                }

                dataPoints.sortDescending();
                return out.length ? out : null;
            }
        } else {
            return super.getCaseNumberTimeSeries(
                regionType, ageRange, maxDateType, sourceId
            );
        }
    }

    /*******************************************************************
     * Miscellaneous calculations
     *******************************************************************/

    /**
     *
     * @param maxDateType
     */
    getMaxMinValues(maxDateType, sourceId) {
        if (sourceId == null) {
            return this.__tryEachSourceId(this.getMaxMinValues, PRIORITIZE_FIRST_VALUE, maxDateType);
        }

        if (sourceId === MANUAL_STATE_DATA_ID) {
            if (!this.__useManualStateData) {
                throw "can't use manual state data!"
            }
            maxDateType = maxDateType || DateType.today();

            var min = 99999999999,
                max = -99999999999,
                allVals = [];

            for (let regionType of this.getRegionChildren()) {
                for (let dataPoint of this.__getDataPointsFromStateCaseData(regionType) || []) {
                    if (dataPoint.getDateType() <= maxDateType) {
                        let value = dataPoint.getValue();

                        if (value === '' || value == null) continue;
                        if (value > max) max = value;
                        if (value < min) min = value;

                        allVals.push(value);
                        break;
                    }
                }
            }

            allVals.sort();
            return {
                'max': max,
                'min': min,
                'median': allVals[Math.round(allVals.length / 2.0)]
            }
        } else {
            return super.getMaxMinValues(maxDateType, sourceId);
        }
    }

    /**
     *
     * @param regionType
     * @param ageRange
     * @param maxDateType
     */
    getDaysSince(regionType, ageRange, maxDateType, sourceId) {
        if (sourceId == null) {
            return this.__tryEachSourceId(this.getDaysSince, PRIORITIZE_LOW_INT_VALUE, regionType, ageRange, maxDateType);
        }

        if (sourceId === MANUAL_STATE_DATA_ID) {
            if (!this.__useManualStateData) {
                throw "can't use manual state data!";
            }
            else if (ageRange) {
                throw "can't use age ranges with manual data!";
            }
            maxDateType = maxDateType || DateType.today();

            for (let regionType of this.getRegionChildren()) {
                for (let dataPoint of this.__getDataPointsFromStateCaseData(regionType) || []) {
                    if (dataPoint.getDateType() <= maxDateType) {
                        return dataPoint.getDateType().numDaysSince(maxDateType);
                    }
                }
            }
            return null;
        } else {
            return super.getDaysSince(regionType, ageRange, maxDateType, sourceId);
        }
    }
}

export default CasesWithManualAUStateData;

import Fns from "../ConfirmedMap/Fns";
import CasesData from "./CasesData";
import stateNums from "../../data/state";
import DataPoints from "../CrawlerDataTypes/DataPoints";
import DataPoint from "../CrawlerDataTypes/DataPoint";
import DateRangeType from "../CrawlerDataTypes/DateRangeType";
import RegionType from "../CrawlerDataTypes/RegionType";
import DateType from "../CrawlerDataTypes/DateType";


const STATE_CASE_DATA_TYPES = new Set([
    'total',
    'status_deaths',
    'status_recovered',
    'tests_total',
    'status_icu',
    'status_active',
    'status_hospitalized'
]);


class CasesWithManualAUStateData extends CasesData {
    constructor(casesData, regionsDateIds, subHeaders,
                dataType, updatedDate,
                regionSchema, regionParent) {

        super(casesData, regionsDateIds, subHeaders,
              dataType, updatedDate,
              regionSchema, regionParent);

        this.__useManualStateData = (
            regionSchema === 'admin_1' &&
            regionParent === 'au' &&
            STATE_CASE_DATA_TYPES.has(dataType)
        );
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
        }

        let dates = Fns.sortedKeys(stateNums).reverse();
        let stateName = regionType.getRegionChild()
                                  .split('-')[1]
                                  .toUpperCase();

        let dateRangeType = new DateRangeType(
            DateType.today(), DateType.today()
        );  // HACK!!!
        let r = new DataPoints(
            this, regionType, dateRangeType,
            "", []
        );

        for (let sortableDate of dates) {
            if (!(stateName in stateNums[sortableDate])) {
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
                r.push(new DataPoint(sortableDate, map[this.dataType]));
            }
        }

        r.sortDescending();

        if (r.length) {
            r.getDateRangeType().setDateRange(
                r[r.length - 1].getDateType(), r[0].getDateType()
            );
        }
        return r.length ? r : null;
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
    getCaseNumber(regionType, ageRange, maxDateType) {
        maxDateType = maxDateType || DateType.today();

        if (this.__useManualStateData && !ageRange) {
            for (let dataPoint of this.__getDataPointsFromStateCaseData(regionType)||[]) {
                if (dataPoint.getDateType() <= maxDateType) {
                    return dataPoint;
                }
            }
            return null;
        } else {
            return super.getCaseNumber(
                regionType, ageRange, maxDateType
            );
        }
    }

    /**
     *
     * @param regionType
     * @param ageRange
     * @param numDays
     * @param maxDateType
     */
    getCaseNumberOverNumDays(regionType, ageRange, numDays, maxDateType) {
        maxDateType = maxDateType || DateType.today();

        if (this.__useManualStateData && !ageRange) {
            let currentDataPoint = this.getCaseNumber(
                regionType, maxDateType
            );
            let prevDataPoint = this.getCaseNumber(
                regionType, maxDateType.daysSubtracted(numDays)
            );
            if (currentDataPoint && prevDataPoint) {
                return new DataPoint(
                    currentDataPoint.getDateType(),
                    currentDataPoint.getValue() - prevDataPoint.getValue()
                )
            }
            return null;
        } else {
            return super.getCaseNumberOverNumDays(
                regionType, ageRange, numDays, maxDateType
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
    getCaseNumberTimeSeries(regionType, ageRange, maxDateType) {
        if (this.__useManualStateData && !ageRange) {
            let dataPoints = this.__getDataPointsFromStateCaseData(regionType) || [];
            let out = dataPoints.cloneWithoutDatapoints();

            for (let dataPoint of dataPoints) {
                if (dataPoint.getDateType() <= maxDateType) {
                    out.push(dataPoint);
                }
            }

            dataPoints.sortDescending();
            dataPoints.setDateRange(
                dataPoints[dataPoints.length-1].getDateType(),
                dataPoints[0].getDateType()
            );
            return out.length ? out : null;
        } else {
            return super.getCaseNumberTimeSeries(
                regionType, ageRange, maxDateType
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
    getMaxMinValues(maxDateType) {
        if (this.__useManualStateData) {
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
            return super.getMaxMinValues(maxDateType);
        }
    }

    /**
     *
     * @param regionType
     * @param ageRange
     * @param maxDateType
     */
    getDaysSince(regionType, ageRange, maxDateType) {
        if (this.__useManualStateData && !ageRange) {
            ageRange = ageRange || '';
            maxDateType = maxDateType || DateType.today();
            var firstVal = null;

            for (var [iChildRegion, iAgeRange, iValues] of this.data) {
                if (iChildRegion === regionType.getRegionChild() && iAgeRange === ageRange) {
                    for (var j = 0; j < iValues.length; j++) {
                        var dateUpdated = this.regionsDateIds[iValues[j][0]],
                            iValue = iValues[j][this.subHeaderIndex + 1];

                        if (dateUpdated > maxDateType) {
                            continue;
                        } if (iValue == null || iValue === '') {
                            continue;
                        } else if (firstVal == null) {
                            firstVal = iValue;
                        } else if (firstVal > iValue) {
                            return dateUpdated.numDaysSince(maxDateType);
                        }
                    }
                }
            }
            return null;
        } else {
            return super.getDaysSince(
                regionType, ageRange, maxDateType
            );
        }
    }
}

export default CasesWithManualAUStateData;

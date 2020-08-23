import RegionType from "../CrawlerDataTypes/RegionType";
import Fns from "../ConfirmedMap/Fns";
import DateType from "../CrawlerDataTypes/DateType";


function debug(msg) {
    if (false) {
        console.log(msg);
    }
}


let __timeSeriesCache = new Map();


class GeoDataPropertyAssignment {
    /**
     *
     * @param insts
     * @param dataType
     * @param lngLatBounds
     * @param iso3166WithinView
     */
    constructor(constants, insts, dataType, lngLatBounds, iso3166WithinView, parents, allDownloaded) {
        this.constants = constants;
        this.insts = insts;
        this.dataType = dataType;
        this.lngLatBounds = lngLatBounds;
        this.iso3166WithinView = iso3166WithinView;
        this.parents = parents;
        this.allDownloaded = allDownloaded;
    }

    /**
     * Returns whether there was still data left
     * to download at the current coordinates
     */
    getMoreToDownload() {
        return this.allDownloaded;
    }

    /**
     *
     * @returns {{caseDataInsts: [], polygons: {features: [], type: string}, geoDataInsts: [], points: {features: [], type: string}}}
     */
    getAssignedData(dateRangeType, maxDateType) {
        let geoDataInsts = [];
        let caseDataInsts = [];
        let pointsAllVals = [],
            polygonsAllVals = [];

        let points = {
            "type": "FeatureCollection",
            "features": []
        },  polygons = {
            "type": "FeatureCollection",
            "features": []
        };

        let assign = (geoDataInst, casesInst, parents) => {
            let iPoints = geoDataInst.getCentralPoints(false, this.lngLatBounds),
                iPolygons = geoDataInst.getPolygonOutlines(false, this.lngLatBounds);

            if (casesInst) {
                // Get assigned points data
                iPoints = this.__getCaseInfoGeoJSON(
                    casesInst,
                    iPoints, null, dateRangeType, maxDateType,
                    parents, this.iso3166WithinView, true
                );
                for (let feature of iPoints['features']) {
                    if (feature.properties['cases']) {
                        pointsAllVals.push(feature.properties['cases']);
                    }
                }
                points['features'].push(...iPoints['features']);

                // Get assigned polygon data
                iPolygons = this.__getCaseInfoGeoJSON(
                    casesInst,
                    iPolygons, null, dateRangeType, maxDateType,
                    parents, this.iso3166WithinView, false
                );
                for (let feature of iPolygons['features']) {
                    if (feature.properties['cases']) {
                        polygonsAllVals.push(feature.properties['cases']);
                    }
                }
                polygons['features'].push(...iPolygons['features']);

                caseDataInsts.push(casesInst);
                geoDataInsts.push(geoDataInst);

                //debug(`assigned ${geoData.getRegionSchema()}->${geoData.getRegionParent()}: lengths ${iPoints.features.length} ${iPolygons.features.length}`);
            }
            else {
                // ???
                //debug(`UNassigned ${geoData.getRegionSchema()}->${geoData.getRegionParent()}: lengths ${iPoints.features.length} ${iPolygons.features.length}`);
            }
        };

        // Make it so e.g. postcode schema takes priority over LGA
        let priorities = {};
        for (let [schemaInfo, geoData, caseData] of this.insts) {
            let srp = geoData.getRegionParent();
            if (!priorities[srp] || priorities[srp][0] < schemaInfo.priority) {
                priorities[srp] = [schemaInfo.priority, geoData, caseData];
            }
        }
        for (let key in priorities) {
            let [priority, geoData, caseData] = priorities[key];
            assign(geoData, caseData, this.parents);
        }

        pointsAllVals.sort((a, b) => a - b);
        points.caseVals = pointsAllVals;

        polygonsAllVals.sort((a, b) => a - b);
        polygons.caseVals = polygonsAllVals;

        return {
            points: points,
            polygons: polygons,
            geoDataInsts: geoDataInsts,
            caseDataInsts: caseDataInsts
        }
    }

    /*******************************************************************
     * Data processing: associate case nums
     *******************************************************************/

    /**
     * Assign cases time series data from a CasesData instance
     *
     * @param inputGeoJSON
     * @param ageRange
     * @param dateRangeType
     * @param maxDateType
     * @param ignoreChildren
     * @param iso3166WithinView
     * @param removeLargestItem
     */
    __getCaseInfoGeoJSON(casesInst, inputGeoJSON, ageRange, dateRangeType, maxDateType,
                         ignoreChildren, iso3166WithinView, removeLargestItem) {

        ignoreChildren = ignoreChildren || new Set();
        let max = -9999999999999,
            min = 9999999999999;

        // clean up since last time
        let cleanUp = (properties) => {
            for (let key of [
                'dayssince',
                'revdayssince',
                'cases',
                'negcases',
                'casesFmt',
                'casesSz',
                'casesTimeSeries'
            ]) {
                if (key in properties) {
                    delete properties[key];
                }
            }
        };

        let out = [];

        for (let feature of inputGeoJSON.features) {
            let properties = feature.properties;

            if (!this.__inView(properties, iso3166WithinView, ignoreChildren)) {
                // Don't show if not in view
                if ('cases' in properties) {
                    cleanUp(properties);
                }
                continue;
            } else if (removeLargestItem && !parseInt(properties.largestItem)) {
                // Ignore smaller islands etc, only add each region once!
                if ('cases' in properties) {
                    cleanUp(properties);
                }
                out.push(feature);
                continue;
            }

            let regionType = new RegionType(
                properties['regionSchema'], properties['regionParent'], properties['regionChild']
            );
            let timeSeriesItem;

            // Only smooth over time for e.g. the "new" datatype when
            // one of the 7/14/21 day controls are selected!
            //
            // (the reason for smoothing here is to reduce noise,
            // but I think the expected behaviour is otherwise to
            // simply show the number of cases for the previous day
            // with data)

            if (!this.constants[casesInst.getDataType()] ||
                !this.constants[casesInst.getDataType()].averagedata ||
                !dateRangeType
            ) {
                timeSeriesItem = (
                    dateRangeType ?
                        casesInst.getCaseNumberOverNumDays(
                            regionType, ageRange, dateRangeType.getDifferenceInDays(), maxDateType
                        ) :
                        casesInst.getCaseNumber(
                            regionType, ageRange, maxDateType
                        )
                );
            } else {
                timeSeriesItem = (
                    dateRangeType ?
                        casesInst.getSmoothedCaseNumberOverNumDays(
                            regionType, ageRange, dateRangeType.getDifferenceInDays(), maxDateType
                        ) :
                        casesInst.getSmoothedCaseNumber(
                            regionType, ageRange, maxDateType
                        )
                );
            }

            if (!timeSeriesItem) {
                debug(`No data for ${regionType.prettified()} (${regionType.getRegionChild()})`);
                if ('cases' in properties) {
                    cleanUp(properties);
                }
                out.push(feature);
                continue;
            }

            // Get a basic list of past values for the graph
            let timeSeries,
                tsKey = `${regionType.getHashKey()}||${ageRange||''}||${this.dataType}`;

            if (__timeSeriesCache.has(tsKey)) {
                timeSeries = __timeSeriesCache.get(tsKey);
            } else {
                timeSeries = (
                    //dateRangeType ?
                    //    casesInst.getCaseNumberTimeSeriesOverNumDays(
                    //        regionType, ageRange, dateRangeType.getDifferenceInDays()
                    //    ) :
                    casesInst.getCaseNumberTimeSeries(
                        regionType, ageRange
                    )
                );

                if (timeSeries && timeSeries.getDateRangeType) {
                    // Fill in every day till the present day
                    let dateRangeType = timeSeries.getDateRangeType();
                    dateRangeType.setDateRange(dateRangeType.getFromDate(), DateType.today());
                    timeSeries = timeSeries.missingDaysFilledIn(dateRangeType);

                    if (this.constants[casesInst.getDataType()] && this.constants[casesInst.getDataType()].dayssince) {
                        // if "dayssince" flag is set, it means the values
                        // go up or down (not just for correcting mistakes etc)
                        timeSeries = timeSeries.getNewValuesFromTotals();
                    }

                    // Can afford to be more liberal with averaging if have more days
                    // (it will discard "overNumDays" samples of data)
                    if (timeSeries.length > 28) {
                        timeSeries = timeSeries.getDayAverage(14);
                    } else if (timeSeries.length > 14) {
                        timeSeries = timeSeries.getDayAverage(7);
                    } else if (timeSeries.length > 7) {
                        timeSeries = timeSeries.getDayAverage(3);
                    }

                    // Convert to % difference
                    timeSeries = timeSeries.getRateOfChange(7);

                    let ts = [];
                    for (let dataPoint of timeSeries) {
                        ts.push(dataPoint.getValue())
                    }
                    timeSeries = ts;
                } else {
                    timeSeries = [];
                }
                __timeSeriesCache.set(tsKey, timeSeries);
            }

            // Assign properties
            this.__assignProperties(feature, timeSeriesItem, timeSeries, regionType, ageRange);

            if (properties.cases && properties.cases < min) {
                min = properties.cases;
            }
            if (properties.cases && properties.cases > max) {
                max = properties.cases;
            }

            out.push(feature);
        }

        //debug(JSON.stringify(features));
        let r = Fns.geoJSONFromFeatures(out);
        r.max = out.length ? max : 0;
        r.min = out.length ? min : 0;
        return r;
    }

    /**
     * Returns `true` if a GeoJSON item is in
     * view and not ignored, otherwise `false`
     *
     * @param properties
     * @param iso3166WithinView
     * @param ignoreChildren
     * @returns {boolean}
     * @private
     */
    __inView(properties, iso3166WithinView, ignoreChildren) {
        if (
            (properties['regionSchema'] === 'admin_0' || properties['regionSchema'] === 'admin_1')
            && !iso3166WithinView.has(properties['regionChild'])
        ) {
            debug(`Ignoring child due to not in view: ${properties['regionSchema']}->${properties['regionChild']}`);
            return false;
        }
        else if (
            properties['regionSchema'] !== 'admin_0' && properties['regionSchema'] !== 'admin_1' &&
            this.regionParent &&
            !iso3166WithinView.has(this.regionParent) && !iso3166WithinView.has(this.regionParent.split('-')[0])
        ) {
            debug(`Ignoring *ALL* parent due to not in view: ${properties['regionSchema']}->${properties['regionChild']}`);
            return false;
        }
        else if (
            ignoreChildren.has(`${properties['regionSchema']}||${properties['regionChild']}`) ||
            (
                properties['regionSchema'] === 'admin_1' &&
                ignoreChildren.has(`${properties['regionSchema']}||${properties['regionChild'].split('-')[0]}`)
            )
        ) {
            // Make it so children such as AU-TAS will replace AU
            debug(`Ignoring child: ${properties['regionSchema']}->${properties['regionChild']}`);
            return false;
        }
        return true;
    }

    /**
     *
     * @param feature
     * @param timeSeriesItem
     * @param regionType
     * @param ageRange
     * @private
     */
    __assignProperties(feature, timeSeriesItem, timeSeries, regionType, ageRange) {
        let properties = feature.properties;

        if (timeSeriesItem.getDaysSince) {
            var dayssince = this.getDaysSince(regionType, ageRange);
            if (dayssince != null) {
                properties['dayssince'] = dayssince;
                properties['revdayssince'] = 1000000-(dayssince*2);
            }
        }

        properties['cases'] = timeSeriesItem.getValue();
        properties['negcases'] = -timeSeriesItem.getValue();
        properties['casesFmt'] = Fns.getCompactNumberRepresentation(timeSeriesItem.getValue(), 1);
        properties['casesSz'] = this._getCasesSize(feature);
        properties['casesTimeSeries'] = timeSeries;
    }

    /**
     * Make it so that there's roughly enough area
     * within circles to be able to display the text.
     *
     * This also makes it so that e.g. 100 is slightly
     * smaller than 999 etc. It's hard to find a good
     * balance here, and it may not work well for
     * millions or above.
     *
     * @param feature
     * @returns {*}
     * @private
     */
    _getCasesSize(feature) {
        var len = feature.properties['casesFmt'].length,
            absCases = Math.abs(feature.properties['cases']),
            isNeg = feature.properties['cases'] < 0.0,
            r;

        // TODO: Make millions slightly larger than thousands!
        if (100000000 >= absCases >= 10000000) {
            r = len+absCases/100000000.0;
        }
        else if (absCases >= 1000000) {
            r = len+absCases/10000000.0;
        }
        else if (absCases >= 100000) {
            r = len+absCases/1000000.0;
        }
        else if (absCases >= 10000) {
            r = len+absCases/100000.0;
        }
        else if (absCases >= 1000) {
            r = len+absCases/10000.0;
        }
        else if (absCases >= 100) {
            r = len+absCases/1000.0;
        }
        else if (absCases >= 10) {
            r = len+absCases/100.0;
        }
        else if (absCases >= 1) {
            r = len+absCases/10.0;
        }
        else {
            r = len;
        }
        return isNeg ? -r : r;
    }
}

export default GeoDataPropertyAssignment;

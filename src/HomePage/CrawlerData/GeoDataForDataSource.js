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

import BigTableOValuesDataSource from "./DEPRECATED/DataABS";
import Fns from "../ConfirmedMap/Fns";

// Higher values will result in less accurate lines,
// but faster performance. Default is 0.375
const MAPBOX_TOLERANCE = 0.45;


class GeoDataForDataSource {
    /**
     * A means to process data from GeoData instances,
     * adding properties such as case numbers or statistics.
     *
     * Also can cluster points for cases, so as to be able
     * to get a zoomed-out general overview of an area
     *
     * @param geoData the GeoData instance
     * @param dataSource
     */
    constructor(geoData, dataSource) {
        this.geoData = geoData;
        this.dataSource = dataSource;

        this._associateSource(geoData, dataSource)
    }

    /*******************************************************************
     * Data processing: combine very close points at different zoom levels
     *******************************************************************/

    /**
     * Values which are below the specified amount will be merged
     * so larger values will mean less will be displayed
     *
     * @param geoJSONData
     * @param zoomLevel
     * @returns {*|GeoDataForDataSource._getModifiedGeoJSONWithPointsJoined.props}
     * @private
     */
    _getModifiedGeoJSONWithPointsJoined(geoJSONData, zoomLevel) {
        //
        var zoomMap = {
            // I have no idea if these are right...
            0: 20.0,
            1: 10.0,
            2: 5.0,
            3: 2.2, // around 2.0 seems a good value - don't touch!
            4: 0.7,
            5: 0.35,
            6: 0.25,
            7: 0.2,
            8: 0.15
        };

        var mergeSmallerThan = zoomMap[zoomLevel];
        var eliminatedMap = new Map();
        var mergedMap = new Map();
        var distances = [];

        // Fast deep copy
        geoJSONData = JSON.parse(JSON.stringify(geoJSONData));

        // Look for all distances
        geoJSONData['features'].forEach((feature1, index1) => {
            var coords1 = feature1['geometry']['coordinates'];

            if (!feature1.properties['cases']) { //  || feature1.properties['cases'] < 0
                // Only add if cases has been added to!
                return;
            }

            geoJSONData['features'].forEach((feature2, index2) => {
                var coords2 = feature2['geometry']['coordinates'];

                if (index1 === index2) {
                    return;
                }
                else if (!feature2.properties['cases']) { //  || feature2.properties['cases'] < 0
                    // Only add if cases has been added to!
                    return;
                }

                var a = coords1[0] - coords2[0],
                    b = coords1[1] - coords2[1],
                    c = Math.sqrt(a*a + b*b);

                distances.push([c, index1, index2]);
            });
        });

        distances.sort((a, b) => a[0] - b[0]);

        for (var i=0; i<distances.length; i++) {
            var distance = distances[i][0],
                index1 = distances[i][1],
                index2 = distances[i][2];

            if (eliminatedMap.has(index2) || eliminatedMap.has(index1)) {
                // Can't eliminate if already eliminated!
                continue;
            }

            if (distance < mergeSmallerThan) {
                // Eliminate only one of two of them,
                // merging any previously merged
                var merged = mergedMap.get(index1) || [];
                merged.push(index2);
                if (mergedMap.has(index2)) {
                    merged = merged.concat(mergedMap.get(index2));
                    mergedMap.delete(index2);
                }
                mergedMap.set(index1, merged);
                eliminatedMap.set(index2, null);
            }
        }

        var newFeatures = [];
        geoJSONData['features'].forEach((feature, index) => {
            if (eliminatedMap.has(index)) {
                //feature.properties['cases'] = 0;
                //newFeatures.push(feature);
            }
            else if (mergedMap.has(index)) {
                var cases = feature.properties['cases'],
                    x = feature.geometry.coordinates[0],
                    y = feature.geometry.coordinates[1],
                    n = 1,
                    highestCases = cases;

                mergedMap.get(index).forEach(function(otherIndex) {
                    var otherFeature =  geoJSONData['features'][otherIndex];
                    x = x + otherFeature.geometry.coordinates[0];
                    y = y + otherFeature.geometry.coordinates[1];
                    cases = cases + otherFeature.properties['cases'];

                    if (otherFeature.properties['cases'] > highestCases) {
                        // Make it so city names/labels with the
                        // largest number of cases take precedence!
                        highestCases = otherFeature.properties['cases'];
                        feature.properties['city'] = otherFeature.properties['city'];
                    }

                    n = n + 1;
                });

                feature.properties['cases'] = cases;
                feature.properties['casesFmt'] = Fns.numberFormat(cases, 1);
                feature.properties['casesSz'] = feature.properties['casesFmt'].length;
                feature.geometry.coordinates = [x/n, y/n];
                newFeatures.push(feature);
            }
            else {
                newFeatures.push(feature);
            }
        });
        geoJSONData['features'] = newFeatures;

        return geoJSONData;
    }

    /*******************************************************************
     * Data processing: associate case nums
     *******************************************************************/

    /**
     * Cluster points for cases, so as to be able
     * to get a zoomed-out general overview of an area
     *
     * @param dataSource
     * @private
     */
    getPointDataByZoomLevel(dataSource) {
        var byZoom = {};

        byZoom[8] = this._getModifiedGeoJSONWithPointsJoined(
            this.pointGeoJSONData, 8
        );
        byZoom[7] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[8], 7
        );
        byZoom[6] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[7], 6
        );
        byZoom[5] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[6], 5
        );
        byZoom[4] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[5], 4
        );
        byZoom[3] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[4], 3
        );
        byZoom[2] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[3], 2
        );
        byZoom[1] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[2], 1
        );
        byZoom[0] = this._getModifiedGeoJSONWithPointsJoined(
            byZoom[1], 0
        );

        return byZoom;
    }

    /**
     *
     * @param geoJSONData
     * @param dataSource
     * @private
     */
    _assignCaseInfoToGeoJSON(geoJSONData, dataSource) {
        for (var i = 0; i < geoJSONData.features.length; i++) {
            var feature = geoJSONData.features[i];
            var cityName = this.getCityNameFromProperty(feature);

            if (!cityName) {
                //console.log("NOT CITYNAME:", data)
                continue; // WARNING!!
            }

            var timeSeriesItem = dataSource.getCaseNumber(cityName, null);
            if (!timeSeriesItem) {
                //console.log("NOT CASE INFO:", state, cityName);
                continue;
            }

            if (timeSeriesItem.getDaysSince) {
                var dayssince = dataSource.getDaysSince(cityName, null);
                if (dayssince != null) {
                    feature.properties['dayssince'] = dayssince;
                    feature.properties['revdayssince'] = 1000000-(dayssince*2);
                }
            }

            feature.properties['cases'] = timeSeriesItem.getValue();
            feature.properties['negcases'] = -timeSeriesItem.getValue();
            feature.properties['casesFmt'] = Fns.numberFormat(timeSeriesItem.getValue(), 1);
            feature.properties['casesSz'] = this._getCasesSize(feature);
            feature.properties['city'] = cityName;
            feature.properties['cityLabel'] = (
                this.getCityPrintableNameFromProperty ?
                    this.getCityPrintableNameFromProperty(feature) : cityName
            );
        }
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
     * @param data
     * @returns {*}
     * @private
     */
    _getCasesSize(data) {
        var len = data.properties['casesFmt'].length,
            absCases = Math.abs(data.properties['cases']),
            isNeg = data.properties['cases'] < 0.0,
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

    /*******************************************************************
     * Data processing: associate abs statistics
     *******************************************************************/

    /**
     *
     * @param dataSource
     * @private
     */
    _associateStatSource(dataSource) {
        if (dataSource.getMaxMinValues) {
            this.maxMinStatVal = dataSource.getMaxMinValues();
        }
        this._assignStatInfoToGeoJSON(this.geoJSONData, dataSource);

        let uniqueId = this.getFillSourceId(dataSource);
        if (uniqueId in this.addedSources) {
            return;
        }
        this.addedSources[uniqueId] = null;

        this.map.addSource(uniqueId, {
            type: 'geojson',
            data: this.geoJSONData,
            tolerance: MAPBOX_TOLERANCE
        });
    }

    /**
     *
     * @param geoJSONData
     * @param dataSource
     * @private
     */
    _assignStatInfoToGeoJSON(geoJSONData, dataSource) {
        var statInfo;
        const state = this.stateName;

        for (var i = 0; i < geoJSONData.features.length; i++) {
            var feature = geoJSONData.features[i];
            var cityName = this.getCityNameFromProperty(feature);
            if (!cityName) {
                //console.log("NOT CITYNAME:", data)
                continue; // WARNING!!
            }
            statInfo = dataSource.getCaseInfoForCity(
                state, cityName
            );
            if (!statInfo) {
                //console.log("NOT STAT INFO:", state, cityName);
                continue;
            }
            feature.properties['stat'] = statInfo['numCases'];
            feature.properties['statCity'] = cityName;
            feature.properties['statDate'] = statInfo['updatedDate'];
            feature.properties['city'] = cityName;
        }

        return geoJSONData;
    }
}

export default GeoDataForDataSource;

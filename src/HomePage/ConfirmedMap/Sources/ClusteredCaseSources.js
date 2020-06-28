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

import Fns from "../Fns";
import MapBoxSource from "./MapBoxSource"


var UNCLUSTERED_ZOOM = 9;


class ClusteredCaseSources {
    /**
     * A collection of mapbox sources which largely functions like
     * a single one, clustering/merging case numbers which overlap
     * so as to be able to get a zoomed out overview
     *
     * @param map a MapBox GL instance
     */
    constructor(map) {
        this.__sources = {};

        for (var i=0; i<UNCLUSTERED_ZOOM+1; i++) {
            this.__sources[i] = new MapBoxSource(
                map, i, UNCLUSTERED_ZOOM === i ? null : i+1
            );
        }
    }

    /**
     * Get the minimum zoom level at which
     * this set of sources is displayed
     *
     * @returns {number}
     */
    getMinZoom() {
        return 0;
    }

    /**
     * Get the maximum zoom level at which
     * this set of sources is displayed
     *
     * @returns {number}
     */
    getMaxZoom() {
        return UNCLUSTERED_ZOOM;
    }

    /**
     * Get the MapBox source layer ID for a given zoom level
     *
     * @param zoomLevel
     * @returns {string}
     */
    getSourceIdByZoom(zoomLevel) {
        return this.__sources[zoomLevel].getSourceId();
    }

    /**
     * Get the MapBox source layer instance for a given zoom level
     *
     * @param zoomLevel
     */
    getSourceInstByZoom(zoomLevel) {
        return this.__sources[zoomLevel];
    }

    /**************************************************************************
     * Update data/features
     **************************************************************************/

    /**
     * Reset the GeoJSON data when changing modes etc
     */
    clearData() {
        for (let [key, source] of Object.entries(this.__sources)) {
            source.clearData();
        }
    }

    /**
     * Update the GeoJSON data if regions changed
     *
     * @param data
     */
    setData(data) {
        if (this.__sources[UNCLUSTERED_ZOOM].setData(data)) {
            var byZoom = this.getPointDataByZoomLevel(data);

            for (let i=0; i<UNCLUSTERED_ZOOM; i++) {
                if (!byZoom[i]) throw "Shouldn't get here!";
                this.__sources[i].setData(byZoom[i]);
            }
        }
    }

    /**************************************************************************
     * Remove source
     **************************************************************************/

    /**
     * Remove the sources
     */
    remove() {
        for (let [key, source] of Object.entries(this.__sources)) {
            source.remove();
        }
    }

    /*******************************************************************
     * Data processing: combine very close points at different zoom levels
     *******************************************************************/

    /**
     * Cluster points for cases, so as to be able
     * to get a zoomed-out general overview of an area
     *
     * @param pointGeoJSONData
     */
    getPointDataByZoomLevel(pointGeoJSONData) {
        let byZoom = {};

        byZoom[9] = pointGeoJSONData;

        for (let i=UNCLUSTERED_ZOOM; i>0; i--) {
            byZoom[i-1] = this.__getModifiedGeoJSONWithPointsJoined(
                byZoom[i], i-1
            );
        }
        return byZoom;
    }

    /**
     * Values which are below the specified amount will be merged
     * so larger values will mean less will be displayed
     *
     * @param geoJSONData
     * @param zoomLevel
     * @returns {*|GeoDataForDataSource.__getModifiedGeoJSONWithPointsJoined.props}
     */
    __getModifiedGeoJSONWithPointsJoined(geoJSONData, zoomLevel) {
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
            8: 0.15,
            9: 0.10,
            10: 0.6,
            11: 0.4,
            12: 0.2
        };

        var mergeSmallerThan = zoomMap[zoomLevel];
        var eliminatedMap = new Map();
        var mergedMap = new Map();
        var distances = [];

        // Fast deep copy
        geoJSONData = JSON.parse(JSON.stringify(geoJSONData));

        // Look for all distances
        let index1 = -1;
        for (let feature1 of geoJSONData['features']) {
            index1++;

            var coords1 = feature1['geometry']['coordinates'];
            if (!feature1.properties['cases']) { //  || feature1.properties['cases'] < 0
                // Only add if cases has been added to!
                continue;
            }

            let index2 = -1;
            for (let feature2 of geoJSONData['features']) {
                index2++;

                var coords2 = feature2['geometry']['coordinates'];
                if (index1 === index2) {
                    continue;
                } else if (!feature2.properties['cases']) { //  || feature2.properties['cases'] < 0
                    // Only add if cases has been added to!
                    continue;
                }

                var a = coords1[0] - coords2[0],
                    b = coords1[1] - coords2[1],
                    c = Math.sqrt(a * a + b * b);

                if (c < mergeSmallerThan) {
                    // Only add if less than threshold!
                    distances.push([c, index1, index2]);
                }
            }
        }

        distances.sort((a, b) => a[0] - b[0]);

        for (var i=0; i<distances.length; i++) {
            let distance = distances[i][0],
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

        let newFeatures = [],
            index = -1;

        for (let feature of geoJSONData['features']) {
            index++;

            var properties = feature.properties,
                geometry = feature.geometry;

            if (eliminatedMap.has(index)) {
                //feature.properties['cases'] = 0;
                //newFeatures.push(feature);
            }
            else if (mergedMap.has(index)) {
                var cases = properties['cases'],
                    x = geometry.coordinates[0],
                    y = geometry.coordinates[1],
                    n = 1,
                    highestCases = cases;

                for (let otherIndex of mergedMap.get(index)) {
                    var otherFeature =  geoJSONData['features'][otherIndex],
                        otherProperties = otherFeature.properties,
                        otherGeometry = otherFeature.geometry;

                    x = x + otherGeometry.coordinates[0];
                    y = y + otherGeometry.coordinates[1];

                    cases = cases + otherProperties['cases'];

                    if (otherProperties['cases'] > highestCases) {
                        // Make it so city names/labels with the
                        // largest number of cases take precedence!
                        highestCases = otherProperties['cases'];
                        properties['city'] = otherProperties['city'];
                    }

                    n = n + 1;
                }

                properties['cases'] = cases;
                properties['casesFmt'] = Fns.getCompactNumberRepresentation(cases, 1);
                properties['casesSz'] = properties['casesFmt'].length;
                geometry.coordinates = [x/n, y/n];
                newFeatures.push(feature);
            }
            else {
                newFeatures.push(feature);
            }
        }
        geoJSONData['features'] = newFeatures;

        return geoJSONData;
    }
}

export default ClusteredCaseSources;

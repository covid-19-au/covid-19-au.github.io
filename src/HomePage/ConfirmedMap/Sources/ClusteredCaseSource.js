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


class ClusteredCaseSource extends MapBoxSource {
    /**
     * A collection of mapbox sources which largely functions like
     * a single one, clustering/merging case numbers which overlap
     * so as to be able to get a zoomed out overview
     *
     * @param map a MapBox GL instance
     * @param minZoom
     * @param maxZoom
     * @param data
     */
    constructor(map, minZoom, maxZoom, data) {
        super(map, minZoom, maxZoom, data);
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

    /**************************************************************************
     * Update data/features
     **************************************************************************/

    /**
     * Update the GeoJSON data if regions changed
     *
     * @param data
     * @param geoDataInsts
     * @param caseDataInsts
     */
    setData(data, geoDataInsts, caseDataInsts) {
        var currentZoom = parseInt(this.map.getZoom());
        //console.log(`current zoom: ${currentZoom}`);
        let modifiedData = this.__getModifiedGeoJSONWithPointsJoined(data, currentZoom);
        this.__clusteringBeingUsed = modifiedData.features.length !== data.features.length;
        return super.setData(modifiedData, geoDataInsts, caseDataInsts);
    }

    /*******************************************************************
     * Miscellaneous
     *******************************************************************/

    /**
     *
     * @returns {boolean}
     */
    clusteringBeingUsed() {
        return this.__clusteringBeingUsed;
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
     * @returns {*|GeoDataForDataSource.__getModifiedGeoJSONWithPointsJoined.props}
     */
    __getModifiedGeoJSONWithPointsJoined(geoJSONData, zoomLevel) {
        var zoomMap = {
            // I have no idea if these are right...
            // There will be less circles with higher numbers
            0: 45,
            1: 12,
            2: 6,
            3: 3.5,
            4: 1.5,
            5: 0.8,
            6: 0.4,
            7: 0.2,
            8: 0.05,
            9: 0.025,
            10: 0.0007,
            11: 0.00035,
            12: 0.00010
        };

        var mergeSmallerThan = zoomMap[zoomLevel];
        var eliminatedMap = new Map();
        var mergedMap = new Map();
        var byCaseCount = [];

        // Fast deep copy
        geoJSONData = JSON.parse(JSON.stringify(geoJSONData));

        // Look for all distances
        let index = -1;
        for (let feature of geoJSONData['features']) {
            index++;
            if (!feature.properties['cases']) { //  || feature1.properties['cases'] < 0
                // Only add if cases has been added to!
                continue;
            }
            byCaseCount.push([feature.properties['cases'], index]);
        }

        // Sort so that areas with highest cases eliminate those with the lowest
        byCaseCount.sort((a, b) => b[0] - a[0]);

        for (let i=0; i<byCaseCount.length; i++) {
            let index1 = byCaseCount[i][1],
                coords1 = geoJSONData['features'][index1]['geometry']['coordinates'];

            for (let j=byCaseCount.length-1; j>i; j--) {
                if (i === j) {
                    continue;
                }

                let index2 = byCaseCount[j][1],
                    coords2 = geoJSONData['features'][index2]['geometry']['coordinates'];

                if (eliminatedMap.has(index2) || eliminatedMap.has(index1)) {
                    // Can't eliminate if already eliminated!
                    continue;
                }

                var a = coords1[0] - coords2[0],
                    b = coords1[1] - coords2[1],
                    distance = Math.sqrt(a * a + b * b);

                if (distance < mergeSmallerThan) {
                    // Eliminate only one of two of them,
                    // merging any previously merged
                    var merged = mergedMap.get(index1) || [];
                    merged.push(index2);
                    mergedMap.set(index1, merged);
                    eliminatedMap.set(index2, null);

                    /*
                    if (mergedMap.has(index2)) {
                        merged = merged.concat(mergedMap.get(index2));
                        mergedMap.delete(index2);
                    }
                    mergedMap.set(index1, merged);
                    eliminatedMap.set(index2, null);
                    */
                }
            }
        }

        let newFeatures = [];
        index = -1;

        for (let feature of geoJSONData['features']) {
            index++;

            var properties = feature.properties;

            if (eliminatedMap.has(index)) {
                //feature.properties['cases'] = 0;
                //newFeatures.push(feature);
            }
            else if (mergedMap.has(index)) {
                var cases = properties['cases'];

                for (let otherIndex of mergedMap.get(index)) {
                    // TODO: Add info about which features were merged(?)
                    var otherFeature =  geoJSONData['features'][otherIndex],
                        otherProperties = otherFeature.properties;

                    cases = cases + otherProperties['cases'];
                }

                if (properties.label ) {
                    // HACK: Give an indicator that there's actually multiple region at this point
                    // This should be implemented in a way which allows adding unified popups, etc with fill area charts
                    properties.label = `${properties.label} (+${mergedMap.get(index).length} more)`;
                }

                properties['cases'] = cases;
                properties['casesFmt'] = Fns.getCompactNumberRepresentation(cases, 1);
                properties['casesSz'] = properties['casesFmt'].length;
                properties['negcases'] = -cases;
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

export default ClusteredCaseSource;

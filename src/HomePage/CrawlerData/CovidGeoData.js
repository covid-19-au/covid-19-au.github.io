import Fns from "../ConfirmedMap/Fns";
import BigTableOValuesDataSource from "./DataABS";

class CovidGeoData {
    constructor(geoData, regionSchema, regionParent) {
        this.regionSchema = regionSchema;
        this.regionParent = regionParent;
        this.geoData = geoData;

        this.pointData = {};
        this.polyData = {};

         this._processData(geoData);
    }

    _processData(geoData) {
        /*
        this.geodata -> {
            schemaType: {
                regionParent: {
                    regionChild: {
                        geodata: [
                            [area,
                             x1,y1,x2,y2 bounding coords,
                             center coords,
                             points],
                        ...],
                        label: {
                            'en': ...,
                            ...
                        }
                    }
                }
            }
        }

        where:
        * schemaType is e.g. 'admin0' for countries, 'admin1' for
          states/territories/provinces, or a custom system like 'lga'
        * regionParent is the ISO-3166-a2 code (e.g. 'AU') or
          ISO-3166-2 code (e.g. 'AU-VIC') this item replaces.
          Should be a blank string for admin0.
        * regionChild is the ISO-3166-a2 code (when admin0),
          ISO-3166-2 code (when admin1/can otherwise be converted,
          as some for 'uk-area' are) or other unique ID
          (such as "geelong"). Note the name has been pre-processed with

        This file converts the data into a format MapBox GL can use for
        displaying layers.
         */

    }

    getForItem(regionChild, noCopy) {
        // TODO!
    }

    getByISO_3166_2(iso_3166_2, noCopy) {
        // TODO!
    }

    /*******************************************************************
     * Data processing: combine very close points at different zoom levels
     *******************************************************************/

    _getModifiedGeoJSONWithPointsJoined(geoJSONData, zoomLevel) {
        // Values which are below the specified amount will be merged
        // so larger values will mean less will be displayed
        var zoomMap = {
            // I have no idea if these are right...
            //1: 3.0,
            2: 5.0,
            3: 2.2, // around 2.0 seems a good value - don't touch!
            4: 0.7,
            5: 0.35,
            6: 0.25//,
            //7: 0.3,
            //8: 0.2
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
     * Data processing: find central x,y points in polygon areas
     *******************************************************************/

    _findCenter(coordinates) {
        var minX = 999999999999,
            minY = 999999999999,
            maxX = -999999999999,
            maxY = -999999999999;

        for (let i = 0; i < coordinates.length; i++) {
            for (let j = 0; j < coordinates[i].length; j++) {
                let x = coordinates[i][j][0],
                    y = coordinates[i][j][1];

                if (x > maxX) maxX = x;
                if (x < minX) minX = x;
                if (y > maxY) maxY = y;
                if (y < minY) minY = y;
            }
        }

        var centerX = minX + (maxX - minX) / 2.0,
            centerY = minY + (maxY - minY) / 2.0;
        return [centerX, centerY];
    }

    _canPutInCenter(point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        // (MIT license)

        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
}
import polylabel from "polylabel";
import Fns from "./Fns"


class GeoBoundaryCentralPoints {
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
                    n = 1;

                mergedMap.get(index).forEach(function(otherIndex) {
                    var otherFeature =  geoJSONData['features'][otherIndex];
                    x = x + otherFeature.geometry.coordinates[0];
                    y = y + otherFeature.geometry.coordinates[1];
                    cases = cases + otherFeature.properties['cases'];
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

    _getModifiedGeoJSONWithPolyCentralAreaPoints(geoJSONData) {
        // Uses https://github.com/mapbox/polylabel
        // to get the central point of the polygon
        let r = {
            "type": "FeatureCollection",
            "features": [/*...*/]
        };
        var that = this;

        // console.log('here',geoJSONData['features'])

        geoJSONData['features'].filter(
            (feature) => !!feature['geometry']
        ).map((feature) => {

            // First, collect as individual polygons,
            // as we can't work with MultiPolygons

            function collectCoordinates(coordinates) {
                r["features"].push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": coordinates
                    },
                    "properties": feature["properties"]
                });
            }

            if (feature['geometry']['type'] === 'MultiPolygon') {
                feature["geometry"]["coordinates"].forEach(
                    (coordinates) => collectCoordinates(coordinates)
                );
            }
            else if (feature['geometry']['type'] === 'Polygon') {
                collectCoordinates(feature["geometry"]["coordinates"]);
            }
            else {
                throw "Unknown geometry type: " +
                feature['geometry']['type'];
            }
        });

        // Ignore small islands etc, only adding a
        // heatmap to the polygons with the largest area

        function filterToOnlyLargestAreas(features) {
            var areaMap = {};

            for (let i = 0; i < features.length; i++) {
                var feature = features[i],
                    properties = feature['properties'];

                // WA data HACK!
                delete properties['lg_ply_pid'];
                delete properties['id'];

                var area = that._getArea(
                    feature['geometry']['coordinates']
                );

                function getUniqueKey(d) {
                    var r = [];
                    for (var k in d) {
                        r.push([k, d[k]])
                    }
                    r.sort();
                    return JSON.stringify(r);
                }

                var uniqueKey = getUniqueKey(properties);

                if (!(uniqueKey in areaMap) || areaMap[uniqueKey][0] < area) {
                    areaMap[uniqueKey] = [area, feature];
                }
            }

            var r = [];
            for (var k in areaMap) {
                // Convert from polygon to a single point
                areaMap[k][1]['geometry']['type'] = 'Point';
                areaMap[k][1]['geometry']['coordinates'] = getPointCoord(
                    areaMap[k][1]['geometry']['coordinates']
                );
                r.push(areaMap[k][1])
            }
            return r;
        }

        function getPointCoord(coordinates) {
            var center = that._findCenter(coordinates),
                pointCoord;

            if (that._canPutInCenter(center, coordinates)) {
                pointCoord = polylabel(
                    coordinates, 10.0
                );
                pointCoord = [
                    (pointCoord[0] + center[0]) / 2.0,
                    (pointCoord[1] + center[1]) / 2.0
                ];
            }
            else {
                pointCoord = polylabel(
                    coordinates, 0.5
                )
            }
            return pointCoord;
        }

        r["features"] = filterToOnlyLargestAreas(
            r["features"]
        );
        return r
    }

    _getArea(coordinates) {
        // Get approximate area of polygons
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
        return (
            (maxX - minX) *
            (maxY - minY)
        );
    }

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

export default GeoBoundaryCentralPoints;

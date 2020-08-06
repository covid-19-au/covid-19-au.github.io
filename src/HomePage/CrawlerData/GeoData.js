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

import RegionType from "../CrawlerDataTypes/RegionType";
import LngLatBounds from "../CrawlerDataTypes/LngLatBounds"
import Fns from "../ConfirmedMap/Fns"
import mapbox from "mapbox-gl";


class GeoData {
    /**
     * TODO!!!!
     * where:
     *   * schemaType is e.g. 'admin0' for countries, 'admin1' for
     *     states/territories/provinces, or a custom system like 'lga'
     *   * regionParent is the ISO-3166-a2 code (e.g. 'AU') or
     *     ISO-3166-2 code (e.g. 'AU-VIC') this item replaces.
     *     Should be a blank string for admin0.
     *
     * @param regionSchema
     * @param regionParent
     * @param schemaRegionSchema
     * @param schemaRegionParent
     * @param regionParentGeoData
     */
    constructor(regionSchema, regionParent,
                schemaRegionSchema, schemaRegionParent,
                regionParentGeoData) {

        this.regionSchema = regionSchema;
        this.regionParent = regionParent;

        // The schema has parents itself, for instance
        // admin1 AU-VIC's parent is admin0 AU
        //
        // Registered here because, if admin1 AU-* is
        // displayed, admin0 AU shouldn't be
        this.schemaRegionSchema = schemaRegionSchema;
        this.schemaRegionParent = schemaRegionParent;

        this.regionParentGeoData = regionParentGeoData;
        this.iso639code = 'en'; // HACK: Please add localization support later!!! ======================================
        this._processData(regionParentGeoData);
    }

    /*******************************************************************
     * Intial processing of data
     *******************************************************************/

    /**
     * regionParentGeoData -> {
     *     regionChild: {
     *         geodata: [
     *             [area,
     *              x1,y1,x2,y2 bounding coords,
     *              center coords,
     *              points],
     *         ...],
     *         label: {
     *             'en': ...,
     *             ...
     *         }
     *     }
     * }
     * regionChild is the ISO-3166-a2 code (when admin0),
     * ISO-3166-2 code (when admin1/can otherwise be converted,
     * as some for 'uk-area' are) or other unique ID
     * (such as "geelong"). Note the name has been pre-processed with
     *
     * This file converts the data into a format MapBox GL can use for
     * displaying layers.
     *
     * @param regionParentGeoData
     * @private
     */
    _processData(regionParentGeoData) {
        var outlines = {
            "type": "FeatureCollection",
            "features": []
        };
        var points = {
            "type": "FeatureCollection",
            "features": []
        };
        let bounds = {};

        for (let [regionChild, childData] of Object.entries(regionParentGeoData)) {
            let geodata = childData['geodata'];
            let uniqueId = `${this.regionSchema}||${this.regionParent}||${regionChild}`;
            let largestItem = 1;

            let min_lng = 9999999999999999;
            let min_lat = 9999999999999999;
            let max_lng = -99999999999999999;
            let max_lat = -99999999999999999;

            for (let [area, boundingCoords, centerCoords, iPoints] of geodata) {
                var properties = {
                    "area": area,
                    "largestItem": largestItem,
                    "boundingCoords": this.__uncompress(boundingCoords),
                    "centerCoords": this.__uncompress(centerCoords),
                    "regionSchema": this.regionSchema,
                    "regionParent": this.regionParent,
                    "regionChild": regionChild,
                    "uniqueid": uniqueId,
                    "label": this.getLabel(regionChild, this.iso639code)
                };
                outlines['features'].push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": this.__uncompressPoints(iPoints)
                    },
                    "properties": properties
                });
                points['features'].push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": centerCoords
                    },
                    // Make sure it's a different object so that modifying properties for
                    // the points won't modify the polygon properties and vice versa
                    "properties": JSON.parse(JSON.stringify(properties))
                });
                largestItem = 0;

                let [lng1, lat1, lng2, lat2] = boundingCoords;

                if (lng1 < min_lng) min_lng = lng1;
                if (lng2 < min_lng) min_lng = lng2;

                if (lat1 < min_lat) min_lat = lat1;
                if (lat2 < min_lat) min_lat = lat2;

                if (lng1 > max_lng) max_lng = lng1;
                if (lng2 > max_lng) max_lng = lng2;

                if (lat1 > max_lat) max_lat = lat1;
                if (lat2 > max_lat) max_lat = lat2;
            }

            bounds[uniqueId] = new LngLatBounds(
                min_lng, min_lat, max_lng, max_lat
            );
        }

        // Assign localized names so that the RegionType can use them
        let labels = {};
        for (let regionChild in this.regionParentGeoData) {
            labels[regionChild] = this.regionParentGeoData[regionChild]['label'];
        }
        RegionType.__assignLabels(this.regionSchema, this.regionParent, labels);

        this.outlines = outlines;
        this.points = points;
        this.bounds = bounds;
    }

    /**
     *
     * @param points
     * @returns {*}
     * @private
     */
    __uncompress(points) {
        return points.map(i => i/1000.0);
    }

    /**
     *
     * @param points
     * @private
     */
    __uncompressPoints(points) {
        let r = [];
        for (let [long, lat] of points) {
            let item = [];
            for (let i = 0; i < long.length; i++) {
                item.push([long[i] / 1000.0, lat[i] / 1000.0])
            }
            r.push(item);
        }
        return r;
    }

    /*******************************************************************
     * Basic methods - region info and get localized region names
     *******************************************************************/

    /**
     * Get the region schema
     *
     * @returns {*}
     */
    getRegionSchema() {
        return this.regionSchema;
    }

    /**
     * Get the region parent
     *
     * @returns {*}
     */
    getRegionParent() {
        return this.regionParent;
    }

    /**
     * Get the GeoData instance of the parent.
     * null if this GeoData is for admin0
     *
     * @returns {*}
     */
    getParentGeoData() {
        return this.regionParentGeoData;
    }

    /**
     * Get the localized label/name of a given region
     *
     * @param regionChild the region child
     * @param iso_639 the ISO 639 language code
     * @returns {*}
     */
    getLabel(regionChild, iso_639) {
        return (
            this.regionParentGeoData[regionChild]['label'][iso_639] ||
            this.regionParentGeoData[regionChild]['label']['en']
        )
    }

    /**
     *
     * @returns {*}
     */
    getSchemaRegionSchema() {
       return this.schemaRegionSchema;
    }

    /**
     *
     * @returns {*}
     */
    getSchemaRegionParent() {
        return this.schemaRegionParent;
    }

    /*******************************************************************
     * Get central points/polygon outlines of children
     *******************************************************************/

    /**
     * Get the central x,y points of child regions
     *
     * @param copy
     */
    getCentralPoints(copy, lngLatBounds) {
        var r = this.points;
        if (copy) {
            r = JSON.parse(JSON.stringify(r));
        }
        if (lngLatBounds) {
            r = this.__filteredToLngLatBounds(r, lngLatBounds);
        }
        return r;
    }

    /**
     * Get the polygon outlines for child regions
     *
     * @param copy
     */
    getPolygonOutlines(copy, lngLatBounds) {
        var r = this.outlines;
        if (copy) {
            r = JSON.parse(JSON.stringify(r));
        }
        if (lngLatBounds) {
            r = this.__filteredToLngLatBounds(r, lngLatBounds);
        }
        return r;
    }

    /**
     *
     * @param geoJSON
     * @private
     */
    __filteredToLngLatBounds(geoJSON, lngLatBounds) {
        let features = [];

        for (let feature of geoJSON['features']) {
            let iLngLatBounds = this.bounds[feature.properties['uniqueid']];

            if (lngLatBounds.intersects(iLngLatBounds)) {
                features.push(feature);
            }
        }

        let r = Fns.geoJSONFromFeatures(features);
        return r;
    }

    /*******************************************************************
     * Data processing: find central x,y points in polygon areas
     *******************************************************************/

    /**
     * Get an estimation of the center x,y inside an array of
     * x, y coordinates
     *
     * Note: In some cases, this may actually be outside the polygon,
     * as it simply is center point based on the bounding box!
     *
     * @param coordinates array of [[x, y], ...] coordinates
     * @returns {number[]}
     * @private
     */
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

    /**
     * Get whether a given point is contained within a polygon
     *
     * @param point
     * @param vs
     * @returns {boolean}
     * @private
     */
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
export default GeoData;

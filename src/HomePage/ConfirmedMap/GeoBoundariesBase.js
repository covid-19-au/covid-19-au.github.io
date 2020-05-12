import BigTableOValuesDataSource from "./ABSData";
import FillPolyLayer from "./LayerFillPoly";
import LinePolyLayer from "./LayerLinePoly";
import HeatMapLayer from "./LayerHeatMap";
import polylabel from "polylabel";


// Higher values will result in less accurate lines,
// but faster performance. Default is 0.375
const MAPBOX_TOLERANCE = 0.45;


class JSONGeoBoundariesBase {
    constructor(map, schema, stateName, uniqueId, data) {
        this.map = map;
        this.schema = schema;
        this.stateName = stateName;
        this.uniqueId = uniqueId;
        this.addedSources = {};  // Using as a set
        this._onLoadData(data);
    }

    _onLoadData(data) {
        this.geoJSONData = data;
        this.pointGeoJSONData = this._getModifiedGeoJSONWithPolyCentralAreaPoints(
            this.geoJSONData
        );
    }

    /*******************************************************************
     * Unique IDs for sources and layers
     *******************************************************************/

    getHeatmapSourceId(dataSource) {
        // Get a unique ID for sources shared by the
        // auto-generated central points in the
        // middle of the polys for the heat maps
        return this.uniqueId+dataSource.getSourceName()+'heatmapsource';
    }
    getFillSourceId(dataSource) {
        // Get a unique ID for sources shared by fill/line polys
        return this.uniqueId+dataSource.getSourceName()+'fillsource';
    }

    /*******************************************************************
     * Fill poly-related
     *******************************************************************/

    addFillPoly(absDataSource, caseDataSource, opacity,
        addLegend, addPopupOnClick, addUnderLayerId) {

        this.removeFillPoly();

        if (absDataSource) {
            this._associateSource(absDataSource);
        }
        if (caseDataSource) {
            this._associateSource(caseDataSource);
        }

        this._fillPolyLayer = new FillPolyLayer(
            this.map,
            absDataSource, caseDataSource, opacity,
            addLegend, addPopupOnClick, addUnderLayerId,
            this.uniqueId,
            this.getFillSourceId(
                absDataSource || caseDataSource
            )
        );
    }

    removeFillPoly() {
        if (this._fillPolyLayer) {
            this._fillPolyLayer.remove();
            delete this._fillPolyLayer;
        }
    }

    /*******************************************************************
     * Line polys
     *******************************************************************/

    addLinePoly(dataSource, color) {
        this.removeLinePoly();
        this._associateSource(dataSource);

        this._linePolyLayer = new LinePolyLayer(
            this.map, dataSource, this.uniqueId, color,
            this.getFillSourceId(dataSource)
        );
    }

    removeLinePoly() {
        if (this._linePolyLayer) {
            this._linePolyLayer.remove();
            delete this._linePolyLayer;
        }
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    addHeatMap(dataSource) {
        this.removeHeatMap();
        this._associateSource(dataSource);

        this._heatMapLayer = new HeatMapLayer(
            this.map, dataSource, this.uniqueId,
            this.getHeatmapSourceId(dataSource)
        );
    }

    removeHeatMap() {
        if (this._heatMapLayer) {
            this._heatMapLayer.remove();
            delete this._heatMapLayer;
        }
    }

    /*******************************************************************
     * Data processing
     *******************************************************************/

    _associateSource(dataSource) {
        if (dataSource instanceof BigTableOValuesDataSource) {
            // ABS stats
            this._associateStatSource(dataSource);
        }
        else {
            this._associateCaseNumsDataSource(dataSource);
        }
    }

    _associateCaseNumsDataSource(dataSource) {
        this._assignCaseInfoToGeoJSON(this.pointGeoJSONData, dataSource);
        let oid = this.getHeatmapSourceId(dataSource);
        if (!(oid in this.addedSources)) {
            //console.log("ADDING HEATMAP SOURCE:"+oid);
            this.addedSources[oid] = null;
            this.map.addSource(oid, {
                type: 'geojson',
                data: this.pointGeoJSONData,
                tolerance: MAPBOX_TOLERANCE
            });
        }

        this._assignCaseInfoToGeoJSON(this.geoJSONData, dataSource);
        let fid = this.getFillSourceId(dataSource);
        if (!(fid in this.addedSources)) {
            //console.log("ADDING FILL SOURCE:"+fid);
            this.addedSources[fid] = null;
            this.map.addSource(fid, {
                type: 'geojson',
                data: this.geoJSONData,
                tolerance: MAPBOX_TOLERANCE
            });
        }
    }

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

    _assignCaseInfoToGeoJSON(geoJSONData, dataSource) {
        var caseInfo;
        const state = this.stateName;

        for (var i = 0; i < geoJSONData.features.length; i++) {
            var data = geoJSONData.features[i];
            var cityName = this.getCityNameFromProperty(data);
            if (!cityName) {
                //console.log("NOT CITYNAME:", data)
                continue; // WARNING!!
            }

            caseInfo = dataSource.getCaseNumber(cityName, null);
            if (!caseInfo) {
                //console.log("NOT CASE INFO:", state, cityName);
                continue;
            }
            data.properties['cases'] = caseInfo['numCases'];
            data.properties['city'] = cityName;
        }
    }

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

    _assignStatInfoToGeoJSON(geoJSONData, dataSource) {
        var statInfo;
        const state = this.stateName;

        for (var i = 0; i < geoJSONData.features.length; i++) {
            var data = geoJSONData.features[i];
            var cityName = this.getCityNameFromProperty(data);
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
            data.properties['stat'] = statInfo['numCases'];
            data.properties['statCity'] = cityName;
            data.properties['statDate'] = statInfo['updatedDate'];
            data.properties['city'] = cityName;
        }
    }
}

export default JSONGeoBoundariesBase;

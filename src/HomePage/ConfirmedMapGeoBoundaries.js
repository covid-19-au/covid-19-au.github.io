import ReactGA from "react-ga";
import mapboxgl from "mapbox-gl";
import polylabel from "polylabel";
import CanvasJS from "../assets/canvasjs.min";

// by LGA
import vicLgaData from "../data/lga_vic.geojson"
import nswLgaData from "../data/lga_nsw.geojson"
import ntLgaData from "../data/lga_nt.geojson"
import qldLgaData from "../data/lga_qld.geojson"
import saLgaData from "../data/lga_sa.geojson"
import tasLgaData from "../data/lga_tas.geojson"
import waLgaData from "../data/lga_wa.geojson"

// by other schema
import actSaData from "../data/sa3_act.geojson"
import qldHhsData from "../data/hhs_qld.geojson"
import nswLhdData from "../data/lhd_nsw.geojson"
//import nswPostCodeData from "../data/postcode_nsw.geojson"

// statewide outlines (when regional data not available)
import actOutlineData from "../data/boundary_act.geojson"
import vicOutlineData from "../data/boundary_vic.geojson"
import nswOutlineData from "../data/boundary_nsw.geojson"
import qldOutlineData from "../data/boundary_qld.geojson"
import waOutlineData from "../data/boundary_wa.geojson"
import saOutlineData from "../data/boundary_sa.geojson"
import tasOutlineData from "../data/boundary_tas.geojson"
import ntOutlineData from "../data/boundary_nt.geojson"

import BigTableOValuesDataSource from "./ConfirmedMapABSData"
import ConfirmedMapFns from "./ConfirmedMapFns"


// Higher values will result in less accurate lines,
// but faster performance. Default is 0.375
const MAPBOX_TOLERANCE = 0.45;


function __getGeoBoundaryClasses() {
    return {
        // LGA classes
        //"act:lga": ACTBoundary,
        "nsw:lga": NSWLGABoundaries,
        "nt:lga": NTLGABoundaries,
        "vic:lga": VicLGABoundaries,
        "qld:lga": QLDLGABoundaries,
        "sa:lga": SALGABoundaries,
        "tas:lga": TasLGABoundaries,
        "wa:lga": WALGABoundaries,

        // Statewide outlines
        "act:statewide": ACTBoundary,
        "nsw:statewide": NSWBoundary,
        "nt:statewide": NTBoundary,
        "vic:statewide": VicBoundary,
        "qld:statewide": QLDBoundary,
        "sa:statewide": SABoundary,
        "tas:statewide": TasBoundary,
        "wa:statewide": WABoundary,

        // Other schemas
        "act:sa3": ACTSA3Boundaries,
        "qld:hhs": QLDHHSGeoBoundaries,
        "nsw:lhd": NSWLHDGeoBoundaries//,
        //"nsw:postcode": NSWPostCodeBoundaries
    };
}


function getAvailableGeoBoundaries() {
    return ConfirmedMapFns.sortedKeys(__getGeoBoundaryClasses());
}

var __geoBoundaryCache = new Map();
function getGeoBoundary(map, schema, stateName) {
    let key = `${stateName}:${schema}`;
    if (__geoBoundaryCache.has(key)) {
        return __geoBoundaryCache.get(key);
    }
    console.log(`Creating new stateName:${stateName} schema:${schema}`)
    var inst = new (__getGeoBoundaryClasses()[key])(map);
    __geoBoundaryCache.set(key, inst);
    return inst;
}

function clearGeoBoundaryCache() {
    // Make sure to call this when destroying the map!
    __geoBoundaryCache = new Map();
}


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

    getHeatMapId() {
        return this.uniqueId+'heatmap';
    }
    getHeatPointId() {
        return this.uniqueId+'heatpoint';
    }
    getFillPolyId() {
        return this.uniqueId+'fillpoly';
    }
    getLinePolyId() {
        return this.uniqueId+'linepoly';
    }

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

    addFillPoly(absDataSource, // the ABS underlay source (if any)
        caseDataSource, // the case source for popups (if any)
        opacity,
        addLegend,
        addPopupOnClick,
        addUnderLayerId) {

        // Add the colored fill area
        const map = this.map;

        if (absDataSource) {
            this._associateSource(absDataSource);
        }
        if (caseDataSource) {
            this._associateSource(caseDataSource);
        }

        if (opacity == null) {
            opacity = 0.75;
        }

        // Display before the heatmap
        // (if one is displayed)
        var layers = map.getStyle().layers;
        var firstHeatmapId = null;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'heatmap') {
                firstHeatmapId = layers[i].id;
                break;
            }
        }

        var min, max, median;
        if (this.maxMinStatVal) {
            min = this.maxMinStatVal['min'];
            max = this.maxMinStatVal['max']; // HACK!
            // HACK - weight the median so we don't
            // get the same values more than once!
            median = (this.maxMinStatVal['median'] * 0.7) + ((min + (max - min)) * 0.3);
        }
        else {
            min = 0;
            median = 125;
            max = 250; // HACK!
        }

        var labels = [
            min,
            min + (median - min) * 0.25,
            min + (median - min) * 0.5,
            min + (median - min) * 0.75,
            median,
            median + (max - median) * 0.25,
            median + (max - median) * 0.5,
            median + (max - median) * 0.75,
            max
        ];
        var colors = [
            '#bae1ff',
            '#9ed0fb',
            '#83bff8',
            '#68adf4',
            '#4f9bef',
            '#3689e9',
            '#1e76e3',
            '#0463da',
            '#004fd0'
        ];

        var fillLayer = map.addLayer(
            {
                id: this.getFillPolyId(),
                type: 'fill',
                minzoom: 2,
                source: this.getFillSourceId(absDataSource || caseDataSource),
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'stat'],
                        labels[0], colors[0],
                        labels[1], colors[1],
                        labels[2], colors[2],
                        labels[3], colors[3],
                        labels[4], colors[4],
                        labels[5], colors[5],
                        labels[6], colors[6],
                        labels[7], colors[7],
                        labels[8], colors[8]
                    ],
                    'fill-opacity': opacity
                },
                filter: ['==', '$type', 'Polygon']
            },
            addUnderLayerId || firstHeatmapId
        );

        // Add legend/popup event as specified
        if (addLegend && absDataSource) {
            this._addLegend(absDataSource, labels, colors);
        }

        if (addPopupOnClick) {
            this._addMapPopupEvent(this.getFillPolyId(), absDataSource, caseDataSource);
        }

        return {
            fillPolyId: this.getFillPolyId(),
            fillLayer: fillLayer
        };
    }

    removeFillPoly() {
        const map = this.map;
        map.removeLayer(this.getFillPolyId());

        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }

    /*******************************************************************
     * Map legends
     *******************************************************************/

    _addLegend(dataSource, labels, colors) {
        this.removeLegend();

        var legend = this.legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.bottom = '40px';
        legend.style.left = '10px';
        legend.style.width = '10%';
        legend.style.minWidth = '75px';
        legend.style.background = 'rgba(255,255,255, 0.35)';
        legend.style.padding = '3px';
        legend.style.boxShadow = '0px 1px 5px 0px rgba(0,0,0,0.05)';
        legend.style.borderRadius = "2px";
        this.map.getCanvasContainer().appendChild(legend);

        var allBetween0_10 = true,
            sameConsecutive = false,
            lastNum = null;

        for (let i = 0; i < labels.length; i++) {
            if (!(labels[i] > -10.0 && labels[i] < 10.0)) {
                allBetween0_10 = false;
            }
            if (lastNum === parseInt(labels[i])) {
                sameConsecutive = true;
                break;
            }
            lastNum = parseInt(labels[i]);
        }

        for (let i = 0; i < labels.length; i++) {
            var label = labels[i],
                color = colors[i];

            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;
            key.style.display = 'inline-block';
            key.style.borderRadius = '20%';
            key.style.width = '10px';
            key.style.height = '10px';

            var value = document.createElement('span');
            value.innerHTML = this._getABSValue(dataSource, label, allBetween0_10, sameConsecutive);
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }
    }

    removeLegend() {
        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }

    _getABSValue(dataSource, label, allBetween0_10, sameConsecutive) {
        var isPercent = dataSource.getSourceName().indexOf('(%)') !== -1;
        return (
            ((allBetween0_10 || sameConsecutive) && label <= 15) ? label.toFixed(1) : parseInt(label)
        ) + (
            isPercent ? '%' : ''
        );
    }

    /*******************************************************************
     * Map popups
     *******************************************************************/

    _addMapPopupEvent(useID, absDataSource, caseDataSource) {
        this.resetPopups();
        const map = this.map;
        var popup;
        var currentFeature = null;
        var that = this;

        var mouseMove = function (e) {
            if (!e.features.length) {
                if (popup) {
                    popup.remove();
                }
                currentFeature = null;
                return;
            }
            else if (e.features[0] == currentFeature) {
                return;
            }
            currentFeature = e.features[0];

            if (popup) {
                popup.remove();
            }

            var cityName = e.features[0].properties.city;
            var caseInfo = caseDataSource.getCaseNumber(cityName, null);
            map.getCanvas().style.cursor = 'pointer';

            if (!caseInfo || caseInfo['numCases'] == null || caseInfo['updatedDate'] == null) {
                // no data?
                return;
            }

            var absInfo;
            if (absDataSource) {
                // TODO: Store on mouseover, so as to allow combining different schemas?
                absInfo = absDataSource.getCaseInfoForCity(
                    that.stateName, cityName
                );
            }

            if (caseDataSource.getCaseNumberTimeSeries) {
                var timeSeries = caseDataSource.getCaseNumberTimeSeries(
                    cityName, null
                );

                popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        `${cityName} (${caseDataSource.schema === 'statewide' ? 'statewide' : caseDataSource.schema.toUpperCase()})` +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo['updatedDate'] +
                        (absInfo ? ('<br>ABS Underlay: '+that._getABSValue(absDataSource, absInfo['numCases'], true)) : '') +
                        '<div id="chartContainer" ' +
                        'style="width: 200px; min-height: 60px; height: 13vh;"></div>'
                    )
                    .addTo(map);

                var chart = new CanvasJS.Chart("chartContainer", {
                    animationEnabled: false,
                    //animationDuration: 200,
                    theme: "light2",
                    axisX: {
                        valueFormatString: "D/M",
                        gridThickness: 1
                    },
                    data: [{
                        type: "line",
                        dataPoints: timeSeries
                    }]
                });
                chart.render();

                document.getElementById('chartContainer').id = '';
            }
            else {
                popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        e.features[0].properties.city +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '<br/>By: ' + caseInfo['updatedDate']
                    )
                    .addTo(map);
            }
        };
        map.on('mousemove', useID, mouseMove);

        // Change it back to a pointer when it leaves.
        var mouseLeave = () => {
            map.getCanvas().style.cursor = '';
            if (popup) {
                popup.remove();
                popup = null;
            }
            currentFeature = null;
        };
        map.on('mouseleave', useID, mouseLeave);

        this.resetPopupEvent = function () {
            map.off('mousemove', useID, mouseMove);
            map.off('mouseleave', useID, mouseLeave);

            if (popup) {
                popup.remove();
                popup = null;
            }
            currentFeature = null;
        }
    }

    resetPopups() {
        if (this.resetPopupEvent) {
            this.resetPopupEvent();
            delete this.resetPopupEvent;
        }
    }

    /*******************************************************************
     * Line polys
     *******************************************************************/

    addLinePoly(dataSource, color) {
        // Add the line outline
        const map = this.map;
        this._associateSource(dataSource);

        var linePolyLayer = map.addLayer({
            id: this.getLinePolyId(),
            minzoom: 2,
            type: 'line',
            source: this.getFillSourceId(dataSource),
            paint: {
                'line-color': color || '#000',
                'line-opacity': 1,
                'line-width': 1,
            },
            filter: ['==', '$type', 'Polygon']
        });

        return {
            linePolyLayer: linePolyLayer
        };
    }

    removeLinePoly() {
        const map = this.map;
        map.removeLayer(this.getLinePolyId());
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    addHeatMap(dataSource) {
        const map = this.map;
        this._associateSource(dataSource);

        var heatMapLayer = map.addLayer(
            {
                'id': this.getHeatMapId(),
                'type': 'heatmap',
                'source': this.getHeatmapSourceId(dataSource),
                'maxzoom': 8,
                'paint': {
                    // Increase the heatmap weight based on frequency and property magnitude
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        0, 0,
                        6, 1
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        9, 3
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0,0,0,0)',
                        0.2, 'rgba(178,24,43,0.21)',
                        0.4, 'rgba(178,24,43,0.4)',
                        0.6, 'rgba(178,24,43,0.61)',
                        0.8, 'rgba(178,24,43,0.81)',
                        1.0, 'rgb(178,24,43)'
                    ],
                    // Adjust the heatmap radius by zoom level and value
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, ['^', ['get', 'cases'], 0.6],
                        2, ['^', ['get', 'cases'], 0.6],
                        4, ['^', ['get', 'cases'], 0.6],
                        16, ['^', ['get', 'cases'], 0.6]
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6, 1,
                        8, 0
                    ]
                }
            }
        );

        var heatCirclesLayer = map.addLayer(
            {
                'id': this.getHeatPointId(),
                'type': 'circle',
                'source': this.getHeatmapSourceId(dataSource),
                'minzoom': 6,
                'paint': {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        1, 3,
                        5, 6,
                        10, 8,
                        50, 20,
                        100, 30,
                        300, 40
                    ],
                    // Color circle by value
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        0, 'rgba(0,0,0,0.0)',
                        1, 'rgba(178,24,43,0.6)',
                        5, 'rgba(178,24,43,0.6)',
                        10, 'rgba(178,24,43,0.7)',
                        50, 'rgba(178,24,43,0.7)',
                        100, 'rgba(178,24,43,0.8)',
                        300, 'rgba(178,24,43,1.0)'
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6, 0,
                        8, 1
                    ]
                }
            }
        );

        return {
            heatMapLayer: heatMapLayer,
            heatCirclesLayer: heatCirclesLayer
        };
    }

    removeHeatMap() {
        const map = this.map;
        map.removeLayer(this.getHeatPointId());
        map.removeLayer(this.getHeatMapId());
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

/*******************************************************************
 * LGA schema boundaries
 *******************************************************************/

class WALGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'WA','lga_wa', waLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties.wa_lga_s_3);
    }
}

class NSWLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'NSW','lga_nsw', nswLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties.nsw_lga__3);
    }
}

class VicLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'VIC','lga_vic', vicLgaData);
    }
    getCityNameFromProperty(data) {
        let city_name = data.properties.vic_lga__2;
        var city = city_name.split(" ");
        city.pop();
        city_name = city.join(' ');
        return ConfirmedMapFns.toTitleCase(city_name);
    }
}

class NTLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'lga', 'NT', 'lga_nt', ntLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties['nt_lga_s_3']);
    }
}

class QLDLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'QLD', 'lga_qld', qldLgaData);
    }
    getCityNameFromProperty(data) {
        return data.properties['qld_lga__3'] ?
            ConfirmedMapFns.toTitleCase(data.properties['qld_lga__3']) : null;
    }
}

class SALGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'lga', 'SA', 'lga_sa', saLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties['abbname']);
    }
}

class TasLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'lga', 'TAS', 'lga_tas', tasLgaData);
    }
    getCityNameFromProperty(data) {
        //console.log(data.properties['tas_lga__3'])
        return ConfirmedMapFns.toTitleCase(data.properties['tas_lga__3']);
    }
}

/*******************************************************************
 * Other boundary schemas
 *******************************************************************/

class ACTSA3Boundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'sa3', 'ACT','sa3_act', actSaData);
    }
    getCityNameFromProperty(data) {
        return data.properties['name'];
    }
}

class QLDHHSGeoBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'hhs', 'QLD', 'hhs_qld', qldHhsData);
    }
    getCityNameFromProperty(data) {
        return data.properties.HHS;
    }
}

class NSWLHDGeoBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'nsw', 'NSW', 'lhd_nsw', nswLhdData);
    }
    getCityNameFromProperty(data) {
        return data.properties.name;
    }
}

/*class NSWPostCodeBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'postcode', 'NSW', 'postcode_nsw', nswPostCodeData);
    }
    getCityNameFromProperty(data) {
        var v = data.properties.loc_pid;
        if (v) {
            return v.replace('NSW', '');
        }
        return null;
    }
}*/

/*******************************************************************
 * Simple state boundaries
 *******************************************************************/

class ACTBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'ACT', 'boundary_act', actOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'ACT';
    }
}

class NSWBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'NSW', 'boundary_nsw', nswOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'NSW';
    }
}

class NTBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'NT', 'boundary_nt', ntOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'NT';
    }
}

class VicBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'VIC', 'boundary_vic', vicOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'VIC';
    }
}

class QLDBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'QLD', 'boundary_qld', qldOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'QLD';
    }
}

class SABoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'SA', 'boundary_sa', saOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'SA';
    }
}

class TasBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'TAS', 'boundary_tas', tasOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'TAS';
    }
}

class WABoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'WA', 'boundary_wa', waOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'WA';
    }
}


// We'll only allow access to these
// classes via the above utility fns
var exportDefaults = {
    getGeoBoundary: getGeoBoundary,
    getAvailableGeoBoundaries: getAvailableGeoBoundaries,
    clearGeoBoundaryCache: clearGeoBoundaryCache
};
export default exportDefaults;

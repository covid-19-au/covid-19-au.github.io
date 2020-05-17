import BigTableOValuesDataSource from "./DataABS";
import FillPolyLayer from "./LayerFillPoly";
import LinePolyLayer from "./LayerLinePoly";
import HeatMapLayer from "./LayerHeatMap";
import DaysSinceLayer from "./LayerDaysSince"
import GeoBoundaryCentralPoints from "./GeoBoundaryCentralPoints"
import Fns from "./Fns"


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
        this.geoBoundaryCentralPoints = new GeoBoundaryCentralPoints();
        this._onLoadData(data);
    }

    _onLoadData(data) {
        this.geoJSONData = data;
        this.pointGeoJSONData = this.geoBoundaryCentralPoints
            ._getModifiedGeoJSONWithPolyCentralAreaPoints(
                this.geoJSONData
            );
    }

    /*******************************************************************
     * Unique IDs for sources and layers
     *******************************************************************/

    getHeatmapSourceId(dataSource, zoomNum) {
        // Get a unique ID for sources shared by the
        // auto-generated central points in the
        // middle of the polys for the heat maps
        zoomNum = zoomNum || '';
        return this.uniqueId+dataSource.getSourceName()+'heatmapsource'+zoomNum;
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
            addLegend, addPopupOnClick, this.stateName,
            this.maxMinStatVal,

            addUnderLayerId, this.uniqueId,
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

    addHeatMap(dataSource, maxMinValues) {
        this.removeHeatMap();
        this._associateSource(dataSource);

        this._heatMapLayer = new HeatMapLayer(
            this.map, dataSource, this.uniqueId, maxMinValues,
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
     * Days since maps
     *******************************************************************/

    addDaysSince(dataSource) {
        this.removeDaysSince();
        this._associateSource(dataSource);

        this._daysSinceLayer = new DaysSinceLayer(
            this.map, dataSource, this.uniqueId,
            this.getHeatmapSourceId(dataSource)
        );
    }

    removeDaysSince() {
        if (this._daysSinceLayer) {
            this._daysSinceLayer.remove();
            delete this._daysSinceLayer;
        }
    }

    /*******************************************************************
     * Data processing: associate source
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

    /*******************************************************************
     * Data processing: associate case nums
     *******************************************************************/

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

            this.pointGeoJSONDataZoom2 = this.geoBoundaryCentralPoints
                ._getModifiedGeoJSONWithPointsJoined(
                    this.pointGeoJSONData, 2
                );
            this.pointGeoJSONDataZoom3 = this.geoBoundaryCentralPoints
                ._getModifiedGeoJSONWithPointsJoined(
                    this.pointGeoJSONData, 3
                );
            this.pointGeoJSONDataZoom4 = this.geoBoundaryCentralPoints
                ._getModifiedGeoJSONWithPointsJoined(
                    this.pointGeoJSONData, 4
                );
            this.pointGeoJSONDataZoom5 = this.geoBoundaryCentralPoints
                ._getModifiedGeoJSONWithPointsJoined(
                    this.pointGeoJSONData, 5
                );
            this.pointGeoJSONDataZoom5 = this.geoBoundaryCentralPoints
                ._getModifiedGeoJSONWithPointsJoined(
                    this.pointGeoJSONData, 6
                );

            this.map.addSource(this.getHeatmapSourceId(dataSource, 2), {
                type: 'geojson',
                data: this.pointGeoJSONDataZoom2,
                tolerance: MAPBOX_TOLERANCE
            });
            this.map.addSource(this.getHeatmapSourceId(dataSource, 3), {
                type: 'geojson',
                data: this.pointGeoJSONDataZoom3,
                tolerance: MAPBOX_TOLERANCE
            });
            this.map.addSource(this.getHeatmapSourceId(dataSource, 4), {
                type: 'geojson',
                data: this.pointGeoJSONDataZoom4,
                tolerance: MAPBOX_TOLERANCE
            });
            this.map.addSource(this.getHeatmapSourceId(dataSource, 5), {
                type: 'geojson',
                data: this.pointGeoJSONDataZoom5,
                tolerance: MAPBOX_TOLERANCE
            });
            this.map.addSource(this.getHeatmapSourceId(dataSource, 6), {
                type: 'geojson',
                data: this.pointGeoJSONDataZoom5,
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

    _assignCaseInfoToGeoJSON(geoJSONData, dataSource) {
        var caseInfo;

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

            if (caseInfo['updatedDate']) {
                var dayssince = dataSource.getDaysSince(
                    cityName, null
                );
                if (dayssince != null) {
                    data.properties['dayssince'] = dayssince;
                    data.properties['revdayssince'] = 1000000-(dayssince*2);
                }
            }
            data.properties['cases'] = caseInfo['numCases'];
            data.properties['casesFmt'] = Fns.numberFormat(caseInfo['numCases']);
            data.properties['city'] = cityName;
        }
    }

    /*******************************************************************
     * Data processing: associate abs statistics
     *******************************************************************/

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

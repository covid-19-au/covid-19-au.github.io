import BigTableOValuesDataSource from "./data_sources/DataABS";
import FillPolyCasesLayer from "./layers/LayerFillPolyCases";
import FillPolyABSLayer from "./layers/LayerFillPolyABS";
import LinePolyLayer from "./layers/LayerLinePoly";
import HeatMapLayer from "./layers/LayerHeatMap";
import DaysSinceLayer from "./layers/LayerDaysSince"
import GeoBoundaryCentralPoints from "./GeoBoundaryCentralPoints"
import CachedMapboxSource from "./CachedMapboxSource"
import Fns from "./Fns"


class JSONGeoBoundariesBase {
    constructor(map, schema, stateName, uniqueId, data) {
        this.map = map;
        this.schema = schema;
        this.stateName = stateName;
        this.uniqueId = uniqueId;
        this.geoJSONData = data;

        try {
            map.addSource("nullsource", {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    'features': []
                }
            });
        } catch (e) {}

        this.geoBoundaryCentralPoints = new GeoBoundaryCentralPoints();
        this.pointGeoJSONData = this.geoBoundaryCentralPoints._getModifiedGeoJSONWithPolyCentralAreaPoints(
            this.geoJSONData
        );

        // Add the datasources
        this._absPolygonSource = new CachedMapboxSource(map);
        this._casePolygonSource = new CachedMapboxSource(map);

        this._casePointSource = new CachedMapboxSource(map);
        this._casePointSourceZoom2 = new CachedMapboxSource(map);
        this._casePointSourceZoom3 = new CachedMapboxSource(map);
        this._casePointSourceZoom4 = new CachedMapboxSource(map);
        this._casePointSourceZoom5 = new CachedMapboxSource(map);
        this._casePointSourceZoom6 = new CachedMapboxSource(map);

        // Add the line outlines for borders
        this._linePolyLayer = new LinePolyLayer(
            map, uniqueId, this._casePolygonSource
        );

        // Add the fill poly layers for both ABS and case stats
        this._fillPolyABSLayer = new FillPolyABSLayer(
            map, stateName, uniqueId, this._absPolygonSource
        );
        this._fillPolyCasesLayer = new FillPolyCasesLayer(
            map, stateName, uniqueId, this._casePolygonSource
        );

        // Add the heat map
        this._heatMapLayer = new HeatMapLayer(
            map, uniqueId, this._casePointSource, {
                2: this._casePointSourceZoom2,
                3: this._casePointSourceZoom3,
                4: this._casePointSourceZoom4,
                5: this._casePointSourceZoom5,
                6: this._casePointSourceZoom6
            }
        );

        // Initially hide the layers
        this.removeABSStatsFillPoly();
        this.removeDaysSince();
        this.removeHeatMap();
        this.removeLinePoly();
    }

    /**
     *
     * @param maxDate
     */
    setMaxDate(maxDate) {
        this.maxDate = maxDate;
    }

    /*******************************************************************
     * Cases fill poly-related
     *******************************************************************/

    addCasesFillPoly(casesDataSource) {
        this._associateSource(casesDataSource);
        this._fillPolyCasesLayer.show(casesDataSource);
    }

    removeCasesFillPoly() {
        this._fillPolyCasesLayer.hide();
    }

    /*******************************************************************
     * ABS statistics fill poly-related
     *******************************************************************/

    addABSStatsFillPoly(absDataSource, maxMinStatVal) {
        this._associateSource(absDataSource);
        this._fillPolyABSLayer.show(absDataSource, maxMinStatVal);
    }

    removeABSStatsFillPoly() {
        this._fillPolyABSLayer.hide();
    }

    /*******************************************************************
     * Line polys
     *******************************************************************/

    addLinePoly(dataSource, color) {
        this._associateSource(dataSource);

        this._linePolyLayer.show(
            color, this.maxDate ? this.maxDate.getTime() : null
        );
    }

    removeLinePoly() {
        this._linePolyLayer.hide();
        this.__linePolySourceId = null;
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    addHeatMap(dataSource) {
        this._associateSource(dataSource);

        this._heatMapLayer.show(
            dataSource, this.maxDate ? this.maxDate.getTime() : null
        );
    }

    removeHeatMap() {
        this._heatMapLayer.hide();
        this.__heatMapSourceId = false;
    }

    /*******************************************************************
     * Days since maps
     *******************************************************************/

    addDaysSince(dataSource) {
        this._associateSource(dataSource);

        this._daysSinceLayer = new DaysSinceLayer(
            this.map, dataSource, this.uniqueId, this._casePointSource
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
        if (!this._casePointSource.hasData(dataSource, this.maxDate)) {
            let pointGeoJSONData = JSON.parse(JSON.stringify(this.pointGeoJSONData));
            this._assignCaseInfoToGeoJSON(pointGeoJSONData, dataSource);

            let pointGeoJSONDataZoom6 = this.geoBoundaryCentralPoints._getModifiedGeoJSONWithPointsJoined(
                pointGeoJSONData, 6
            );
            let pointGeoJSONDataZoom5 = this.geoBoundaryCentralPoints._getModifiedGeoJSONWithPointsJoined(
                pointGeoJSONDataZoom6, 5
            );
            let pointGeoJSONDataZoom4 = this.geoBoundaryCentralPoints._getModifiedGeoJSONWithPointsJoined(
                pointGeoJSONDataZoom5, 4
            );
            let pointGeoJSONDataZoom3 = this.geoBoundaryCentralPoints._getModifiedGeoJSONWithPointsJoined(
                pointGeoJSONDataZoom4, 3
            );
            let pointGeoJSONDataZoom2 = this.geoBoundaryCentralPoints._getModifiedGeoJSONWithPointsJoined(
                pointGeoJSONDataZoom3, 2
            );

            this._casePointSourceZoom6.addData(dataSource, this.maxDate, pointGeoJSONDataZoom6);
            this._casePointSourceZoom5.addData(dataSource, this.maxDate, pointGeoJSONDataZoom5);
            this._casePointSourceZoom4.addData(dataSource, this.maxDate, pointGeoJSONDataZoom4);
            this._casePointSourceZoom3.addData(dataSource, this.maxDate, pointGeoJSONDataZoom3);
            this._casePointSourceZoom2.addData(dataSource, this.maxDate, pointGeoJSONDataZoom2);
            this._casePointSource.addData(dataSource, this.maxDate, pointGeoJSONData);
        }
        this._casePointSource.setData(dataSource, this.maxDate);
        this._casePointSourceZoom2.setData(dataSource, this.maxDate);
        this._casePointSourceZoom3.setData(dataSource, this.maxDate);
        this._casePointSourceZoom4.setData(dataSource, this.maxDate);
        this._casePointSourceZoom5.setData(dataSource, this.maxDate);
        this._casePointSourceZoom6.setData(dataSource, this.maxDate);

        if (!this._casePolygonSource.hasData(dataSource, this.maxDate)) {
            let geoJSONData = JSON.parse(JSON.stringify(this.geoJSONData));
            this._assignCaseInfoToGeoJSON(geoJSONData, dataSource);
            this._casePolygonSource.addData(dataSource, this.maxDate, geoJSONData);
        }
        this._casePolygonSource.setData(dataSource, this.maxDate);
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

            caseInfo = dataSource.getCaseNumber(cityName, null, this.maxDate);
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
            data.properties['negcases'] = -caseInfo['numCases'];
            data.properties['casesFmt'] = Fns.numberFormat(caseInfo['numCases'], 1);
            data.properties['casesSz'] = this._getCasesSize(data);
            data.properties['city'] = cityName;
            data.properties['date'] = this.maxDate ? this.maxDate.getTime() : null; // CHECK ME!!!
        }
    }

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

    _associateStatSource(dataSource) {
        if (!this._absPolygonSource.hasData(dataSource, this.maxDate)) {
            let geoJSONData = JSON.parse(JSON.stringify(this.geoJSONData));
            this._assignStatInfoToGeoJSON(geoJSONData, dataSource);
            this._absPolygonSource.addData(dataSource, this.maxDate, geoJSONData);
        }
        this._absPolygonSource.setData(dataSource, this.maxDate);
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
            data.properties['date'] = this.maxDate ? this.maxDate.getTime() : null; // CHECK ME!!!
        }
    }
}

export default JSONGeoBoundariesBase;

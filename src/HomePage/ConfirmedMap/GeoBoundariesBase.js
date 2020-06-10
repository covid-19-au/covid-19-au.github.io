import FillPolyLayer from "./Layers/LayerFillPoly";
import LinePolyLayer from "./Layers/LayerLinePoly";
import HeatMapLayer from "./Layers/LayerHeatMap";
import DaysSinceLayer from "./Layers/LayerDaysSince"
import GeoBoundaryCentralPoints from "./GeoBoundaryCentralPoints"


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
}

export default JSONGeoBoundariesBase;

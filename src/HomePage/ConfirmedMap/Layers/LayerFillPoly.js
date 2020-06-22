import mapboxgl from "mapbox-gl";
import CanvasJS from "../../../assets/canvasjs.min";


class FillPolyLayer {
    /**
     *
     * @param map
     * @param opacity
     * @param addPopupOnClick
     * @param addUnderLayerId
     * @param uniqueId
     * @param casesMapBoxSource
     */
    constructor(
        map,
        opacity,
        addPopupOnClick,
        addUnderLayerId,
        uniqueId,
        casesMapBoxSource,
    ) {

        if (opacity == null) {
            opacity = 0.70;
        }

        this.map = map;
        this.opacity = opacity;
        this.addPopupOnClick = addPopupOnClick;
        this.addUnderLayerId = addUnderLayerId;
        this.uniqueId = uniqueId;
        this.casesMapBoxSource = casesMapBoxSource;

        this._addFillPoly();
    }

    /**
     * TODO!!!
     * @param maxMinStatVal
     */
    setMaxMinStatVal(maxMinStatVal) {
        this.maxMinStatVal = maxMinStatVal;
    }

    /**
     *
     * @returns {string}
     */
    getFillPolyId() {
        return this.uniqueId+'fillpoly';
    }

    /*******************************************************************
     * Fill poly
     *******************************************************************/

    /**
     *
     * @returns {{fillLayer: *, fillPolyId: string}}
     * @private
     */
    _addFillPoly() {
        // Add the colored fill area
        const map = this.map;

        // Make it so that symbol/circle layers are given different priorities
        // This is a temporary fix to make ACT display in the correct priority -
        // see also LayerHeatMap.js for an explanation.
        var lastFillLayer;
        var layers = map.getStyle().layers;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'fill' && layers[i].id.indexOf('fillpoly') !== -1) {
                lastFillLayer = layers[i].id;
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
            //'#ffffff',
            '#f0f5ff',
            '#dcf0ff',
            //'#c8ebff',
            '#bae1ff',
            '#9ed0fb',
            '#83bff8',
            //'#68adf4',
            '#4f9bef',
            '#3689e9',
            '#1e76e3',
            //'#0463da',
            '#004fd0'
        ];

        var fillLayer = map.addLayer(
            {
                id: this.getFillPolyId(),
                type: 'fill',
                minzoom: 2,
                source: this.casesMapBoxSource.getSourceId(),
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
                    'fill-opacity': this.opacity
                },
                filter: ['==', '$type', 'Polygon']
            },
            this.addUnderLayerId || lastFillLayer
        );

        // Add legend/popup event as specified
        if (this.addLegend && this.absDataSource) {
            this._addLegend(this.absDataSource, labels, colors);
        }

        if (this.addPopupOnClick) {
            this._addMapPopupEvent(this.getFillPolyId());
        }

        return {
            fillPolyId: this.getFillPolyId(),
            fillLayer: fillLayer
        };
    }

    /**
     *
     */
    remove() {
        const map = this.map;
        map.removeLayer(this.getFillPolyId());
        this._resetPopups();
        this._removeLegend();
    }

    /**
     *
     * @param dataSource
     * @param label
     * @param allBetween0_10
     * @param sameConsecutive
     * @returns {string}
     * @private
     */
    _getUnderlayValue(dataSource, label, allBetween0_10, sameConsecutive) {
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

    /**
     *
     * @param useID
     * @private
     */
    _addMapPopupEvent(useID) {
        this._resetPopups();
        const map = this.map;
        var popup;
        var currentFeature = null;

        var click = (e) => {
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

            var cityName = e.features[0].properties.city,
                cityLabel = e.features[0].properties.cityLabel;
            var caseInfo = this.caseDataSource.getCaseNumber(cityName, null);

            if (!caseInfo || caseInfo['numCases'] == null || caseInfo['updatedDate'] == null) {
                // no data?
                return;
            }

            var absInfo;
            let underlayDataSource = this.__getUnderlayDataSource(FIXME);
            if (underlayDataSource) {
                // TODO: Store on mouseover, so as to allow combining different schemas?
                absInfo = underlayDataSource.getOnOrBeforeDate(
                    new RegionType(FIXME),
                    DateType.today()
                );
            }

            let caseDataSource = this.__getCaseDataSource(FIXME); // TODO: MANY METHODS+ATTRIBUTES HAVE CHANGED!!! ===========
            if (caseDataSource.getCaseNumberTimeSeries) {
                var timeSeries = caseDataSource.getCaseNumberTimeSeries(
                    new RegionType(FIXME),
                    null
                );

                popup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        `${cityLabel} (${caseDataSource.regionSchema}${cityName !== cityLabel ? ' '+cityName : ''})` +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo['updatedDate'] +
                        (absInfo ? ('<br>ABS Underlay: '+this._getUnderlayValue(underlayDataSource, absInfo['numCases'], true)) : '') +
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
                    closeButton: true,
                    closeOnClick: true
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        cityLabel +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '<br/>By: ' + caseInfo['updatedDate']
                    )
                    .addTo(map);
            }
        };
        map.on('click', useID, click);

        var mouseEnter = () => {
            map.getCanvas().style.cursor = 'pointer';
        };
        map.on('mouseenter', useID, mouseEnter);

        // Change it back to a pointer when it leaves.
        var mouseLeave = () => {
            map.getCanvas().style.cursor = '';
        };
        map.on('mouseleave', useID, mouseLeave);

        this.resetPopupEvent = function () {
            map.off('click', useID, click);
            map.off('mouseenter', useID, mouseEnter);
            map.off('mouseleave', useID, mouseLeave);

            if (popup) {
                popup.remove();
                popup = null;
            }
            currentFeature = null;
        }
    }

    /**
     *
     * @param dataSources
     */
    setDataSources(dataSources) {
        this.__dataSources = dataSources;
    }

    /**
     *
     * @private
     */
    __getUnderlayDataSource() {
        // TODO!
    }

    /**
     *
     * @private
     */
    __getCaseDataSource() {
        // TODO!
    }

    /**
     *
     * @private
     */
    _resetPopups() {
        if (this.resetPopupEvent) {
            this.resetPopupEvent();
            delete this.resetPopupEvent;
        }
    }
}

export default FillPolyLayer;

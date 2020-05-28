import mapboxgl from "mapbox-gl";
import CanvasJS from "../../assets/canvasjs.min";


class FillPolyLayer {
    constructor(
        map,
        absDataSource, // the ABS underlay source (if any)
        caseDataSource, // the case source for popups (if any)
        opacity,
        addLegend,
        addPopupOnClick,
        stateName,
        maxMinStatVal,
        addUnderLayerId,
        uniqueId,
        fillSourceId,
    ) {

        if (opacity == null) {
            opacity = 0.70;
        }

        this.map = map;
        this.absDataSource = absDataSource;
        this.caseDataSource = caseDataSource;
        this.opacity = opacity;
        this.addLegend = addLegend;
        this.addPopupOnClick = addPopupOnClick;
        this.stateName = stateName;
        this.maxMinStatVal = maxMinStatVal;
        this.addUnderLayerId = addUnderLayerId;
        this.uniqueId = uniqueId;
        this.fillSourceId = fillSourceId;

        this._addFillPoly();
    }

    getFillPolyId() {
        return this.uniqueId+'fillpoly';
    }

    /*******************************************************************
     * Fill poly
     *******************************************************************/

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
                source: this.fillSourceId,
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

    remove() {
        const map = this.map;
        map.removeLayer(this.getFillPolyId());
        this._resetPopups();
        this._removeLegend();
    }

    /*******************************************************************
     * Map legends
     *******************************************************************/

    _addLegend(dataSource, labels, colors) {
        this._removeLegend();

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

    _removeLegend() {
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
            if (this.absDataSource) {
                // TODO: Store on mouseover, so as to allow combining different schemas?
                absInfo = this.absDataSource.getCaseInfoForCity(
                    this.stateName, cityName
                );
            }

            if (this.caseDataSource.getCaseNumberTimeSeries) {
                var timeSeries = this.caseDataSource.getCaseNumberTimeSeries(
                    cityName, null
                );

                popup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        `${cityLabel} (${this.caseDataSource.schema === 'statewide' ? 'statewide' : this.caseDataSource.schema.toUpperCase()}${cityName !== cityLabel ? ' '+cityName : ''})` +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo['updatedDate'] +
                        (absInfo ? ('<br>ABS Underlay: '+this._getABSValue(this.absDataSource, absInfo['numCases'], true)) : '') +
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

    _resetPopups() {
        if (this.resetPopupEvent) {
            this.resetPopupEvent();
            delete this.resetPopupEvent;
        }
    }
}

export default FillPolyLayer;

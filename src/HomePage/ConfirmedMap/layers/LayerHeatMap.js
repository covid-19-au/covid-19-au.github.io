import setLayerSource from "../setLayerSource";


class HeatMapLayer {
    constructor(map, uniqueId) {
        this.map = map;
        this.uniqueId = uniqueId;

        this.heatLabelsByZoom = {};
        this.heatCirclesByZoom = {};

        this.__initLayer()
    }

    getHeatMapId() {
        return this.uniqueId+'heatmap';
    }
    
    getHeatPointId() {
        return this.uniqueId+'heatpoint';
    }

    __initLayer() {
        const map = this.map;

        var circleColor = [
            'interpolate',
            ['linear'],
            ['get', 'cases'],
            -1, 'rgba(0,80,0,0.8)',
            0, 'rgba(0,0,80,0.0)',
            1, '#ff9f85',
            5, '#ff9f85',
            10, '#fc653d',
            50, '#ff5c30',
            100, '#ff4817',
            300, '#e73210'
        ];

        // Make it so that symbol/circle layers are given different priorities
        // This is essentially a hack to make it so Canberra is situated above
        // NSW lines, but under NSW cases which are larger in number.
        // Ideally, all the layers for all the schemas should be combined,
        // so as to be able to combine ACT+NSW cases at different zooms
        var lastSymbolLayer,
            lastCircleLayer;

        var layers = map.getStyle().layers;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                lastSymbolLayer = layers[i].id;
            }
            else if (layers[i].type === 'circle') {
                lastCircleLayer = layers[i].id;
            }
            else if (layers[i].type === 'fill' || layers[i].type === 'line') {
                lastSymbolLayer = lastCircleLayer = null;
            }
        }

        for (var zoomLevel of [2, 3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
            var opacity;
            if (zoomLevel === 2) {
                opacity = [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    zoomLevel + 0.9999999999999, 1,
                    zoomLevel + 1, 0,
                ];
            }
            else {
                opacity = [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    zoomLevel - 0.0000000000001, 0,
                    zoomLevel, 1,
                    zoomLevel + 0.9999999999999, 1,
                    zoomLevel + 1, 0
                ];
            }

            map.addLayer(
                {
                    'id': this.getHeatPointId()+zoomLevel,
                    'type': 'circle',
                    'source': 'nullsource',
                    'minzoom': zoomLevel-1,
                    'maxzoom': zoomLevel+2,
                    'paint': {
                        // Size circle radius by value
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['get', 'casesSz'],
                            -4, 20,
                            -3, 14,
                            -2, 10,
                            -1, 9,
                            0, 0,
                            1, 9,
                            2, 13,
                            3, 16,
                            4, 20
                        ],
                        // Color circle by value
                        'circle-color': circleColor,
                        // Transition by zoom level
                        'circle-opacity': opacity
                    }
                }, lastCircleLayer
            );

            map.addLayer({
                id: this.getHeatPointId()+'label'+zoomLevel,
                type: 'symbol',
                source: 'nullsource',
                minzoom: zoomLevel-1,
                maxzoom: zoomLevel+2,
                filter: ['all',
                    ['!=', 'cases', 0],
                    ['has', 'cases']
                ],
                layout: {
                    'text-field': '{casesFmt}',
                    'text-font': [
                        'Arial Unicode MS Bold',
                        'Open Sans Bold',
                        'DIN Offc Pro Medium'
                    ],
                    'text-size': 13,
                    'text-allow-overlap': true,
                    'symbol-sort-key': ["to-number", ["get", "cases"], 1]
                },
                paint: {
                    "text-color": "rgba(255, 255, 255, 1.0)",
                    // Transition by zoom level
                    'text-opacity': opacity
                }
            }, lastSymbolLayer);
        }

        map.addLayer(
            {
                id: this.getHeatPointId(),
                type: 'circle',
                source: 'nullsource',
                minzoom: 6,
                paint: {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'casesSz'],
                        -4, 20,
                        -3, 14,
                        -2, 10,
                        -1, 9,
                        0, 0,
                        1, 9,
                        2, 15,
                        3, 22,
                        4, 30
                    ],
                    // Color circle by value
                    'circle-color': circleColor,
                    // Transition by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6.99999999999, 0,
                        7.00000000001, 1
                    ]
                }
            }, lastCircleLayer
        );

        map.addLayer({
            'id': this.getHeatPointId()+'citylabel',
            'type': 'symbol',
            'minzoom': 6,
            'source': 'nullsource',
            'filter': ['all',
                ['!=', 'cases', 0],
                ['has', 'cases']
            ],
            'layout': {
                'text-field': [
                    'format',
                    ['get', 'city'],
                    { 'font-scale': 0.7 },
                ],
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 0.8],
                'text-anchor': 'top',
                'symbol-sort-key': ['get', 'negcases']
            },
            'paint': {
                'text-color': 'rgba(0, 0, 0, 0.8)',
                'text-halo-color': 'rgba(255, 255, 255, 0.8)',
                'text-halo-width': 3,
                'text-halo-blur': 2
            }
        }, lastSymbolLayer);

        map.addLayer({
            id: this.getHeatPointId()+'label',
            type: 'symbol',
            source: 'nullsource',
            minzoom: 6,
            filter: ['all',
                ['!=', 'cases', 0],
                ['has', 'cases']
            ],
            layout: {
                'text-field': '{casesFmt}',
                'text-font': [
                    'Arial Unicode MS Bold',
                    'Open Sans Bold',
                    'DIN Offc Pro Medium'
                ],
                'text-size': 13,
                'text-allow-overlap': true,
                'symbol-sort-key': ["to-number", ["get", "negcases"], 1]
            },
            paint: {
                "text-color": "rgba(255, 255, 255, 1.0)",
                // Transition by zoom level
                'text-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    6.99999999999, 0,
                    7.00000000001, 1
                ]
            }
        }, lastSymbolLayer);
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    show(dataSource, heatMapSourceId) {
        this.dataSource = dataSource;

        this.map.setLayoutProperty(this.getHeatPointId(), "visibility", "visible");
        this.map.setLayoutProperty(this.getHeatPointId()+'label', "visibility", "visible");
        this.map.setLayoutProperty(this.getHeatPointId()+'citylabel', "visibility", "visible");

        for (var zoomLevel of [2, 3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
            this.map.setLayoutProperty(this.getHeatPointId()+zoomLevel, "visibility", "visible");
            this.map.setLayoutProperty(this.getHeatPointId()+'label'+zoomLevel, "visibility", "visible");
        }

        if (this.heatMapSourceId !== heatMapSourceId) {
            this.heatMapSourceId = heatMapSourceId;

            setLayerSource(this.map, this.getHeatPointId(), heatMapSourceId);
            setLayerSource(this.map, this.getHeatPointId() + 'label', heatMapSourceId);
            setLayerSource(this.map, this.getHeatPointId() + 'citylabel', heatMapSourceId);

            for (var zoomLevel of [2, 3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
                setLayerSource(this.map, this.getHeatPointId() + 'label' + zoomLevel, heatMapSourceId + zoomLevel);
                setLayerSource(this.map, this.getHeatPointId() + zoomLevel, heatMapSourceId + zoomLevel);
            }
        }
    }

    hide() {
        this.map.setLayoutProperty(this.getHeatPointId(), "visibility", "none");
        this.map.setLayoutProperty(this.getHeatPointId()+'label', "visibility", "none");
        this.map.setLayoutProperty(this.getHeatPointId()+'citylabel', "visibility", "none");

        for (var zoomLevel of [2, 3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
            this.map.setLayoutProperty(this.getHeatPointId()+zoomLevel, "visibility", "none");
            this.map.setLayoutProperty(this.getHeatPointId()+'label'+zoomLevel, "visibility", "none");
        }
    }
}

export default HeatMapLayer;

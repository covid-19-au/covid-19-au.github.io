class HeatMapLayer {
    constructor(map, dataSource, uniqueId, maxMinValues, heatMapSourceId) {
        this.map = map;
        this.dataSource = dataSource;
        this.uniqueId = uniqueId;
        this.heatMapSourceId = heatMapSourceId;
        this.maxMinValues = maxMinValues;
        this._addHeatMap()
    }

    getHeatMapId() {
        return this.uniqueId+'heatmap';
    }
    getHeatPointId() {
        return this.uniqueId+'heatpoint';
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    _addHeatMap() {
        const map = this.map;
        const maxMin = this.maxMinValues;

        var divBy = parseFloat(maxMin['max']);
        var radiusDivBy = divBy / 40;

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

            var heatCirclesLayer = map.addLayer(
                {
                    'id': this.getHeatPointId()+zoomLevel,
                    'type': 'circle',
                    'source': this.heatMapSourceId+zoomLevel,
                    'minzoom': zoomLevel-1,
                    'maxzoom': zoomLevel+2,
                    'paint': {
                        // Size circle radius by value
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['get', 'casesSz'],
                            0, 0,
                            1, 13,
                            2, 13,
                            3, 16,
                            4, 20
                        ],
                        // Color circle by value
                        'circle-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'cases'],
                            -1, 'rgba(0,80,0,0.6)',
                            0, 'rgba(0,0,80,0.0)',
                            1, 'rgba(178,70,43,0.7)',
                            5, 'rgba(178,60,43,0.7)',
                            10, 'rgba(178,50,43,0.8)',
                            50, 'rgba(178,40,43,0.8)',
                            100, 'rgba(178,30,43,0.9)',
                            300, 'rgba(178,24,43,0.9)'
                        ],
                        // Transition by zoom level
                        'circle-opacity': opacity
                    }
                }
            );

            var heatLabels = map.addLayer({
                id: this.getHeatPointId()+'label'+zoomLevel,
                type: 'symbol',
                source: this.heatMapSourceId+zoomLevel,
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
            });
        }

        var heatCirclesLayer = map.addLayer(
            {
                id: this.getHeatPointId(),
                type: 'circle',
                source: this.heatMapSourceId,
                minzoom: 6,
                paint: {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'casesSz'],
                        0, 0,
                        1, 15,
                        2, 15,
                        3, 25,
                        4, 30
                    ],
                    // Color circle by value
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        -1, 'rgba(0,80,0,0.6)',
                        0, 'rgba(0,0,80,0.0)',
                        1, 'rgba(178,70,43,0.95)',
                        5, 'rgba(178,60,43,0.95)',
                        10, 'rgba(178,50,43,0.95)',
                        50, 'rgba(178,40,43,0.95)',
                        100, 'rgba(178,30,43,0.95)',
                        300, 'rgba(178,24,43,0.95)'
                    ],
                    // Transition by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6.99999999999, 0,
                        7.00000000001, 1
                    ]
                }
            }
        );

        var heatLabels = map.addLayer({
            id: this.getHeatPointId()+'label',
            type: 'symbol',
            source: this.heatMapSourceId,
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
                'symbol-sort-key': ["to-number", ["get", "cases"], 1]
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
        });

        return {
            heatCirclesLayer: heatCirclesLayer,
            heatLabels: heatLabels
        };
    }

    remove() {
        const map = this.map;
        map.removeLayer(this.getHeatPointId());
        map.removeLayer(this.getHeatPointId()+'label');

        for (var zoomLevel of [2, 3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
            map.removeLayer(this.getHeatPointId()+'label'+zoomLevel);
            map.removeLayer(this.getHeatPointId()+zoomLevel);
        }
    }
}

export default HeatMapLayer;

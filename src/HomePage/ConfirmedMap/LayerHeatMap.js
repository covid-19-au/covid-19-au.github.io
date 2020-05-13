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
                    zoomLevel + 1, 1,
                    zoomLevel + 1.001, 0
                ];
            }
            else {
                opacity = [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    zoomLevel - 0.15, 0,
                    zoomLevel, 1,
                    zoomLevel + 1, 1,
                    zoomLevel + 1.15, 0
                ];
            }

            var heatCirclesLayer = map.addLayer(
                {
                    'id': this.getHeatPointId()+zoomLevel,
                    'type': 'circle',
                    'source': this.heatMapSourceId+zoomLevel,
                    'paint': {
                        // Size circle radius by value
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['/', ['get', 'cases'], divBy],
                            0, 0,
                            0.00000001, 10,
                            1, 15
                        ],
                        // Color circle by value
                        'circle-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'cases'],
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
                filter: ['all',
                    ['>', 'cases', 0],
                    ['has', 'cases']
                ],
                layout: {
                    'text-field': '{cases}',
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
                paint: {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['/', ['get', 'cases'], divBy],
                        0, 0,
                        0.00000001, 10,
                        1, 40
                    ],
                    // Color circle by value
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
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
                        6.85, 0,
                        7, 1
                    ]
                }
            }
        );

        var heatLabels = map.addLayer({
            id: this.getHeatPointId()+'label',
            type: 'symbol',
            source: this.heatMapSourceId,
            filter: ['all',
                ['>', 'cases', 0],
                ['has', 'cases']
            ],
            layout: {
                'text-field': '{cases}',
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
                    6.85, 0,
                    7, 1
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

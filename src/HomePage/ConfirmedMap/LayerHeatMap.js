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

        for (var zoomLevel of [3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
            var heatCirclesLayer = map.addLayer(
                {
                    'id': this.getHeatPointId()+zoomLevel,
                    'type': 'circle',
                    'source': this.heatMapSourceId+zoomLevel,
                    'minzoom': zoomLevel,
                    'maxzoom': zoomLevel+1,
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
                        ]
                    }
                }
            );

            var heatLabels = map.addLayer({
                id: this.getHeatPointId()+'label'+zoomLevel,
                type: 'symbol',
                source: this.heatMapSourceId+zoomLevel,
                minzoom: zoomLevel,
                maxzoom: zoomLevel+2,
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
                    "text-color": "rgba(255, 255, 255, 1.0)"
                }
            });
        }

        var heatCirclesLayer = map.addLayer(
            {
                id: this.getHeatPointId(),
                type: 'circle',
                source: this.heatMapSourceId,
                minzoom: 7,
                paint: {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['/', ['get', 'cases'], divBy],
                        0, 0,
                        0.00000001, 10,
                        1, 50
                    ],
                    // Color circle by value
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        0, 'rgba(0,0,0,0.0)',
                        1, 'rgba(178,24,43,0.8)',
                        5, 'rgba(178,24,43,0.8)',
                        10, 'rgba(178,24,43,0.8)',
                        50, 'rgba(178,24,43,0.85)',
                        100, 'rgba(178,24,43,0.9)',
                        300, 'rgba(178,24,43,1.0)'
                    ]
                }
            }
        );

        var heatLabels = map.addLayer({
            id: this.getHeatPointId()+'label',
            type: 'symbol',
            source: this.heatMapSourceId,
            minzoom: 7,
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
                "text-color": "rgba(255, 255, 255, 1.0)"
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

        for (var zoomLevel of [3, 4, 5, 6]) { // Must be kept in sync with GeoBoundariesBase!!!
            map.removeLayer(this.getHeatPointId()+'label'+zoomLevel);
            map.removeLayer(this.getHeatPointId()+zoomLevel);
        }
    }
}

export default HeatMapLayer;

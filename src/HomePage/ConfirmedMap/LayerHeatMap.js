class HeatMapLayer {
    constructor(map, dataSource, uniqueId, heatMapSourceId) {
        this.map = map;
        this.dataSource = dataSource;
        this.uniqueId = uniqueId;
        this.heatMapSourceId = heatMapSourceId;
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
        const maxMin = this.dataSource.getMaxMinValues();

        var divBy = parseFloat(maxMin['max']);
        var radiusDivBy = divBy / 20;

        var heatMapLayer = map.addLayer(
            {
                'id': this.getHeatMapId(),
                'type': 'heatmap',
                'source': this.heatMapSourceId,
                'maxzoom': 8,
                'paint': {
                    // Increase the heatmap weight based on frequency and property magnitude
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        0, 0,
                        1, 1
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
                        0, ['/', ['get', 'cases'], radiusDivBy],
                        2, ['/', ['get', 'cases'], radiusDivBy],
                        4, ['/', ['get', 'cases'], radiusDivBy],
                        16, ['/', ['get', 'cases'], radiusDivBy]
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
                'source': this.heatMapSourceId,
                'minzoom': 6,
                'paint': {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['/', ['get', 'cases'], divBy],
                        0, 0,
                        0.00000001, 10,
                        1, 35
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
                'text-size': 13
            },
            paint: {
                "text-color": "rgba(255, 255, 255, 1.0)",
                'text-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    6, 0,
                    7, 1
                ]
                //"text-halo-width": 1,
                //"text-halo-color": "rgba(255, 255, 180, 0.8)",
                //"text-halo-blur": 1
            }
        });

        return {
            heatMapLayer: heatMapLayer,
            heatCirclesLayer: heatCirclesLayer,
            heatLabels: heatLabels
        };
    }

    remove() {
        const map = this.map;
        map.removeLayer(this.getHeatPointId());
        map.removeLayer(this.getHeatMapId());
        map.removeLayer(this.getHeatPointId()+'label');
    }
}

export default HeatMapLayer;

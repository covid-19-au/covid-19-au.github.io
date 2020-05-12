class DaysSinceLayer {
    constructor(map, dataSource, uniqueId, daysSinceSourceId) {
        this.map = map;
        this.dataSource = dataSource;
        this.uniqueId = uniqueId;
        this.daysSinceSourceId = daysSinceSourceId;
        this._addDaysSince()
    }

    getDaysSinceId() {
        return this.uniqueId+'dayssince';
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    _addDaysSince() {
        const map = this.map;
        var divBy = parseFloat(100); // HACK!

        var heatCirclesLayer = map.addLayer(
            {
                id: this.getDaysSinceId(),
                type: 'circle',
                source: this.daysSinceSourceId,
                filter: ['has', 'dayssince'],
                paint: {
                    // Size circle radius by value
                    'circle-radius': 15,
                    // Color circle by value
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'dayssince'],
                        0, 'rgb(255,0,0)',
                        5, 'rgb(200,0,50)',
                        10, 'rgb(150,0,100)',
                        20, 'rgb(100,0,150)',
                        50, 'rgb(50,0,200)',
                        100, 'rgb(0,0,255)'
                    ]
                }
            }
        );

        var daysSinceLabels = map.addLayer({
            id: this.getDaysSinceId()+'label',
            type: 'symbol',
            source: this.daysSinceSourceId,
            filter: ['has', 'dayssince'],
            layout: {
                'text-field': '{dayssince}',
                'text-font': [
                    'Arial Unicode MS Bold',
                    'Open Sans Bold',
                    'DIN Offc Pro Medium'
                ],
                'text-size': 13
            },
            paint: {
                "text-color": "rgba(255, 255, 255, 1.0)"
            }
        });

        return {
            daysSinceCircles: heatCirclesLayer,
            daysSinceLabels: daysSinceLabels
        };
    }

    remove() {
        const map = this.map;
        map.removeLayer(this.getDaysSinceId());
        map.removeLayer(this.getDaysSinceId()+'label');
    }
}

export default DaysSinceLayer;

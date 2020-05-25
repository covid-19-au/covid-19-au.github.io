var MAX_VAL = 40;

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
                        0, 'rgba(255,0,0,0.9)',
                        5, 'rgba(200,0,50,0.9)',
                        10, 'rgba(150,0,100,0.9)',
                        20, 'rgba(100,0,150,0.9)',
                        50, 'rgba(50,0,200,0.9)',
                        100, 'rgba(0,0,255,0.9)'
                    ]
                },
                layout: {
                    'circle-sort-key': ["to-number", ["get", "revdayssince"], 1]
                }
            }
        );

        for (var i=MAX_VAL; i>-1; i--) {
            var daysSinceLabels = map.addLayer({
                id: this.getDaysSinceId() + 'label' + i,
                type: 'symbol',
                source: this.daysSinceSourceId,
                filter: [(i === MAX_VAL-1) ? '>=' : '==', ["get", "dayssince"], i],
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
        }

        return {
            daysSinceCircles: heatCirclesLayer,
            daysSinceLabels: daysSinceLabels
        };
    }

    remove() {
        const map = this.map;
        map.removeLayer(this.getDaysSinceId());

        for (var i=MAX_VAL; i>-1; i--) {
            map.removeLayer(this.getDaysSinceId() + 'label' + i);
        }
    }
}

export default DaysSinceLayer;

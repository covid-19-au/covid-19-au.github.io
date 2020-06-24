/**
This file is licensed under the MIT license

Copyright (c) 2020 David Morrissey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

var MAX_VAL = 40;


class DaysSinceLayer {
    /**
     * Create a "days since" layer than starts from red
     * (for 0/1 etc days since last case) moving towards
     * blue around 20 and above
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique identifier for the MapBox source IDs
     * @param mapBoxSource a MapBoxSource instance
     */
    constructor(map, uniqueId, mapBoxSource) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.mapBoxSource = mapBoxSource;
    }

    /*******************************************************************
     * Show/hide "days since" indicators
     *******************************************************************/

    /**
     * Create the layer, destroying previous indicators if they exist
     */
    addLayer() {
        this.removeLayer();
        const map = this.map;
        this.__shown = true;

        map.addLayer(
            {
                id: this.uniqueId,
                type: 'circle',
                source: this.mapBoxSource.getSourceId(),
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
            map.addLayer({
                id: `${this.uniqueId}label${i}`,
                type: 'symbol',
                source: this.mapBoxSource.getSourceId(),
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
    }

    /**
     * Remove the layers
     */
    removeLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId);

            for (var i=MAX_VAL; i>-1; i--) {
                map.removeLayer(`${this.uniqueId}label${i}`);
            }
            this.__shown = false;
        }
    }
}

export default DaysSinceLayer;

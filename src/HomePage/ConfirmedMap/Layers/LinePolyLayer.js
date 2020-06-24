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


class LinePolyLayer {
    /**
     * Create a new layer showing polygon outlines
     *
     * @param map a MapBox GL instance
     * @param uniqueId a unique identifier for the MapBox layer
     * @param color the color as a rgba/rgb/#xxx etc value.
     *              defaults to black
     * @param lineWidth the line width as a float. sometimes useful to have
     *                  this as 0.5 for very packed schemas such as postcodes.
     *                  defaults to 1.0
     * @param mapBoxSource a MapBoxSource instance, either for cases or underlays
     */
    constructor(map, uniqueId, color, lineWidth, mapBoxSource) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.color = color;
        this.lineWidth = lineWidth;
        this.mapBoxSource = mapBoxSource;
    }

    /*******************************************************************
     * Line poly
     *******************************************************************/

    /**
     * Show the polygon outlines
     */
    showLayer() {
        this.hideLayer();

        // Add the line outline
        const map = this.map;

        // Make it so that symbol/circle layers are given different priorities
        // This is a temporary fix to make ACT display in the correct priority -
        // see also LayerHeatMap.js for an explanation.
        var lastLineLayer;
        var layers = map.getStyle().layers;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'line') {
                lastLineLayer = layers[i].id;
            }
            else if (layers[i].type === 'fill') {
                lastLineLayer = null;
            }
        }

        map.addLayer({
            id: this.uniqueId,
            type: 'line',
            source: this.mapBoxSource.getSourceId(),
            paint: {
                'line-color': this.color || '#000',
                'line-opacity': 1,
                'line-width': this.lineWidth || 1.0
            }
        }, lastLineLayer);
        this.__shown = true;
    }

    /**
     * Hide the polygon outlines
     */
    hideLayer() {
        if (this.__shown) {
            const map = this.map;
            map.removeLayer(this.uniqueId);
            this.__shown = false;
        }
    }
}

export default LinePolyLayer;

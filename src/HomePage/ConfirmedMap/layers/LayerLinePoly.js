class LinePolyLayer {
    constructor(map, uniqueId, cachedMapboxSource) {
        this.map = map;
        this.uniqueId = uniqueId;
        this.cachedMapboxSource = cachedMapboxSource;

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

        // Add the line outline layer
        map.addLayer({
            id: this.getLinePolyId(),
            minzoom: 2,
            type: 'line',
            source: cachedMapboxSource.getSourceId(),
            paint: {
                'line-color': '#000',
                'line-opacity': 1,
                'line-width': 1,
            }
        }, lastLineLayer);
    }

    getLinePolyId() {
        return this.uniqueId+'linepoly';
    }

    /*******************************************************************
     * Line poly
     *******************************************************************/

    show() {
        this.map.setLayoutProperty(this.getLinePolyId(), "visibility", "visible");
    }

    hide() {
        this.map.setLayoutProperty(this.getLinePolyId(), "visibility", "none");
    }
}

export default LinePolyLayer;

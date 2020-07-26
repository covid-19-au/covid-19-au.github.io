import setLayerSource from "../setLayerSource";


class LinePolyLayer {
    constructor(map, uniqueId) {
        this.map = map;
        this.uniqueId = uniqueId;

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
            source: 'nullsource',
            paint: {
                'line-color': this.color || '#000',
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

    show(color, fillSourceId) {
        this.color = color;
        this.map.setLayoutProperty(this.getLinePolyId(), "visibility", "visible");

        if (this.fillSourceId !== fillSourceId) {
            this.fillSourceId = fillSourceId;
            setLayerSource(this.map, this.getLinePolyId(), fillSourceId);
        }
    }

    hide() {
        this.map.setLayoutProperty(this.getLinePolyId(), "visibility", "none");
    }
}

export default LinePolyLayer;

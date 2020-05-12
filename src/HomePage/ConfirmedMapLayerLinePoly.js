class LinePolyLayer {
    constructor(map, dataSource, uniqueId, color, fillSourceId) {
        this.map = map;
        this.dataSource = dataSource;
        this.uniqueId = uniqueId;
        this.color = color;
        this.fillSourceId = fillSourceId;

        this._addLinePoly();
    }

    getLinePolyId() {
        return this.uniqueId+'linepoly';
    }

    /*******************************************************************
     * Line poly
     *******************************************************************/

    _addLinePoly() {
        // Add the line outline
        const map = this.map;

        var linePolyLayer = map.addLayer({
            id: this.getLinePolyId(),
            minzoom: 2,
            type: 'line',
            source: this.fillSourceId,
            paint: {
                'line-color': this.color || '#000',
                'line-opacity': 1,
                'line-width': 1,
            },
            filter: ['==', '$type', 'Polygon']
        });

        return {
            linePolyLayer: linePolyLayer
        };
    }

    remove() {
        const map = this.map;
        map.removeLayer(this.getLinePolyId());
    }
}

export default LinePolyLayer;

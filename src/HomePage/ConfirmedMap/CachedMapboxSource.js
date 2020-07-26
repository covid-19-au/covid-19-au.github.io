let __currentSourceId = 0;

// Higher values will result in less accurate lines,
// but faster performance. Default is 0.375
const MAPBOX_TOLERANCE = 0.45;


class CachedMapboxSource {
    constructor(map) {
        this.map = map;
        this.sourceId = __currentSourceId++;
        this.__cache = new Map();

        map.addSource(this.getSourceId(), {
            "type": "geojson",
            "data": {
                'type': 'FeatureCollection',
                'features': []
            },
            "tolerance": MAPBOX_TOLERANCE
        })
    }

    getSourceId() {
        return `cms_${this.sourceId}`;
    }

    /**
     *
     * @param dataSource
     * @param maxDate
     * @returns {string}
     * @private
     */
    __getKey(dataSource, maxDate) {
        return `${dataSource.getSourceName()}|${maxDate}`;
    }

    /**
     *
     * @param dataSource
     * @param maxDate
     * @param data
     */
    addData(dataSource, maxDate, data) {
        let key = this.__getKey(dataSource, maxDate);
        this.__cache.set(key, data.features);
    }

    /**
     *
     * @param dataSource
     * @param maxDate
     */
    hasData(dataSource, maxDate) {
        let key = this.__getKey(dataSource, maxDate);
        return this.__cache.has(key);
    }

    /**
     *
     * @param dataSource
     * @param maxDate
     */
    setData(dataSource, maxDate) {
        let key = this.__getKey(dataSource, maxDate);

        // Only update if changed
        if (this.__key === key) {
            return
        } this.__key = key;

        this.map.getSource(this.getSourceId()).setData({
            'type': 'FeatureCollection',
            'features': this.__cache.get(key)
        });
    }
}

export default CachedMapboxSource;

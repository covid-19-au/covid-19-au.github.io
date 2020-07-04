class LngLatBounds {
    /**
     * A basic longitude/latitude type, meant to be used mainly for
     * checking whether one bounds (effectively a rectangle)
     * overlaps/intersects another
     *
     * (The main reason for using this type when MapBox GL has a
     * LngLatBounds type is the MapBox GL doesn't have a method
     * to check whether one bounds overlaps another)
     *
     * @param lng1
     * @param lat1
     * @param lng2
     * @param lat2
     */
    constructor(lng1, lat1, lng2, lat2) {
        if (lng1 > lng2) [lng2, lng1] = [lng1, lng2];
        if (lat1 > lat2) [lat2, lat1] = [lat1, lat2];

        this.lng1 = lng1;
        this.lat1 = lat1;
        this.lng2 = lng2;
        this.lat2 = lat2;
    }

    toString() {
        return `${this.lng1} ${this.lat1} ${this.lng2} ${this.lat2}`;
    }

    /**
     * Convert a MapBox GL LngLatBounds object
     *
     * @param lngLatBounds
     */
    static fromMapbox(lngLatBounds) {
        let [lngLat1, lngLat2] = lngLatBounds.toArray();
        return new LngLatBounds(...lngLat1, ...lngLat2);
    }

    /**
     * Get whether one LngLatBounds overlaps another
     *
     * @param lngLat
     * @param other
     * @returns {boolean}
     */
    intersects(other) {
        if (!(other instanceof LngLatBounds)) {
            throw `other type isn't a LngLatBounds: ${other}`;
        }
        else if (this.lng1 > other.lng2 || other.lng1 > this.lng2) {
            return false;
        }
        else if (this.lat1 > other.lat2 || other.lat1 > this.lat2) {
            return false;
        }
        return true;
    }
}

export default LngLatBounds;
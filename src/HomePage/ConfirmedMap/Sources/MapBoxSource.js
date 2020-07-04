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

var __currentId = 0;


class MapBoxSource {
    /**
     * A MapBox source wrapper that keeps track of when countries/states
     * and other regions change, and allows live updates of GeoJSON data
     * when they do
     *
     * @param map a MapBox GL instance
     * @param minZoom the minimum zoom (or null)
     * @param maxZoom the maximum zoom (or null)
     * @param data the GeoJSON data (or null)
     */
    constructor(map, minZoom, maxZoom, data) {
        this.map = map;
        var id = this.__id = __currentId++;

        map.addSource(`mapboxSource${id}`, {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                'features': []
            },
            "buffer": 32, // default 128
            "tolerance": 1 // default 0.375; higher will make vectors lower quality but faster
            //"minzoom": minZoom,
            //"maxzoom": maxZoom
        });

        if (data) {
            this.setData(data);
        }
    }

    /**
     * Get the MapBox source Id to allow associating layers etc
     *
     * @returns {string}
     */
    getSourceId() {
        return `mapboxSource${this.__id}`;
    }

    /**
     *
     * @returns {*}
     */
    getSourceInst() {
        return this.map.getSource(this.getSourceId());
    }

    /**************************************************************************
     * Update data/features
     **************************************************************************/

    /**
     * Reset the GeoJSON data
     *
     * Could be useful when changing from e.g. total to active cases,
     * as setData only updates if the region keys have changed,
     * not the case values (or any other values)
     */
    clearData() {
        if (!this.getSourceInst()) {
            return;
        }
        this.getSourceInst().setData([]);
        delete this.__dataKeys;
    }

    /**
     * Update the GeoJSON data
     *
     * Only updated if the region keys have changed, not the
     * case values (or any other values). The uniqueid key
     * as referenced by "__getDataKeys" below contains
     * "{region schema}||{region parent}||{region child}"
     *
     * Returns true if really updated, otherwise false
     *
     * @param data
     * @param geoDataInsts
     * @param caseDataInsts
     * @returns {boolean}
     */
    setData(data, geoDataInsts, caseDataInsts) {
        var dataKeys = this.__getDataKeys(data);
        if (this.__dataKeys && this.__setsEqual(this.__dataKeys, dataKeys)) {
            return false;
        }
        else if (!this.getSourceInst()) { // WARNING: This could have consequences for the order of async jobs!!! ======================================
            setTimeout(this.setData.bind(this), 150, data);
            return true;
        }

        this.getSourceInst().setData(data);
        this.__dataKeys = dataKeys;
        if (caseDataInsts) {
            this.__assignCaseDataInsts(caseDataInsts);
        }
        if (geoDataInsts) {
            this.__assignGeoDataInsts(geoDataInsts);
        }

        let pointsAllVals = [];
        for (let feature of data['features']) {
            if (feature.properties['cases'])
                pointsAllVals.push(feature.properties['cases']);
        }
        pointsAllVals.sort((a, b) => {return a-b});
        this.__pointsAllVals = pointsAllVals;

        return true;
    }

    /*******************************************************************
     * Miscellaneous
     *******************************************************************/

    /**
     *
     * @returns {[]|*[]}
     */
    getPointsAllVals() {
        return this.__pointsAllVals;
    }

    /**************************************************************************
     * GeoData/CaseData instance management
     **************************************************************************/

    /**
     *
     * @param regionSchema
     * @param regionParent
     */
    getGeoDataInst(regionSchema, regionParent) {
        return this.__geoDataInsts[`${regionSchema}||${regionParent}`];
    }

    /**
     *
     * @param regionSchema
     * @param regionParent
     */
    getCaseDataInst(regionSchema, regionParent) {
        return this.__caseDataInsts[`${regionSchema}||${regionParent}`];
    }

    /**
     *
     * @param geoDataInsts
     * @private
     */
    __assignGeoDataInsts(geoDataInsts) {
        let r = {};
        for (let geoDataInst of geoDataInsts) {
            r[`${geoDataInst.regionSchema}||${geoDataInst.regionParent}`] = geoDataInst;
        }
        this.__geoDataInsts = r;
    }

    /**
     *
     * @param caseDataInsts
     * @private
     */
    __assignCaseDataInsts(caseDataInsts) {
        let r = {};
        for (let caseDataInst of caseDataInsts) {
            r[`${caseDataInst.regionSchema}||${caseDataInst.regionParent}`] = caseDataInst;
        }
        this.__caseDataInsts = r;
    }

    /**************************************************************************
     * Remove source
     **************************************************************************/

    /**
     * Remove the source
     */
    remove() {
        this.removeSourceId(`mapboxSource${this.__id}`);
    }

    /**************************************************************************
     * Set functions
     **************************************************************************/

    /**
     * Get unique regions in the features as a means of figuring out whether
     * the in view countries/states etc have changed, thus need data updated
     *
     * @param data GeoJSON data
     * @returns {Set<unknown>}
     * @private
     */
    __getDataKeys(data) {
        let dataKeys = new Set();
        for (let feature of (data['features']||[])) {
            let properties = feature.properties;
            if (properties.uniqueid == null) {
                throw "the unique ID can't be null!"
            }
            dataKeys.add(properties.uniqueid);
        }
        return dataKeys;
    }

    /**
     * Get whether set dk1 is equal to set dk2
     *
     * @param dk1 Set object #1
     * @param dk2 Set object #2
     * @returns {boolean}
     * @private
     */
    __setsEqual(dk1, dk2) {
        if (dk1.size !== dk2.size) {
            return false;
        }
        for (var a of dk1) {
            if (!dk2.has(a)) {
                return false;
            }
        }
        return true;
    }
}

export default MapBoxSource;

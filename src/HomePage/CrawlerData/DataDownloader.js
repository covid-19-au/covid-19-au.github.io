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

import GeoData from "./GeoData.js"
import CasesData from "./CasesData.js"
import UnderlayData from "./UnderlayData";
import Fns from "../ConfirmedMap/Fns"
import LngLatBounds from "../CrawlerDataTypes/LngLatBounds"

import schemaTypes from "../../data/caseData/schema_types.json"


var MODE_GEOJSON_ONLY = 0,
    MODE_UNDERLAY = 1,
    MODE_CASES = 2;


function debug(message) {
    if (false) {
        console.log(message);
    }
}


class DataDownloader {
    /**
     *
     */
    constructor() {
        this._geoDataInsts = {};
        this._underlayDataInsts = {};
        this._caseDataInsts = {};

        this._caseDataPending = {};
        this._underlayDataPending = {};
        this._geoDataPending = {};

        this.schemas = schemaTypes['schemas'];
        this.adminBounds = this._getAdminBounds(schemaTypes['boundaries']);

        this.caseDataListing = new Set(schemaTypes.listings.case_data_listing);
        this.geoJSONDataListing = new Set(schemaTypes.listings.geo_json_data_listing);
        this.underlayDataListing = new Set(schemaTypes.listings.underlay_data_listing);
    }

    getAdminBoundsForISO_3166_2(iso_3166_2) {
        return this.adminBounds[iso_3166_2];
    }

    /**************************************************************************
     * Download data based on coordinates
     **************************************************************************/

    /**
     *
     * @param zoomLevel
     * @param prevDataType
     * @param prevSchemasForCases
     * @param dataType
     * @param schemasForCases
     */
    caseDataForZoomAndCoordsChanged(zoomLevel,
                                    prevDataType, prevSchemasForCases,
                                    dataType, schemasForCases) {

        if (dataType !== prevDataType) {
            return true;
        }

        let getHash = (o) => {
            let r = [],
                keys = Array.from(o.keys());

            keys.sort();
            for (var k of keys) {
                r.push(`${k}||${schemasForCases.get(k)}`)
            }
            return r.join('||');
        };

        return getHash(schemasForCases) !== getHash(prevSchemasForCases);
    }

    /**
     *
     * @param zoomLevel
     * @param lngLatBounds
     * @param dataType
     * @param dateRangeType
     * @param possibleSchemasForCases
     * @param iso3166WithinView restrict to a given ISO 3166 2 code
     * @returns {Promise<void>}
     * @private
     */
    async getCaseDataForZoomAndCoords(zoomLevel, lngLatBounds, dataType, dateRangeType,
                                      possibleSchemasForCases, iso3166WithinView) {
        var promises = [];

        for (let schemaInfo of possibleSchemasForCases) {
            if (schemaInfo.iso3166Codes) {
                for (let iso3166 of schemaInfo.iso3166Codes) {
                    promises.push([
                        schemaInfo,
                        this.getGeoData(schemaInfo.schema, iso3166),
                        this.getCaseData(dataType, schemaInfo.schema, iso3166)
                    ]);
                }
            }
            else {
                promises.push([
                    schemaInfo,
                    this.getGeoData(schemaInfo.schema, null),
                    this.getCaseData(dataType, schemaInfo.schema, null)
                ]);
            }
        }

        let points = {
            "type": "FeatureCollection",
            "features": []
        },  polygons = {
            "type": "FeatureCollection",
            "features": []
        };

        let insts = [];
        let parents = new Set();

        let addParents = (geoData) => {
            if (geoData.getSchemaRegionParent()) {
                if (geoData.getSchemaRegionParent().indexOf('-') !== -1) {
                    // e.g. for custom AU-VIC schemas,
                    // only remove admin_0 AU and admin_1 AU-VIC
                    parents.add(`admin_0||${geoData.getSchemaRegionParent().split('-')[0]}`);
                    parents.add(`admin_1||${geoData.getSchemaRegionParent()}`);
                }
                else {
                    // e.g. for custom whole-of-AU schemas, remove
                    // admin_0 AU and every admin_1 prefixed with AU-*
                    parents.add(`admin_0||${geoData.getSchemaRegionParent()}`);
                    parents.add(`admin_1||${geoData.getSchemaRegionParent()}`);
                }
            }
            else if (geoData.getRegionSchema() === 'admin_1') {
                // e.g. make admin_1 AU-VIC take precedence over AU
                parents.add(`admin_0||${geoData.getRegionParent().split('-')[0]}`);
            }
        };

        for (let [schemaInfo, geoDataPromise, caseDataPromise] of promises) {
            let geoData = await geoDataPromise,
                caseData = await caseDataPromise;

            // Allow it so that e.g. admin0 AU is hidden
            // if admin1 AU-VIC is shown by recording
            // what the parent of each schema is
            if (geoData instanceof GeoData) {
                if (!caseData || !caseData.datatypeInData()) { // datatypeInData HACK!
                    continue;
                }
                addParents(geoData);
                insts.push([schemaInfo, geoData, caseData]);
            }
            else {
                for (let k in geoData) {
                    // If no corresponding case data,
                    // don't add the geojson data either!
                    //if (!caseData[k]) continue;
                    if (!caseData[k] || !caseData[k].datatypeInData()) { // datatypeInData HACK!
                        debug(`Warning: Case data not found - ${k}`);
                        continue;
                    }
                    addParents(geoData[k]);
                    insts.push([schemaInfo, geoData[k], caseData[k]]);
                }
            }
        }
        debug(`Ignoring parent schemas: ${Array.from(parents)}`);

        let geoDataInsts = [];
        let caseDataInsts = [];
        let pointsAllVals = [],
            polygonsAllVals = [];

        let assign = (geoData, caseData, parents) => {
            let iPoints = geoData.getCentralPoints(false, lngLatBounds),
                iPolygons = geoData.getPolygonOutlines(false, lngLatBounds);

            if (caseData) {
                iPoints = caseData.getCaseInfoGeoJSON(
                    iPoints, null, dateRangeType, parents, iso3166WithinView, true
                );
                iPolygons = caseData.getCaseInfoGeoJSON(
                    iPolygons, null, dateRangeType, parents, iso3166WithinView, false
                );

                for (let feature of iPoints['features']) {
                    if (feature.properties['cases'])
                        pointsAllVals.push(feature.properties['cases']);
                }
                for (let feature of iPolygons['features']) {
                    if (feature.properties['cases'])
                        polygonsAllVals.push(feature.properties['cases']);
                }

                points['features'].push(...iPoints['features']);
                polygons['features'].push(...iPolygons['features']);

                caseDataInsts.push(caseData);

                geoDataInsts.push(geoData);
                debug(`assigned ${geoData.getRegionSchema()}->${geoData.getRegionParent()}: lengths ${iPoints.features.length} ${iPolygons.features.length}`);
            }
            else {
                // ???
                debug(`UNassigned ${geoData.getRegionSchema()}->${geoData.getRegionParent()}: lengths ${iPoints.features.length} ${iPolygons.features.length}`);
            }
        };

        // Make it so e.g. postcode schema takes priority over LGA
        let priorities = {};
        for (let [schemaInfo, geoData, caseData] of insts) {
            let srp = geoData.getRegionParent();
            if (!priorities[srp] || priorities[srp][0] < schemaInfo.priority) {
                priorities[srp] = [schemaInfo.priority, geoData, caseData];
            }
        }
        for (let key in priorities) {
            let [priority, geoData, caseData] = priorities[key];
            assign(geoData, caseData, parents);
        }

        pointsAllVals.sort((a, b) => a - b);
        polygonsAllVals.sort((a, b) => a - b);
        points.caseVals = pointsAllVals;
        polygons.caseVals = polygonsAllVals;

        return {
            points: points,
            polygons: polygons,
            geoDataInsts: geoDataInsts,
            caseDataInsts: caseDataInsts
        }
    }

    /**************************************************************************
     * Get possible schemas based on current map boundaries
     **************************************************************************/

    /**
     * Get a Map with keys of [parent schema, parent iso 3166 code]
     * and values of [priority, schema, iso 3166-2 codes as an array],
     * filtering only to schemas which have GeoJSON data.
     *
     * The iso 3166-2 codes are only provided when data files are split
     * to make downloads more manageable
     *
     * @param zoomLevel
     * @param iso3166WithinView
     * @returns {Map<any, any>}
     */
    getPossibleSchemasForGeoJSON(zoomLevel, iso3166WithinView) {
        return this.__getPossibleSchemas(MODE_GEOJSON_ONLY, zoomLevel, iso3166WithinView);
    }

    /**
     * Get a Map with keys of [parent schema, parent iso 3166 code]
     * and values of [priority, schema, iso 3166-2 codes as an array],
     * filtering only to schemas which have underlay data.
     *
     * The iso 3166-2 codes are only provided when data files are split
     * to make downloads more manageable
     *
     * @param zoomLevel
     * @param iso3166WithinView
     * @returns {Map<any, any>}
     */
    getPossibleSchemasForUnderlay(zoomLevel, iso3166WithinView) {
        return this.__getPossibleSchemas(MODE_UNDERLAY, zoomLevel, iso3166WithinView);
    }

    /**
     * Get a Map with keys of [parent schema, parent iso 3166 code]
     * and values of [priority, schema, iso 3166-2 codes as an array],
     * filtering only to schemas which have cases data.
     *
     * The iso 3166-2 codes are only provided when data files are split
     * to make downloads more manageable
     *
     * @param zoomLevel
     * @param iso3166WithinView
     * @returns {Map<any, any>}
     */
    getPossibleSchemasForCases(zoomLevel, iso3166WithinView) {
        return this.__getPossibleSchemas(MODE_CASES, zoomLevel, iso3166WithinView);
    }

    /**
     * Get a list of objects with keys of {
     *     parent schema,
     *     parent iso 3166 code,
     *     priority,
     *     schema,
     *     iso 3166-2 codes as an array
     * }
     *
     * The iso 3166-2 codes are only provided when data files are split
     * to make downloads more manageable
     *
     * Note that only the highest priority values are kept for a given
     * parent schema/parent ISO code combination
     *
     * @param mode
     * @param zoomLevel
     * @param iso3166WithinView
     * @returns {Map<any, any>}
     * @private
     */
    __getPossibleSchemas(mode, zoomLevel, iso3166WithinView) {
        var r = [];
        debug(`ISO 3166 within view: ${Array.from(iso3166WithinView)}`);

        for (let [schema, schemaObj] of Object.entries(this.schemas)) {
            var iso_3166 = schemaObj['iso_3166'] ? schemaObj['iso_3166'].toLowerCase() : schemaObj['iso_3166'],  // HACK!!! =========================
                parentSchema = this.__getParentSchema(schema, iso_3166),
                parentISO = iso_3166, // TODO: What about admin_0/1??
                minZoom = schemaObj['min_zoom'],
                maxZoom = schemaObj['max_zoom'],
                priority = schemaObj['priority']||0,
                splitByParentRegion = schemaObj['split_by_parent_region'];

            if (mode === MODE_CASES) {
                if (schema === 'admin_1') {
                    // HACK: Allow for specific logic for AU/US which
                    //       have disproportionately larger states!
                } else if (minZoom != null && zoomLevel < minZoom) {
                    debug(`ignoring due to minzoom: ${zoomLevel}<${minZoom} ${schema} (parent schema->${parentSchema}; parent iso->${parentISO})`);
                    continue;
                } else if (maxZoom != null && zoomLevel > maxZoom) {
                    debug(`ignoring due to maxzoom: ${zoomLevel}>${maxZoom} ${schema} (parent schema->${parentSchema}; parent iso->${parentISO})`);
                    continue;
                }
            }

            if (splitByParentRegion && parentSchema === 'admin_0') { // Child of admin_0 is admin_1 or a custom schema
                // Split into different files by parent region
                // e.g. admin_1 has no parent (signifying for all admin_0's),
                //          but is split into e.g. AU-VIC etc
                //      jp_city has a parent of JP (signifying for all Japan)
                let iso3166Codes = [];
                let US_AU_REGEX = /^au-*$|^us-*$|^br-*$|^ru-*$|^kz-*$|^se-*$|^no-*$|^in-*$|^sa-*$/,
                    CN_REGEX = /^cn-*$/;

                for (let iso3166 of Array.from(iso3166WithinView)) {
                    let hasHyphen = iso3166.indexOf('-') !== -1;

                    if (schema === 'admin_1' && iso3166.match(US_AU_REGEX) &&
                        zoomLevel < 3) {
                        // AUS/USA both have very large states, so need
                        // specific logic for admin_1 to show from zoom 3
                        continue;
                    } else if (schema === 'admin_1' && !iso3166.match(US_AU_REGEX)
                                                    && !iso3166.match(CN_REGEX) &&
                               zoomLevel < 4) {
                        // Otherwise start only from zoom 4 for admin_1,
                        // unless for China, in which case always use admin_1
                        // as doesn't have admin_0 for JHU data
                        continue;

                    } else if (!hasHyphen && schema !== 'admin_1') {
                        // Splitting is done at a ISO 3166-2 level (admin_1) for custom schemas
                        continue;
                    } else if (hasHyphen && schema === 'admin_1') {
                        // Splitting is done at a ISO 3166-a2 level (admin_0) for admin_1
                        continue;

                    } else if (!this.__fileInGeoJSONData(schema, iso3166)) {
                        debug(`split geojson not found: ${schema} ${iso3166}`);
                        continue;
                    } else if (mode === MODE_CASES && !this.__fileInCaseData(schema, iso3166)){
                        // Cases data not in listing
                        debug(`split cases not found: ${schema} ${iso3166}`);
                        continue;
                    } else if (mode === MODE_UNDERLAY && !this.__fileInUnderlayData(schema, iso3166)){
                        // Underlay data not in listing
                        debug(`split underlay not found: ${schema} ${iso3166}`);
                        continue;
                    }
                    iso3166Codes.push(iso3166);
                }

                // Data is split into multiple files to save downloads -
                // only get files which are in view!
                debug(`adding with iso3166 codes: ${parentSchema} ${parentISO} ${priority} ${schema} ${iso3166Codes}`);
                r.push({
                    parentSchema: parentSchema,
                    parentISO: parentISO,
                    priority: priority,
                    schema: schema,
                    iso3166Codes: iso3166Codes
                });

            } else if (!splitByParentRegion) {
                if (parentISO && !iso3166WithinView.has(parentISO)) {
                    // The parent isn't in view, so isn't possible!
                    debug(`non-split not in view: ${schema} ${parentSchema} ${parentISO}`);
                    continue;
                } else if (!this.__fileInGeoJSONData(schema, null)) {
                    debug(`non-split geojson not found: ${schema}`);
                    continue;
                } else if (mode === MODE_CASES && !this.__fileInCaseData(schema, null)){
                    // Cases data not in listing
                    debug(`non-split cases not found: ${schema}`);
                    continue;
                } else if (mode === MODE_UNDERLAY && !this.__fileInUnderlayData(schema, null)){
                    // Underlay data not in listing
                    debug(`non-split underlay not found: ${schema}`);
                    continue;
                }

                // All data is in one file, so assign for all
                debug(`adding without iso3166 codes: ${parentSchema} ${parentISO} ${priority} ${schema}`);
                r.push({
                    parentSchema: parentSchema,
                    parentISO: parentISO,
                    priority: priority,
                    schema: schema
                });

            } else {
                throw "Parent schema must be admin_0 to allow splitting files!";
            }
        }
        return r;
    }

    /**************************************************************************
     * Map boundaries
     **************************************************************************/

    /**
     * Get each ISO 3166-a2 (admin_0) and ISO 3166-2 (admin_1) code mapped
     * to a boundary area (a mapbox LngLatBounds instance), so that we
     * can know when a given admin_0/1 area is in view and download as
     * necessary
     *
     * @param adminBounds
     * @returns {{}}
     * @private
     */
    _getAdminBounds(adminBounds) {
        var r = {};
        for (var key in adminBounds) {
            let [lng1, lat1, lng2, lat2] = adminBounds[key];
            r[key] = new LngLatBounds(lng1, lat1, lng2, lat2);
        }
        return r
    }

    /**
     * Get which ISO 3166-a2 (admin_0) and ISO 3166-2 (admin_1) codes
     * are within view as a set
     *
     * @param lngLatBounds a mapbox LngLatBounds instance
     * @returns {Set<unknown>}
     * @private
     */
    getISO3166WithinView(lngLatBounds) {
        var r = new Set();

        for (var [iso_3166, iLngLatBounds] of Object.entries(this.adminBounds)) { // region parent, region child??? ==========
            if (lngLatBounds.intersects(iLngLatBounds)) {
                r.add(iso_3166);

                // If ISO 3166 2 is in view, assume ISO 3166 a2 is in view too
                r.add(iso_3166.split('_')[0])
            }
        }
        return r;
    }

    /**************************************************************************
     * Download Files
     **************************************************************************/

    // There a fair amount of duplicated code below, but can't
    // think of a way of making it much better at the moment

    /**
     * Download GeoJSON (geographic) data and create instances as needed.
     *
     * @param regionSchema
     * @param regionParent
     * @returns {Promise<unknown>}
     */
    getGeoData(regionSchema, regionParent) {
        var fileNames = this.__getFileNames(regionSchema, regionParent);

        return new Promise(resolve => {
            if (!this._geoDataInsts[regionSchema]) {
                this._geoDataInsts[regionSchema] = {};
            }

            if (regionParent != null && this._geoDataInsts[regionSchema][regionParent]) {
                // Data already downloaded+instance created
                debug(`Geodata instance cached: ${regionSchema}->${regionParent}`);
                return resolve(this._geoDataInsts[regionSchema][regionParent]);
            }
            else if (regionParent == null && !Fns.isArrayEmpty(this._geoDataInsts[regionSchema])) {
                // Data for multiple instances already downloaded+instance created
                debug(`Geodata instances cached: ${regionSchema}->${regionParent}`);
                return resolve(this._geoDataInsts[regionSchema]);
            }
            else if (this._geoDataPending[fileNames.geoDataFilename]) {
                // Request already pending!
                debug(`Geodata pending: ${regionSchema}->${regionParent}`);
                this._geoDataPending[fileNames.geoJSONFilename].push([resolve, regionSchema, regionParent]);
            }
            else {
                // Otherwise send a new request
                debug(`Geodata fetching: ${regionSchema}->${regionParent}`);
                this._geoDataPending[fileNames.geoJSONFilename] = [];

                import(`../../data/geoJSONData/${fileNames.geoJSONFilename}.geojson`).then((module) => {  // FIXME!!
                    var geodata = module.default;
                    for (var iRegionSchema in geodata) {
                        for (var iRegionParent in geodata[iRegionSchema]) {
                            let schemaObj = this.schemas[iRegionSchema],
                                iso_3166 = schemaObj['iso_3166'] ? schemaObj['iso_3166'].toLowerCase() : schemaObj['iso_3166'];

                            this._geoDataInsts[iRegionSchema][iRegionParent] = new GeoData(
                                iRegionSchema, iRegionParent,
                                this.__getParentSchema(iRegionSchema, iRegionParent), iso_3166,
                                geodata[iRegionSchema][iRegionParent]
                            );
                        }
                    }

                    // Resolve any other requests which want the
                    // instance as well as the first promise
                    for (let [iResolve, iRegionSchema, iRegionParent] of (this._geoDataPending[fileNames.geoJSONFilename]||[])) {
                        iResolve(iRegionParent == null ?
                            this._geoDataInsts[iRegionSchema] :
                            this._geoDataInsts[iRegionSchema][iRegionParent]
                        );
                    }
                    delete this._geoDataPending[fileNames.geoJSONFilename];

                    resolve(regionParent == null ?
                        this._geoDataInsts[regionSchema] :
                        this._geoDataInsts[regionSchema][regionParent]
                    );
                });
            }
        });
    }

    /**
     * Download underlay (e.g. ABS statistics) data
     * and create instances as needed.
     *
     * @param regionSchema
     * @param regionParent
     * @returns {Promise<unknown>}
     */
    /*
    getUnderlayData(underlayId) {
        var fileNames = this.__getFileNames(regionSchema, regionParent);

        return new Promise(resolve => {
            if (!this._underlayDataInsts[regionSchema]) {
                this._underlayDataInsts[regionSchema] = {};
            }

            if (this._underlayDataInsts[regionSchema][regionParent]) {
                return resolve(this._underlayDataInsts[regionSchema][regionParent]);
            }
            else if (this._underlayDataPending[fileNames.underlayDataFilename]) {
                // Request already pending!
                this._underlayDataPending[fileNames.underlayDataFilename].push(resolve);
            }
            else {
                // Otherwise send a new request
                this._underlayDataPending[fileNames.underlayDataFilename] = [resolve];

                import(`../data/mapUnderlayData/${fileNames.underlayDataFilename}`).then((module) => {  // FIXME!!
                    var underlayData = module['underlay_data'];

                    let underlayDataInst = this._underlayDataInsts[regionSchema][regionParent] = new UnderlayData(
                        underlayData[regionSchema][regionParent]
                    );
                    for (let iResolve of this._underlayDataPending[fileNames.underlayDataFilename]) {
                        iResolve(underlayDataInst);
                    }
                    delete this._underlayDataPending[fileNames.underlayDataFilename];
                });
            }
        });
    }
    */

    /**
     * Download often-changing case data
     *
     * @param dataType
     * @param regionSchema
     * @param regionParent
     * @returns {Promise<unknown>}
     */
    getCaseData(dataType, regionSchema, regionParent) {
        var fileNames = this.__getFileNames(regionSchema, regionParent);

        return new Promise(resolve => {
            if (!this._caseDataInsts[dataType]) {
                this._caseDataInsts[dataType] = {};
            }
            if (!this._caseDataInsts[dataType][regionSchema]) {
                this._caseDataInsts[dataType][regionSchema] = {};
            }

            if (regionParent != null && this._caseDataInsts[dataType][regionSchema][regionParent]) {
                debug(`Case data instance cached: ${regionSchema}->${regionParent}`);
                return resolve(this._caseDataInsts[dataType][regionSchema][regionParent]);
            }
            else if (regionParent == null && !Fns.isArrayEmpty(this._caseDataInsts[dataType][regionSchema])) {
                debug(`Case data instances cached: ${regionSchema}->${regionParent}`);
                return resolve(this._caseDataInsts[dataType][regionSchema]);
            }
            else if (this._caseDataPending[fileNames.caseDataFilename]) {
                // Request already pending!
                debug(`Case data pending: ${regionSchema}->${regionParent}`);
                this._caseDataPending[fileNames.caseDataFilename].push([resolve, dataType, regionSchema, regionParent]);
            }
            else {
                // Otherwise send a new request
                debug(`Case data fetching: ${regionSchema}->${regionParent}`);
                this._caseDataPending[fileNames.caseDataFilename] = [];

                import(`../../data/caseData/${fileNames.caseDataFilename}.json`).then((module) => {  // FIXME!!
                    var caseData = module.default['time_series_data'];
                    for (var iRegionSchema in caseData) {
                        for (var iRegionParent in caseData[iRegionSchema]) {
                            for (var iDataType of caseData[iRegionSchema][iRegionParent]['sub_headers']) {
                                if (!this._caseDataInsts[iDataType]) {
                                    this._caseDataInsts[iDataType] = {};
                                }
                                if (!this._caseDataInsts[iDataType][iRegionSchema]) {
                                    this._caseDataInsts[iDataType][iRegionSchema] = {};
                                }

                                this._caseDataInsts[iDataType][iRegionSchema][iRegionParent] = new CasesData(
                                    caseData[iRegionSchema][iRegionParent], module.default['date_ids'],
                                    iDataType, module.default['updated_dates'][iRegionSchema][iRegionParent],
                                    iRegionSchema, iRegionParent
                                );
                            }
                        }
                    }

                    // Resolve any other requests which want the
                    // instance as well as the first promise
                    for (let [iResolve, iDataType, iRegionSchema, iRegionParent] of (this._caseDataPending[fileNames.caseDataFilename]||[])) {
                        iResolve(iRegionParent == null ?
                            this._caseDataInsts[iDataType][iRegionSchema] :
                            this._caseDataInsts[iDataType][iRegionSchema][iRegionParent]
                        );
                    }
                    delete this._caseDataPending[fileNames.caseDataFilename];

                    resolve(regionParent == null ?
                        this._caseDataInsts[dataType][regionSchema] :
                        this._caseDataInsts[dataType][regionSchema][regionParent]
                    );
                });
            }
        });
    }

    /**************************************************************************
     * Remote data filenames
     **************************************************************************/

    /**
     * Get the remove filenames for a given schema type and region parent.
     *
     * Note that if a given schema type isn't split into multiple files,
     * the region parent will be ignored
     *
     * @param schemaType
     * @param regionParent
     * @returns {{caseDataFilename: string, staticDataFilename: string}}
     * @private
     */
    __getFileNames(schemaType, regionParent) {
        var caseDataFilename,
            geoJSONFilename,
            underlayDataFilename;

        if (this.schemas[schemaType].split_by_parent_region) {
            if (regionParent == null) {
                throw `schemaType ${schemaType} is split by parent region but parent not provided`;
            }
            geoJSONFilename = `${schemaType}_${regionParent}`;
            underlayDataFilename = `${schemaType}_${regionParent}`;
            caseDataFilename = `${schemaType}_${regionParent}`;
        }
        else {
            geoJSONFilename = `${schemaType}`;
            underlayDataFilename = `${schemaType}`;
            caseDataFilename = `${schemaType}`;
        }

        return {
            geoJSONFilename: geoJSONFilename,
            underlayDataFilename: underlayDataFilename,
            caseDataFilename: caseDataFilename
        };
    }

    /**
     * Get whether a cases data file exists on the remote server
     *
     * @param schemaType
     * @param regionParent
     * @returns {boolean}
     * @private
     */
    __fileInCaseData(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);
        return this.caseDataListing.has(fileNames.caseDataFilename+'.json');
    }

    /**
     * Get whether a GeoJSON data file exists on the remote server
     *
     * @param schemaType
     * @param regionParent
     * @returns {boolean}
     * @private
     */
    __fileInGeoJSONData(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);
        return this.geoJSONDataListing.has(fileNames.geoJSONFilename+'.geojson');
    }

    /**
     * Get whether an underlay data file exists on the remote server
     *
     * @param schemaType
     * @param regionParent
     * @returns {boolean}
     * @private
     */
    __fileInUnderlayData(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);
        return this.underlayDataListing.has(fileNames.underlayDataFilename+'.json');
    }

    /**************************************************************************
     * Miscellaneous
     **************************************************************************/

    /**
     * Given a parent ISO 3166 code and a schema, get the parent schema.
     *
     * @param schema
     * @param parentISO
     * @returns {string}
     * @private
     */
    __getParentSchema(schema, parentISO) {
        var parentSchema;
        if (schema === 'admin_0') {
            // Countries: has no parent
            // (may change this to make "world" or
            // regions like West Europe parents later)
            parentSchema = null;
        }
        else if (schema === 'admin_1') {
            // Replaces all admin_0 (states/territories)
            parentSchema = 'admin_0';
        }
        else if (parentISO && parentISO.indexOf('-') !== -1) {
            // e.g. AU-VIC: replaces only a single admin_1 region
            parentSchema = 'admin_1';
        }
        else {
            // e.g. AU: replaces entire admin_0 (country)
            parentSchema = 'admin_0';
        }
        return parentSchema;
    }
}

export default DataDownloader;

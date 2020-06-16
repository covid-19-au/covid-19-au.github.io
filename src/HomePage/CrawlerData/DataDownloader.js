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


class DataDownloader {
    constructor() {
        this._geoDataInsts = {};
        this._underlayDataInsts = {};
        this._caseDataInsts = {};
    }

    //========================================================//
    //                     Download Files                     //
    //========================================================//

    /**
     * Download GeoJSON (geographic) data and create instances as needed.
     *
     * @param schemaType
     * @param regionParent
     * @returns {Promise<unknown>}
     */
    getGeoData(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return new Promise(resolve => {
            if (this.staticData[schemaType][regionParent]) {
                return resolve(this.staticData[schemaType][regionParent]);
            }
            import(`../data/mapStaticData/${fileNames.staticDataFilename}`).then((module) => {  // FIXME!!
                var geodata = module['geodata'];
                for (var schema of geodata) {
                    for (var regionParent of geodata[schema]) {
                        this.staticData[schema][regionParent] = new GeoData(
                            geodata[schema][regionParent]
                        );

                    }
                }
                var underlayData = module['underlay_data'];
                for (var schema of underlayData) {
                    for (var regionParent of underlayData[schema]) {
                        this.staticData[schema][regionParent] = new UnderlayData(
                            underlayData[schema][regionParent]
                        );
                    }
                }
                resolve(resolve(this.staticData[schema][regionParent]));
            });
        });
    }

    /**
     * Download underlay (e.g. ABS statistics) data
     * and create instances as needed.
     *
     * @param schemaType
     * @param regionParent
     * @returns {Promise<unknown>}
     */
    getUnderlayData(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return new Promise(resolve => {
            if (this.staticData[schemaType][regionParent]) {
                return resolve(this.staticData[schemaType][regionParent]);
            }
            import(`../data/mapStaticData/${fileNames.staticDataFilename}`).then((module) => {  // FIXME!!
                var geodata = module['geodata'];
                for (var schema of geodata) {
                    for (var regionParent of geodata[schema]) {
                        this.staticData[schema][regionParent] = new GeoData(
                            geodata[schema][regionParent]
                        );

                    }
                }
                var underlayData = module['underlay_data'];
                for (var schema of underlayData) {
                    for (var regionParent of underlayData[schema]) {
                        this.staticData[schema][regionParent] = new UnderlayData(
                            underlayData[schema][regionParent]
                        );
                    }
                }
                resolve(resolve(this.staticData[schema][regionParent]));
            });
        });
    }

    /**
     * Download often-changing case data
     *
     * @param schemaType
     * @param regionParent
     * @returns {Promise<unknown>}
     */
    getCaseData(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return new Promise(resolve => {
            if (this.caseData[schemaType][regionParent]) {
                return resolve(this.caseData[schemaType][regionParent]);
            }
            import(`../data/mapCaseData/${fileNames.caseDataFilename}`).then((module) => {  // FIXME!!
                var caseData = module['case_data'];
                for (var schema of caseData) {
                    for (var regionParent of caseData[schema]) {
                        this._caseDataInsts[schema][regionParent] = new CasesData(  // TODO: Create a new one for each datatype!!
                            caseData[schema][regionParent]
                        );
                    }
                }
            });
            resolve(this.caseData[schemaType][regionParent]);
        });
    }

    //========================================================//
    //                     Miscellaneous                      //
    //========================================================//

    /**
     *
     * @param schemaType
     * @param regionParent
     * @returns {{caseDataFilename: string, staticDataFilename: string}}
     * @private
     */
    __getFileNames(schemaType, regionParent) {
        var staticDataFilename,
            caseDataFilename;

        if (this.schemas[schemaType].split_by_parent_region) {
            staticDataFilename = `../data/mapStaticData/${schemaType}_${regionParent}.json`;
            caseDataFilename = `../data/mapCaseData/${schemaType}_${regionParent}.json`;
        }
        else {
            staticDataFilename = `../data/mapStaticData/${schemaType}.json`;
            caseDataFilename = `../data/mapCaseData/${schemaType}.json`;
        }

        return {
            staticDataFilename: staticDataFilename,
            caseDataFilename: caseDataFilename
        };
    }

    /**
     *
     * @param schemaType
     * @param regionParent
     * @returns {boolean|boolean}
     * @private
     */
    __filesInListings(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return (
            fileNames.staticDataFilename in this.staticDataListing &&
            fileNames.caseDataFilename in this.caseDataListing
        );
    }
}

export default DataDownloader;

class CovidDataDownloader {
    constructor() {
        this._geoDataInsts = {};
        this._underlayDataInsts = {};
        this._caseDataInsts = {};
    }

    //========================================================//
    //                     Download Files                     //
    //========================================================//

    downloadStaticData(schemaType, regionParent) {
        /*
        Download GeoJSON (geographic) data+
        underlay (e.g. ABS statistics) data
        and create instances as needed.
         */
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return new Promise(resolve => {
            if (this.staticData[schemaType][regionParent]) {
                return resolve(this.staticData[schemaType][regionParent]);
            }
            import(`../data/mapStaticData/${fileNames.staticDataFilename}`).then((module) => {  // FIXME!!
                var geodata = module['geodata'];
                for (var schema of geodata) {
                    for (var regionParent of geodata[schema]) {
                        this.staticData[schema][regionParent] = new CovidGeoData(
                            geodata[schema][regionParent]
                        );

                    }
                }
                var underlayData = module['underlay_data'];
                for (var schema of underlayData) {
                    for (var regionParent of underlayData[schema]) {
                        this.staticData[schema][regionParent] = new CovidUnderlayData(
                            underlayData[schema][regionParent]
                        );
                    }
                }
                resolve(resolve(this.staticData[schema][regionParent]));
            });
        });
    }

    downloadCaseData(schemaType, regionParent) {
        /*
        Download often-changing case data
         */
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return new Promise(resolve => {
            if (this.caseData[schema][regionParent]) {
                return resolve(this.caseData[schema][regionParent]);
            }
            import(`../data/mapCaseData/${fileNames.caseDataFilename}`).then((module) => {  // FIXME!!
                var caseData = module['case_data'];
                for (var schema of caseData) {
                    for (var regionParent of caseData[schema]) {
                        this._caseDataInsts[schema][regionParent] = new TimeSeriesCaseData(  // TODO: Create a new one for each datatype!!
                            caseData[schema][regionParent]
                        );
                    }
                }
            });
            resolve(this.caseData[schema][regionParent]);
        });
    }

    //========================================================//
    //                     Miscellaneous                      //
    //========================================================//

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

    __filesInListings(schemaType, regionParent) {
        var fileNames = this.__getFileNames(schemaType, regionParent);

        return (
            fileNames.staticDataFilename in this.staticDataListing &&
            fileNames.caseDataFilename in this.caseDataListing
        );
    }

    //========================================================//
    //                     Download Files                     //
    //========================================================//

    getGeoDataInst(schemaType, regionParent) {
        /*

         */
        var inst = this._geoDataInsts[schemaType][regionParent];
        if (!inst) {
            throw (
                `GeoData instance ${schemaType}/${regionParent} `+
                `hasn't been created with ` +
                `"await downloadStaticData(regionType, regionParent)".`
            );
        }
        return inst;
    }

    getUnderlayDataInst(schemaType, regionParent) {
        /*

         */
        var inst = this._underlayDataInsts[schemaType][regionParent];
        if (!inst) {
            throw (
                `Underlay data instance ${schemaType}/${regionParent} `+
                `hasn't been created with ` +
                `"await downloadStaticData(regionType, regionParent)".`
            );
        }
        return inst;
    }

    getCaseDataInst(schemaType, regionParent) {
        /*

         */
        var inst = this._caseDataInsts[schemaType][regionParent];
        if (!inst) {
            throw (
                `Case data instance ${schemaType}/${regionParent} `+
                `hasn't been created with ` +
                `"await downloadCaseData(regionType, regionParent)".`
            );
        }
        return inst;
    }
}
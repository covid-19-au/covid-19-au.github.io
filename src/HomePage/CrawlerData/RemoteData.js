//let URL = 'http://18.219.202.227/covid_static_data/schema_types.json';
let URL = 'https://covid-global-map.org/covid_static_data/schema_types.json';
let __remoteData;


async function getRemoteData() {
    if (!__remoteData) {
        let schemaTypes = await fetch(URL);
        schemaTypes = await schemaTypes.json();
        __remoteData = new __RemoteData(schemaTypes);
    }
    return __remoteData;
}


class __RemoteData {
    constructor(schemaTypes) {
        this.schemaTypes = schemaTypes;

        this.caseDataListing = new Set(schemaTypes.listings.case_data_listing);
        this.geoJSONDataListing = new Set(schemaTypes.listings.geo_json_data_listing);
        this.underlayDataListing = new Set(schemaTypes.listings.underlay_data_listing);
    }

    downloadFromRemote(jsonPath) {
        return fetch(
            //`http://18.219.202.227/covid_static_data/` +
            `https://covid-global-map.org/covid_static_data/` +
            `${this.schemaTypes.output_path}/${jsonPath}`
        );
    }

    getSchemas() {
        return this.schemaTypes['schemas'];
    }

    getAdminBounds() {
        return this.schemaTypes['boundaries'];
    }

    getConstants() {
        return this.schemaTypes['constants'];
    }

    getConstantSelect() {
        return this.schemaTypes['constant_select'];
    }

    getUnderlayCategories() {
        // TODO!
    }

    getUnderlay() {
        // TODO!
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
     */
    getFileNames(schemaType, regionParent) {
        var caseDataFilename,
            geoJSONFilename,
            underlayDataFilename;

        if (this.schemaTypes.schemas[schemaType].split_by_parent_region) {
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
     */
    fileInCaseData(schemaType, regionParent) {
        var fileNames = this.getFileNames(schemaType, regionParent);
        return this.caseDataListing.has(fileNames.caseDataFilename);
    }

    /**
     * Get whether a GeoJSON data file exists on the remote server
     *
     * @param schemaType
     * @param regionParent
     * @returns {boolean}
     */
    fileInGeoJSONData(schemaType, regionParent) {
        var fileNames = this.getFileNames(schemaType, regionParent);
        return this.geoJSONDataListing.has(fileNames.geoJSONFilename);
    }

    /**
     * Get whether an underlay data file exists on the remote server
     *
     * @param schemaType
     * @param regionParent
     * @returns {boolean}
     */
    fileInUnderlayData(schemaType, regionParent) {
        var fileNames = this.getFileNames(schemaType, regionParent);
        return this.underlayDataListing.has(fileNames.underlayDataFilename);
    }
}

export default getRemoteData;

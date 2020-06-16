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

class RegionType {
    /**
     * A type which stores information about a given region.
     * Each region has a schema
     * (e.g. admin0, admin1, or a custom schema like lga),
     * a region parent, and a region child. For example,
     * regionSchema "admin1", regionParent "AU",
     * regionChild "AU-VIC" refers to Victoria, Australia
     * using the admin1 (ISO 3166-2) system
     *
     * @param geoDataInst the GeoData instance which has localization info etc
     *        for this schema/parent/child combination
     * @param regionSchema the region schema
     * @param regionParent the region parent
     * @param regionChild the region child
     */
    constructor(geoDataInst, regionSchema, regionParent, regionChild) {
        this.geoDataInst = geoDataInst;

        this.regionSchema = regionSchema;
        this.regionParent = regionParent;
        this.regionChild = regionChild;
    }

    /********************************************************************
     * Basic Methods
     ********************************************************************/

    /**
     * Get the region schema, e.g. "admin0" for country-level ISO 3166-a2,
     * "admin1" for state/territory/province level ISO 3166-2,
     * or a custom system like "lga" for Australian Local Government Areas
     * 
     * @returns {string}
     */
    getRegionSchema() {
        return this.regionSchema;
    }

    /**
     * Get the region parent (the entity above that belonging to the region
     * schema, e.g. "AU" if the region schema is "admin1", or a blank string
     * if schema is "admin0")
     *
     * @returns {string}
     */
    getRegionParent() {
        return this.regionParent;
    }

    /**
     * Get the region child
     * (the entity directly belonging to the region schema)
     *
     * @returns {string}
     */
    getRegionChild() {
        return this.regionChild;
    }

    /********************************************************************
     * Convert to string (including localization)
     ********************************************************************/

    /**
     *
     * @param langCode an ISO 631 language code,
     *        e.g. "en" or "zh" for Chinese
     * @returns {string}
     */
    prettified(langCode) {
        // TODO: Localize the region parent too!!
        return (
            `${this.getLocalized(this.regionChild, langCode)}, `+
            `${this.regionParent} `+
            `(${this.regionSchema})`
        );
    }

    /**
     *
     * @param regionChild a child region
     * @param langCode langCode an ISO 631 language code,
     *        e.g. "en" or "zh" for Chinese
     * @returns {*}
     */
    getLocalized(regionChild, langCode) {
        return this.geoDataInst.getLabel(regionChild, langCode);
    }

    /********************************************************************
     * Get population of country/region
     ********************************************************************/

    /**
     * Get the population of the country (admin0 entity)
     * associated with a given child region
     *
     * @param regionChild a child region
     * @returns {*}
     */
    getCountryPopulation(regionChild) {
        return this.geoDataInst.getForItem(regionChild)['country_population'];
    }

    /**
     * Get the population of the child region.
     * This is normally based on satellite data,
     * so may be inaccurate
     *
     * @param regionChild a child region
     * @returns {*}
     */
    getRegionChildPopulation(regionChild) {
        return this.geoDataInst.getForItem(regionChild)['regional_population'];
    }
}

export default RegionType;

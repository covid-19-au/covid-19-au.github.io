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

let __labels = {};

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
     * @param regionParent the region parent
     * @param regionSchema the region schema
     * @param regionChild the region child
     */
    constructor(regionSchema, regionParent, regionChild) {
        this.regionSchema = regionSchema;
        this.regionParent = this._prepareForComparison(regionParent);
        this.regionChild = this._prepareForComparison(regionChild);
    }

    /**
     * Internal use: assign localized labels for
     * regions once the GeoData has been downloaded
     *
     * @param regionSchema
     * @param regionParent
     * @param labels
     * @private
     */
    static __assignLabels(regionSchema, regionParent, labels) {
        if (!__labels[regionSchema]) {
            __labels[regionSchema] = {};
        }
        __labels[regionSchema][regionParent] = labels;
    }

    /**
     * Replace different kinds of successive hyphens
     * and whitespace with only a single hyphen,
     * then lowercase before comparing to make sure
     * e.g. "KALGOORLIE-BOULDER" matches against
     * "Kalgoorlie - Boulder"
     *
     * @param s
     * @returns {*}
     */
    _prepareForComparison(s) {
        s = s.replace(/(\s*[-‒–—])\s+/g, '-');
        s = s.toLowerCase();
        // Sync me with get_regions_json_data in the web app!!
        s = s.replace('the corporation of the city of ', '');
        s = s.replace('the corporation of the town of ', '');
        s = s.replace('pastoral unincorporated area', 'pua');
        s = s.replace('district council', '');
        s = s.replace('regional council', '');
        s = s.replace('unincorporated sa', 'pua');
        s = s.replace(' shire', '');
        s = s.replace(' council', '');
        s = s.replace(' regional', '');
        s = s.replace(' rural', '');
        s = s.replace(' city', '');
        s = s.replace('the dc of ', '');
        s = s.replace('town of ', '');
        s = s.replace('city of ', '');
        if (s.indexOf('the ') === 0)
            s = s.slice(4);
        return s;
    }

    /**
     * Get whether another RegionType is equal to this one
     *
     * @param regionType
     * @returns {boolean}
     */
    equalTo(regionType) {
        return (
            this.getRegionSchema() === regionType.getRegionSchema() &&
            this.getRegionParent() === regionType.getRegionParent() &&
            this.getRegionChild() === regionType.getRegionChild()
        );
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
     * Get a pretty-printed
     * "region child, region parent (region schema)"
     * string representation
     *
     * @param langCode an ISO 631 language code,
     *        e.g. "en" or "zh" for Chinese
     * @returns {string}
     */
    prettified(langCode) {
        // TODO: Localize the region parent too!!
        return (
            `${this.getLocalized(langCode)}, `+
            `${this.regionParent ? (this.regionParent+' ') : ''}`+
            `(${this.regionSchema})`
        );
    }

    /**
     *
     */
    toString() {
        return this.prettified('en');
    }

    /**
     * Get the localized name of a child region.
     * If langCode isn't supplied, it will default to English.
     *
     * @param regionChild a child region
     * @param langCode langCode an ISO 631 language code,
     *        e.g. "en" or "zh" for Chinese
     * @returns {*}
     */
    getLocalized(langCode) {
        let hasLabels = (
            __labels[this.regionSchema] &&
            __labels[this.regionSchema][this.regionParent] &&
            __labels[this.regionSchema][this.regionParent][this.regionChild]
        );

        if (hasLabels && __labels[this.regionSchema][this.regionParent][this.regionChild][langCode]) {
            // Have a direct localization
            return __labels[this.regionSchema][this.regionParent][this.regionChild][langCode];
        }
        else if (hasLabels && __labels[this.regionSchema][this.regionParent][this.regionChild]['en']) {
            // Fall back to English if one not available
            return __labels[this.regionSchema][this.regionParent][this.regionChild]['en'];
        }
        else {
            // Give up and use region child code
            return this.regionChild;
        }
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
     * Get the population of the child region. This is
     * normally based on satellite data, so may be inaccurate
     *
     * @param regionChild a child region
     * @returns {*}
     */
    getRegionChildPopulation(regionChild) {
        return this.geoDataInst.getForItem(regionChild)['regional_population'];
    }
}

export default RegionType;

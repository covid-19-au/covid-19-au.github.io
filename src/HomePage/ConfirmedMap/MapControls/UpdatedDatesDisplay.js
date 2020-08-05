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

import React from "react";
import Fns from "../Fns";
import RegionType from "../../CrawlerDataTypes/RegionType";


class UpdatedDatesDisplay extends React.Component {
    /**
     * A map schema/region parent updated indicator
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let bySchemas = {};
        for (let caseDataInst of this.state.caseDataInsts||[]) {
            let regionSchema = caseDataInst.getRegionSchema(),
                regionParent = caseDataInst.getRegionParent(),
                updatedDate = caseDataInst.getUpdatedDate();

            if (!(regionSchema in bySchemas)) {
                bySchemas[regionSchema] = [];
            }
            bySchemas[regionSchema].push([regionParent, updatedDate]);
        }

        let r = [];
        for (let regionSchema of Fns.sortedKeys(bySchemas)) {
            let schemaHTML = [];

            for (let [regionParent, updatedDate] of bySchemas[regionSchema]) {
                let prettifiedRegion;

                if (regionParent && regionParent.indexOf('-') !== -1) {
                    prettifiedRegion = new RegionType(
                        'admin_1',
                        regionParent.split('-')[0],
                        regionParent
                    ).getLocalized();
                } else if (regionParent) {
                    prettifiedRegion = new RegionType(
                        'admin_0', '', regionParent
                    ).getLocalized();
                } else {
                    prettifiedRegion = regionParent; // ???
                }

                schemaHTML.push(
                    `${prettifiedRegion} ${updatedDate.prettified()}`
                );
            }

            schemaHTML.sort();
            r.push(`${regionSchema.replace('_', ' ')}: ${schemaHTML.join(', ')}`)
        }

        r.sort();
        return r.join('; ') || 'loading, please wait...';
    }

    /**
     * Update the GeoData/CaseData instances, to allow updating the dates
     *
     * @param geoDataInsts
     * @param caseDataInsts
     */
    setValue(geoDataInsts, caseDataInsts) {
        this.setState({
            geoDataInsts: geoDataInsts,
            caseDataInsts: caseDataInsts
        });
    }
}

export default UpdatedDatesDisplay;

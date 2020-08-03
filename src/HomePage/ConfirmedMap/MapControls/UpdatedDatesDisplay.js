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
